import { supabase } from './supabase';

// Cache for trending listings
let trendingCache: {
  listings: string[];
  lastUpdated: number;
} | null = null;

const CACHE_DURATION = 1000 * 60 * 60; // 1 hour

export async function incrementListingClick(listingId: string) {
  try {
    const { data, error } = await supabase.rpc('increment_listing_click', {
      listing_id_param: listingId
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error incrementing listing click:', error);
    return false;
  }
}

export async function getTrendingListings() {
  try {
    // Check cache first
    if (
      trendingCache &&
      Date.now() - trendingCache.lastUpdated < CACHE_DURATION
    ) {
      return trendingCache.listings;
    }

    // Get trending listings
    const { data: trendingData, error: trendingError } = await supabase
      .rpc('get_trending_listings', { days_window: 7 });

    if (trendingError) throw trendingError;

    // Filter trending listings and get their details
    const trendingIds = trendingData
      .filter(item => item.is_trending)
      .map(item => item.listing_id);

    if (trendingIds.length === 0) {
      return [];
    }

    // Update cache
    trendingCache = {
      listings: trendingIds,
      lastUpdated: Date.now()
    };

    return trendingIds;
  } catch (error) {
    console.error('Error fetching trending listings:', error);
    return [];
  }
}