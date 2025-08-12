import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { csvUploadService } from '../services/csvUpload';

interface CSVUploadProps {
  onUploadComplete: (results: { success: number; failed: number; errors: string[] }) => void;
  onClose: () => void;
}

export const CSVUploadModal: React.FC<CSVUploadProps> = ({ onUploadComplete, onClose }) => {
  const { user, getItemListingLimits } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const limits = getItemListingLimits();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsUploading(true);
    setProgress(0);

    try {
      const csvContent = await file.text();
      
      // Use the CSV upload service
      const results = await csvUploadService.uploadFromCSV(
        csvContent,
        limits.maxItems === -1 ? 1000 : limits.maxItems, // Set reasonable upper limit
        (current: number, total: number) => {
          setProgress((current / total) * 100);
        }
      );

      onUploadComplete(results);
      
    } catch (error) {
      onUploadComplete({ 
        success: 0, 
        failed: 1, 
        errors: [`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`] 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const downloadTemplate = () => {
    const template = csvUploadService.generateTemplate();
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'food_items_template.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full mx-4">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Upload Items via CSV</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-4">
          {/* Subscription Limits Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
            <p className="text-sm text-blue-800">
              <strong>{user?.subscriptionPlan || 'Free'} Plan:</strong> Up to {limits.maxItems === -1 ? 'unlimited' : limits.maxItems} items
              {limits.hasAPIAccess && ', API access available'}
            </p>
          </div>

          {/* Template Download */}
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Need a template?</span>
            <button
              onClick={downloadTemplate}
              className="text-teal-600 hover:text-teal-800 text-sm font-medium"
            >
              Download CSV Template
            </button>
          </div>

          {/* File Selection */}
          <div>
            <label htmlFor="csv-file-input" className="block text-sm font-medium text-gray-700 mb-2">
              Select CSV File
            </label>
            <input
              id="csv-file-input"
              ref={fileInputRef}
              type="file"
              accept=".csv"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-teal-50 file:text-teal-700
                hover:file:bg-teal-100"
            />
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              onClick={handleUpload}
              disabled={!file || isUploading}
              className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isUploading ? 'Uploading...' : 'Upload CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
