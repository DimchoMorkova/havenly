import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Home, Building2, Warehouse, Castle, Building, Hotel, TreePine, Tent } from 'lucide-react';
import PropertyTypeCard from '../components/listing/PropertyTypeCard';
import SpaceTypeCard from '../components/listing/SpaceTypeCard';
import LocationInput from '../components/listing/LocationInput';
import BasicDetails from '../components/listing/BasicDetails';
import AmenitiesSelection from '../components/listing/AmenitiesSelection';
import PhotoUpload from '../components/listing/PhotoUpload';
import PropertyHighlights from '../components/listing/PropertyHighlights';
import Description from '../components/listing/Description';
import PricingSetup from '../components/listing/PricingSetup';
import ListingReview from '../components/listing/ListingReview';
import ListingTitle from '../components/listing/ListingTitle';

type Step = {
  id: number;
  title: string;
  description: string;
};

const steps: Step[] = [
  { id: 1, title: 'Property Type', description: 'What type of place will you host?' },
  { id: 2, title: 'Space Type', description: 'How will guests use your space?' },
  { id: 3, title: 'Location', description: "Where's your place located?" },
  { id: 4, title: 'Basic Details', description: 'Share some basics about your place' },
  { id: 5, title: 'Amenities', description: 'What amenities do you offer?' },
  { id: 6, title: 'Photos', description: 'Add photos of your place' },
  { id: 7, title: 'Highlights', description: 'What makes your place special?' },
  { id: 8, title: 'Title', description: 'Give your place a title' },
  { id: 9, title: 'Description', description: 'Create your description' },
  { id: 10, title: 'Pricing', description: 'Set your price' },
  { id: 11, title: 'Review', description: 'Review your listing' },
];

const propertyTypes = [
  { id: 'house', label: 'House', icon: Home },
  { id: 'apartment', label: 'Apartment', icon: Building2 },
  { id: 'cabin', label: 'Cabin', icon: TreePine },
  { id: 'mansion', label: 'Mansion', icon: Building },
  { id: 'dome', label: 'Dome', icon: Warehouse },
  { id: 'villa', label: 'Villa', icon: Home },
  { id: 'castle', label: 'Castle', icon: Castle },
  { id: 'hotel', label: 'Hotel', icon: Hotel },
];

const spaceTypes = [
  {
    id: 'entire',
    title: 'Entire place',
    description: 'Guests have the whole place to themselves',
  },
  {
    id: 'private',
    title: 'Private room',
    description: 'Guests have their own room in a home, plus access to shared spaces',
  },
  {
    id: 'shared',
    title: 'Shared room',
    description: 'Guests sleep in a room or common area that may be shared with you or others',
  },
];

const CreateListing = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    propertyType: '',
    spaceType: '',
    location: {
      address: '',
      latitude: null as number | null,
      longitude: null as number | null,
    },
    basics: {
      maxGuests: 1,
      bedrooms: 1,
      beds: 1,
      bathrooms: 1,
    },
    amenities: [] as string[],
    photos: [] as string[],
    highlights: [] as string[],
    title: '',
    description: '',
    pricing: {
      basePrice: 0,
      currency: 'USD',
    },
  });

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        navigate('/login?redirect=/create-listing');
        return;
      }
      setUser(session.user);
    };

    checkAuth();
  }, [navigate]);

  const handleNext = () => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePublish = async () => {
    try {
      setError(null);

      if (!user?.id) {
        throw new Error('User not authenticated');
      }

      const listingData = {
        user_id: user.id,
        title: formData.title || `${formData.propertyType} in ${formData.location.address}`,
        description: formData.description,
        property_type: formData.propertyType,
        access_type: formData.spaceType,
        address: formData.location.address,
        latitude: formData.location.latitude,
        longitude: formData.location.longitude,
        max_guests: formData.basics.maxGuests,
        bedrooms: formData.basics.bedrooms,
        beds: formData.basics.beds,
        bathrooms: formData.basics.bathrooms,
        amenities: formData.amenities,
        photos: formData.photos,
        highlights: formData.highlights,
        price_per_night: formData.pricing.basePrice,
        currency: formData.pricing.currency,
        status: 'published',
      };

      const { data, error: supabaseError } = await supabase
        .from('listings')
        .insert([listingData])
        .select()
        .single();

      if (supabaseError) {
        throw supabaseError;
      }

      if (!data) {
        throw new Error('No data returned from the server');
      }

      navigate(`/listings/${data.id}`);
    } catch (error: any) {
      console.error('Error publishing listing:', error);
      setError(error.message || 'Failed to publish listing. Please try again.');
    }
  };

  if (!user) {
    return null;
  }

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {propertyTypes.map((type) => (
              <PropertyTypeCard
                key={type.id}
                {...type}
                selected={formData.propertyType === type.id}
                onClick={() => updateFormData('propertyType', type.id)}
              />
            ))}
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            {spaceTypes.map((type) => (
              <SpaceTypeCard
                key={type.id}
                {...type}
                selected={formData.spaceType === type.id}
                onClick={() => updateFormData('spaceType', type.id)}
              />
            ))}
          </div>
        );
      case 3:
        return (
          <LocationInput
            value={formData.location}
            onChange={(location) => updateFormData('location', location)}
          />
        );
      case 4:
        return (
          <BasicDetails
            value={formData.basics}
            onChange={(basics) => updateFormData('basics', basics)}
          />
        );
      case 5:
        return (
          <AmenitiesSelection
            selected={formData.amenities}
            onChange={(amenities) => updateFormData('amenities', amenities)}
          />
        );
      case 6:
        return (
          <PhotoUpload
            photos={formData.photos}
            onChange={(photos) => updateFormData('photos', photos)}
          />
        );
      case 7:
        return (
          <PropertyHighlights
            selected={formData.highlights}
            onChange={(highlights) => updateFormData('highlights', highlights)}
          />
        );
      case 8:
        return (
          <ListingTitle
            value={formData.title}
            onChange={(title) => updateFormData('title', title)}
            propertyType={formData.propertyType}
            location={formData.location.address}
          />
        );
      case 9:
        return (
          <Description
            value={formData.description}
            onChange={(description) => updateFormData('description', description)}
          />
        );
      case 10:
        return (
          <PricingSetup
            value={formData.pricing}
            onChange={(pricing) => updateFormData('pricing', pricing)}
          />
        );
      case 11:
        return (
          <ListingReview
            formData={formData}
            onPublish={handlePublish}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-24">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold">
              {steps[currentStep - 1].title}
            </h1>
            <p className="text-gray-600 mt-1">
              {steps[currentStep - 1].description}
            </p>
          </div>

          {renderStep()}

          <div className="mt-8 flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={handleBack}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Back
              </button>
            )}
            {currentStep < steps.length && (
              <button
                onClick={handleNext}
                className="ml-auto px-6 py-2 bg-[#FF385C] text-white rounded-lg hover:bg-[#FF385C]/90"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateListing;