import React, { useState, useEffect } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, addDays, differenceInDays, isBefore, isAfter } from 'date-fns';
import { Minus, Plus, Calendar, Users, Loader2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useNavigate } from 'react-router-dom';
import 'react-day-picker/dist/style.css';

interface ReservationWidgetProps {
  listingId: string;
  pricePerNight: number;
  maxGuests: number;
}

interface Reservation {
  check_in_date: string;
  check_out_date: string;
}

const ReservationWidget: React.FC<ReservationWidgetProps> = ({
  listingId,
  pricePerNight,
  maxGuests,
}) => {
  const navigate = useNavigate();
  const [checkIn, setCheckIn] = useState<Date | undefined>();
  const [checkOut, setCheckOut] = useState<Date | undefined>();
  const [guests, setGuests] = useState(1);
  const [showCalendar, setShowCalendar] = useState(false);
  const [disabledDays, setDisabledDays] = useState<Date[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingReservations, setExistingReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    const fetchReservations = async () => {
      const { data: reservations, error } = await supabase
        .from('reservations')
        .select('check_in_date, check_out_date')
        .eq('listing_id', listingId)
        .neq('status', 'cancelled');

      if (error) {
        console.error('Error fetching reservations:', error);
        return;
      }

      setExistingReservations(reservations || []);

      // Generate array of disabled dates from existing reservations
      const disabled = reservations?.flatMap((reservation: Reservation) => {
        const start = new Date(reservation.check_in_date);
        const end = new Date(reservation.check_out_date);
        const dates = [];
        let current = start;
        while (isBefore(current, end)) {
          dates.push(new Date(current));
          current = addDays(current, 1);
        }
        return dates;
      }) || [];

      setDisabledDays(disabled);
    };

    fetchReservations();
  }, [listingId]);

  const checkDateOverlap = (startDate: Date, endDate: Date): boolean => {
    return existingReservations.some(reservation => {
      const existingStart = new Date(reservation.check_in_date);
      const existingEnd = new Date(reservation.check_out_date);

      // Check if the new reservation overlaps with any existing reservation
      return (
        (isAfter(startDate, existingStart) && isBefore(startDate, existingEnd)) ||
        (isAfter(endDate, existingStart) && isBefore(endDate, existingEnd)) ||
        (isBefore(startDate, existingStart) && isAfter(endDate, existingEnd)) ||
        (startDate.getTime() === existingStart.getTime()) ||
        (endDate.getTime() === existingEnd.getTime())
      );
    });
  };

  const handleDayClick = (day: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (isBefore(day, today)) {
      return;
    }

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(day);
      setCheckOut(undefined);
      setError(null);
    } else {
      if (isBefore(day, checkIn)) {
        setCheckIn(day);
        setCheckOut(undefined);
        setError(null);
      } else {
        // Check for overlap before setting the checkout date
        if (checkDateOverlap(checkIn, day)) {
          setError('Selected dates overlap with an existing reservation');
          return;
        }
        setCheckOut(day);
        setError(null);
      }
    }
  };

  const handleGuestsChange = (increment: boolean) => {
    if (increment && guests < maxGuests) {
      setGuests(guests + 1);
    } else if (!increment && guests > 1) {
      setGuests(guests - 1);
    }
  };

  const calculateTotal = () => {
    if (!checkIn || !checkOut) return 0;
    const nights = differenceInDays(checkOut, checkIn);
    const subtotal = nights * pricePerNight;
    const serviceFee = subtotal * 0.15; // 15% service fee
    return subtotal + serviceFee;
  };

  const handleReserve = async () => {
    if (!checkIn || !checkOut) {
      setError('Please select check-in and check-out dates');
      return;
    }

    // Double-check for overlaps before submitting
    if (checkDateOverlap(checkIn, checkOut)) {
      setError('Selected dates overlap with an existing reservation');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session?.user) {
        setError('Please log in to make a reservation');
        return;
      }

      const { data, error } = await supabase
        .from('reservations')
        .insert([
          {
            listing_id: listingId,
            user_id: session.session.user.id,
            check_in_date: checkIn.toISOString(),
            check_out_date: checkOut.toISOString(),
            guests,
            total_price: calculateTotal(),
            status: 'confirmed',
          },
        ])
        .select()
        .single();

      if (error) {
        if (error.message.includes('overlap')) {
          throw new Error('Selected dates overlap with an existing reservation');
        }
        throw error;
      }

      // Redirect to confirmation page
      navigate(`/reservations/${data.id}`);
    } catch (err: any) {
      console.error('Reservation error:', err);
      setError(err.message || 'Failed to make reservation');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="border rounded-xl shadow-lg p-6 space-y-4">
      <div className="flex items-baseline justify-between mb-4">
        <div>
          <span className="text-2xl font-semibold">${pricePerNight}</span>
          <span className="text-gray-600"> night</span>
        </div>
      </div>

      <div className="relative">
        <div className="grid grid-cols-2 border rounded-t-xl overflow-hidden">
          <button
            onClick={() => setShowCalendar(true)}
            className="p-3 text-left border-r hover:bg-gray-50"
          >
            <div className="text-xs font-medium text-gray-700">CHECK-IN</div>
            <div className="text-sm">
              {checkIn ? format(checkIn, 'MMM d, yyyy') : 'Add date'}
            </div>
          </button>
          <button
            onClick={() => setShowCalendar(true)}
            className="p-3 text-left hover:bg-gray-50"
          >
            <div className="text-xs font-medium text-gray-700">CHECKOUT</div>
            <div className="text-sm">
              {checkOut ? format(checkOut, 'MMM d, yyyy') : 'Add date'}
            </div>
          </button>
        </div>

        {showCalendar && (
          <div className="absolute top-full left-0 right-0 z-50 bg-white border rounded-lg shadow-lg p-4 mt-2">
            <button
              onClick={() => setShowCalendar(false)}
              className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
            <DayPicker
              mode="range"
              selected={{
                from: checkIn,
                to: checkOut,
              }}
              onDayClick={handleDayClick}
              disabled={[
                ...disabledDays,
                { before: new Date() },
              ]}
              className="custom-calendar"
            />
          </div>
        )}

        <div className="border-x border-b rounded-b-xl">
          <div className="p-3">
            <div className="text-xs font-medium text-gray-700">GUESTS</div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-sm">{guests} guest{guests !== 1 ? 's' : ''}</span>
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => handleGuestsChange(false)}
                  disabled={guests <= 1}
                  className="p-1 rounded-full border hover:border-gray-400 disabled:opacity-50"
                >
                  <Minus size={16} />
                </button>
                <span className="text-sm">{guests}</span>
                <button
                  onClick={() => handleGuestsChange(true)}
                  disabled={guests >= maxGuests}
                  className="p-1 rounded-full border hover:border-gray-400 disabled:opacity-50"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {checkIn && checkOut && (
        <div className="space-y-4 mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm">
            <span>
              ${pricePerNight} × {differenceInDays(checkOut, checkIn)} nights
            </span>
            <span>${pricePerNight * differenceInDays(checkOut, checkIn)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>${(pricePerNight * differenceInDays(checkOut, checkIn) * 0.15).toFixed(2)}</span>
          </div>
          <div className="flex justify-between font-semibold pt-4 border-t">
            <span>Total</span>
            <span>${calculateTotal().toFixed(2)}</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm mt-2">{error}</div>
      )}

      <button
        onClick={handleReserve}
        disabled={!checkIn || !checkOut || loading}
        className="w-full bg-[#FF385C] text-white py-3 rounded-lg font-medium hover:bg-[#FF385C]/90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
      >
        {loading ? (
          <>
            <Loader2 size={20} className="animate-spin mr-2" />
            Processing...
          </>
        ) : (
          'Reserve'
        )}
      </button>
    </div>
  );
};

export default ReservationWidget;