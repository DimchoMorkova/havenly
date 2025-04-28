import React, { useState } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface DeleteListingModalProps {
  listing: {
    id: string;
    title: string;
  };
  onClose: () => void;
  onDelete: (listingId: string) => void;
}

const DeleteListingModal: React.FC<DeleteListingModalProps> = ({ listing, onClose, onDelete }) => {
  const [confirmText, setConfirmText] = useState('');
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (confirmText !== listing.title) {
      setError('Please type the listing title exactly to confirm deletion');
      return;
    }

    setDeleting(true);
    setError(null);

    try {
      const { error: deleteError } = await supabase
        .from('listings')
        .delete()
        .eq('id', listing.id);

      if (deleteError) throw deleteError;

      onDelete(listing.id);
      onClose();
    } catch (err: any) {
      console.error('Error deleting listing:', err);
      setError(err.message || 'Failed to delete listing');
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-md w-full mx-4">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center text-red-600">
              <AlertTriangle size={24} className="mr-2" />
              <h2 className="text-xl font-semibold">Delete Listing</h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X size={24} />
            </button>
          </div>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-700 font-medium mb-2">Warning: This action cannot be undone</p>
              <p className="text-red-600 text-sm">
                Deleting this listing will permanently remove:
              </p>
              <ul className="text-red-600 text-sm mt-2 space-y-1">
                <li>• All property information and photos</li>
                <li>• All booking history and reviews</li>
                <li>• All associated data and statistics</li>
              </ul>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Please type <span className="font-semibold">{listing.title}</span> to confirm deletion
              </label>
              <input
                type="text"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                placeholder="Type listing title here"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-600 text-sm">
                {error}
              </div>
            )}

            <div className="flex justify-end space-x-4 pt-4">
              <button
                onClick={onClose}
                className="px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting || confirmText !== listing.title}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:hover:bg-red-600 flex items-center"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Deleting...
                  </>
                ) : (
                  'Delete Permanently'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteListingModal;