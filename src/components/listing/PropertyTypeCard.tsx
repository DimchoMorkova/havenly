import React from 'react';
import { DivideIcon as LucideIcon } from 'lucide-react';

interface PropertyTypeCardProps {
  id: string;
  label: string;
  icon: LucideIcon;
  selected: boolean;
  onClick: () => void;
}

const PropertyTypeCard: React.FC<PropertyTypeCardProps> = ({
  label,
  icon: Icon,
  selected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 rounded-xl border-2 transition-all ${
        selected
          ? 'border-[#FF385C] bg-[#FF385C]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <Icon
        size={32}
        className={selected ? 'text-[#FF385C]' : 'text-gray-600'}
      />
      <p className={`mt-2 font-medium ${selected ? 'text-[#FF385C]' : 'text-gray-700'}`}>
        {label}
      </p>
    </button>
  );
};

export default PropertyTypeCard;