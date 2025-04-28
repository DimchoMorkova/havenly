import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import PropertyCard from '../components/PropertyCard';
import { Grid3X3, LayoutList, SlidersHorizontal } from 'lucide-react';

interface Listing {
  id: string;
  title: string;
  address: string;
  photos: string[];
  price_per_night: number;
  property_type: string;
  profiles?: {
    username: string;
  };
}

const Wishlist = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [view, setView] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'newest' | 'price-high' | 'price-low'>('newest');

  useEffect(() => {
    const fetchFavorites = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/');
          return;
        }

        const { data: favoriteListings, error: favoritesError } = await supabase
          .from('favorites')
          .select(`
            listing_id,
            listings (
              id,
              title,
              address,
              photos,
              price_per_night,
              property_type,
              profiles:user_id (
                username
              )
            )
          `)
          .eq('user_id', session.user.id);

        if (favoritesError) throw favoritesError;

        // Extract the listing data from the nested structure
        const listings = favoriteListings
          ?.map(fav => fav.listings)
          .filter(listing => listing) as Listing[];

        setFavorites(listings || []);
      } catch (err: any) {
        console.error('Error fetching favorites:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();
  }, [navigate]);

  const sortedFavorites = [...favorites].sort((a, b) => {
    switch (sortBy) {
      case 'price-high':
        return b.price_per_night - a.price_per_night;
      case 'price-low':
        return a.price_per_night - b.price_per_night;
      default:
        return 0;
    }
  });

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-200 rounded-xl"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-semibold">Wishlist</h1>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 border rounded-lg p-1">
              <button
                onClick={() => setView('grid')}
                className={`p-2 rounded ${
                  view === 'grid' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <Grid3X3 size={20} />
              </button>
              <button
                onClick={() => setView('list')}
                className={`p-2 rounded ${
                  view === 'list' ? 'bg-gray-100' : 'hover:bg-gray-50'
                }`}
              >
                <LayoutList size={20} />
              </button>
            </div>
            <div className="flex items-center space-x-2">
              <SlidersHorizontal size={20} className="text-gray-500" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="border rounded-lg px-3 py-2"
              >
                <option value="newest">Newest First</option>
                <option value="price-high">Price: High to Low</option>
                <option value="price-low">Price: Low to High</option>
              </select>
            </div>
          </div>
        </div>

        {error ? (
          <div className="text-red-500 text-center py-8">{error}</div>
        ) : favorites.length === 0 ? (
          <div className="text-center py-16">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              No favorites yet
            </h2>
            <p className="text-gray-600 mb-8">
              Start saving your favorite places by clicking the heart icon on any listing.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-3 bg-[#FF385C] text-white rounded-lg hover:bg-[#FF385C]/90"
            >
              Explore homes
            </button>
          </div>
        ) : (
          <div
            className={
              view === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6'
                : 'space-y-6'
            }
          >
            {sortedFavorites.map((listing) => (
              <PropertyCard
                key={listing.id}
                id={listing.id}
                imageUrl={listing.photos?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800'}
                photos={listing.photos}
                title={listing.title || `${listing.property_type} in ${listing.address}`}
                location={listing.address}
                rating={4.5}
                reviews={0}
                price={listing.price_per_night}
                dates="Available now"
                host={`Hosted by ${listing.profiles?.username || 'Anonymous'}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Wishlist;