import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
          {/* Logo and Copyright */}
          <div className="flex items-center">
            <Home className="text-[#FF385C] h-8 w-8 block" />
            <span className="text-[#FF385C] font-bold text-xl ml-2">havenly</span>
          </div>

          {/* Navigation Links */}
          <nav className="flex items-center space-x-6">
            <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Privacy Policy
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Terms & Conditions
            </Link>
            <Link to="#" className="text-gray-600 hover:text-gray-900 text-sm">
              Support
            </Link>
          </nav>

          {/* Copyright Text */}
          <div className="text-gray-500 text-sm">
            © {currentYear} Havenly. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;