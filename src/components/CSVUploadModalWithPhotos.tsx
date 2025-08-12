import React, { useState, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { csvUploadService } from '../services/csvUpload';
import type { PhotoUploadMapping } from '../services/csvUpload';

interface CSVUploadProps {
  onUploadComplete: (results: { success: number; failed: number; errors: string[] }) => void;
  onClose: () => void;
}

interface ItemPhotoMapping {
  itemName: string;
  photos: File[];
}

export const CSVUploadModalWithPhotos: React.FC<CSVUploadProps> = ({ onUploadComplete, onClose }) => {
  const { user, getItemListingLimits } = useAuth();
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const [photoMappings, setPhotoMappings] = useState<ItemPhotoMapping[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'csv' | 'photos' | 'upload'>('csv');
  const [parsedItems, setParsedItems] = useState<string[]>([]);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const photoFileInputRef = useRef<HTMLInputElement>(null);
  const [selectedItemForPhotos, setSelectedItemForPhotos] = useState<string>('');
  
  const limits = getItemListingLimits();

  // Handle CSV file selection and parsing
  const handleCsvFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setCsvFile(selectedFile);
      
      try {
        // Parse CSV to get item names for photo mapping
        const csvContent = await selectedFile.text();
        const rows = csvUploadService.parseCSV(csvContent);
        const itemNames = rows.map(row => row.name).filter(Boolean);
        setParsedItems(itemNames);
        
        // Initialize photo mappings
        setPhotoMappings(itemNames.map(name => ({ itemName: name, photos: [] })));
        setCurrentStep('photos');
      } catch (error) {
        alert('Error parsing CSV file. Please check the format.');
        setCsvFile(null);
      }
    } else {
      alert('Please select a valid CSV file');
    }
  };

  // Handle photo selection for a specific item
  const handlePhotoSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(event.target.files || []);
    
    if (!selectedItemForPhotos || selectedFiles.length === 0) {
      return;
    }

    // Validate selected photos
    const validPhotos = selectedFiles.filter(file => {
      const isValidType = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'].includes(file.type);
      const isValidSize = file.size <= 10 * 1024 * 1024; // 10MB limit
      
      if (!isValidType) {
        alert(`${file.name} is not a valid image file. Only JPEG, PNG, and WebP are allowed.`);
        return false;
      }
      
      if (!isValidSize) {
        alert(`${file.name} is too large. Maximum size is 10MB.`);
        return false;
      }
      
      return true;
    });

    if (validPhotos.length > 0) {
      setPhotoMappings(prev =>
        prev.map(mapping =>
          mapping.itemName === selectedItemForPhotos
            ? { ...mapping, photos: [...mapping.photos, ...validPhotos].slice(0, 5) } // Max 5 photos per item
            : mapping
        )
      );
    }

    // Clear the file input
    if (photoFileInputRef.current) {
      photoFileInputRef.current.value = '';
    }
  };

  // Remove a photo from an item
  const removePhoto = (itemName: string, photoIndex: number) => {
    setPhotoMappings(prev =>
      prev.map(mapping =>
        mapping.itemName === itemName
          ? { ...mapping, photos: mapping.photos.filter((_, index) => index !== photoIndex) }
          : mapping
      )
    );
  };

  // Handle final upload with CSV and photos
  const handleUpload = async () => {
    if (!csvFile) return;

    setIsUploading(true);
    setProgress(0);
    setCurrentStep('upload');

    try {
      const csvContent = await csvFile.text();
      
      // Convert photo mappings to the format expected by the service
      const photoUploadMapping: PhotoUploadMapping = {};
      photoMappings.forEach(mapping => {
        if (mapping.photos.length > 0) {
          photoUploadMapping[mapping.itemName] = mapping.photos;
        }
      });
      
      // Upload with photos
      const results = await csvUploadService.uploadFromCSV(
        csvContent,
        limits.maxItems === -1 ? 1000 : limits.maxItems,
        (current: number, total: number) => {
          setProgress((current / total) * 100);
        },
        user?.id || 'anonymous',
        photoUploadMapping
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

  const goBackToCsv = () => {
    setCurrentStep('csv');
    setCsvFile(null);
    setParsedItems([]);
    setPhotoMappings([]);
  };

  const proceedToUpload = () => {
    setCurrentStep('upload');
  };

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full flex items-center justify-center z-50">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-screen overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            Upload Items via CSV with Photos
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'csv' ? 'bg-teal-600 text-white' : 'bg-teal-600 text-white'
            }`}>
              1
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">CSV File</span>
          </div>
          
          <div className="flex-1 h-px bg-gray-300 mx-4" />
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'photos' || currentStep === 'upload' ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              2
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Add Photos</span>
          </div>
          
          <div className="flex-1 h-px bg-gray-300 mx-4" />
          
          <div className="flex items-center">
            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${
              currentStep === 'upload' ? 'bg-teal-600 text-white' : 'bg-gray-300 text-gray-500'
            }`}>
              3
            </div>
            <span className="ml-2 text-sm font-medium text-gray-700">Upload</span>
          </div>
        </div>

        {/* Subscription Limits Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-6">
          <p className="text-sm text-blue-800">
            <strong>{user?.subscriptionPlan || 'Free'} Plan:</strong> Upload up to {limits.maxItems === -1 ? 'unlimited' : limits.maxItems} items via CSV
            <span className="block text-xs mt-1">✓ Includes S3 storage for food item data and images (up to 5 photos per item)</span>
            <span className="block text-xs">✓ Bulletproof reliability with localStorage fallback</span>
          </p>
        </div>

        {/* Step 1: CSV Upload */}
        {currentStep === 'csv' && (
          <div className="space-y-4">
            {/* Template Download */}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Need a template?</span>
              <div className="flex space-x-2">
                <a
                  href="/sample-food-items.csv"
                  download="sample-food-items.csv"
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  Download Sample
                </a>
                <span className="text-gray-400">|</span>
                <button
                  onClick={downloadTemplate}
                  className="text-teal-600 hover:text-teal-800 text-sm font-medium"
                >
                  Generate Template
                </button>
              </div>
            </div>

            {/* File Selection */}
            <div>
              <label htmlFor="csv-file-input" className="block text-sm font-medium text-gray-700 mb-2">
                Select CSV File
              </label>
              <input
                id="csv-file-input"
                ref={csvFileInputRef}
                type="file"
                accept=".csv"
                onChange={handleCsvFileSelect}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-teal-50 file:text-teal-700
                  hover:file:bg-teal-100"
              />
            </div>
          </div>
        )}

        {/* Step 2: Photo Upload */}
        {currentStep === 'photos' && (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-800">
                ✅ CSV file parsed successfully! Found {parsedItems.length} items.
                Now you can add photos for each item (optional, up to 5 photos per item).
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Item List */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">Your Items</h4>
                <div className="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
                  {parsedItems.map((itemName) => {
                    const mapping = photoMappings.find(m => m.itemName === itemName);
                    const photoCount = mapping?.photos.length || 0;
                    
                    return (
                      <button
                        key={itemName}
                        className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                          selectedItemForPhotos === itemName ? 'bg-teal-50 border-teal-200' : ''
                        }`}
                        onClick={() => setSelectedItemForPhotos(itemName)}
                        type="button"
                      >
                        <div className="flex justify-between items-center">
                          <span className="font-medium text-gray-900">{itemName}</span>
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                            {photoCount} photo{photoCount !== 1 ? 's' : ''}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Photo Upload Area */}
              <div>
                <h4 className="text-md font-medium text-gray-900 mb-4">
                  Add Photos {selectedItemForPhotos && `for "${selectedItemForPhotos}"`}
                </h4>
                
                {selectedItemForPhotos ? (
                  <div className="space-y-4">
                    {/* Photo Upload Input */}
                    <div>
                      <input
                        ref={photoFileInputRef}
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/webp"
                        multiple
                        onChange={handlePhotoSelect}
                        className="block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-blue-50 file:text-blue-700
                          hover:file:bg-blue-100"
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Max 5 photos per item, 10MB per photo. Formats: JPEG, PNG, WebP
                      </p>
                    </div>

                    {/* Selected Photos Preview */}
                    <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto">
                      {photoMappings
                        .find(m => m.itemName === selectedItemForPhotos)
                        ?.photos.map((photo, photoIndex) => (
                          <div key={`${photo.name}-${photoIndex}`} className="relative group">
                            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                              <img
                                src={URL.createObjectURL(photo)}
                                alt={photo.name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <button
                              onClick={() => removePhoto(selectedItemForPhotos, photoIndex)}
                              className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </div>
                        ))
                      }
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Select an item from the list to add photos
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={goBackToCsv}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
              >
                ← Back to CSV
              </button>
              <button
                onClick={proceedToUpload}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700"
              >
                Proceed to Upload →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Upload Progress */}
        {currentStep === 'upload' && (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
              <p className="text-sm text-blue-800">
                Uploading your items with photos to S3 storage with bulletproof reliability...
              </p>
            </div>

            {/* Upload Progress */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing items and uploading photos...</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-teal-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-gray-600">
                  Photos are being uploaded to S3 with retry logic for maximum reliability
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex space-x-3 pt-4">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
                disabled={isUploading}
              >
                Cancel
              </button>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className="flex-1 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-md hover:bg-teal-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {isUploading ? 'Uploading...' : 'Start Upload'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
