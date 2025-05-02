
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { useAuth } from "./contexts/AuthContext";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Animals from "./pages/Animals";
import Health from "./pages/Health";
import Expenses from "./pages/Expenses";
import Finance from "./pages/Finance";
import Users from "./pages/Users";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

console.log("App component is being rendered");

const queryClient = new QueryClient();

// Component to show Firebase configuration error
const FirebaseError = ({ error }: { error: string }) => {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Alert variant="destructive" className="max-w-md">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Firebase Configuration Error</AlertTitle>
        <AlertDescription>
          {error}
          <div className="mt-4 text-sm">
            This is a frontend-only demo. Use these credentials:
            <ul className="mt-2 ml-4 list-disc">
              <li>Admin: admin@example.com / password</li>
              <li>User: user@example.com / password</li>
            </ul>
          </div>
        </AlertDescription>
      </Alert>
    </div>
  );
};

// Inner app component that uses auth context
const AppRoutes = () => {
  const { error } = useAuth();
  
  if (error) {
    return <FirebaseError error={error} />;
  }
  
  return (
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/animals" element={<Animals />} />
      <Route path="/health" element={<Health />} />
      <Route path="/expenses" element={<Expenses />} />
      <Route path="/finance" element={<Finance />} />
      <Route path="/users" element={<Users />} />
      <Route path="/settings" element={<Settings />} />
      {/* Catch-all route */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

const App = () => {
  console.log("Inside App component function");
  
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <AppRoutes />
          </TooltipProvider>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

export default App;
