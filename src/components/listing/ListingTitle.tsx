import React from 'react';

interface ListingTitleProps {
  value: string;
  onChange: (title: string) => void;
  propertyType: string;
  location: string;
}

const ListingTitle: React.FC<ListingTitleProps> = ({ value, onChange, propertyType, location }) => {
  const suggestedTitle = `${propertyType.charAt(0).toUpperCase() + propertyType.slice(1)} in ${location}`;

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Listing title
        </label>
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={suggestedTitle}
          maxLength={50}
          className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF385C] focus:outline-none"
        />
        <p className="mt-2 text-sm text-gray-500">
          {value.length}/50 characters
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Writing tips:</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Keep it short and catchy</li>
          <li>• Highlight unique features</li>
          <li>• Include location if relevant</li>
          <li>• Be descriptive but concise</li>
        </ul>
      </div>

      {!value && (
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            Suggested title: <span className="font-medium">{suggestedTitle}</span>
          </p>
        </div>
      )}
    </div>
  );
};

export default ListingTitle;