import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/supabase';
import { generateUniqueFilename, generateFilePath, uploadToB2 } from '@/utils/b2';

export const maxDuration = 60; // Max duration in seconds

export async function POST(request: NextRequest) {
  try {
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
    
    // Parse multipart form data
    const formData = await request.formData();
    
    const file = formData.get('file') as File;
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }
    
    const contentType = formData.get('contentType') as string;
    const contentId = formData.get('contentId') as string;
    
    if (!contentType || !['artist', 'release', 'track'].includes(contentType)) {
      return NextResponse.json({ error: 'Invalid content type' }, { status: 400 });
    }
    
    if (!contentId) {
      return NextResponse.json({ error: 'Missing content ID' }, { status: 400 });
    }
    
    // For track uploads, verify the artist owns the track's release
    if (contentType === 'track') {
      const trackReleaseQuery = await supabase
        .from('tracks')
        .select('release_id')
        .eq('id', contentId)
        .single();
      
      if (trackReleaseQuery.error) {
        return NextResponse.json({ error: 'Track not found' }, { status: 404 });
      }
      
      const releaseId = trackReleaseQuery.data.release_id;
      
      const releaseOwnerQuery = await supabase
        .from('releases')
        .select('artist_id')
        .eq('id', releaseId)
        .single();
      
      if (releaseOwnerQuery.error || releaseOwnerQuery.data.artist_id !== user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to upload to this track' }, 
          { status: 403 }
        );
      }
    }
    
    // For release uploads, verify the artist owns the release
    if (contentType === 'release') {
      const releaseOwnerQuery = await supabase
        .from('releases')
        .select('artist_id')
        .eq('id', contentId)
        .single();
      
      if (releaseOwnerQuery.error || releaseOwnerQuery.data.artist_id !== user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to upload to this release' }, 
          { status: 403 }
        );
      }
    }
    
    // For artist uploads, verify user owns the artist profile
    if (contentType === 'artist' && contentId !== user.id) {
      const artistQuery = await supabase
        .from('artists')
        .select('id')
        .eq('id', contentId)
        .single();
      
      if (artistQuery.error || artistQuery.data.id !== user.id) {
        return NextResponse.json(
          { error: 'You do not have permission to upload to this artist profile' }, 
          { status: 403 }
        );
      }
    }
    
    // Generate unique filename and path
    const uniqueFilename = generateUniqueFilename(file.name);
    const filePath = generateFilePath(contentType as any, contentId, uniqueFilename);
    
    // Convert File to Buffer for upload
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Upload to B2
    const uploadResult = await uploadToB2(buffer, file.type, filePath);
    
    if (!uploadResult.success) {
      console.error('Upload failed:', uploadResult.error);
      return NextResponse.json(
        { error: 'Failed to upload file to storage' }, 
        { status: 500 }
      );
    }
    
    // Update database with file info based on content type
    let dbUpdateResult;
    
    if (contentType === 'artist') {
      dbUpdateResult = await supabase
        .from('artists')
        .update({
          profile_image_path: filePath,
          image_url: uploadResult.url
        })
        .eq('id', contentId);
    } else if (contentType === 'release') {
      // Check if this is a cover image or a download file
      const isImage = file.type.startsWith('image/');
      
      if (isImage) {
        dbUpdateResult = await supabase
          .from('releases')
          .update({
            cover_image_path: filePath,
            cover_image_url: uploadResult.url
          })
          .eq('id', contentId);
      } else {
        dbUpdateResult = await supabase
          .from('releases')
          .update({
            download_path: filePath,
            download_size: file.size,
            download_file_type: file.type
          })
          .eq('id', contentId);
      }
    } else if (contentType === 'track') {
      dbUpdateResult = await supabase
        .from('tracks')
        .update({
          file_path: filePath,
          file_size: file.size,
          file_type: file.type,
          audio_url: uploadResult.url
        })
        .eq('id', contentId);
    }
    
    if (dbUpdateResult?.error) {
      console.error('Database update error:', dbUpdateResult.error);
      return NextResponse.json(
        { error: 'Failed to update database with file information' }, 
        { status: 500 }
      );
    }
    
    // Return success with file info
    return NextResponse.json({
      success: true,
      filePath,
      fileUrl: uploadResult.url,
      fileSize: file.size,
      fileType: file.type
    });
    
  } catch (error: any) {
    console.error('Error processing upload:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' }, 
      { status: 500 }
    );
  }
} 