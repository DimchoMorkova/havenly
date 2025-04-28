import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export const useFavorites = (userId?: string) => {
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFavorites = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('favorites')
          .select('listing_id')
          .eq('user_id', userId);

        if (error) throw error;

        setFavorites(new Set(data.map(fav => fav.listing_id)));
      } catch (error) {
        console.error('Error fetching favorites:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFavorites();

    // Subscribe to changes
    const subscription = supabase
      .channel('favorites_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'favorites',
          filter: `user_id=eq.${userId}`,
        },
        async () => {
          // Refetch favorites when changes occur
          const { data } = await supabase
            .from('favorites')
            .select('listing_id')
            .eq('user_id', userId);

          if (data) {
            setFavorites(new Set(data.map(fav => fav.listing_id)));
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const toggleFavorite = async (listingId: string) => {
    if (!userId) return false;

    const isFavorited = favorites.has(listingId);

    try {
      if (isFavorited) {
        // Remove from favorites
        const { error } = await supabase
          .from('favorites')
          .delete()
          .eq('user_id', userId)
          .eq('listing_id', listingId);

        if (error) throw error;

        setFavorites(prev => {
          const next = new Set(prev);
          next.delete(listingId);
          return next;
        });
      } else {
        // Add to favorites
        const { error } = await supabase
          .from('favorites')
          .insert([{ user_id: userId, listing_id: listingId }]);

        if (error) throw error;

        setFavorites(prev => new Set([...prev, listingId]));
      }

      return true;
    } catch (error) {
      console.error('Error toggling favorite:', error);
      return false;
    }
  };

  return {
    favorites,
    loading,
    toggleFavorite,
    isFavorited: (listingId: string) => favorites.has(listingId),
  };
};