import React from 'react';

interface DescriptionProps {
  value: string;
  onChange: (description: string) => void;
}

const Description: React.FC<DescriptionProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Describe your place to guests. Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood."
          className="w-full h-48 p-4 border-2 border-gray-200 rounded-lg focus:border-[#FF385C] focus:outline-none resize-none"
        />
        <p className="mt-2 text-sm text-gray-500">
          {value.length}/500 characters
        </p>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Writing tips:</h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Write a clear opening statement</li>
          <li>• Describe the space and layout</li>
          <li>• Mention unique features</li>
          <li>• Share what's nearby</li>
          <li>• Add your hosting style</li>
        </ul>
      </div>
    </div>
  );
};

export default Description;