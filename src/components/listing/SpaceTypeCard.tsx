import React from 'react';

interface SpaceTypeCardProps {
  id: string;
  title: string;
  description: string;
  selected: boolean;
  onClick: () => void;
}

const SpaceTypeCard: React.FC<SpaceTypeCardProps> = ({
  title,
  description,
  selected,
  onClick,
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-6 rounded-xl border-2 text-left transition-all ${
        selected
          ? 'border-[#FF385C] bg-[#FF385C]/5'
          : 'border-gray-200 hover:border-gray-300'
      }`}
    >
      <h3 className={`text-lg font-medium ${selected ? 'text-[#FF385C]' : 'text-gray-700'}`}>
        {title}
      </h3>
      <p className="mt-1 text-gray-600">{description}</p>
    </button>
  );
};

export default SpaceTypeCard;