import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, MapPin, Calendar, Users, ChevronLeft, ChevronRight, Plus, Minus, Trash2 } from 'lucide-react';
import { GoogleMap, DrawingManager, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';
import { DayPicker, DateRange } from 'react-day-picker';
import { addDays, format, isWithinInterval, isBefore, startOfToday } from 'date-fns';
import usePlacesAutocomplete, { getGeocode, getLatLng } from 'use-places-autocomplete';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (searchParams: SearchParams) => void;
}

interface SearchParams {
  location?: {
    address: string;
    bounds?: google.maps.LatLngBounds;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };
  dates?: {
    checkIn: Date;
    checkOut: Date;
  };
  guests: {
    adults: number;
    children: number;
    infants: number;
  };
}

type SearchTab = 'location' | 'dates' | 'guests';

const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onSearch }) => {
  const { isLoaded } = useGoogleMaps();
  const [activeTab, setActiveTab] = useState<SearchTab>('location');
  const [searchParams, setSearchParams] = useState<SearchParams>({
    guests: { adults: 1, children: 0, infants: 0 }
  });
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedRange, setSelectedRange] = useState<DateRange>();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const {
    ready,
    value: locationValue,
    suggestions: { status, data },
    setValue: setLocationValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'],
    },
    debounce: 300,
  });

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleLocationSelect = async (address: string) => {
    clearSuggestions();
    setLocationValue(address, false);

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);
      const bounds = new google.maps.LatLngBounds(
        new google.maps.LatLng(lat - 0.1, lng - 0.1),
        new google.maps.LatLng(lat + 0.1, lng + 0.1)
      );

      if (map) {
        map.fitBounds(bounds);
        
        if (marker) {
          marker.setMap(null);
        }
        
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          animation: google.maps.Animation.DROP
        });
        setMarker(newMarker);
      }

      setSearchParams(prev => ({
        ...prev,
        location: { 
          address,
          bounds,
          coordinates: { lat, lng }
        }
      }));

      const updatedSearches = [address, ...recentSearches.filter(s => s !== address)].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(search => search !== searchToRemove);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleDateSelect = (range: DateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      setSearchParams(prev => ({
        ...prev,
        dates: {
          checkIn: range.from,
          checkOut: range.to
        }
      }));
    }
  };

  const handleGuestChange = (type: 'adults' | 'children' | 'infants', increment: boolean) => {
    setSearchParams(prev => {
      const guests = { ...prev.guests };
      const value = guests[type] + (increment ? 1 : -1);
      
      if (type === 'adults') {
        guests[type] = Math.max(1, Math.min(value, 16));
      } else if (type === 'children') {
        guests[type] = Math.max(0, Math.min(value, 15));
      } else {
        guests[type] = Math.max(0, Math.min(value, 5));
      }

      return { ...prev, guests };
    });
  };

  const handleSearch = () => {
    onSearch(searchParams);
    onClose();
  };

  const disabledDays = [
    { before: startOfToday() },
  ];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-start justify-center">
      <div className="bg-white w-full min-h-screen md:min-h-0 md:rounded-xl md:shadow-xl md:max-w-4xl md:mt-20">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-white border-b flex items-center justify-between p-4">
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X size={20} />
          </button>
          <div className="flex space-x-6">
            <button
              onClick={() => setActiveTab('location')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'location' ? 'text-[#FF385C] border-b-2 border-[#FF385C]' : 'text-gray-500'
              }`}
            >
              Where
            </button>
            <button
              onClick={() => setActiveTab('dates')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'dates' ? 'text-[#FF385C] border-b-2 border-[#FF385C]' : 'text-gray-500'
              }`}
            >
              When
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`py-2 px-4 font-medium ${
                activeTab === 'guests' ? 'text-[#FF385C] border-b-2 border-[#FF385C]' : 'text-gray-500'
              }`}
            >
              Who?
            </button>
          </div>
          <button
            onClick={handleSearch}
            className="bg-[#FF385C] text-white px-6 py-2 rounded-lg hover:bg-[#FF385C]/90"
          >
            Search
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6">
          {activeTab === 'location' && (
            <div className="space-y-6">
              <div className="relative mt-12 md:mt-0">
                <div className="absolute left-4 top-4">
                  <Search className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  placeholder="Search destinations"
                  value={locationValue}
                  onChange={(e) => setLocationValue(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 border-2 rounded-lg focus:border-[#FF385C] focus:outline-none"
                  disabled={!ready}
                />
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-4">
                  {status === "OK" && (
                    <div className="border rounded-lg shadow-lg">
                      {data.map((suggestion) => (
                        <button
                          key={suggestion.place_id}
                          onClick={() => handleLocationSelect(suggestion.description)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start"
                        >
                          <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="ml-3">
                            <div className="font-medium">{suggestion.structured_formatting.main_text}</div>
                            <div className="text-sm text-gray-500">{suggestion.structured_formatting.secondary_text}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  {recentSearches.length > 0 && (
                    <div>
                      <h3 className="text-lg font-medium mb-3">Recent searches</h3>
                      <div className="max-h-48 overflow-y-auto space-y-2">
                        {recentSearches.map((search, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 rounded-lg group"
                          >
                            <button
                              onClick={() => handleLocationSelect(search)}
                              className="flex items-center flex-grow text-left"
                            >
                              <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                              {search}
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeRecentSearch(search);
                              }}
                              className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Trash2 size={16} className="text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {isLoaded && (
                  <div className="h-[300px] md:h-[400px] rounded-lg overflow-hidden">
                    <GoogleMap
                      mapContainerStyle={{ width: '100%', height: '100%' }}
                      center={searchParams.location?.coordinates || { lat: 42.6977, lng: 23.3219 }}
                      zoom={10}
                      onLoad={setMap}
                      options={{
                        streetViewControl: false,
                        mapTypeControl: false,
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'dates' && (
            <div className="space-y-6 mt-12 md:mt-0">
              <div className="flex justify-center">
                <DayPicker
                  mode="range"
                  selected={selectedRange}
                  onSelect={handleDateSelect}
                  numberOfMonths={window.innerWidth >= 768 ? 2 : 1}
                  disabled={disabledDays}
                  showOutsideDays
                  classNames={{
                    day_selected: "bg-[#FF385C] text-white",
                    day_today: "font-bold",
                  }}
                />
              </div>

              <div className="flex space-x-4">
                <button
                  onClick={() => handleDateSelect({
                    from: new Date(),
                    to: addDays(new Date(), 2)
                  })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Weekend
                </button>
                <button
                  onClick={() => handleDateSelect({
                    from: new Date(),
                    to: addDays(new Date(), 7)
                  })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Week
                </button>
                <button
                  onClick={() => handleDateSelect({
                    from: new Date(),
                    to: addDays(new Date(), 30)
                  })}
                  className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Month
                </button>
              </div>
            </div>
          )}

          {activeTab === 'guests' && (
            <div className="space-y-6 mt-12 md:mt-0">
              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <h3 className="font-medium">Adults</h3>
                  <p className="text-sm text-gray-500">Ages 18 or above</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleGuestChange('adults', false)}
                    disabled={searchParams.guests.adults <= 1}
                    className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{searchParams.guests.adults}</span>
                  <button
                    onClick={() => handleGuestChange('adults', true)}
                    disabled={searchParams.guests.adults >= 16}
                    className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <h3 className="font-medium">Children</h3>
                  <p className="text-sm text-gray-500">Ages 2-17</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleGuestChange('children', false)}
                    disabled={searchParams.guests.children <= 0}
                    className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{searchParams.guests.children}</span>
                  <button
                    onClick={() => handleGuestChange('children', true)}
                    disabled={searchParams.guests.children >= 15}
                    className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between py-4 border-b">
                <div>
                  <h3 className="font-medium">Infants</h3>
                  <p className="text-sm text-gray-500">Under 2</p>
                </div>
                <div className="flex items-center space-x-4">
                  <button
                    onClick={() => handleGuestChange('infants', false)}
                    disabled={searchParams.guests.infants <= 0}
                    className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                  >
                    <Minus size={16} />
                  </button>
                  <span className="w-8 text-center">{searchParams.guests.infants}</span>
                  <button
                    onClick={() => handleGuestChange('infants', true)}
                    disabled={searchParams.guests.infants >= 5}
                    className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Guest policies</h4>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>• Maximum 16 guests per stay</li>
                  <li>• Infants don't count toward maximum occupancy</li>
                  <li>• Pets must be declared separately</li>
                </ul>
              </div>

              <button
                onClick={() => setSearchParams(prev => ({
                  ...prev,
                  guests: { adults: 1, children: 0, infants: 0 }
                }))}
                className="w-full py-2 text-[#FF385C] font-medium hover:bg-[#FF385C]/5 rounded-lg"
              >
                Reset guest count
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchModal;