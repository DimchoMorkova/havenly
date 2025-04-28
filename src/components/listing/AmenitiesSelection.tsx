import React from 'react';
import { Wifi, Tv, Twitch as Kitchen, Shield, ChevronFirst as FirstAid, Siren as Fire, Car, Snowflake, Dumbbell, Trees, Waves, School as Pool, Palmtree, Mountain, Anchor, Droplets, TreePine, Tent, Building2, Castle, Crown, Star, Sparkles, MapPin, Wheat, Bot as Boat, Landmark, Palmtree as Palm, DoorOpen as Door, Power as Tower, SkipBack as Ski } from 'lucide-react';

interface AmenitiesSelectionProps {
  selected: string[];
  onChange: (amenities: string[]) => void;
}

const amenityCategories = [
  {
    title: 'Essentials',
    items: [
      { id: 'wifi', label: 'Wifi', icon: Wifi },
      { id: 'tv', label: 'TV', icon: Tv },
      { id: 'kitchen', label: 'Kitchen', icon: Kitchen },
      { id: 'washer', label: 'Washer', icon: Droplets },
      { id: 'dryer', label: 'Dryer', icon: Snowflake },
    ],
  },
  {
    title: 'Safety',
    items: [
      { id: 'smoke_alarm', label: 'Smoke alarm', icon: Shield },
      { id: 'first_aid', label: 'First aid kit', icon: FirstAid },
      { id: 'fire_extinguisher', label: 'Fire extinguisher', icon: Fire },
      { id: 'security_system', label: 'Security system', icon: Shield },
    ],
  },
  {
    title: 'Features',
    items: [
      { id: 'parking', label: 'Free parking', icon: Car },
      { id: 'ac', label: 'Air conditioning', icon: Snowflake },
      { id: 'gym', label: 'Gym', icon: Dumbbell },
      { id: 'pool', label: 'Pool', icon: Pool },
      { id: 'hot_tub', label: 'Hot tub', icon: Pool },
    ],
  },
  {
    title: 'Location',
    items: [
      { id: 'beachfront', label: 'Beachfront', icon: Palmtree },
      { id: 'lakefront', label: 'Lakefront', icon: Droplets },
      { id: 'ski_in_out', label: 'Ski-in/ski-out', icon: Ski },
      { id: 'mountain_view', label: 'Mountain view', icon: Mountain },
      { id: 'ocean_view', label: 'Ocean view', icon: Waves },
    ],
  },
  {
    title: 'Property Type',
    items: [
      { id: 'cabin', label: 'Cabin', icon: TreePine },
      { id: 'dome', label: 'Dome', icon: Building2 },
      { id: 'castle', label: 'Castle', icon: Castle },
      { id: 'mansion', label: 'Mansion', icon: Crown },
      { id: 'treehouse', label: 'Treehouse', icon: Trees },
      { id: 'boat', label: 'Boat', icon: Boat },
      { id: 'tower', label: 'Tower', icon: Tower },
    ],
  },
  {
    title: 'Special Features',
    items: [
      { id: 'historic', label: 'Historic', icon: Landmark },
      { id: 'luxury', label: 'Luxury', icon: Sparkles },
      { id: 'off_grid', label: 'Off the grid', icon: Tent },
      { id: 'island', label: 'Island', icon: Anchor },
      { id: 'tropical', label: 'Tropical', icon: Palm },
    ],
  },
];

const AmenitiesSelection: React.FC<AmenitiesSelectionProps> = ({ selected, onChange }) => {
  const toggleAmenity = (amenityId: string) => {
    if (selected.includes(amenityId)) {
      onChange(selected.filter((id) => id !== amenityId));
    } else {
      onChange([...selected, amenityId]);
    }
  };

  return (
    <div className="space-y-8">
      {amenityCategories.map((category) => (
        <div key={category.title}>
          <h3 className="text-lg font-medium text-gray-900 mb-4">{category.title}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {category.items.map((amenity) => {
              const Icon = amenity.icon;
              const isSelected = selected.includes(amenity.id);

              return (
                <button
                  key={amenity.id}
                  onClick={() => toggleAmenity(amenity.id)}
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
                    {amenity.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default AmenitiesSelection;