
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tractor, Bird, Activity, PiggyBank, BarChart, Menu, X } from "lucide-react";
import DashboardPreview from "@/components/home/DashboardPreview";
import ExpenseForm from "@/components/home/ExpenseForm";
import AnimalEntryForm from "@/components/home/AnimalEntryForm";
import ReportPreview from "@/components/home/ReportPreview";

const Index = () => {
  console.log("Index component is rendering");
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle body overflow when mobile menu is open
  useEffect(() => {
    console.log("Index component mounted");
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (currentUser) {
      console.log("User is logged in, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white px-4 sm:px-6 py-4 border-b shadow-sm sticky top-0 z-10">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Tractor className="h-6 w-6 text-farm-600" />
            <span className="text-xl font-semibold text-farm-800">Green Pastures</span>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-farm-800"
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
          
          {/* Desktop navigation */}
          <div className="hidden md:flex space-x-2">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-farm-600 hover:bg-farm-700 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
        
        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2 border-t mt-4 flex flex-col space-y-2 animate-fade-in">
            <Link to="/login" className="w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button variant="outline" className="w-full">Sign In</Button>
            </Link>
            <Link to="/register" className="w-full" onClick={() => setMobileMenuOpen(false)}>
              <Button className="bg-farm-600 hover:bg-farm-700 text-white w-full">Sign Up</Button>
            </Link>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1740&q=80" 
            alt="Cow in pasture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-farm-900/70 to-farm-800/40"></div>
        </div>
        
        <div className="container mx-auto relative z-10 px-4 sm:px-6">
          <div className="max-w-2xl text-white space-y-6 animate-fade-in">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Smart Livestock Management
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Efficiently manage your farm with our comprehensive system. Track 1,500+ animals, monitor expenses, and boost productivity.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <Button className="w-full sm:w-auto bg-farm-500 hover:bg-farm-600 text-white text-lg h-12 px-8">
                  Get Started
                </Button>
              </Link>
              <Link to="#dashboard-preview">
                <Button variant="outline" className="w-full sm:w-auto text-white border-white hover:bg-white/10 text-lg h-12 px-8">
                  See Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section id="dashboard-preview" className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-farm-800">Dashboard Preview</h2>
            <p className="text-xl text-gray-600 mt-2">See your key farm metrics at a glance</p>
          </div>
          
          <DashboardPreview />
        </div>
      </section>

      {/* Forms Section - Two Column on Desktop */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-farm-800">Streamlined Data Entry</h2>
            <p className="text-xl text-gray-600 mt-2">Easily manage expenses and register new animals</p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Expense Form */}
            <div>
              <h3 className="text-2xl font-semibold text-farm-700 mb-6">Daily Expense Entry</h3>
              <ExpenseForm />
            </div>
            
            {/* Animal Entry Form */}
            <div>
              <h3 className="text-2xl font-semibold text-farm-700 mb-6">Animal Registration</h3>
              <AnimalEntryForm />
            </div>
          </div>
        </div>
      </section>

      {/* Report Preview Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-farm-800">Monthly Reports</h2>
            <p className="text-xl text-gray-600 mt-2">Visualize your farm's performance over time</p>
          </div>
          
          <ReportPreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 farm-gradient">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-farm-900 mb-4">
            Ready to transform your livestock management?
          </h2>
          <p className="text-xl text-farm-800 mb-8 max-w-2xl mx-auto">
            Join Green Pastures and take control of your farm operations with our comprehensive management system.
          </p>
          <Link to="/register">
            <Button className="bg-farm-600 hover:bg-farm-700 text-white text-lg h-12 px-8 animate-scale-in">
              Start Your Free Trial
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4 sm:px-6 mt-auto">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <Tractor className="h-5 w-5 text-farm-600" />
              <span className="text-lg font-semibold text-farm-800">Green Pastures</span>
            </div>
            <div className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} Green Pastures. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
