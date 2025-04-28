import React, { useState, useCallback, useEffect } from 'react';
import { MapPin, Search, Loader2 } from 'lucide-react';
import { GoogleMap, Marker } from '@react-google-maps/api';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { useGoogleMaps } from '../../contexts/GoogleMapsContext';

interface LocationInputProps {
  value: {
    address: string;
    latitude: number | null;
    longitude: number | null;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  };
  onChange: (location: {
    address: string;
    latitude: number | null;
    longitude: number | null;
    street?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
  }) => void;
}

const defaultCenter = {
  lat: 40.7128,
  lng: -74.0060
};

const LocationInput: React.FC<LocationInputProps> = ({ value, onChange }) => {
  const { isLoaded } = useGoogleMaps();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    ready,
    value: searchValue,
    suggestions: { status, data },
    setValue: setSearchValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    callbackName: "initMap",
    requestOptions: {
      types: ['address'],
    },
    debounce: 300,
  });

  useEffect(() => {
    // Get user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          console.log('Error getting location');
        }
      );
    }
  }, []);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleSelect = async (description: string) => {
    setIsLoading(true);
    clearSuggestions();
    setSearchValue(description, false);

    try {
      const results = await getGeocode({ address: description });
      const { lat, lng } = await getLatLng(results[0]);
      const addressComponents = results[0].address_components;

      // Extract address components
      const street = [
        (addressComponents.find(c => c.types.includes('street_number'))?.long_name || ''),
        (addressComponents.find(c => c.types.includes('route'))?.long_name || ''),
      ].filter(Boolean).join(' ');

      const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
      const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
      const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
      const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';

      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(16);
      }

      onChange({
        address: description,
        latitude: lat,
        longitude: lng,
        street,
        city,
        state,
        postalCode,
        country,
      });
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        const addressComponents = result.results[0].address_components;

        const street = [
          (addressComponents.find(c => c.types.includes('street_number'))?.long_name || ''),
          (addressComponents.find(c => c.types.includes('route'))?.long_name || ''),
        ].filter(Boolean).join(' ');

        const city = addressComponents.find(c => c.types.includes('locality'))?.long_name || '';
        const state = addressComponents.find(c => c.types.includes('administrative_area_level_1'))?.long_name || '';
        const postalCode = addressComponents.find(c => c.types.includes('postal_code'))?.long_name || '';
        const country = addressComponents.find(c => c.types.includes('country'))?.long_name || '';

        setSearchValue(address, false);
        onChange({
          address,
          latitude: lat,
          longitude: lng,
          street,
          city,
          state,
          postalCode,
          country,
        });
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <div className={`relative border-2 rounded-lg transition-all ${
          ready ? 'border-gray-200 focus-within:border-[#FF385C]' : 'border-gray-200 opacity-50'
        }`}>
          <div className="absolute left-4 top-4">
            <Search className="text-gray-400" size={24} />
          </div>
          <input
            type="text"
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            disabled={!ready}
            placeholder="Enter your address"
            className="w-full pl-12 pr-4 py-4 rounded-lg focus:outline-none"
          />
          {isLoading && (
            <div className="absolute right-4 top-4">
              <Loader2 className="w-6 h-6 animate-spin text-[#FF385C]" />
            </div>
          )}
        </div>

        {/* Suggestions Dropdown */}
        {status === "OK" && (
          <div className="absolute w-full mt-1 bg-white rounded-lg shadow-lg z-10 border">
            {data.map((suggestion) => (
              <div
                key={suggestion.place_id}
                onClick={() => handleSelect(suggestion.description)}
                className="px-4 py-3 hover:bg-gray-50 cursor-pointer"
              >
                <div className="flex items-start">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                  <span className="ml-2">{suggestion.description}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div className="h-[400px] rounded-lg overflow-hidden">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={value.latitude && value.longitude 
            ? { lat: value.latitude, lng: value.longitude }
            : userLocation || defaultCenter
          }
          zoom={12}
          onLoad={onLoad}
          onUnmount={onUnmount}
          onClick={handleMapClick}
          options={{
            streetViewControl: true,
            mapTypeControl: true,
            fullscreenControl: true,
            styles: [
              {
                featureType: 'poi',
                elementType: 'labels',
                stylers: [{ visibility: 'off' }],
              },
            ],
          }}
        >
          {value.latitude && value.longitude && (
            <Marker
              position={{ lat: value.latitude, lng: value.longitude }}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>

      {/* Address Details */}
      {value.street && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Street Address
            </label>
            <input
              type="text"
              value={value.street}
              readOnly
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City
            </label>
            <input
              type="text"
              value={value.city}
              readOnly
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State
            </label>
            <input
              type="text"
              value={value.state}
              readOnly
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code
            </label>
            <input
              type="text"
              value={value.postalCode}
              readOnly
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg bg-gray-50"
            />
          </div>
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="font-medium text-gray-700 mb-2">Location privacy</h3>
        <p className="text-gray-600 text-sm">
          Your exact address will only be shared with confirmed guests. We'll show only approximate location in search results.
        </p>
      </div>
    </div>
  );
};

export default LocationInput;