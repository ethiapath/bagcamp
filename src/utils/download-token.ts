import { sign, verify } from 'jsonwebtoken';

export interface DownloadTokenPayload {
  sub: string; // User ID
  path: string; // Allowed download path
  aud: string; // Audience (e.g., your download domain)
  iss: string; // Issuer (e.g., your main domain)
  iat: number; // Issued at
  exp: number; // Expiration time
  type: 'release' | 'track'; // Type of content
  id: string; // Content ID (for tracking)
}

// Generate a token for authorized downloads
export const generateDownloadToken = (
  userId: string,
  filePath: string,
  contentType: 'release' | 'track',
  contentId: string,
  expiresInMinutes: number = 5
): string => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable not set');
  }

  const downloadBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DOWNLOAD_BASE_URL;
  if (!downloadBaseUrl) {
    throw new Error('NEXT_PUBLIC_CLOUDFLARE_DOWNLOAD_BASE_URL environment variable not set');
  }

  const issuedAt = Math.floor(Date.now() / 1000);
  const expiresAt = issuedAt + (expiresInMinutes * 60);
  
  const payload: DownloadTokenPayload = {
    sub: userId,
    path: `/${filePath}`, // Prepend '/' for matching in worker
    aud: new URL(downloadBaseUrl).hostname, // e.g., media.yourdomain.com
    iss: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bagcamp.com',
    iat: issuedAt,
    exp: expiresAt,
    type: contentType,
    id: contentId
  };
  
  return sign(payload, jwtSecret);
};

// Verify a token (usually done in Cloudflare Worker, but useful for testing)
export const verifyDownloadToken = (token: string): DownloadTokenPayload | null => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable not set');
  }
  
  try {
    return verify(token, jwtSecret) as DownloadTokenPayload;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}; 