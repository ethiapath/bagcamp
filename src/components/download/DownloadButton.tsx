'use client';

import React, { useState } from 'react';
import { FiDownload, FiLoader } from 'react-icons/fi';
import { useSupabaseClient } from '@supabase/auth-helpers-react';

interface DownloadButtonProps {
  releaseId?: string;
  trackId?: string;
  type: 'release' | 'track';
  className?: string;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  icon?: boolean;
  children?: React.ReactNode;
}

export default function DownloadButton({
  releaseId,
  trackId,
  type,
  className = '',
  variant = 'primary',
  size = 'md',
  icon = true,
  children
}: DownloadButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = useSupabaseClient();
  
  const handleDownload = async () => {
    setIsLoading(true);
    setError(null);
    
    // Check if user is logged in
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setError('Please log in to download');
      setIsLoading(false);
      // You could redirect to login page here
      return;
    }
    
    try {
      // Call the backend API route to authorize and set the cookie
      const response = await fetch('/api/download/authorize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          releaseId,
          trackId,
          type
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Authorization failed');
      }
      
      // If successful, the cookie is set by the server
      // Now, redirect the browser to the actual download URL
      if (data.downloadUrl) {
        window.location.href = data.downloadUrl; // Trigger browser navigation/download
      } else {
        throw new Error('Download URL not received from server');
      }
      
    } catch (err: any) {
      console.error('Download initiation failed:', err);
      setError(err.message);
    } finally {
      // Set loading to false after a short delay (as the browser will navigate away)
      setTimeout(() => setIsLoading(false), 3000);
    }
  };
  
  // Determine button styling based on variant and size
  let buttonClasses = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors ';
  
  // Variant styling
  if (variant === 'primary') {
    buttonClasses += 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500 ';
  } else if (variant === 'secondary') {
    buttonClasses += 'bg-gray-800 hover:bg-gray-700 text-white focus:ring-gray-500 ';
  } else if (variant === 'outline') {
    buttonClasses += 'border border-gray-300 dark:border-gray-700 bg-transparent hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300 focus:ring-gray-500 ';
  }
  
  // Size styling
  if (size === 'sm') {
    buttonClasses += 'text-xs px-2.5 py-1.5 ';
  } else if (size === 'md') {
    buttonClasses += 'text-sm px-4 py-2 ';
  } else if (size === 'lg') {
    buttonClasses += 'text-base px-6 py-3 ';
  }
  
  // Add custom classes
  buttonClasses += className;
  
  return (
    <div>
      <button
        type="button"
        className={buttonClasses}
        onClick={handleDownload}
        disabled={isLoading}
      >
        {isLoading ? (
          <FiLoader className={`${icon ? 'mr-2' : ''} h-4 w-4 animate-spin`} />
        ) : icon ? (
          <FiDownload className="mr-2 h-4 w-4" />
        ) : null}
        
        {children || (type === 'release' ? 'Download Release' : 'Download Track')}
      </button>
      
      {error && (
        <p className="mt-2 text-sm text-red-600 dark:text-red-400">{error}</p>
      )}
    </div>
  );
} 