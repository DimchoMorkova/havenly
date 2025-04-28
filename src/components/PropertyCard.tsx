import React, { useState } from 'react';
import { Heart, Star, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';
import { useFavorites } from '../hooks/useFavorites';
import { supabase } from '../lib/supabase';

interface PropertyCardProps {
  id?: string;
  imageUrl: string;
  photos?: string[];
  title: string;
  location: string;
  rating: number;
  reviews: number;
  price: number;
  dates: string;
  host: string;
  latitude?: number;
  longitude?: number;
  onClick?: () => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({
  id,
  imageUrl,
  photos = [],
  title,
  location,
  rating,
  reviews,
  price,
  dates,
  host,
  latitude,
  longitude,
  onClick,
}) => {
  const { isLoaded } = useGoogleMaps();
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const allPhotos = photos.length > 0 ? photos : [imageUrl];
  const [user, setUser] = useState<any>(null);
  const { favorites, toggleFavorite, isFavorited } = useFavorites(user?.id);

  React.useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
    };

    getUser();
  }, []);

  const handleFavoriteClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    if (!user) {
      // TODO: Show login modal
      return;
    }

    if (!id) return;

    setIsAnimating(true);
    await toggleFavorite(id);
    setTimeout(() => setIsAnimating(false), 300);
  };

  const nextImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev + 1) % allPhotos.length);
  };

  const previousImage = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex((prev) => (prev - 1 + allPhotos.length) % allPhotos.length);
  };

  const goToImage = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentImageIndex(index);
  };

  const handleClick = (e: React.MouseEvent) => {
    if (onClick) {
      onClick();
    }
  };

  return (
    <Link to={id ? `/listings/${id}` : "#"} className="group cursor-pointer" onClick={handleClick}>
      <div className="relative aspect-square overflow-hidden rounded-xl bg-gray-100">
        <img
          src={allPhotos[currentImageIndex]}
          alt={title}
          className="object-cover w-full h-full group-hover:scale-105 transition duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.src = 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800';
          }}
        />
        
        {/* Navigation Arrows */}
        {allPhotos.length > 1 && (
          <>
            {/* Left Arrow */}
            <button
              onClick={previousImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-4 h-4 text-gray-700" />
            </button>

            {/* Right Arrow */}
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-white"
              aria-label="Next image"
            >
              <ChevronRight className="w-4 h-4 text-gray-700" />
            </button>

            {/* Image Indicators */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5">
              {allPhotos.map((_, index) => (
                <button
                  key={index}
                  onClick={goToImage(index)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    index === currentImageIndex
                      ? 'bg-white scale-110'
                      : 'bg-white/60 hover:bg-white/80'
                  }`}
                  aria-label={`Go to image ${index + 1}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Action Buttons */}
        <div className="absolute top-3 right-3 flex space-x-2">
          {latitude && longitude && (
            <button 
              onClick={(e) => {
                e.preventDefault();
                setShowMap(true);
              }}
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors"
            >
              <MapPin className="w-5 h-5 text-gray-700" />
            </button>
          )}
          {id && (
            <button 
              className="p-2 rounded-full bg-white/80 backdrop-blur-sm hover:bg-white transition-colors relative"
              onClick={handleFavoriteClick}
            >
              <Heart 
                className={`w-5 h-5 stroke-[2] transition-all duration-300 ${
                  isFavorited(id)
                    ? 'fill-[#FF385C] text-[#FF385C]'
                    : 'fill-transparent text-gray-700 hover:text-[#FF385C]'
                } ${isAnimating ? 'scale-125' : 'scale-100'}`}
              />
            </button>
          )}
        </div>
      </div>

      <div className="mt-3">
        <div className="flex justify-between items-start">
          <h3 className="font-medium text-gray-900 line-clamp-1">{title}</h3>
          {reviews > 0 && (
            <div className="flex items-center space-x-1">
              <Star className="w-4 h-4 text-[#FF385C] fill-current" />
              <span className="text-sm">{rating}</span>
            </div>
          )}
        </div>
        <p className="text-gray-500 text-sm line-clamp-1">{location}</p>
        <p className="text-gray-500 text-sm">{host}</p>
        <p className="text-gray-500 text-sm">{dates}</p>
        <p className="mt-2 font-medium">
          ${price.toLocaleString()} <span className="font-normal text-gray-500">night</span>
        </p>
      </div>

      {/* Map Modal */}
      {showMap && isLoaded && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={(e) => {
          e.preventDefault();
          setShowMap(false);
        }}>
          <div className="bg-white rounded-lg p-4 w-full max-w-2xl mx-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium">Location</h3>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setShowMap(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            <div className="h-[400px] rounded-lg overflow-hidden">
              <GoogleMap
                mapContainerStyle={{ width: '100%', height: '100%' }}
                center={{ lat: latitude!, lng: longitude! }}
                zoom={14}
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
                <Marker
                  position={{ lat: latitude!, lng: longitude! }}
                  icon={{
                    path: google.maps.SymbolPath.CIRCLE,
                    scale: 50,
                    fillColor: '#FF385C',
                    fillOpacity: 0.2,
                    strokeWeight: 0,
                  }}
                />
              </GoogleMap>
            </div>
            <p className="mt-4 text-sm text-gray-600">
              Exact location provided after booking
            </p>
          </div>
        </div>
      )}
    </Link>
  );
};

export default PropertyCard;