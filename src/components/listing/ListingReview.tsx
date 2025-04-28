import React from 'react';
import { Check, AlertCircle } from 'lucide-react';

interface ListingReviewProps {
  formData: any;
  onPublish: () => void;
  error: string | null;
}

const ListingReview: React.FC<ListingReviewProps> = ({ formData, onPublish, error }) => {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div className="flex items-center space-x-2 text-green-600">
          <Check size={20} />
          <span className="font-medium">Your listing is ready to publish!</span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg space-y-4">
          <h3 className="font-medium">Listing summary:</h3>
          <div className="space-y-2 text-sm">
            <p>
              <span className="text-gray-600">Property type:</span>{' '}
              <span className="font-medium">{formData.propertyType}</span>
            </p>
            <p>
              <span className="text-gray-600">Space type:</span>{' '}
              <span className="font-medium">{formData.spaceType}</span>
            </p>
            <p>
              <span className="text-gray-600">Location:</span>{' '}
              <span className="font-medium">{formData.location.address}</span>
            </p>
            <p>
              <span className="text-gray-600">Price per night:</span>{' '}
              <span className="font-medium">
                ${formData.pricing.basePrice} {formData.pricing.currency}
              </span>
            </p>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={18} />
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4">
        <button
          onClick={onPublish}
          className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#FF385C]/90 disabled:opacity-50"
        >
          Publish listing
        </button>
      </div>
    </div>
  );
};

export default ListingReview;