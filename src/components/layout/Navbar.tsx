
import { useAuth } from "@/contexts/AuthContext";
import { Bell, User, X, Tractor, Wheat, Cow } from "lucide-react";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { currentUser, userData, logout, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Toggle body class when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.classList.add('sidebar-open');
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }, [isMobileMenuOpen]);

  // Close mobile menu on window resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  // Toggle mobile sidebar
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
    // Dispatch a custom event that Sidebar.tsx can listen for
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar', { 
      detail: { isOpen: !isMobileMenuOpen } 
    }));
  };

  return (
    <header className="border-b bg-farm-50 px-4 py-3 shadow-sm sticky top-0 z-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-farm-700" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Tractor className="h-5 w-5" />}
          </Button>
          <div className="flex items-center gap-2">
            <Wheat className="h-6 w-6 text-farm-600" />
            <h1 className="text-xl font-semibold text-farm-700">Green Pastures</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="text-farm-600 hover:bg-farm-100">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full hover:bg-farm-100">
                <User className="h-5 w-5 text-farm-600" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-farm-50 border-farm-200">
              <DropdownMenuLabel>
                <div className="flex flex-col">
                  <span className="text-farm-800">{userData?.name || 'User'}</span>
                  <span className="text-xs font-normal text-farm-600">
                    {userData?.email}
                  </span>
                  <span className="mt-1 rounded-full bg-farm-100 px-2 py-0.5 text-xs font-medium text-farm-800">
                    {isAdmin ? 'Farm Admin' : 'Farm Staff'}
                  </span>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-farm-200" />
              <DropdownMenuItem className="text-farm-700 hover:bg-farm-100 cursor-pointer">
                <Cow className="h-4 w-4 mr-2" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuItem className="text-farm-700 hover:bg-farm-100 cursor-pointer">
                <Wheat className="h-4 w-4 mr-2" />
                Settings
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-farm-200" />
              <DropdownMenuItem 
                onClick={() => logout()}
                className="text-farm-700 hover:bg-farm-100 cursor-pointer"
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
