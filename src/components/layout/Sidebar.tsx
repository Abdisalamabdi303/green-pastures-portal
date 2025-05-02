
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { 
  Home, 
  Tractor, 
  Activity, 
  PiggyBank, 
  Landmark, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Bird,
  X
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  adminOnly?: boolean;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: "/dashboard", icon: Home },
  { label: "Animals", path: "/animals", icon: Bird },
  { label: "Health", path: "/health", icon: Activity },
  { label: "Expenses", path: "/expenses", icon: PiggyBank },
  { label: "Finance", path: "/finance", icon: Landmark },
  { label: "Users", path: "/users", icon: Users, adminOnly: true },
  { label: "Settings", path: "/settings", icon: Settings },
];

export default function Sidebar() {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isMobile = useIsMobile();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle toggle events from Navbar
  useEffect(() => {
    const handleToggleSidebar = (event: Event) => {
      const customEvent = event as CustomEvent;
      setMobileOpen(customEvent.detail.isOpen);
    };

    window.addEventListener('toggle-mobile-sidebar', handleToggleSidebar as EventListener);
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleToggleSidebar as EventListener);
    };
  }, []);

  // Close mobile sidebar when route changes
  useEffect(() => {
    if (isMobile && mobileOpen) {
      setMobileOpen(false);
      document.body.classList.remove('sidebar-open');
    }
  }, [location.pathname, isMobile]);

  // Set up initial state based on device
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setMobileOpen(false);
    } else {
      setMobileOpen(false);
      // On desktop, respect user preference for collapsed state
      const savedState = localStorage.getItem('sidebarCollapsed');
      if (savedState) {
        setCollapsed(savedState === 'true');
      }
    }
  }, [isMobile]);

  const toggleCollapse = () => {
    const newState = !collapsed;
    setCollapsed(newState);
    // Save preference to localStorage
    localStorage.setItem('sidebarCollapsed', String(newState));
  };

  const closeMobileMenu = () => {
    setMobileOpen(false);
    document.body.classList.remove('sidebar-open');
  };

  const filteredNavItems = navItems.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  // Mobile sidebar overlay
  if (isMobile) {
    return (
      <>
        {/* Mobile sidebar overlay */}
        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity animate-fade-in"
            onClick={closeMobileMenu}
            aria-hidden="true"
          ></div>
        )}

        {/* Mobile sidebar */}
        <aside
          className={cn(
            "fixed top-0 left-0 h-full bg-white shadow-xl z-50 transition-transform duration-300 ease-in-out w-[280px] md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Tractor className="h-6 w-6 text-farm-600" />
              <h2 className="ml-2 text-lg font-semibold text-farm-800">Farm Manager</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={closeMobileMenu} aria-label="Close menu">
              <X className="h-5 w-5" />
            </Button>
          </div>
          <nav className="flex-1 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {filteredNavItems.map((item) => (
                <li key={item.path} className="px-3">
                  <NavLink
                    to={item.path}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center py-3 px-4 rounded-md text-sm font-medium transition-colors",
                        {
                          "bg-farm-100 text-farm-900": isActive,
                          "text-muted-foreground hover:bg-muted hover:text-foreground": !isActive,
                        }
                      )
                    }
                    onClick={closeMobileMenu}
                  >
                    <item.icon className="h-5 w-5 mr-3" />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </aside>
      </>
    );
  }

  // Desktop sidebar
  return (
    <aside
      className={cn(
        "bg-white transition-all duration-300 h-screen border-r sticky top-0 left-0 hidden md:flex flex-col z-10",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center whitespace-nowrap">
            <Tractor className="h-6 w-6 text-farm-600 flex-shrink-0" />
            <h2 className="ml-2 text-lg font-semibold text-farm-800 truncate">Farm Manager</h2>
          </div>
        )}
        {collapsed && (
          <Tractor className="h-6 w-6 mx-auto text-farm-600" />
        )}
      </div>

      <nav className="flex-1 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {filteredNavItems.map((item) => (
            <li key={item.path} className="px-3">
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
                    {
                      "bg-farm-100 text-farm-900": isActive,
                      "text-muted-foreground hover:bg-muted hover:text-foreground": !isActive,
                      "justify-center": collapsed,
                    }
                  )
                }
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn("h-5 w-5 flex-shrink-0", collapsed ? "" : "mr-3")} />
                {!collapsed && <span className="truncate">{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 rounded-full border bg-background shadow-sm hidden md:flex"
        onClick={toggleCollapse}
        aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
      >
        {collapsed ? (
          <ChevronRight className="h-4 w-4" />
        ) : (
          <ChevronLeft className="h-4 w-4" />
        )}
      </Button>
    </aside>
  );
}
