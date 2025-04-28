import React from 'react';
import { Minus, Plus } from 'lucide-react';

interface BasicDetailsProps {
  value: {
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  };
  onChange: (details: {
    maxGuests: number;
    bedrooms: number;
    beds: number;
    bathrooms: number;
  }) => void;
}

const BasicDetails: React.FC<BasicDetailsProps> = ({ value, onChange }) => {
  const updateField = (field: keyof typeof value, increment: boolean) => {
    const step = field === 'bathrooms' ? 0.5 : 1;
    const newValue = increment ? value[field] + step : value[field] - step;
    
    // Ensure the value doesn't go below minimum
    const minValue = field === 'bathrooms' ? 0.5 : 1;
    if (newValue < minValue) return;

    // Maximum values
    const maxValues = {
      maxGuests: 16,
      bedrooms: 8,
      beds: 16,
      bathrooms: 8,
    };

    if (newValue > maxValues[field]) return;

    onChange({
      ...value,
      [field]: newValue,
    });
  };

  const fields = [
    { key: 'maxGuests', label: 'Guests' },
    { key: 'bedrooms', label: 'Bedrooms' },
    { key: 'beds', label: 'Beds' },
    { key: 'bathrooms', label: 'Bathrooms' },
  ] as const;

  return (
    <div className="space-y-6">
      {fields.map((field) => (
        <div key={field.key} className="flex items-center justify-between">
          <span className="text-gray-700 font-medium">{field.label}</span>
          <div className="flex items-center space-x-4">
            <button
              onClick={() => updateField(field.key, false)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
              type="button"
            >
              <Minus size={16} className="text-gray-600" />
            </button>
            <span className="w-8 text-center">{value[field.key]}</span>
            <button
              onClick={() => updateField(field.key, true)}
              className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center hover:border-gray-400"
              type="button"
            >
              <Plus size={16} className="text-gray-600" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default BasicDetails;