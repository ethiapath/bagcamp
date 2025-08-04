/**
 * Bagcamp Download Authentication Worker
 * 
 * This Cloudflare Worker authenticates download requests by verifying
 * JWTs in cookies before allowing access to protected files.
 */

import { parse } from 'cookie';
import { jwtVerify, JWTVerifyResult } from 'jose';

// Define expected JWT payload structure
interface DownloadTokenPayload {
  sub: string;        // User ID
  path: string;       // Allowed download path
  type: 'release' | 'track'; // Content type
  id: string;         // Content ID
  aud?: string;       // Audience (hostname)
  iss?: string;       // Issuer
  iat?: number;       // Issued at
  exp?: number;       // Expiration time
}

interface Env {
  JWT_SECRET: string;
  // Add any additional environment variables or bindings here
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // --- Configuration ---
    const JWT_SECRET_TEXT = env.JWT_SECRET; // Get secret from Worker environment
    const AUDIENCE = url.hostname; // Expect audience to be the requested hostname
    const ISSUER = 'https://bagcamp.com'; // Expected issuer
    const DOWNLOAD_TOKEN_COOKIE_NAME = 'download_token';
    
    if (!JWT_SECRET_TEXT) {
      console.error("Worker: JWT_SECRET environment variable not set!");
      return new Response("Server configuration error", { status: 500 });
    }
    
    // Log basic request info for debugging
    console.log(`Worker: Request for ${url.pathname} from ${request.headers.get('cf-connecting-ip')}`);
    
    // --- 1. Extract Token from Cookie ---
    const cookieHeader = request.headers.get('Cookie');
    if (!cookieHeader) {
      console.log("Worker: No cookie header found.");
      return new Response('Forbidden: Missing authentication credentials', { status: 403 });
    }
    
    const cookies = parse(cookieHeader);
    const token = cookies[DOWNLOAD_TOKEN_COOKIE_NAME];
    
    if (!token) {
      console.log(`Worker: Cookie '${DOWNLOAD_TOKEN_COOKIE_NAME}' not found.`);
      return new Response('Forbidden: Missing download token', { status: 403 });
    }
    
    // --- 2. Verify JWT ---
    let payload: DownloadTokenPayload;
    try {
      // Encode the secret text to Uint8Array for jose
      const secret = new TextEncoder().encode(JWT_SECRET_TEXT);
      
      const { payload: verifiedPayload }: JWTVerifyResult = await jwtVerify(
        token,
        secret,
        {
          audience: AUDIENCE,
          issuer: ISSUER,
        }
      );
      
      payload = verifiedPayload as unknown as DownloadTokenPayload;
      console.log("Worker: JWT Verified for user:", payload.sub);
      
    } catch (error: any) {
      console.error('Worker: JWT Verification failed:', error.message);
      
      // Clear the invalid cookie
      const cookieClearHeader = {
        'Set-Cookie': `${DOWNLOAD_TOKEN_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Expires=${new Date(0).toUTCString()}`
      };
      
      return new Response(
        `Forbidden: Invalid or expired token. ${error.code || ''}`, 
        { 
          status: 403,
          headers: cookieClearHeader
        }
      );
    }
    
    // --- 3. Path Matching ---
    // Ensure the token allows access to the specific requested path
    if (payload.path !== url.pathname) {
      console.warn(`Worker: Token path mismatch. Token path: ${payload.path}, Requested path: ${url.pathname}`);
      return new Response('Forbidden: Token not valid for this resource', { status: 403 });
    }
    
    // --- 4. Check if token is expired ---
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      console.warn(`Worker: Token expired at ${new Date(payload.exp * 1000).toISOString()}`);
      return new Response('Forbidden: Token has expired', { status: 403 });
    }
    
    // --- 5. Token is Valid - Proceed to Origin/Cache ---
    console.log(`Worker: Access granted for ${url.pathname}`);
    
    // Add custom headers if needed (e.g., for analytics)
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-User-ID', payload.sub);
    requestHeaders.set('X-Content-Type', payload.type);
    requestHeaders.set('X-Content-ID', payload.id);
    
    // Clone the request with the modified headers
    const modifiedRequest = new Request(request.url, {
      method: request.method,
      headers: requestHeaders,
      body: request.body,
      redirect: request.redirect,
    });
    
    try {
      // Let Cloudflare handle the rest (cache lookup, fetch from origin with AOP)
      const originResponse = await fetch(modifiedRequest);
      
      // Add CORS headers if needed
      const responseHeaders = new Headers(originResponse.headers);
      
      // Add cache control headers if not already set
      if (!responseHeaders.has('Cache-Control')) {
        responseHeaders.set('Cache-Control', 'public, max-age=31536000'); // 1 year
      }
      
      // Optional: Add Content-Disposition header for downloads
      if (!responseHeaders.has('Content-Disposition')) {
        // Extract filename from path
        const filename = url.pathname.split('/').pop();
        responseHeaders.set('Content-Disposition', `attachment; filename="${filename}"`);
      }
      
      // Return the response with modified headers
      return new Response(originResponse.body, {
        status: originResponse.status,
        statusText: originResponse.statusText,
        headers: responseHeaders,
      });
      
    } catch (originError: any) {
      console.error("Worker: Error fetching content from origin:", originError);
      return new Response("Error fetching content from origin", { status: 502 }); // Bad Gateway
    }
  },
}; 