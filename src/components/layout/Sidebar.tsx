
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
  Menu,
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

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setMobileOpen(false);
    } else {
      setMobileOpen(true);
    }
  }, [isMobile]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const toggleMobileMenu = () => {
    setMobileOpen(!mobileOpen);
  };

  const filteredNavItems = navItems.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  // Handle view based on mobile status
  if (isMobile) {
    return (
      <>
        <Button
          variant="ghost"
          size="icon"
          className="fixed top-4 left-4 z-50 md:hidden"
          onClick={toggleMobileMenu}
        >
          {mobileOpen ? (
            <X className="h-6 w-6 text-farm-600" />
          ) : (
            <Menu className="h-6 w-6 text-farm-600" />
          )}
          <span className="sr-only">Toggle menu</span>
        </Button>

        {mobileOpen && (
          <div 
            className="fixed inset-0 bg-black/50 z-40 md:hidden"
            onClick={toggleMobileMenu}
          ></div>
        )}

        <aside
          className={cn(
            "fixed top-0 left-0 h-full bg-white shadow-xl z-40 transition-transform duration-300 ease-in-out transform w-[240px] md:hidden",
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          )}
        >
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center">
              <Tractor className="h-6 w-6 text-farm-600" />
              <h2 className="ml-2 text-lg font-semibold text-farm-800">Farm Manager</h2>
            </div>
            <Button variant="ghost" size="icon" onClick={toggleMobileMenu}>
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
                        "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                        {
                          "bg-farm-100 text-farm-900": isActive,
                          "text-muted-foreground hover:bg-muted hover:text-foreground": !isActive,
                        }
                      )
                    }
                    onClick={() => isMobile && setMobileOpen(false)}
                  >
                    <item.icon className="h-5 w-5 mr-2" />
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

  // Desktop view
  return (
    <aside
      className={cn(
        "bg-white transition-all duration-300 h-screen border-r flex flex-col relative hidden md:flex",
        collapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <div className="flex items-center justify-between p-4 border-b">
        {!collapsed && (
          <div className="flex items-center">
            <Tractor className="h-6 w-6 text-farm-600" />
            <h2 className="ml-2 text-lg font-semibold text-farm-800">Farm Manager</h2>
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
                    "flex items-center py-2 px-3 rounded-md text-sm font-medium transition-colors",
                    {
                      "bg-farm-100 text-farm-900": isActive,
                      "text-muted-foreground hover:bg-muted hover:text-foreground":
                        !isActive,
                      "justify-center": collapsed,
                    }
                  )
                }
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "" : "mr-2")} />
                {!collapsed && <span>{item.label}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <Button
        variant="ghost"
        size="icon"
        className="absolute -right-3 top-20 rounded-full border bg-background shadow-sm"
        onClick={toggleCollapse}
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
