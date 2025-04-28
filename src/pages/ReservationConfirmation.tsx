import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Calendar, MapPin, Users, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';

interface Reservation {
  id: string;
  check_in_date: string;
  check_out_date: string;
  guests: number;
  total_price: number;
  status: string;
  listings?: {
    title: string;
    address: string;
    photos: string[];
    property_type: string;
    profiles?: {
      username: string;
    };
  };
}

const ReservationConfirmation = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        const { data, error } = await supabase
          .from('reservations')
          .select(`
            *,
            listings (
              title,
              address,
              photos,
              property_type,
              profiles:user_id (
                username
              )
            )
          `)
          .eq('id', id)
          .single();

        if (error) throw error;
        setReservation(data);
      } catch (err) {
        console.error('Error fetching reservation:', err);
        navigate('/');
      } finally {
        setLoading(false);
      }
    };

    fetchReservation();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen pt-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-48 bg-gray-200 rounded-lg"></div>
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!reservation) return null;

  return (
    <div className="min-h-screen pt-24 px-6">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center mb-8">
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </div>
          </div>

          <h1 className="text-3xl font-semibold text-center mb-2">
            Reservation Confirmed!
          </h1>
          <p className="text-gray-600 text-center mb-8">
            Your stay at {reservation.listings?.title} has been booked successfully.
          </p>

          <div className="border rounded-xl overflow-hidden mb-8">
            <img
              src={reservation.listings?.photos?.[0] || 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800'}
              alt={reservation.listings?.title}
              className="w-full h-48 object-cover"
            />
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-2">
                {reservation.listings?.title}
              </h2>
              <p className="text-gray-600 mb-4">
                {reservation.listings?.property_type} hosted by{' '}
                {reservation.listings?.profiles?.username}
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Your stay</p>
                    <p className="text-gray-600">
                      {format(new Date(reservation.check_in_date), 'MMM d, yyyy')} -{' '}
                      {format(new Date(reservation.check_out_date), 'MMM d, yyyy')}
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-gray-600">{reservation.listings?.address}</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Users className="w-5 h-5 text-gray-600 mt-0.5" />
                  <div>
                    <p className="font-medium">Guests</p>
                    <p className="text-gray-600">
                      {reservation.guests} {reservation.guests === 1 ? 'guest' : 'guests'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t">
                <div className="flex justify-between font-medium">
                  <span>Total paid</span>
                  <span>${reservation.total_price.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-center space-x-4">
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 border rounded-lg hover:bg-gray-50"
            >
              Back to Home
            </button>
            <button
              onClick={() => window.print()}
              className="px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#FF385C]/90"
            >
              Print Confirmation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationConfirmation;