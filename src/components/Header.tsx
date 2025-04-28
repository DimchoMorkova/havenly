import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Search,
  Globe,
  Menu,
  User,
  LogOut,
  LogIn,
  UserPlus,
  Home as HomeIcon,
  Heart,
  MapPin,
  Calendar,
  Users,
  X,
  Plus,
  Minus,
  Trash2,
  Search as SearchIcon,
  ChevronLeft,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import AuthModal from './AuthModal';
import { DayPicker } from 'react-day-picker';
import {
  addDays,
  format,
  isWithinInterval,
  isBefore,
  startOfToday,
} from 'date-fns';
import usePlacesAutocomplete, {
  getGeocode,
  getLatLng,
} from 'use-places-autocomplete';
import { GoogleMap, Marker } from '@react-google-maps/api';
import { useGoogleMaps } from '../contexts/GoogleMapsContext';

interface HeaderProps {
  activeSection: 'location' | 'dates' | 'guests' | null;
  setActiveSection: (section: 'location' | 'dates' | 'guests' | null) => void;
}

interface SearchTag {
  type: 'location' | 'dates' | 'guests';
  label: string;
  value: any;
}

const Header: React.FC<HeaderProps> = ({ activeSection, setActiveSection }) => {
  const { isLoaded } = useGoogleMaps();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const navigate = useNavigate();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [marker, setMarker] = useState<google.maps.Marker | null>(null);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const mobileMenuRef = useRef<HTMLDivElement>(null);
  const searchMenuRef = useRef<HTMLDivElement>(null);
  const searchButtonRef = useRef<HTMLDivElement>(null);
  const [isHostButtonActive, setIsHostButtonActive] = useState(false);
  const [searchTags, setSearchTags] = useState<SearchTag[]>([]);

  const [searchParams, setSearchParams] = useState({
    location: {
      address: '',
      coordinates: null as { lat: number; lng: number } | null,
    },
    dates: {
      checkIn: null as Date | null,
      checkOut: null as Date | null,
    },
    guests: {
      adults: 1,
      children: 0,
      infants: 0,
    },
  });

  const clearSearch = () => {
    setSearchParams({
      location: {
        address: '',
        coordinates: null,
      },
      dates: {
        checkIn: null,
        checkOut: null,
      },
      guests: {
        adults: 1,
        children: 0,
        infants: 0,
      },
    });
    setLocationValue('', false);
    setActiveSection(null);
    navigate('/');
  };

  const {
    ready,
    value: locationValue,
    suggestions: { status, data },
    setValue: setLocationValue,
    clearSuggestions,
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ['(cities)'],
    },
    debounce: 300,
  });

  const location = useLocation();
  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error('Session error:', sessionError);
          localStorage.clear();
          setUser(null);
          return;
        }

        setUser(session?.user ?? null);
      } catch (error) {
        console.error('Auth initialization error:', error);
        localStorage.clear();
        setUser(null);
      }
    };

    initializeAuth();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'TOKEN_REFRESHED' && !session) {
        localStorage.clear();
        setUser(null);
        setShowAuthModal(true);
        setAuthMode('login');
        navigate('/');
        return;
      }

      if (event === 'SIGNED_OUT') {
        localStorage.clear();
        navigate('/');
      }

      setUser(session?.user ?? null);
      setShowUserMenu(false);
      setShowMobileMenu(false);
      setShowAuthModal(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target as Node) &&
        showMobileMenu
      ) {
        setShowMobileMenu(false);
      }

      if (
        activeSection !== null &&
        searchMenuRef.current &&
        searchButtonRef.current &&
        !(
          searchMenuRef.current.contains(event.target as Node) ||
          searchButtonRef.current.contains(event.target as Node)
        )
      ) {
        setActiveSection(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMobileMenu, activeSection, setActiveSection]);

  useEffect(() => {
    const newTags: SearchTag[] = [];

    if (searchParams.location.address) {
      newTags.push({
        type: 'location',
        label: searchParams.location.address,
        value: searchParams.location,
      });
    }

    if (searchParams.dates.checkIn && searchParams.dates.checkOut) {
      newTags.push({
        type: 'dates',
        label: `${format(searchParams.dates.checkIn, 'MMM d')} - ${format(
          searchParams.dates.checkOut,
          'MMM d'
        )}`,
        value: searchParams.dates,
      });
    }

    const totalGuests =
      searchParams.guests.adults +
      searchParams.guests.children +
      searchParams.guests.infants;
    if (totalGuests > 1) {
      newTags.push({
        type: 'guests',
        label: `${totalGuests} guests`,
        value: searchParams.guests,
      });
    }

    setSearchTags(newTags);
  }, [searchParams]);

  const handleAuthClick = (mode: 'login' | 'signup') => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setShowUserMenu(false);
    setShowMobileMenu(false);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      localStorage.clear();
      setShowUserMenu(false);
      setShowMobileMenu(false);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleHostClick = () => {
    setIsHostButtonActive(true);
    setTimeout(() => setIsHostButtonActive(false), 200);
    
    if (!user) {
      setAuthMode('login');
      setShowAuthModal(true);
      return;
    }
    navigate('/create-listing');
  };

  const handleLocationSelect = async (address: string) => {
    setLocationValue(address, false);
    clearSuggestions();

    try {
      const results = await getGeocode({ address });
      const { lat, lng } = await getLatLng(results[0]);

      if (map) {
        map.panTo({ lat, lng });
        map.setZoom(12);

        if (marker) {
          marker.setMap(null);
        }

        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          animation: google.maps.Animation.DROP,
        });
        setMarker(newMarker);
      }

      setSearchParams((prev) => ({
        ...prev,
        location: {
          address,
          coordinates: { lat, lng },
        },
      }));

      const updatedSearches = [
        address,
        ...recentSearches.filter((s) => s !== address),
      ].slice(0, 5);
      setRecentSearches(updatedSearches);
      localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));

      if (window.innerWidth < 768) {
        setActiveSection('dates');
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const removeRecentSearch = (searchToRemove: string) => {
    const updatedSearches = recentSearches.filter(
      (search) => search !== searchToRemove
    );
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  const handleMapClick = async (e: google.maps.MapMouseEvent) => {
    if (!e.latLng) return;

    const lat = e.latLng.lat();
    const lng = e.latLng.lng();

    try {
      const geocoder = new google.maps.Geocoder();
      const result = await geocoder.geocode({ location: { lat, lng } });

      if (result.results[0]) {
        const address = result.results[0].formatted_address;
        setLocationValue(address, false);

        if (marker) {
          marker.setMap(null);
        }
        const newMarker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          animation: google.maps.Animation.DROP,
        });
        setMarker(newMarker);

        setSearchParams((prev) => ({
          ...prev,
          location: {
            address,
            coordinates: { lat, lng },
          },
        }));
      }
    } catch (error) {
      console.error('Geocoding error:', error);
    }
  };

  const handleGuestChange = (
    type: 'adults' | 'children' | 'infants',
    increment: boolean
  ) => {
    setSearchParams((prev) => {
      const guests = { ...prev.guests };
      const value = guests[type] + (increment ? 1 : -1);

      if (type === 'adults') {
        guests[type] = Math.max(1, Math.min(value, 16));
      } else if (type === 'children') {
        guests[type] = Math.max(0, Math.min(value, 15));
      } else {
        guests[type] = Math.max(0, Math.min(value, 5));
      }

      return { ...prev, guests };
    });
  };

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (searchParams.location.address) {
      params.set('location', searchParams.location.address);
      if (searchParams.location.coordinates) {
        params.set('lat', searchParams.location.coordinates.lat.toString());
        params.set('lng', searchParams.location.coordinates.lng.toString());
      }
    }
    if (searchParams.dates.checkIn && searchParams.dates.checkOut) {
      params.set('checkIn', searchParams.dates.checkIn.toISOString());
      params.set('checkOut', searchParams.dates.checkOut.toISOString());
    }
    params.set('guests', JSON.stringify(searchParams.guests));

    navigate(`/?${params.toString()}`);
    setActiveSection(null);
  };

  const handleDateSelect = (range: { from: Date; to: Date } | undefined) => {
    if (range?.from) {
      setSearchParams(prev => ({
        ...prev,
        dates: {
          checkIn: range.from,
          checkOut: range.to || null
        }
      }));

      if (window.innerWidth < 768 && range.to) {
        setActiveSection('guests');
      }
    }
  };

  const removeSearchTag = (tag: SearchTag, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    
    switch (tag.type) {
      case 'location':
        setSearchParams((prev) => ({
          ...prev,
          location: {
            address: '',
            coordinates: null,
          },
        }));
        setLocationValue('', false);
        break;
      case 'dates':
        setSearchParams((prev) => ({
          ...prev,
          dates: {
            checkIn: null,
            checkOut: null,
          },
        }));
        break;
      case 'guests':
        setSearchParams((prev) => ({
          ...prev,
          guests: {
            adults: 1,
            children: 0,
            infants: 0,
          },
        }));
        break;
    }
  };

  const renderMobileSearchTags = () => {
    if (!activeSection || window.innerWidth >= 768) return null;

    return (
      <div className="fixed top-0 left-0 right-0 bg-white z-50 px-4 py-3 border-b">
        <div className="flex items-center">
          <button
            onClick={() => {
              if (activeSection === 'dates') setActiveSection('location');
              else if (activeSection === 'guests') setActiveSection('dates');
              else setActiveSection(null);
            }}
            className="mr-4"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex flex-wrap gap-2">
            {searchTags.map((tag) => (
              <div
                key={tag.type}
                className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm"
              >
                <button
                  onClick={() => setActiveSection(tag.type)}
                  className="mr-2"
                >
                  {tag.label}
                </button>
                <button
                  onClick={(e) => removeSearchTag(tag, e)}
                  className="p-1 hover:bg-gray-200 rounded-full"
                  aria-label={`Remove ${tag.type} filter`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  const renderSearchBar = () => (
    <div
      ref={searchButtonRef}
      className={`flex items-center border rounded-full py-2 px-4 shadow-sm hover:shadow-md transition cursor-pointer ${
        activeSection ? 'shadow-md' : ''
      }`}
      onClick={(e) => {
        e.stopPropagation();
        if (!activeSection) setActiveSection('location');
      }}
    >
      <div className="hidden md:flex items-center flex-1 justify-between">
        <div className="flex items-center divide-x">
          <button
            className={`flex flex-col items-start px-4 min-w-[140px] ${
              activeSection === 'location' ? 'text-[#FF385C]' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSection('location');
            }}
          >
            <span className="text-xs font-medium">Where</span>
            <span className="text-sm truncate max-w-[200px]">
              {searchParams.location.address || 'Add location'}
            </span>
          </button>

          <button
            className={`flex flex-col items-start px-4 min-w-[140px] ${
              activeSection === 'dates' ? 'text-[#FF385C]' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSection('dates');
            }}
          >
            <span className="text-xs font-medium">When</span>
            <span className="text-sm whitespace-nowrap">
              {searchParams.dates.checkIn && searchParams.dates.checkOut
                ? `${format(searchParams.dates.checkIn, 'MMM d')} - ${format(
                    searchParams.dates.checkOut,
                    'MMM d'
                  )}`
                : 'Add dates'}
            </span>
          </button>

          <button
            className={`flex flex-col items-start px-4 min-w-[140px] ${
              activeSection === 'guests' ? 'text-[#FF385C]' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              setActiveSection('guests');
            }}
          >
            <span className="text-xs font-medium">Who</span>
            <span className="text-sm whitespace-nowrap">
              {searchParams.guests.adults +
                searchParams.guests.children +
                searchParams.guests.infants ===
              1
                ? '1 guest'
                : `${
                    searchParams.guests.adults +
                    searchParams.guests.children +
                    searchParams.guests.infants
                  } guests`}
            </span>
          </button>
        </div>

        <div className="flex items-center space-x-2 pl-4">
          {searchTags.length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                clearSearch();
              }}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X size={18} />
            </button>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleSearch();
            }}
            className="bg-[#FF385C] p-3 rounded-full text-white flex items-center gap-2"
          >
            <Search size={16} />
            <span className="font-medium">Search</span>
          </button>
        </div>
      </div>

      <div className="md:hidden flex-1 text-center">
        {activeSection ? (
          <span className="text-sm font-medium">
            {activeSection === 'location' ? 'Where to?' :
             activeSection === 'dates' ? 'When?' :
             'How many guests?'}
          </span>
        ) : (
          'Search'
        )}
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          handleSearch();
        }}
        className="md:hidden bg-[#FF385C] p-2 rounded-full text-white"
      >
        <Search size={16} />
      </button>
    </div>
  );

  const disabledDays = [{ before: startOfToday() }];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white z-50 border-b">
        {renderMobileSearchTags()}
        <div className="flex gap-2 items-center justify-between h-[72px] px-6 max-w-[2520px] mx-auto">
          <Link
            to="/"
            className="flex items-center flex-shrink-0"
            aria-label="Havenly Homepage"
          >
            <HomeIcon className="text-[#FF385C] h-8 w-8 block" />
            <span className="text-[#FF385C] font-bold text-xl ml-2 hidden md:block">
              havenly
            </span>
          </Link>

          {isHomePage && (
            <div className="relative flex-1 max-w-2xl mx-auto">
              {renderSearchBar()}
              {activeSection && (
                <div
                  ref={searchMenuRef}
                  className={`fixed md:absolute ${
                    window.innerWidth < 768 ? 'inset-0 bg-white mt-12' : 'top-full left-0 right-0 mt-2 bg-white rounded-3xl shadow-lg border'
                  } p-4`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {activeSection === 'location' && (
                    <div className="w-full md:w-[600px] grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Search destinations"
                            value={locationValue}
                            onChange={(e) => setLocationValue(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border rounded-lg"
                          />
                          <MapPin
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                            size={20}
                          />
                        </div>

                        {recentSearches.length > 0 && !status && (
                          <div>
                            <h3 className="text-sm font-medium text-gray-700 mb-2">
                              Recent searches
                            </h3>
                            <div className="space-y-2">
                              {recentSearches.map((search, index) => (
                                <div
                                  key={index}
                                  className="flex items-center justify-between px-4 py-2 hover:bg-gray-50 rounded-lg group"
                                >
                                  <button
                                    onClick={() => handleLocationSelect(search)}
                                    className="flex items-center flex-grow text-left"
                                  >
                                    <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                                    {search}
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      removeRecentSearch(search);
                                    }}
                                    className="p-1 rounded-full hover:bg-gray-200 opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <Trash2
                                      size={16}
                                      className="text-gray-500"
                                    />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {status === 'OK' && (
                          <div className="space-y-2">
                            {data.map((suggestion) => (
                              <button
                                key={suggestion.place_id}
                                onClick={() =>
                                  handleLocationSelect(suggestion.description)
                                }
                                className="w-full px-4 py-2 text-left hover:bg-gray-50 rounded-lg flex items-start"
                              >
                                <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                                <div className="ml-3">
                                  <div className="font-medium">
                                    {suggestion.structured_formatting.main_text}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {
                                      suggestion.structured_formatting
                                        .secondary_text
                                    }
                                  </div>
                                </div>
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {isLoaded && window.innerWidth >= 768 && (
                        <div className="h-[400px] rounded-lg overflow-hidden">
                          <GoogleMap
                            mapContainerStyle={{
                              width: '100%',
                              height: '100%',
                            }}
                            center={
                              searchParams.location.coordinates || {
                                lat: 42.6977,
                                lng: 23.3219,
                              }
                            }
                            zoom={10}
                            onLoad={setMap}
                            onClick={handleMapClick}
                            options={{
                              streetViewControl: false,
                              mapTypeControl: false,
                            }}
                          />
                        </div>
                      )}
                    </div>
                  )}

                  {activeSection === 'dates' && (
                    <div className="space-y-6">
                      <div className="flex justify-center">
                        <DayPicker
                          mode="range"
                          selected={{
                            from: searchParams.dates.checkIn,
                            to: searchParams.dates.checkOut,
                          }}
                          onSelect={(range) => {
                            if (range) {
                              handleDateSelect(range);
                            }
                          }}
                          numberOfMonths={window.innerWidth >= 768 ? 2 : 1}
                          disabled={disabledDays}
                          showOutsideDays
                          classNames={{
                            day_selected: 'bg-[#FF385C] text-white',
                            day_today: 'font-bold',
                          }}
                        />
                      </div>

                      <div className="flex space-x-4 justify-center">
                        <button
                          onClick={() => {
                            const today = new Date();
                            handleDateSelect({
                              from: today,
                              to: addDays(today, 2)
                            });
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Weekend
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            handleDateSelect({
                              from: today,
                              to: addDays(today, 7)
                            });
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Week
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            handleDateSelect({
                              from: today,
                              to: addDays(today, 30)
                            });
                          }}
                          className="px-4 py-2 border rounded-lg hover:bg-gray-50"
                        >
                          Month
                        </button>
                      </div>
                    </div>
                  )}

                  {activeSection === 'guests' && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-medium">Adults</h3>
                          <p className="text-sm text-gray-500">
                            Ages 13 or above
                          </p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleGuestChange('adults', false)}
                            disabled={searchParams.guests.adults <= 1}
                            className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span>{searchParams.guests.adults}</span>
                          <button
                            onClick={() => handleGuestChange('adults', true)}
                            className="p-2 border rounded-full hover:border-gray-400"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-medium">Children</h3>
                          <p className="text-sm text-gray-500">Ages 2-12</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleGuestChange('children', false)}
                            disabled={searchParams.guests.children <= 0}
                            className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span>{searchParams.guests.children}</span>
                          <button
                            onClick={() => handleGuestChange('children', true)}
                            className="p-2 border rounded-full hover:border-gray-400"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>

                      <div className="flex items-center justify-between py-4">
                        <div>
                          <h3 className="font-medium">Infants</h3>
                          <p className="text-sm text-gray-500">Under 2</p>
                        </div>
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleGuestChange('infants', false)}
                            disabled={searchParams.guests.infants <= 0}
                            className="p-2 border rounded-full hover:border-gray-400 disabled:opacity-50"
                          >
                            <Minus size={16} />
                          </button>
                          <span>{searchParams.guests.infants}</span>
                          <button
                            onClick={() => handleGuestChange('infants', true)}
                            className="p-2 border rounded-full hover:border-gray-400"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  {window.innerWidth < 768 && (
                    <div className="fixed bottom-24 left-0 right-0 p-4 bg-white border-t">
                      <button
                        onClick={handleSearch}
                        className="w-full bg-[#FF385C] text-white py-3 rounded-lg flex items-center justify-center space-x-2"
                      >
                        <Search size={20} />
                        <span>Search</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="hidden md:flex items-center space-x-4 flex-shrink-0">
            <button
              onClick={handleHostClick}
              className={`px-4 py-2 rounded-full transition-all whitespace-nowrap ${
                isHostButtonActive
                  ? 'bg-[#FF385C]/10 text-[#FF385C]'
                  : 'hover:bg-gray-100'
              }`}
            >
              List your home
            </button>
            <div className="hover:bg-gray-100 p-2 rounded-full cursor-pointer">
              <Globe size={20} />
            </div>
            <div className="relative">
              <button
                onClick={()=> setShowUserMenu(!showUserMenu)}
                className="flex items-center border rounded-full p-2 hover:shadow-md cursor-pointer"
                aria-label="User menu"
              >
                <Menu size={20} className="mr-2" />
                <User
                  size={20}
                  className="bg-gray-500 text-white rounded-full"
                />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 border border-gray-100">
                  {user ? (
                    <>
                      <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                        {user.user_metadata?.username || 'User'}
                      </div>
                      <Link
                        to="/wishlist"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <Heart size={16} className="mr-2" />
                        Wishlist
                      </Link>
                      <Link
                        to="/manage-homes"
                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-gray-100"
                        onClick={() => setShowUserMenu(false)}
                      >
                        <HomeIcon size={16} className="mr-2" />
                        Manage homes
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-gray-700"
                      >
                        <LogOut size={16} className="mr-2" />
                        Log out
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleAuthClick('login')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-gray-700"
                      >
                        <LogIn size={16} className="mr-2" />
                        Log in
                      </button>
                      <button
                        onClick={() => handleAuthClick('signup')}
                        className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center text-gray-700"
                      >
                        <UserPlus size={16} className="mr-2" />
                        Sign up
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t md:hidden z-50">
        <div className="grid grid-cols-3 h-16">
          <Link
            to="/wishlist"
            className="flex flex-col items-center justify-center text-gray-500 hover:text-[#FF385C]"
          >
            <Heart size={24} />
            <span className="text-xs mt-1">Wishlists</span>
          </Link>
          <button
            onClick={handleHostClick}
            className={`flex flex-col items-center justify-center transition-colors ${
              isHostButtonActive
                ? 'text-[#FF385C]'
                : 'text-gray-500 hover:text-[#FF385C]'
            }`}
          >
            <HomeIcon size={24} />
            <span className="text-xs mt-1">Host</span>
          </button>
          <button
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            className="flex flex-col items-center justify-center text-gray-500 hover:text-[#FF385C]"
          >
            <User size={24} />
            <span className="text-xs mt-1">Profile</span>
          </button>
        </div>
      </div>

      {showMobileMenu && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 md:hidden">
          <div
            ref={mobileMenuRef}
            className="absolute bottom-16 left-0 right-0 bg-white rounded-t-xl"
          >
            <div className="p-4">
              {user ? (
                <>
                  <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
                    {user.user_metadata?.username || 'User'}
                  </div>
                  
                  <Link
                    to="/wishlist"
                    className="flex items-center px-4 py-3 text-gray-700"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Heart size={20} className="mr-3" />
                    Wishlist
                  </Link>
                  <Link
                    to="/manage-homes"
                    className="flex items-center px-4 py-3 text-gray-700"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <HomeIcon size={20} className="mr-3" />
                    Manage homes
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center px-4 py-3 text-gray-700"
                  >
                    <LogOut size={20} className="mr-3" />
                    Log out
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => handleAuthClick('login')}
                    className="w-full flex items-center px-4 py-3 text-gray-700"
                  >
                    <LogIn size={20} className="mr-3" />
                    Log in
                  </button>
                  <button
                    onClick={() => handleAuthClick('signup')}
                    className="w-full flex items-center px-4 py-3 text-gray-700"
                  >
                    <UserPlus size={20} className="mr-3" />
                    Sign up
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
      />
    </>
  );
};

export default Header;