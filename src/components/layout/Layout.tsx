
import { ReactNode } from "react";
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
        <main className="flex-1 p-4 md:p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
