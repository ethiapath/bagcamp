import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';
import { generateDownloadToken } from '@/utils/download-token';
import cookie from 'cookie'; // Make sure to npm install cookie first

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { releaseId, trackId, type } = body;
    
    if (!type || !['release', 'track'].includes(type)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
    
    if ((type === 'release' && !releaseId) || (type === 'track' && !trackId)) {
      return NextResponse.json({ error: 'Missing content ID' }, { status: 400 });
    }
    
    const contentId = type === 'release' ? releaseId : trackId;
    
    // Initialize Supabase client
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Verify authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized: Please log in' }, 
        { status: 401 }
      );
    }
    
    // Get file path based on content type
    let filePath: string | null = null;
    let hasPermission = false;
    let isPaid = false; // For future monetization features
    
    if (type === 'release') {
      const { data: release, error: releaseError } = await supabase
        .from('releases')
        .select('download_path, artist_id, published')
        .eq('id', contentId)
        .single();
      
      if (releaseError || !release) {
        return NextResponse.json({ error: 'Release not found' }, { status: 404 });
      }
      
      filePath = release.download_path;
      
      // Check permissions: either the user is the artist or the release is published
      hasPermission = release.artist_id === user.id || release.published;
      
      // Record the download event in the database
      if (hasPermission) {
        // Use the record_download function we defined in the migration
        await supabase.rpc('record_download', {
          p_user_id: user.id,
          p_release_id: contentId,
          p_track_id: null,
          p_download_type: 'release',
          p_ip_address: request.headers.get('x-forwarded-for') || request.ip,
          p_user_agent: request.headers.get('user-agent') || null
        });
      }
      
    } else if (type === 'track') {
      const { data: track, error: trackError } = await supabase
        .from('tracks')
        .select('file_path, release_id')
        .eq('id', contentId)
        .single();
      
      if (trackError || !track) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      }
      
      filePath = track.file_path;
      
      // Check if the release is published or the user is the artist
      const { data: release, error: releaseError } = await supabase
        .from('releases')
        .select('artist_id, published')
        .eq('id', track.release_id)
        .single();
      
      if (releaseError || !release) {
        return NextResponse.json({ error: 'Release not found' }, { status: 404 });
      }
      
      hasPermission = release.artist_id === user.id || release.published;
      
      // Record the download event
      if (hasPermission) {
        await supabase.rpc('record_download', {
          p_user_id: user.id,
          p_release_id: null,
          p_track_id: contentId,
          p_download_type: 'track',
          p_ip_address: request.headers.get('x-forwarded-for') || request.ip,
          p_user_agent: request.headers.get('user-agent') || null
        });
      }
    }
    
    if (!filePath) {
      return NextResponse.json({ error: 'File not available for download' }, { status: 404 });
    }
    
    if (!hasPermission) {
      return NextResponse.json({ error: 'You do not have permission to download this file' }, { status: 403 });
    }
    
    // If future paid content check is needed
    if (!isPaid) {
      // For now, all content is free, but we could check payment status here
    }
    
    // Generate JWT download token
    const token = generateDownloadToken(
      user.id,
      filePath,
      type as 'release' | 'track',
      contentId
    );
    
    // Get the download base URL from env
    const downloadBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DOWNLOAD_BASE_URL;
    if (!downloadBaseUrl) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 });
    }
    
    // Create the full download URL
    const fullDownloadUrl = `${downloadBaseUrl}/${filePath}`;
    
    // Prepare response with download URL
    const response = NextResponse.json({
      success: true,
      downloadUrl: fullDownloadUrl
    });
    
    // Set HttpOnly cookie with JWT token
    // Token is valid for 5 minutes by default
    const issuedAt = Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + (5 * 60); // 5 minutes
    
    response.headers.set(
      'Set-Cookie',
      cookie.serialize('download_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV !== 'development',
        sameSite: 'lax',
        path: `/${filePath}`, // Scope cookie to the specific download path
        expires: new Date(expiresAt * 1000)
      })
    );
    
    return response;
    
  } catch (error: any) {
    console.error('Error authorizing download:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 