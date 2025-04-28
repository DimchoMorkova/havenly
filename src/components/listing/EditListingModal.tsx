import React, { useState, useCallback } from 'react';
import { X, Loader2, Upload, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useDropzone } from 'react-dropzone';
import { uploadToImgur } from '../../lib/imgur';
import AmenitiesSelection from './AmenitiesSelection';
import BasicDetails from './BasicDetails';

interface EditListingModalProps {
  listing: any;
  onClose: () => void;
  onUpdate: (updatedListing: any) => void;
}

const EditListingModal: React.FC<EditListingModalProps> = ({ listing, onClose, onUpdate }) => {
  const [formData, setFormData] = useState({
    title: listing.title || '',
    description: listing.description || '',
    price_per_night: listing.price_per_night,
    status: listing.status,
    amenities: listing.amenities || [],
    photos: listing.photos || [],
    basics: {
      maxGuests: listing.max_guests,
      bedrooms: listing.bedrooms,
      beds: listing.beds,
      bathrooms: listing.bathrooms,
    },
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (formData.photos.length + acceptedFiles.length > 20) {
      setError('Maximum 20 photos allowed');
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      const uploadPromises = acceptedFiles.map(file => uploadToImgur(file));
      const uploadedUrls = await Promise.all(uploadPromises);
      
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, ...uploadedUrls]
      }));
    } catch (error) {
      console.error('Upload error:', error);
      setError('Failed to upload images. Please try again.');
    } finally {
      setUploading(false);
    }
  }, [formData.photos]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.webp'],
    },
    multiple: true,
    disabled: uploading,
  });

  const removePhoto = (index: number) => {
    setFormData(prev => ({
      ...prev,
      photos: prev.photos.filter((_, i) => i !== index)
    }));
  };

  const movePhoto = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) ||
      (direction === 'down' && index === formData.photos.length - 1)
    ) {
      return;
    }

    const newPhotos = [...formData.photos];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    [newPhotos[index], newPhotos[newIndex]] = [newPhotos[newIndex], newPhotos[index]];

    setFormData(prev => ({
      ...prev,
      photos: newPhotos
    }));
  };

  const handleSave = async () => {
    if (!formData.title.trim()) {
      setError('Title is required');
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const { data, error } = await supabase
        .from('listings')
        .update({
          title: formData.title,
          description: formData.description,
          price_per_night: formData.price_per_night,
          status: formData.status,
          amenities: formData.amenities,
          photos: formData.photos,
          max_guests: formData.basics.maxGuests,
          bedrooms: formData.basics.bedrooms,
          beds: formData.basics.beds,
          bathrooms: formData.basics.bathrooms,
          updated_at: new Date().toISOString(),
        })
        .eq('id', listing.id)
        .select()
        .single();

      if (error) throw error;

      onUpdate(data);
      setSuccessMessage('Changes saved successfully!');
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err: any) {
      console.error('Error saving changes:', err);
      setError(err.message || 'Failed to save changes');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center z-50 overflow-y-auto">
      <div className="relative min-h-screen w-full flex items-center justify-center p-4">
        <div className="bg-white rounded-xl w-full max-w-3xl my-8">
          <div className="sticky top-0 bg-white rounded-t-xl border-b z-10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Edit Listing</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="px-6 py-4 overflow-y-auto max-h-[calc(100vh-8rem)]">
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-medium mb-4">Basic Information</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                      placeholder="Enter listing title"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      rows={4}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                      placeholder="Describe your listing"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Price per night
                    </label>
                    <input
                      type="number"
                      value={formData.price_per_night}
                      onChange={(e) => setFormData(prev => ({ ...prev, price_per_night: Number(e.target.value) }))}
                      min="0"
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#FF385C] focus:border-transparent"
                    >
                      <option value="draft">Draft</option>
                      <option value="published">Published</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Property Details */}
              <div>
                <h3 className="text-lg font-medium mb-4">Property Details</h3>
                <BasicDetails
                  value={formData.basics}
                  onChange={(basics) => setFormData(prev => ({ ...prev, basics }))}
                />
              </div>

              {/* Amenities */}
              <div>
                <h3 className="text-lg font-medium mb-4">Amenities</h3>
                <AmenitiesSelection
                  selected={formData.amenities}
                  onChange={(amenities) => setFormData(prev => ({ ...prev, amenities }))}
                />
              </div>

              {/* Photos */}
              <div>
                <h3 className="text-lg font-medium mb-4">Photos</h3>
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
                          {formData.photos.length}/20 photos
                        </p>
                      </>
                    )}
                  </div>

                  {formData.photos.length > 0 && (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {formData.photos.map((photo, index) => (
                        <div key={index} className="relative aspect-square group">
                          <img
                            src={photo}
                            alt={`Property photo ${index + 1}`}
                            className="w-full h-full object-cover rounded-lg"
                          />
                          <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center space-x-2">
                            <button
                              onClick={() => movePhoto(index, 'up')}
                              disabled={index === 0}
                              className="p-1 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                            >
                              ↑
                            </button>
                            <button
                              onClick={() => movePhoto(index, 'down')}
                              disabled={index === formData.photos.length - 1}
                              className="p-1 bg-white rounded-full hover:bg-gray-100 disabled:opacity-50"
                            >
                              ↓
                            </button>
                            <button
                              onClick={() => removePhoto(index)}
                              className="p-1 bg-white rounded-full hover:bg-gray-100"
                            >
                              <Trash2 size={16} className="text-red-600" />
                            </button>
                          </div>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-white rounded-full px-2 py-1 text-xs font-medium">
                              Featured
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center text-red-600">
                  <AlertCircle size={20} className="mr-2" />
                  {error}
                </div>
              )}

              {successMessage && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-center text-green-600">
                  <CheckCircle size={20} className="mr-2" />
                  {successMessage}
                </div>
              )}
            </div>
          </div>

          <div className="sticky bottom-0 bg-white rounded-b-xl border-t z-10 px-6 py-4 flex justify-end space-x-4">
            <button
              onClick={onClose}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#FF385C]/90 disabled:opacity-50 flex items-center"
            >
              {saving ? (
                <>
                  <Loader2 size={20} className="animate-spin mr-2" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditListingModal;