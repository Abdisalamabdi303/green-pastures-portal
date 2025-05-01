
import { useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Tractor, Bird, Activity, PiggyBank, BarChart } from "lucide-react";

const Index = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to dashboard if already logged in
    if (currentUser) {
      navigate("/dashboard");
    }
  }, [currentUser, navigate]);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white px-6 py-4 border-b">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Tractor className="h-6 w-6 text-farm-600" />
            <span className="text-xl font-semibold text-farm-800">Green Pastures</span>
          </div>
          <div className="space-x-2">
            <Link to="/login">
              <Button variant="outline">Sign In</Button>
            </Link>
            <Link to="/register">
              <Button className="bg-farm-600 hover:bg-farm-700 text-white">Sign Up</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="farm-gradient py-16 md:py-24 px-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl font-bold text-farm-900 leading-tight">
                Smart Livestock Management System
              </h1>
              <p className="text-lg text-farm-800">
                Efficiently manage your livestock with our comprehensive solution. 
                Track health, finances, and productivity all in one place.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <Link to="/register">
                  <Button className="w-full sm:w-auto bg-farm-600 hover:bg-farm-700 text-white text-lg h-12 px-8">
                    Get Started
                  </Button>
                </Link>
                <Link to="/login">
                  <Button variant="outline" className="w-full sm:w-auto text-lg h-12 px-8">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
            <div className="hidden md:block">
              <img 
                src="https://images.unsplash.com/photo-1516467508483-a7212febe31a?auto=format&fit=crop&q=80&w=2073" 
                alt="Farm with livestock" 
                className="rounded-lg shadow-lg"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-6 bg-white">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-farm-800">Key Features</h2>
            <p className="text-lg text-muted-foreground mt-2">
              Everything you need to manage your livestock efficiently
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="card-farm p-6 text-center">
              <div className="mx-auto bg-farm-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <Bird className="h-8 w-8 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Animal Tracking</h3>
              <p className="text-muted-foreground">
                Register and monitor all your animals with detailed profiles and history.
              </p>
            </div>

            <div className="card-farm p-6 text-center">
              <div className="mx-auto bg-farm-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <Activity className="h-8 w-8 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Health Management</h3>
              <p className="text-muted-foreground">
                Track treatments, medication schedules, and health issues efficiently.
              </p>
            </div>

            <div className="card-farm p-6 text-center">
              <div className="mx-auto bg-farm-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <PiggyBank className="h-8 w-8 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expense Tracking</h3>
              <p className="text-muted-foreground">
                Monitor all farm expenses categorized by purpose and date.
              </p>
            </div>

            <div className="card-farm p-6 text-center">
              <div className="mx-auto bg-farm-100 w-16 h-16 flex items-center justify-center rounded-full mb-4">
                <BarChart className="h-8 w-8 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Financial Analysis</h3>
              <p className="text-muted-foreground">
                Calculate profit/loss and analyze financial performance with visual reports.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 earth-gradient">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold text-earth-900 mb-4">
            Ready to modernize your farm management?
          </h2>
          <p className="text-lg text-earth-800 mb-8 max-w-2xl mx-auto">
            Join Green Pastures and take control of your livestock operations with our easy-to-use, powerful management system.
          </p>
          <Link to="/register">
            <Button className="bg-farm-600 hover:bg-farm-700 text-white text-lg h-12 px-8">
              Get Started Today
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-6">
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
