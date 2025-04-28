import React from 'react';
import { DollarSign } from 'lucide-react';

interface PricingSetupProps {
  value: {
    basePrice: number;
    currency: string;
  };
  onChange: (pricing: {
    basePrice: number;
    currency: string;
  }) => void;
}

const PricingSetup: React.FC<PricingSetupProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Base price (per night)
        </label>
        <div className="relative">
          <div className="absolute left-4 top-1/2 -translate-y-1/2">
            <DollarSign className="text-gray-400" size={20} />
          </div>
          <input
            type="number"
            value={value.basePrice}
            onChange={(e) =>
              onChange({
                ...value,
                basePrice: Number(e.target.value),
              })
            }
            min="0"
            step="1"
            className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-lg focus:border-[#FF385C] focus:outline-none"
          />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg space-y-4">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Base price</span>
          <span className="font-medium">${value.basePrice}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">Airbnb service fee (5%)</span>
          <span className="font-medium">${(value.basePrice * 0.05).toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-base pt-4 border-t">
          <span className="font-medium">Guest total</span>
          <span className="font-medium">
            ${(value.basePrice * 1.05).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PricingSetup;