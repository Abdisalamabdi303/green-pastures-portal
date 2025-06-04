import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ArrowRight, BarChart3, Users, DollarSign, LineChart } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
            alt="Cow in pasture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/50"></div>
        </div>
        
        <div className="container mx-auto relative z-10 px-4 sm:px-6">
          <div className="max-w-3xl text-white space-y-8">
            <div className="inline-block bg-farm-500/20 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-4">
              Modern Farm Management Solution
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              Smart Livestock Management
            </h1>
            <p className="text-xl md:text-2xl opacity-90 max-w-2xl">
              Efficiently manage your farm with our comprehensive system. Track 1,500+ animals, monitor expenses, and boost productivity.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <button className="w-full sm:w-auto bg-farm-500 hover:bg-farm-600 text-white font-medium py-3 px-8 rounded-lg flex items-center gap-2 transition-all duration-200">
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white font-medium py-3 px-8 rounded-lg transition-all duration-200">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-gradient-to-br from-farm-50 to-farm-100 p-8 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-farm-500 rounded-xl flex items-center justify-center">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">1,500+</h3>
                  <p className="text-gray-600">Animals Tracked</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-farm-50 to-farm-100 p-8 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-farm-500 rounded-xl flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">$2.5M+</h3>
                  <p className="text-gray-600">Revenue Managed</p>
                </div>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-farm-50 to-farm-100 p-8 rounded-2xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-farm-500 rounded-xl flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">98%</h3>
                  <p className="text-gray-600">Customer Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-farm-100 text-farm-700 px-4 py-2 rounded-full text-sm font-medium mb-4">
              Features
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Key Features</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your livestock efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-14 h-14 bg-farm-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="h-7 w-7 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Livestock Tracking</h3>
              <p className="text-gray-600 leading-relaxed">
                Keep detailed records of all your animals, including health status, breeding, and production metrics.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-14 h-14 bg-farm-100 rounded-xl flex items-center justify-center mb-6">
                <DollarSign className="h-7 w-7 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Expense Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Track all your farm expenses and income in one place for better financial planning and analysis.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
              <div className="w-14 h-14 bg-farm-100 rounded-xl flex items-center justify-center mb-6">
                <BarChart3 className="h-7 w-7 text-farm-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Insightful Reports</h3>
              <p className="text-gray-600 leading-relaxed">
                Get valuable insights with easy-to-understand reports and charts for informed decision making.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 bg-gradient-to-br from-farm-600 to-farm-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Ready to transform your livestock management?
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Join Green Pastures and take control of your farm operations with our comprehensive management system.
          </p>
          <Link to="/register">
            <button className="bg-white hover:bg-gray-100 text-farm-600 font-medium py-4 px-10 rounded-xl text-lg flex items-center gap-2 mx-auto transition-all duration-200">
              Start Your Free Trial
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-12 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-xl font-semibold text-farm-800">Green Pastures</span>
            </div>
            <div className="text-sm text-gray-500">
              © {new Date().getFullYear()} Green Pastures. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;