
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
  Bird
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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
      setHidden(true);
    } else {
      setHidden(false);
    }
  }, [isMobile]);

  const toggleCollapse = () => {
    setCollapsed(!collapsed);
  };

  const filteredNavItems = navItems.filter(
    item => !item.adminOnly || (item.adminOnly && isAdmin)
  );

  if (hidden) return null;

  return (
    <aside
      className={cn(
        "bg-white transition-all duration-300 h-screen border-r flex flex-col relative",
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
