import React, { createContext, useContext, useCallback } from 'react';
import { useJsApiLoader } from '@react-google-maps/api';

const GOOGLE_MAPS_API_KEY = 'XXX';

// Define the libraries array type
type Libraries = ('places')[];
const libraries: Libraries = ['places'];

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

export const useGoogleMaps = () => useContext(GoogleMapsContext);

// Define the callback function that will be called when the script loads
const initMap = () => {
  console.log('Google Maps script loaded successfully');
};

// Add the callback to the window object
declare global {
  interface Window {
    initMap: () => void;
  }
}
window.initMap = initMap;

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
    libraries,
    version: "weekly",
    callback: 'initMap'  // Add the callback name here
  });

  // Log any loading errors for debugging
  if (loadError) {
    console.error('Google Maps failed to load:', loadError);
  }

  const value = {
    isLoaded,
    loadError
  };

  return (
    <GoogleMapsContext.Provider value={value}>
      {children}
    </GoogleMapsContext.Provider>
  );
};