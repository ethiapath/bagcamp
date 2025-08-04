'use client';

import React, { useState, useRef } from 'react';
import { FiUpload, FiFile, FiX, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

interface FileUploadProps {
  contentType: 'artist' | 'release' | 'track';
  contentId: string;
  accept?: string;
  maxSizeMB?: number;
  onUploadComplete?: (data: any) => void;
  onUploadError?: (error: string) => void;
  className?: string;
  label?: string;
}

export default function FileUpload({
  contentType,
  contentId,
  accept,
  maxSizeMB = 50, // Default max size 50MB
  onUploadComplete,
  onUploadError,
  className = '',
  label = 'Upload File'
}: FileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    // Clear previous states
    setError(null);
    setSuccess(false);
    
    // Check file size
    const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
    if (selectedFile.size > maxSize) {
      setError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
      if (onUploadError) onUploadError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
      return;
    }
    
    // All checks passed, set the file
    setFile(selectedFile);
  };
  
  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file to upload');
      return;
    }
    
    setUploading(true);
    setError(null);
    setProgress(0);
    
    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);
      formData.append('contentType', contentType);
      formData.append('contentId', contentId);
      
      // Upload the file
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to upload file');
      }
      
      // Upload successful
      setSuccess(true);
      setUploading(false);
      setProgress(100);
      
      // Reset file after success
      setFile(null);
      if (fileInputRef.current) fileInputRef.current.value = '';
      
      // Call completion callback
      if (onUploadComplete) onUploadComplete(data);
      
    } catch (error: any) {
      setError(error.message || 'An error occurred during upload');
      setUploading(false);
      setProgress(0);
      
      if (onUploadError) onUploadError(error.message || 'An error occurred during upload');
    }
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      
      // Clear previous states
      setError(null);
      setSuccess(false);
      
      // Check file size
      const maxSize = maxSizeMB * 1024 * 1024; // Convert MB to bytes
      if (droppedFile.size > maxSize) {
        setError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
        if (onUploadError) onUploadError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`);
        return;
      }
      
      // All checks passed, set the file
      setFile(droppedFile);
      
      // Auto-upload when a file is dropped
      setTimeout(() => {
        handleUpload();
      }, 100);
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };
  
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };
  
  return (
    <div className={`w-full ${className}`}>
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center 
          ${error ? 'border-red-300 bg-red-50 dark:bg-red-900/10' : 
            success ? 'border-green-300 bg-green-50 dark:bg-green-900/10' : 
            'border-gray-300 dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          accept={accept}
          onChange={handleFileChange}
        />
        
        {!file && !success ? (
          <div className="space-y-3">
            <div className="flex justify-center">
              <FiUpload className="w-12 h-12 text-gray-400" />
            </div>
            <div>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-500"
              >
                Click to upload
              </button>{' '}
              or drag and drop
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              {accept ? `${accept.split(',').join(', ')} • ` : ''}
              Max {maxSizeMB}MB
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {file && !success && (
              <>
                <div className="flex items-center justify-center space-x-2">
                  <FiFile className="w-8 h-8 text-gray-400" />
                  <div className="text-left">
                    <div className="text-sm font-medium truncate max-w-xs">{file.name}</div>
                    <div className="text-xs text-gray-500">{formatFileSize(file.size)}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                  >
                    <FiX className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                
                {!uploading ? (
                  <button
                    type="button"
                    onClick={handleUpload}
                    className="px-4 py-2 mt-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Upload
                  </button>
                ) : (
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500" 
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>
                )}
              </>
            )}
            
            {success && (
              <div className="flex items-center justify-center space-x-2 text-green-600 dark:text-green-400">
                <FiCheckCircle className="w-8 h-8" />
                <span>Upload successful!</span>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setFile(null);
                    if (fileInputRef.current) fileInputRef.current.value = '';
                  }}
                  className="p-1 ml-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>
            )}
          </div>
        )}
        
        {error && (
          <div className="mt-3 flex items-center justify-center space-x-2 text-red-600 dark:text-red-400">
            <FiAlertCircle className="w-5 h-5" />
            <span className="text-sm">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
} 