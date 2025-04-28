import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import FilterBar from './components/FilterBar';
import PropertyGrid from './components/PropertyGrid';
import CreateListing from './pages/CreateListing';
import ListingDetail from './pages/ListingDetail';
import ManageHomes from './pages/ManageHomes';
import Wishlist from './pages/Wishlist';
import ReservationConfirmation from './pages/ReservationConfirmation';
import { GoogleMapsProvider } from './contexts/GoogleMapsContext';
import Footer from './components/Footer';

function App() {
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [activeSection, setActiveSection] = useState<'location' | 'dates' | 'guests' | null>(null);

  return (
    <GoogleMapsProvider>
      <Router>
        <div className="min-h-screen bg-white flex flex-col">
          <Header 
            activeSection={activeSection} 
            setActiveSection={setActiveSection} 
          />
          <Routes>
            <Route
              path="/"
              element={
                <main className="flex-grow">
                  <FilterBar
                    activeFilters={activeFilters}
                    onFilterChange={setActiveFilters}
                  />
                  <PropertyGrid activeFilters={activeFilters} />
                </main>
              }
            />
            <Route path="/create-listing" element={<CreateListing />} />
            <Route path="/listings/:id" element={<ListingDetail />} />
            <Route path="/manage-homes" element={<ManageHomes />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/reservations/:id" element={<ReservationConfirmation />} />
          </Routes>
          <Footer />
        </div>
      </Router>
    </GoogleMapsProvider>
  );
}

export default App;