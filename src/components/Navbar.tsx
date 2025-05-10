
import { Link, useLocation } from 'react-router-dom';
import { useState } from 'react';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path ? 'bg-farm-100 text-farm-800' : 'hover:bg-gray-100';
  };

  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and desktop nav links */}
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-farm-600 font-bold text-xl">Green Pastures</Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-4">
              <Link to="/" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/')}`}>Home</Link>
              <Link to="/dashboard" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/dashboard')}`}>Dashboard</Link>
              <Link to="/animals" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/animals')}`}>Animals</Link>
              <Link to="/expenses" className={`px-3 py-2 rounded-md text-sm font-medium ${isActive('/expenses')}`}>Expenses</Link>
            </div>
          </div>
          
          {/* Login/register buttons or user menu */}
          <div className="hidden sm:ml-6 sm:flex sm:items-center sm:space-x-4">
            <Link to="/login" className="px-4 py-2 text-sm font-medium text-farm-700 bg-white border border-farm-300 rounded-md hover:bg-farm-50">
              Login
            </Link>
            <Link to="/register" className="px-4 py-2 text-sm font-medium text-white bg-farm-600 rounded-md hover:bg-farm-700">
              Register
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              type="button"
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <span className="sr-only">Open main menu</span>
              {isMenuOpen ? (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="sm:hidden">
          <div className="pt-2 pb-3 space-y-1">
            <Link to="/" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/')}`}>Home</Link>
            <Link to="/dashboard" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/dashboard')}`}>Dashboard</Link>
            <Link to="/animals" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/animals')}`}>Animals</Link>
            <Link to="/expenses" className={`block px-3 py-2 rounded-md text-base font-medium ${isActive('/expenses')}`}>Expenses</Link>
          </div>
          <div className="pt-4 pb-3 border-t border-gray-200">
            <div className="flex items-center px-4 space-x-3">
              <Link to="/login" className="block px-4 py-2 text-base font-medium text-farm-700 hover:bg-farm-50 rounded-md">
                Login
              </Link>
              <Link to="/register" className="block px-4 py-2 text-base font-medium text-white bg-farm-600 hover:bg-farm-700 rounded-md">
                Register
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
