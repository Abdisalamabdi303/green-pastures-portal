
import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Home, Users, DollarSign, Activity, Settings, LogOut, Tractor } from 'lucide-react';
import { User } from '@/types';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const location = useLocation();

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('user');
    window.location.href = '/login';
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const getLinkClass = (path: string) => {
    return location.pathname === path
      ? 'flex items-center px-4 py-2 bg-farm-600 text-white rounded-md'
      : 'flex items-center px-4 py-2 text-gray-700 hover:bg-farm-100 hover:text-farm-600 rounded-md transition-colors';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/dashboard" className="text-xl font-bold text-farm-700 flex items-center">
                <Tractor className="h-8 w-8 mr-2 text-farm-600" />
                <span>Farm Manager</span>
              </Link>
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link to="/animals" className={getLinkClass('/animals')}>
              <Users className="h-5 w-5 mr-2" />
              Animals
            </Link>
            <Link to="/expenses" className={getLinkClass('/expenses')}>
              <DollarSign className="h-5 w-5 mr-2" />
              Expenses
            </Link>
            <Link to="/health" className={getLinkClass('/health')}>
              <Activity className="h-5 w-5 mr-2" />
              Health
            </Link>
            <Link to="/settings" className={getLinkClass('/settings')}>
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center">
            {user && (
              <div className="flex items-center">
                <span className="mr-4 text-gray-700">{user.name}</span>
                <button
                  onClick={handleLogout}
                  className="flex items-center px-3 py-2 border border-farm-500 text-farm-500 rounded-md hover:bg-farm-50 transition-colors"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Logout
                </button>
              </div>
            )}
          </div>
          <div className="-mr-2 flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-farm-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-farm-500"
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

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/dashboard"
              className={getLinkClass('/dashboard')}
              onClick={closeMenu}
            >
              <Home className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/animals"
              className={getLinkClass('/animals')}
              onClick={closeMenu}
            >
              <Users className="h-5 w-5 mr-2" />
              Animals
            </Link>
            <Link
              to="/expenses"
              className={getLinkClass('/expenses')}
              onClick={closeMenu}
            >
              <DollarSign className="h-5 w-5 mr-2" />
              Expenses
            </Link>
            <Link
              to="/health"
              className={getLinkClass('/health')}
              onClick={closeMenu}
            >
              <Activity className="h-5 w-5 mr-2" />
              Health
            </Link>
            <Link
              to="/settings"
              className={getLinkClass('/settings')}
              onClick={closeMenu}
            >
              <Settings className="h-5 w-5 mr-2" />
              Settings
            </Link>
          </div>
          {user && (
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="flex items-center px-5">
                <div className="ml-3">
                  <div className="text-base font-medium text-gray-800">{user.name}</div>
                  <div className="text-sm font-medium text-gray-500">{user.email}</div>
                </div>
              </div>
              <div className="mt-3 space-y-1 px-2">
                <button
                  onClick={handleLogout}
                  className="flex w-full items-center px-3 py-2 text-base font-medium text-gray-500 hover:bg-gray-100 hover:text-farm-600 rounded-md"
                >
                  <LogOut className="h-5 w-5 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
