# Bagcamp File Upload System

This document outlines the file upload system for Bagcamp, implementing secure file uploads using Backblaze B2 and Cloudflare CDN.

## Architecture Overview

The system consists of several components:

1. **Backend Storage**: Backblaze B2 bucket for reliable, low-cost file storage
2. **Content Delivery**: Cloudflare CDN for fast global content delivery
3. **Authentication**: Cloudflare Worker for secure access control
4. **Database**: Supabase for tracking file metadata and user permissions

## Setup Instructions

### 1. Backblaze B2 Setup

1. Create a Backblaze B2 account at https://www.backblaze.com/b2/sign-up.html
2. Create a private bucket (e.g., `bagcamp-files`)
3. Create an application key with appropriate permissions:
   - `listBuckets`
   - `listFiles`
   - `readFiles`
   - `writeFiles`
   - `deleteFiles`
4. Note the key ID, application key, bucket name, and bucket ID

### 2. Cloudflare Setup

1. Create a Cloudflare account at https://dash.cloudflare.com/sign-up
2. Add your domain to Cloudflare
3. Create a CNAME record pointing to your B2 bucket (e.g., `media.yourdomain.com` → `s3.us-west-000.backblazeb2.com`)
4. Enable Cloudflare proxy (orange cloud)
5. Set up Authenticated Origin Pulls:
   - Go to SSL/TLS → Origin Server
   - Enable "Authenticated Origin Pulls"
   - Follow instructions to set up credentials for B2

### 3. Cloudflare Worker Setup

1. Navigate to the `cloudflare/download-worker` directory
2. Install dependencies:
   ```bash
   npm install
   ```
3. Update the `wrangler.toml` file with your domain
4. Deploy the worker:
   ```bash
   npm run deploy
   ```
5. Set the JWT secret:
   ```bash
   npx wrangler secret put JWT_SECRET
   ```
   Enter the same JWT secret that you use in your `.env.local` file

### 4. Database Setup

Run the SQL migration to add file storage paths to your database schema:

```bash
npx supabase db push
```

This will add the necessary columns to your tables and create the downloads table for tracking.

### 5. Environment Variables

Copy the `.env.local.example` file to `.env.local` and fill in the values:

```bash
cp .env.local.example .env.local
```

### 6. Usage

#### File Uploads

Use the `FileUpload` component to enable file uploads:

```jsx
import FileUpload from '@/components/upload/FileUpload';

// For artist profile image
<FileUpload 
  contentType="artist" 
  contentId={artistId}
  accept="image/*"
  maxSizeMB={5}
  onUploadComplete={(data) => console.log('Upload complete:', data)}
/>

// For track audio
<FileUpload 
  contentType="track" 
  contentId={trackId}
  accept="audio/*"
  maxSizeMB={50}
  onUploadComplete={(data) => console.log('Upload complete:', data)}
/>

// For release downloads (ZIP files)
<FileUpload 
  contentType="release" 
  contentId={releaseId}
  accept=".zip"
  maxSizeMB={500}
  onUploadComplete={(data) => console.log('Upload complete:', data)}
/>
```

#### File Downloads

Use the `DownloadButton` component to enable secure downloads:

```jsx
import DownloadButton from '@/components/download/DownloadButton';

// For track downloads
<DownloadButton 
  type="track"
  trackId={trackId}
  variant="primary"
>
  Download Track
</DownloadButton>

// For release downloads
<DownloadButton 
  type="release"
  releaseId={releaseId}
  variant="primary"
>
  Download Album
</DownloadButton>
```

## Security Features

1. **Private B2 Bucket**: Files are stored in a private bucket, inaccessible directly
2. **JWT Authentication**: Downloads require a valid, short-lived JWT token
3. **Path-Specific Cookies**: Download tokens are scoped to specific file paths
4. **HTTP-Only Cookies**: Prevents JavaScript access to the download token
5. **Row-Level Security**: Database permissions ensure users can only download content they have access to
6. **Download Tracking**: All downloads are recorded for analytics and rate limiting

## Troubleshooting

### Common Issues

1. **Worker not intercepting requests**:
   - Verify routes in `wrangler.toml`
   - Check Cloudflare dashboard for worker errors

2. **Upload failures**:
   - Check B2 credentials and bucket permissions
   - Verify file size limits

3. **Download errors**:
   - Verify JWT secret matches between server and worker
   - Check file paths in database

### Logs

Check Cloudflare Worker logs in the Cloudflare dashboard under Workers → bagcamp-download-authenticator → Logs 