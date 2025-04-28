import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2 } from 'lucide-react';
import { uploadToImgur } from '../../lib/imgur';

interface PhotoUploadProps {
  photos: string[];
  onChange: (photos: string[]) => void;
}

const PhotoUpload: React.FC<PhotoUploadProps> = ({ photos, onChange }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    setUploadError(null);
    
    try {
      const uploadPromises = acceptedFiles.map(file => uploadToImgur(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      onChange([...photos, ...uploadedUrls]);
    } catch (error) {
      console.error('Upload error:', error);
      setUploadError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [photos, onChange]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
    disabled: uploading,
  });

  const removePhoto = (index: number) => {
    const newPhotos = [...photos];
    newPhotos.splice(index, 1);
    onChange(newPhotos);
  };

  return (
    <div className="space-y-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-all ${
          uploading ? 'opacity-50 cursor-not-allowed' : ''
        } ${
          isDragActive
            ? 'border-[#FF385C] bg-[#FF385C]/5'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <input {...getInputProps()} />
        {uploading ? (
          <div className="flex flex-col items-center">
            <Loader2 size={48} className="animate-spin text-[#FF385C] mb-4" />
            <p className="text-gray-600">Uploading images...</p>
          </div>
        ) : (
          <>
            <Upload
              size={48}
              className={`mx-auto mb-4 ${
                isDragActive ? 'text-[#FF385C]' : 'text-gray-400'
              }`}
            />
            <p className="text-gray-600">
              {isDragActive
                ? 'Drop your photos here'
                : 'Drag and drop your photos here, or click to select files'}
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Upload at least 5 photos
            </p>
          </>
        )}
      </div>

      {uploadError && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {uploadError}
        </div>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square">
              <img
                src={photo}
                alt={`Property photo ${index + 1}`}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => removePhoto(index)}
                className="absolute top-2 right-2 p-1 bg-white rounded-full shadow-md hover:bg-gray-100"
              >
                <X size={16} className="text-gray-600" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PhotoUpload;