import React from 'react';
import { Loader2 } from 'lucide-react';

interface ImageUploadProps {
  type: 'desktop' | 'mobile';
  currentImage: string;
  onUpload: (file: File) => void;
  uploading: boolean;
}

function ImageUpload({ type, currentImage, onUpload, uploading }: ImageUploadProps) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700">
        Imagem {type === 'desktop' ? 'Desktop' : 'Mobile'}
      </label>
      <div className="mt-1 flex items-center space-x-4">
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
            }
          }}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-medium
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100"
        />
        {uploading && <Loader2 className="h-5 w-5 animate-spin text-blue-600" />}
      </div>
      {currentImage && (
        <div className="mt-2">
          <img
            src={currentImage}
            alt={`Preview ${type}`}
            className={`rounded border border-gray-200 ${
              type === 'desktop' ? 'h-32 w-64' : 'h-32 w-24'
            } object-cover`}
          />
        </div>
      )}
    </div>
  );
}

export default ImageUpload;