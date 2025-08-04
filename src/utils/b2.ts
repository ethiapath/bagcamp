import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import crypto from 'crypto';
import { createReadStream, ReadStream } from 'fs';
import path from 'path';

// B2 supports the AWS S3 API
const s3Client = new S3Client({
  region: process.env.B2_REGION || 'us-west-000',
  endpoint: `https://${process.env.B2_ENDPOINT}`,
  credentials: {
    accessKeyId: process.env.B2_APPLICATION_KEY_ID || '',
    secretAccessKey: process.env.B2_APPLICATION_KEY || ''
  }
});

// Generate a unique filename with original extension
export const generateUniqueFilename = (originalFilename: string): string => {
  const fileExt = path.extname(originalFilename);
  const filename = path.basename(originalFilename, fileExt);
  const timestamp = Date.now();
  const randomString = crypto.randomBytes(8).toString('hex');
  return `${filename}-${timestamp}-${randomString}${fileExt}`;
};

// Generate folder structure based on content type and IDs
export const generateFilePath = (
  contentType: 'artist' | 'release' | 'track', 
  id: string, 
  filename: string
): string => {
  const sanitizedFilename = filename.replace(/[^a-zA-Z0-9_.-]/g, '_');
  
  switch (contentType) {
    case 'artist':
      return `artists/${id}/${sanitizedFilename}`;
    case 'release':
      return `releases/${id}/${sanitizedFilename}`;
    case 'track':
      return `tracks/${id}/${sanitizedFilename}`;
    default:
      return `uploads/${sanitizedFilename}`;
  }
};

// Upload file to B2
export const uploadToB2 = async (
  fileBuffer: Buffer | ReadStream,
  contentType: string,
  filePath: string
): Promise<{ success: boolean; url?: string; error?: any }> => {
  const bucketName = process.env.B2_BUCKET_NAME || '';
  
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: filePath,
      Body: fileBuffer,
      ContentType: contentType,
      CacheControl: 'max-age=31536000' // 1 year cache
    }));
    
    // Return the URL with Cloudflare CDN base
    const cdnBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DOWNLOAD_BASE_URL || '';
    return {
      success: true,
      url: `${cdnBaseUrl}/${filePath}`
    };
  } catch (error) {
    console.error('Error uploading to B2:', error);
    return {
      success: false,
      error
    };
  }
};

// Delete file from B2
export const deleteFromB2 = async (
  filePath: string
): Promise<{ success: boolean; error?: any }> => {
  const bucketName = process.env.B2_BUCKET_NAME || '';
  
  try {
    await s3Client.send(new DeleteObjectCommand({
      Bucket: bucketName,
      Key: filePath
    }));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting from B2:', error);
    return {
      success: false,
      error
    };
  }
};

// Generate signed URL - used for temporary access to private files
export const getCdnUrl = (filePath: string): string => {
  const cdnBaseUrl = process.env.NEXT_PUBLIC_CLOUDFLARE_DOWNLOAD_BASE_URL || '';
  return `${cdnBaseUrl}/${filePath}`;
}; 