import React from 'react';
import { Star, Heart, Home, Map, Zap, Coffee, Mountain, Waves, Anchor, Droplets, TreePine, Tent } from 'lucide-react';

interface PropertyHighlightsProps {
  selected: string[];
  onChange: (highlights: string[]) => void;
}

const highlights = [
  { id: 'peaceful', label: 'Peaceful', icon: Star },
  { id: 'unique', label: 'Unique', icon: Heart },
  { id: 'family_friendly', label: 'Family-friendly', icon: Home },
  { id: 'city_center', label: 'City center', icon: Map },
  { id: 'stylish', label: 'Stylish', icon: Zap },
  { id: 'spacious', label: 'Spacious', icon: Coffee },
  { id: 'mountain_view', label: 'Mountain view', icon: Mountain },
  { id: 'beachfront', label: 'Beachfront', icon: Waves },
  { id: 'island', label: 'Island', icon: Anchor },
  { id: 'lakefront', label: 'Lakefront', icon: Droplets },
  { id: 'countryside', label: 'Countryside', icon: TreePine },
  { id: 'off_grid', label: 'Off-grid', icon: Tent },
];

const PropertyHighlights: React.FC<PropertyHighlightsProps> = ({ selected, onChange }) => {
  const toggleHighlight = (highlightId: string) => {
    if (selected.includes(highlightId)) {
      onChange(selected.filter((id) => id !== highlightId));
    } else {
      onChange([...selected, highlightId]);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((highlight) => {
          const Icon = highlight.icon;
          const isSelected = selected.includes(highlight.id);

          return (
            <button
              key={highlight.id}
              onClick={() => toggleHighlight(highlight.id)}
              className={`flex items-center p-4 rounded-lg border-2 transition-all ${
                isSelected
                  ? 'border-[#FF385C] bg-[#FF385C]/5'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <Icon
                size={24}
                className={isSelected ? 'text-[#FF385C]' : 'text-gray-600'}
              />
              <span className={`ml-3 ${isSelected ? 'text-[#FF385C]' : 'text-gray-700'}`}>
                {highlight.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default PropertyHighlights;