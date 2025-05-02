
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tractor, Bird, Activity, PiggyBank, BarChart, Menu, X } from "lucide-react";

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Handle body overflow when mobile menu is open
  useEffect(() => {
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
      <section className="farm-gradient py-12 md:py-24 px-4 sm:px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4 md:space-y-6 animate-fade-in">
              <h1 className="text-3xl md:text-5xl font-bold text-farm-900 leading-tight">
                Smart Livestock Management System
              </h1>
              <p className="text-base md:text-lg text-farm-800">
                Efficiently manage your livestock with our comprehensive solution. 
                Track health, finances, and productivity all in one place.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link to="/register" className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto bg-farm-600 hover:bg-farm-700 text-white text-base md:text-lg h-10 md:h-12 px-4 md:px-8">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login" className="w-full sm:w-auto">
                  <Button variant="outline" className="w-full sm:w-auto text-base md:text-lg h-10 md:h-12 px-4 md:px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block animate-slide-in-right">
              <img 
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=2073" 
                alt="Farm with livestock" 
                className="rounded-lg shadow-lg"
                loading="lazy"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-farm-800">Key Features</h2>
            <p className="text-base md:text-lg text-muted-foreground mt-2">
              Everything you need to manage your livestock efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
            <div className="card-farm p-5 md:p-6 text-center hover-lift">
              <div className="mx-auto bg-farm-100 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full mb-4">
                <Bird className="h-6 w-6 md:h-8 md:w-8 text-farm-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Animal Tracking</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Register and monitor all your animals with detailed profiles and history.
              </p>
            </div>

            <div className="card-farm p-5 md:p-6 text-center hover-lift">
              <div className="mx-auto bg-farm-100 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full mb-4">
                <Activity className="h-6 w-6 md:h-8 md:w-8 text-farm-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Health Management</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Track treatments, medication schedules, and health issues efficiently.
              </p>
            </div>

            <div className="card-farm p-5 md:p-6 text-center hover-lift">
              <div className="mx-auto bg-farm-100 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full mb-4">
                <PiggyBank className="h-6 w-6 md:h-8 md:w-8 text-farm-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Expense Tracking</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Monitor all farm expenses categorized by purpose and date.
              </p>
            </div>

            <div className="card-farm p-5 md:p-6 text-center hover-lift">
              <div className="mx-auto bg-farm-100 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center rounded-full mb-4">
                <BarChart className="h-6 w-6 md:h-8 md:w-8 text-farm-600" />
              </div>
              <h3 className="text-lg md:text-xl font-semibold mb-2">Financial Analysis</h3>
              <p className="text-sm md:text-base text-muted-foreground">
                Calculate profit/loss and analyze financial performance with visual reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 md:py-16 px-4 sm:px-6 earth-gradient">
        <div className="container mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-earth-900 mb-4">
            Ready to modernize your farm management?
          </h2>
          <p className="text-base md:text-lg text-earth-800 mb-6 md:mb-8 max-w-2xl mx-auto">
            Join Green Pastures and take control of your livestock operations with our easy-to-use, powerful management system.
          </p>
          <Link to="/register">
            <Button className="bg-farm-600 hover:bg-farm-700 text-white text-base md:text-lg h-10 md:h-12 px-4 md:px-8 animate-scale-in">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-6 md:py-8 px-4 sm:px-6 mt-auto">
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
