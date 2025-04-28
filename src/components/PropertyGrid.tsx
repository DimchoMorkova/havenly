import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import PropertyCard from './PropertyCard';
import { Loader2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { getTrendingListings, incrementListingClick } from '../lib/trending';

interface Listing {
  id: string;
  title: string;
  address: string;
  photos: string[];
  price_per_night: number;
  status: string;
  property_type: string;
  amenities: string[];
  highlights: string[];
  created_at: string;
  user_id: string;
}

interface PropertyGridProps {
  activeFilters: string[];
}

const PropertyGrid: React.FC<PropertyGridProps> = ({ activeFilters }) => {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchParams] = useSearchParams();
  const locationQuery = searchParams.get('location');
  const [trendingListings, setTrendingListings] = useState<string[]>([]);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data, error } = await supabase
          .from('listings')
          .select('*')
          .eq('status', 'published')
          .order('created_at', { ascending: false });

        if (error) throw error;
        setListings(data || []);

        // Fetch trending listings
        const trending = await getTrendingListings();
        setTrendingListings(trending);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    const subscription = supabase
      .channel('listings_channel')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
          filter: 'status=eq.published',
        },
        fetchListings
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const handleListingClick = async (listingId: string) => {
    await incrementListingClick(listingId);
  };

  const filteredListings = listings.filter((listing) => {
    // First filter by location if it exists
    if (locationQuery) {
      const locationLower = locationQuery.toLowerCase();
      const addressLower = listing.address.toLowerCase();

      // Check if the address contains the location query
      if (!addressLower.includes(locationLower)) {
        return false;
      }
    }

    // Then apply other filters
    if (activeFilters.length === 0) return true;

    const filter = activeFilters[0]; // Only use the first filter since we only allow one

    // Check if trending filter is active
    if (filter === 'trending') {
      return trendingListings.includes(listing.id);
    }

    // Check property type
    if (listing.property_type === filter) return true;

    // Check amenities
    if (listing.amenities?.includes(filter)) return true;

    // Check highlights
    if (listing.highlights?.includes(filter)) return true;

    // Special filters
    if (filter === 'new') {
      const oneMonthAgo = new Date();
      oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
      return new Date(listing.created_at) > oneMonthAgo;
    }

    return false;
  });

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-144px)] pt-4 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#FF385C]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[calc(100vh-144px)] pt-4 px-6">
        <div className="flex items-center justify-center py-12">
          <p className="text-red-500">Error loading listings: {error}</p>
        </div>
      </div>
    );
  }

  const defaultImage =
    'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800';

  return (
    <div className="min-h-[calc(100vh-144px)] pt-24 px-6 pb-20">
      {locationQuery && filteredListings.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            No properties found in {locationQuery}
          </h2>
          <p className="text-gray-600">
            Try searching in a different location or adjusting your filters
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredListings.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                No matches found
              </h2>
              <p className="text-gray-600">
                Try selecting a different filter or clear the current one
              </p>
            </div>
          ) : (
            filteredListings.map((listing) => {
              const displayTitle =
                listing.title ||
                `${
                  listing.property_type.charAt(0).toUpperCase() +
                  listing.property_type.slice(1)
                } in ${listing.address}`;

              return (
                <PropertyCard
                  key={listing.id}
                  id={listing.id}
                  imageUrl={listing.photos?.[0] || defaultImage}
                  photos={listing.photos}
                  title={displayTitle}
                  location={listing.address}
                  rating={4.5}
                  reviews={0}
                  price={listing.price_per_night}
                  dates="Available now"
                  host=""
                  onClick={() => handleListingClick(listing.id)}
                />
              );
            })
          )}
        </div>
      )}
    </div>
  );
};

export default PropertyGrid;