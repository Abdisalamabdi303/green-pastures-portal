import { useState, useEffect } from 'react';
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
  Home
} from 'lucide-react';
import { User } from '@/types';
import { cn } from '@/lib/utils';

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
      ? 'flex items-center px-4 py-2.5 bg-farm-600 text-white rounded-md'
      : 'flex items-center px-4 py-2.5 text-gray-700 hover:bg-farm-100 hover:text-farm-600 rounded-md transition-colors';
  };

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link 
                to="/" 
                className="group relative flex items-center py-2"
              >
                <div className="flex items-center">
                  <div className="relative mr-3">
                    <div className="absolute -left-0.5 -top-0.5">
                      <Compass 
                        className="h-8 w-8 text-farm-600/10 transform rotate-12" 
                        strokeWidth={1.5}
                      />
                    </div>
                    <Compass 
                      className="h-8 w-8 text-farm-600 transition-transform duration-300 group-hover:rotate-45" 
                      strokeWidth={2}
                    />
                  </div>
                  <div className="flex flex-col border-l-2 border-farm-600/10 pl-3">
                    <span className="text-xl font-bold text-farm-600 leading-tight tracking-widest">
                      NEW DIRECTION
                    </span>
                    <span className="text-xs text-farm-500 font-medium tracking-wider uppercase">
                      Farm Management System
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
          <div className="hidden md:ml-6 md:flex md:items-center md:space-x-2">
            <Link to="/" className={getLinkClass('/')}>
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link to="/dashboard" className={getLinkClass('/dashboard')}>
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link to="/animals" className={getLinkClass('/animals')}>
              <Bird className="h-5 w-5 mr-2" />
              Animals
            </Link>
            <Link to="/expenses" className={getLinkClass('/expenses')}>
              <Receipt className="h-5 w-5 mr-2" />
              Expenses
            </Link>
            <Link to="/finance" className={getLinkClass('/finance')}>
              <Landmark className="h-5 w-5 mr-2" />
              Finance
            </Link>
            <Link to="/health" className={getLinkClass('/health')}>
              <Stethoscope className="h-5 w-5 mr-2" />
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
                <div className="relative group">
                  <button className="flex items-center px-3 py-2 text-gray-700 hover:text-farm-600 transition-colors">
                    <span className="mr-2">{user.name}</span>
                    <ChevronDown className="h-4 w-4" />
                  </button>
                  <div className="absolute right-0 w-48 mt-2 py-1 bg-white rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <button
                      onClick={handleLogout}
                      className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-farm-50 hover:text-farm-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </button>
                  </div>
                </div>
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
              to="/"
              className={getLinkClass('/')}
              onClick={closeMenu}
            >
              <Home className="h-5 w-5 mr-2" />
              Home
            </Link>
            <Link
              to="/dashboard"
              className={getLinkClass('/dashboard')}
              onClick={closeMenu}
            >
              <LayoutDashboard className="h-5 w-5 mr-2" />
              Dashboard
            </Link>
            <Link
              to="/animals"
              className={getLinkClass('/animals')}
              onClick={closeMenu}
            >
              <Bird className="h-5 w-5 mr-2" />
              Animals
            </Link>
            <Link
              to="/expenses"
              className={getLinkClass('/expenses')}
              onClick={closeMenu}
            >
              <Receipt className="h-5 w-5 mr-2" />
              Expenses
            </Link>
            <Link
              to="/finance"
              className={getLinkClass('/finance')}
              onClick={closeMenu}
            >
              <Landmark className="h-5 w-5 mr-2" />
              Finance
            </Link>
            <Link
              to="/health"
              className={getLinkClass('/health')}
              onClick={closeMenu}
            >
              <Stethoscope className="h-5 w-5 mr-2" />
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
            {user && (
              <button
                onClick={() => {
                  handleLogout();
                  closeMenu();
                }}
                className="flex items-center w-full px-4 py-2 text-gray-700 hover:bg-farm-50 hover:text-farm-600"
              >
                <LogOut className="h-5 w-5 mr-2" />
                Logout
              </button>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
