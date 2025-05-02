
import { ReactNode, useEffect } from "react";
import Sidebar from "./Sidebar";
import Navbar from "./Navbar";
import { useAuth } from "@/contexts/AuthContext";
import { Navigate } from "react-router-dom";

interface LayoutProps {
  children: ReactNode;
  requireAuth?: boolean;
  requireAdmin?: boolean;
}

export default function Layout({ 
  children, 
  requireAuth = true,
  requireAdmin = false
}: LayoutProps) {
  const { currentUser, userData, loading, isAdmin } = useAuth();

  // Add effect to handle body overflow on mobile
  useEffect(() => {
    // Prevent body scrolling when mobile sidebar is open
    const handleBodyScroll = () => {
      const isSidebarOpen = document.body.classList.contains('sidebar-open');
      document.body.style.overflow = isSidebarOpen ? 'hidden' : '';
    };

    window.addEventListener('resize', handleBodyScroll);
    handleBodyScroll();

    return () => {
      window.removeEventListener('resize', handleBodyScroll);
      document.body.style.overflow = '';
    };
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-farm-500 border-t-transparent"></div>
      </div>
    );
  }

  // Not authenticated but auth required
  if (requireAuth && !currentUser) {
    return <Navigate to="/login" replace />;
  }

  // Not admin but admin required
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/dashboard" replace />;
  }

  // Authenticated but on auth pages
  if (!requireAuth && currentUser) {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requireAuth) {
    return (
      <div className="min-h-screen bg-background">
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-1 flex-col w-full">
        <Navbar />
        <main className="flex-1 p-4 md:p-6 animate-fade-in overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
