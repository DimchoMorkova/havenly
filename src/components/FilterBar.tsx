import React, { useRef, useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, TreePine, Ticket, Palmtree, Building2, Home, Hotel, Castle, Mountain, Tent, Siren as Fire, Compass, Home as AFrame, Waves, Star, Crown, Sparkles, Anchor, MapPin, Droplets, Tent as OffGrid, School as Pool, Trees, Mountain as Desert, Wheat, Bot as Boat, Landmark, Palmtree as Palm, Snowflake, DoorOpen as Door, Power as Tower, SkipBack as Ski, TrendingUp } from 'lucide-react';

export interface Filter {
  label: string;
  icon: React.ElementType;
  id: string;
  category: string;
}

const filters: Filter[] = [
  { label: 'Trending', icon: TrendingUp, id: 'trending', category: 'popularity' },
  { label: 'A-Frame', icon: AFrame, id: 'a_frame', category: 'property_type' },
  { label: 'Beachfront', icon: Waves, id: 'beachfront', category: 'highlights' },
  { label: 'Countryside', icon: TreePine, id: 'countryside', category: 'location' },
  { label: 'Mountain view', icon: Mountain, id: 'mountain_view', category: 'highlights' },
  { label: 'Cabin', icon: Home, id: 'cabin', category: 'property_type' },
  { label: 'Dome', icon: Building2, id: 'dome', category: 'property_type' },
  { label: 'Beach', icon: Palmtree, id: 'beach', category: 'location' },
  { label: 'Castle', icon: Castle, id: 'castle', category: 'property_type' },
  { label: 'Mansion', icon: Crown, id: 'mansion', category: 'property_type' },
  { label: 'Luxe', icon: Sparkles, id: 'luxe', category: 'highlights' },
  { label: 'New', icon: Star, id: 'new', category: 'status' },
  { label: 'Island', icon: Anchor, id: 'island', category: 'location' },
  { label: 'Lake', icon: Droplets, id: 'lake', category: 'location' },
  { label: 'City center', icon: Hotel, id: 'city_center', category: 'location' },
  { label: 'Lakefront', icon: MapPin, id: 'lakefront', category: 'highlights' },
  { label: 'Off-grid', icon: OffGrid, id: 'off_grid', category: 'highlights' },
  { label: 'Pool', icon: Pool, id: 'pool', category: 'amenities' },
  { label: 'National parks', icon: Trees, id: 'national_parks', category: 'location' },
  { label: 'Desert', icon: Desert, id: 'desert', category: 'location' },
  { label: 'Farm', icon: Wheat, id: 'farm', category: 'property_type' },
  { label: 'Boat', icon: Boat, id: 'boat', category: 'property_type' },
  { label: 'Historic', icon: Landmark, id: 'historic', category: 'highlights' },
  { label: 'Tropical', icon: Palm, id: 'tropical', category: 'location' },
  { label: 'Arctic', icon: Snowflake, id: 'arctic', category: 'location' },
  { label: 'Room', icon: Door, id: 'room', category: 'property_type' },
  { label: 'Tower', icon: Tower, id: 'tower', category: 'property_type' },
  { label: 'Ski-in/out', icon: Ski, id: 'ski_in_out', category: 'amenities' },
];

interface FilterBarProps {
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

const FilterBar: React.FC<FilterBarProps> = ({ activeFilters, onFilterChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    const scrollContainer = scrollContainerRef.current;
    if (scrollContainer) {
      scrollContainer.addEventListener('scroll', handleScroll);
      handleScroll();
      return () => scrollContainer.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({
        left: scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const toggleFilter = (filterId: string) => {
    if (activeFilters.includes(filterId)) {
      onFilterChange([]);
    } else {
      onFilterChange([filterId]);
    }
  };

  return (
    <div className="sticky top-[72px] bg-white z-40 border-b">
      <div className="max-w-[2520px] mx-auto px-6 py-4 relative">
        {showLeftArrow && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        )}

        <div
          ref={scrollContainerRef}
          className="flex space-x-10 overflow-x-auto scrollbar-hide relative scroll-smooth px-4"
          style={{ maskImage: showRightArrow ? 'linear-gradient(to right, black 90%, transparent 100%)' : 'none' }}
        >
          {filters.map((filter) => {
            const isActive = activeFilters.includes(filter.id);
            const Icon = filter.icon;

            return (
              <button
                key={filter.id}
                onClick={() => toggleFilter(filter.id)}
                className={`flex flex-col items-center space-y-2 min-w-[60px] transition-colors ${
                  isActive ? 'text-[#FF385C]' : 'text-gray-600 hover:text-[#FF385C]'
                }`}
              >
                <div className={`p-2 rounded-full transition-all ${
                  isActive ? 'bg-[#FF385C]/10' : 'hover:bg-gray-100'
                }`}>
                  <Icon size={24} />
                </div>
                <span className="text-xs whitespace-nowrap">{filter.label}</span>
              </button>
            );
          })}
        </div>

        {showRightArrow && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:shadow-lg transition-all"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        )}

        {activeFilters.length > 0 && (
          <button
            onClick={() => onFilterChange([])}
            className="absolute right-6 top-1/2 -translate-y-1/2 border rounded-xl px-4 py-2 flex items-center space-x-2 bg-white hover:bg-gray-50"
          >
            <span>Clear filter</span>
          </button>
        )}
      </div>
    </div>
  );
};

export default FilterBar;