import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, Edit, Eye, Settings, ArrowUpDown, Filter, Plus, Trash2, AlertCircle } from 'lucide-react';
import { DayPicker } from 'react-day-picker';
import { format, isWithinInterval, parseISO } from 'date-fns';
import EditListingModal from '../components/listing/EditListingModal';
import DeleteListingModal from '../components/listing/DeleteListingModal';

interface Listing {
  id: string;
  title: string;
  address: string;
  photos: string[];
  price_per_night: number;
  status: string;
  property_type: string;
  description: string;
  amenities: string[];
  max_guests: number;
  bedrooms: number;
  beds: number;
  bathrooms: number;
  reservations?: Reservation[];
}

interface Reservation {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
}

const ManageHomes = () => {
  const navigate = useNavigate();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<string | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingListing, setDeletingListing] = useState<Listing | null>(null);

  useEffect(() => {
    const fetchListings = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
          navigate('/');
          return;
        }

        const { data: listings, error: listingsError } = await supabase
          .from('listings')
          .select(`
            *,
            reservations (
              id,
              check_in_date,
              check_out_date,
              guests,
              total_price,
              status
            )
          `)
          .eq('user_id', session.user.id)
          .order('created_at', { ascending: false });

        if (listingsError) throw listingsError;
        setListings(listings || []);
      } catch (err: any) {
        console.error('Error fetching listings:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchListings();

    // Subscribe to changes
    const subscription = supabase
      .channel('listings_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'listings',
        },
        fetchListings
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  const handleEditClick = (listing: Listing) => {
    setEditingListing(listing);
    setShowEditModal(true);
  };

  const handleDeleteClick = (listing: Listing) => {
    setDeletingListing(listing);
    setShowDeleteModal(true);
  };

  const handleListingUpdate = (updatedListing: Listing) => {
    setListings(prevListings =>
      prevListings.map(listing =>
        listing.id === updatedListing.id ? updatedListing : listing
      )
    );
  };

  const handleListingDelete = (deletedListingId: string) => {
    setListings(prevListings =>
      prevListings.filter(listing => listing.id !== deletedListingId)
    );
  };

  const getReservationMetrics = (reservations: Reservation[] = []) => {
    const upcoming = reservations.filter(r => 
      r.status === 'confirmed' && 
      new Date(r.check_in_date) > new Date()
    ).length;

    const completed = reservations.filter(r => 
      r.status === 'completed'
    ).length;

    const totalRevenue = reservations
      .filter(r => r.status === 'completed')
      .reduce((sum, r) => sum + r.total_price, 0);

    return { upcoming, completed, totalRevenue };
  };

  const getOccupancyRate = (reservations: Reservation[] = []) => {
    const totalDays = 30;
    const bookedDays = new Set();
    
    reservations.forEach(reservation => {
      const checkIn = new Date(reservation.check_in_date);
      const checkOut = new Date(reservation.check_out_date);
      
      if (reservation.status === 'completed' || reservation.status === 'confirmed') {
        let current = new Date(checkIn);
        while (current <= checkOut) {
          if (isWithinInterval(current, { 
            start: new Date(new Date().setDate(new Date().getDate() - 30)), 
            end: new Date() 
          })) {
            bookedDays.add(current.toISOString().split('T')[0]);
          }
          current.setDate(current.getDate() + 1);
        }
      }
    });

    return Math.round((bookedDays.size / totalDays) * 100);
  };

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(i => (
                <div key={i} className="border rounded-lg p-4">
                  <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                  <div className="space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
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
          <h1 className="text-2xl font-semibold">Manage Your Properties</h1>
          <button
            onClick={() => navigate('/create-listing')}
            className="flex items-center px-4 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#FF385C]/90"
          >
            <Plus size={20} className="mr-2" />
            Add new property
          </button>
        </div>

        <div className="flex items-center space-x-4 mb-6">
          <div className="flex items-center space-x-2">
            <Filter size={20} className="text-gray-500" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">All Properties</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <ArrowUpDown size={20} className="text-gray-500" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-high">Price: High to Low</option>
              <option value="price-low">Price: Low to High</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings
            .filter(listing => filterStatus === 'all' || listing.status === filterStatus)
            .sort((a, b) => {
              switch (sortBy) {
                case 'price-high':
                  return b.price_per_night - a.price_per_night;
                case 'price-low':
                  return a.price_per_night - b.price_per_night;
                case 'oldest':
                  return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                default:
                  return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
              }
            })
            .map(listing => {
              const metrics = getReservationMetrics(listing.reservations);
              const occupancyRate = getOccupancyRate(listing.reservations);

              return (
                <div key={listing.id} className="border rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video">
                    <img
                      src={listing.photos?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800'}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-2 right-2 bg-white rounded-full px-2 py-1 text-sm font-medium">
                      {listing.status === 'published' ? (
                        <span className="text-green-600">Live</span>
                      ) : (
                        <span className="text-gray-600">Draft</span>
                      )}
                    </div>
                  </div>

                  <div className="p-4">
                    <h3 className="font-medium text-lg mb-1">{listing.title}</h3>
                    <p className="text-gray-600 text-sm mb-4">{listing.address}</p>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Upcoming</p>
                        <p className="text-lg font-medium">{metrics.upcoming}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Completed</p>
                        <p className="text-lg font-medium">{metrics.completed}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Revenue</p>
                        <p className="text-lg font-medium">${metrics.totalRevenue}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-600">Occupancy</p>
                        <p className="text-lg font-medium">{occupancyRate}%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t">
                      <button
                        onClick={() => {
                          setSelectedListing(listing.id);
                          setShowCalendar(true);
                        }}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                      >
                        <Calendar size={18} className="mr-1" />
                        <span className="text-sm">Calendar</span>
                      </button>
                      <button
                        onClick={() => navigate(`/listings/${listing.id}`)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                      >
                        <Eye size={18} className="mr-1" />
                        <span className="text-sm">View</span>
                      </button>
                      <button
                        onClick={() => handleEditClick(listing)}
                        className="flex items-center text-gray-600 hover:text-gray-900"
                      >
                        <Edit size={18} className="mr-1" />
                        <span className="text-sm">Edit</span>
                      </button>
                      <button
                        onClick={() => handleDeleteClick(listing)}
                        className="flex items-center text-red-600 hover:text-red-700"
                      >
                        <Trash2 size={18} className="mr-1" />
                        <span className="text-sm">Delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
        </div>

        {showCalendar && selectedListing && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Reservation Calendar</h3>
                <button
                  onClick={() => setShowCalendar(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              <DayPicker
                mode="single"
                selected={new Date()}
                modifiers={{
                  booked: listings
                    .find(l => l.id === selectedListing)
                    ?.reservations?.map(r => ({
                      from: parseISO(r.check_in_date),
                      to: parseISO(r.check_out_date)
                    })) || []
                }}
                modifiersStyles={{
                  booked: { backgroundColor: '#FF385C', color: 'white' }
                }}
              />
            </div>
          </div>
        )}

        {showEditModal && editingListing && (
          <EditListingModal
            listing={editingListing}
            onClose={() => {
              setShowEditModal(false);
              setEditingListing(null);
            }}
            onUpdate={handleListingUpdate}
          />
        )}

        {showDeleteModal && deletingListing && (
          <DeleteListingModal
            listing={deletingListing}
            onClose={() => {
              setShowDeleteModal(false);
              setDeletingListing(null);
            }}
            onDelete={handleListingDelete}
          />
        )}
      </div>
    </div>
  );
};

export default ManageHomes;