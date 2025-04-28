import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Star, Share, Heart, MapPin, Users, Home, Bed, Bath, Wifi, Tv, Car, Snowflake, Shield } from 'lucide-react';
import ReservationWidget from '../components/reservation/ReservationWidget';

interface Listing {
  id: string;
  title: string;
  description: string;
  address: string;
  price_per_night: number;
  photos: string[];
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  amenities: string[];
  property_type: string;
  access_type: string;
  created_at: string;
  profiles?: {
    username: string;
  };
}

const ListingDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [listing, setListing] = useState<Listing | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAllPhotos, setShowAllPhotos] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select(`
            *,
            profiles:user_id (
              username
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setListing(data);
      } catch (err: any) {
        console.error('Error fetching listing:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen pt-20 px-6">
        <div className="max-w-7xl mx-auto animate-pulse">
          <div className="h-[60vh] bg-gray-200 rounded-xl mb-8"></div>
          <div className="h-8 bg-gray-200 rounded w-1/2 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !listing) {
    return (
      <div className="min-h-screen pt-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl font-semibold text-gray-900">
            {error || 'Listing not found'}
          </h2>
        </div>
      </div>
    );
  }

  if (showAllPhotos) {
    return (
      <div className="fixed inset-0 bg-white z-50 overflow-y-auto">
        <div className="p-4">
          <button
            onClick={() => setShowAllPhotos(false)}
            className="fixed left-8 top-8 flex items-center gap-1 px-4 py-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>
          <div className="max-w-6xl mx-auto grid gap-4 mt-16">
            {listing.photos.map((photo, index) => (
              <div key={index}>
                <img
                  src={photo}
                  alt={`${listing.title} - Photo ${index + 1}`}
                  className="w-full rounded-2xl"
                />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const amenityIcons: Record<string, any> = {
    wifi: Wifi,
    tv: Tv,
    parking: Car,
    ac: Snowflake,
    smoke_alarm: Shield,
  };

  return (
    <div className="min-h-screen pt-20 px-6">
      <div className="max-w-7xl mx-auto">
        {/* Title Section */}
        <div className="mb-6">
          <h1 className="text-3xl font-semibold text-gray-900 mb-2">
            {listing.title}
          </h1>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center">
                <Star className="w-4 h-4 text-[#FF385C] fill-current" />
                <span className="ml-1 font-medium">New</span>
                <span className="mx-2">·</span>
                <span className="text-gray-600">{listing.address}</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <button className="flex items-center hover:bg-gray-100 px-4 py-2 rounded-lg">
                <Share className="w-4 h-4 mr-2" />
                Share
              </button>
              <button className="flex items-center hover:bg-gray-100 px-4 py-2 rounded-lg">
                <Heart className="w-4 h-4 mr-2" />
                Save
              </button>
            </div>
          </div>
        </div>

        {/* Photo Grid */}
        <div className="relative mb-8">
          <div className="grid grid-cols-4 gap-2 rounded-xl overflow-hidden aspect-[2/1]">
            <div className="col-span-2 row-span-2 relative">
              {listing.photos[0] && (
                <img
                  src={listing.photos[0]}
                  alt={listing.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="relative">
              {listing.photos[1] && (
                <img
                  src={listing.photos[1]}
                  alt={`${listing.title} - Photo 2`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="relative">
              {listing.photos[2] && (
                <img
                  src={listing.photos[2]}
                  alt={`${listing.title} - Photo 3`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="relative">
              {listing.photos[3] && (
                <img
                  src={listing.photos[3]}
                  alt={`${listing.title} - Photo 4`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="relative">
              {listing.photos[4] && (
                <img
                  src={listing.photos[4]}
                  alt={`${listing.title} - Photo 5`}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAllPhotos(true)}
            className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-shadow flex items-center gap-2"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
            </svg>
            Show all photos
          </button>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Left Column */}
          <div className="lg:col-span-2">
            {/* Host and Property Type */}
            <div className="flex items-start justify-between pb-6 border-b">
              <div>
                <h2 className="text-2xl font-semibold mb-2">
                  {listing.access_type === 'entire' ? 'Entire ' : ''}
                  {listing.property_type} hosted by {listing.profiles?.username}
                </h2>
                <div className="flex items-center space-x-2 text-gray-600">
                  <span>{listing.max_guests} guests</span>
                  <span>·</span>
                  <span>{listing.bedrooms} bedrooms</span>
                  <span>·</span>
                  <span>{listing.beds} beds</span>
                  <span>·</span>
                  <span>{listing.bathrooms} baths</span>
                </div>
              </div>
              <div className="w-12 h-12 rounded-full bg-gray-200"></div>
            </div>

            {/* Key Features */}
            <div className="py-6 border-b space-y-6">
              <div className="flex items-start space-x-4">
                <Home className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium">Entire home</h3>
                  <p className="text-gray-600">
                    You'll have the {listing.property_type.toLowerCase()} to yourself.
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-4">
                <MapPin className="w-6 h-6 mt-1" />
                <div>
                  <h3 className="font-medium">Great location</h3>
                  <p className="text-gray-600">
                    Recent guests rated the location 4.9/5 stars.
                  </p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-semibold mb-4">About this place</h2>
              <p className="text-gray-600 whitespace-pre-line">
                {listing.description}
              </p>
            </div>

            {/* Amenities */}
            <div className="py-6 border-b">
              <h2 className="text-xl font-semibold mb-4">What this place offers</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.amenities?.map((amenity) => {
                  const Icon = amenityIcons[amenity] || Shield;
                  return (
                    <div key={amenity} className="flex items-center space-x-4">
                      <Icon className="w-6 h-6 text-gray-600" />
                      <span className="capitalize">
                        {amenity.replace('_', ' ')}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column - Booking Widget */}
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <ReservationWidget
                listingId={listing.id}
                pricePerNight={listing.price_per_night}
                maxGuests={listing.max_guests}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetail;