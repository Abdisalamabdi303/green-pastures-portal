import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Menu, 
  X, 
  LayoutDashboard, 
  Bird, 
  Receipt, 
  Stethoscope, 
  Settings, 
  LogOut, 
  ChevronDown,
  Compass,
  Landmark,
  Home,
  User
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const location = useLocation();
  const { currentUser, userData, logout } = useAuth();

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? 'flex items-center px-4 py-2.5 bg-[#004225] text-white rounded-lg'
      : 'flex items-center px-4 py-2.5 text-gray-700 hover:bg-[#004225]/10 hover:text-[#004225] rounded-lg transition-colors duration-200';
  };

  // Protected navigation items
  const protectedNavItems = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/animals', icon: Bird, label: 'Animals' },
    { path: '/expenses', icon: Receipt, label: 'Expenses' },
    { path: '/health', icon: Stethoscope, label: 'Health' },
    { path: '/finance', icon: Landmark, label: 'Finance' },
  ];

  return (
    <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20">
          {/* Logo Section */}
          <div className="flex-shrink-0 flex items-center">
            <Link 
              to={currentUser ? "/dashboard" : "/"} 
              className="flex items-center"
            >
              <img
                src="/logoQowsaar.png"
                alt="Qowsaar Livestock"
                className="h-16 w-auto drop-shadow-md hover:drop-shadow-lg transition-all duration-200"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex md:items-center md:space-x-1">
            {!currentUser && (
              <Link
                to="/about"
                className={getLinkClass('/about')}
              >
                About Us
              </Link>
            )}
            
            {currentUser ? (
              <>
                {protectedNavItems.map((item) => (
                  <Link 
                    key={item.path} 
                    to={item.path} 
                    className={getLinkClass(item.path)}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                ))}

                <div className="relative ml-4">
                  <button 
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    className="flex items-center px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-[#004225]/10 hover:text-[#004225] transition-colors duration-200"
                  >
                    <User className="h-5 w-5 mr-2" />
                    <span className="mr-2 font-medium">{userData?.name || currentUser.email}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div 
                      className="absolute right-0 w-48 mt-2 py-2 bg-white rounded-lg shadow-lg border border-gray-100"
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                        <p className="text-sm text-gray-500">{currentUser.email}</p>
                      </div>
                      <Link
                        to="/settings"
                        className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-[#004225]/10 hover:text-[#004225]"
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-[#004225]/10 hover:text-[#004225]"
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link
                to="/login"
                className="px-4 py-2 bg-[#004225] text-white rounded-lg hover:bg-[#003820] transition-colors duration-200"
              >
                Login to Dashboard
              </Link>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-400 hover:text-[#004225] hover:bg-[#004225]/10 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#004225]"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {!currentUser && (
              <Link
                to="/about"
                className={getLinkClass('/about')}
                onClick={closeMenu}
              >
                About Us
              </Link>
            )}
            
            {currentUser ? (
              <>
                {protectedNavItems.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={getLinkClass(item.path)}
                    onClick={closeMenu}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
                    {item.label}
                  </Link>
                ))}
                <div className="px-4 py-2 border-t border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{userData?.name}</p>
                  <p className="text-sm text-gray-500">{currentUser.email}</p>
                </div>
                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="flex items-center w-full px-4 py-2.5 text-gray-700 hover:bg-[#004225]/10 hover:text-[#004225] rounded-lg"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                to="/login"
                className="block px-4 py-2 bg-[#004225] text-white rounded-lg hover:bg-[#003820] transition-colors duration-200"
                onClick={closeMenu}
              >
                Login to Dashboard
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
