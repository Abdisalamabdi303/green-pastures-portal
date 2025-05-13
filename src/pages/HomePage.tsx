import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import DashboardPreview from '../components/home/DashboardPreview';
import { statCardsData, expenseChartData } from '../data/mockData';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative h-[500px] flex items-center">
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1740&q=80" 
            alt="Cow in pasture" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-50"></div>
        </div>
        
        <div className="container mx-auto relative z-10 px-4 sm:px-6">
          <div className="max-w-2xl text-white space-y-6">
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              Smart Livestock Management
            </h1>
            <p className="text-xl md:text-2xl opacity-90">
              Efficiently manage your farm with our comprehensive system. Track 1,500+ animals, monitor expenses, and boost productivity.
            </p>
            <div className="pt-4 flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Link to="/register">
                <button className="w-full sm:w-auto bg-farm-500 hover:bg-farm-600 text-white font-medium py-3 px-8 rounded">
                  Get Started
                </button>
              </Link>
              <Link to="/login">
                <button className="w-full sm:w-auto bg-white text-farm-600 hover:bg-gray-100 font-medium py-3 px-8 rounded">
                  Login
                </button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Key Features</h2>
            <p className="text-xl text-gray-600 mt-2">Everything you need to manage your livestock</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-farm-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-farm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Livestock Tracking</h3>
              <p className="text-gray-600">Keep detailed records of all your animals, including health status, breeding, and production.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-farm-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-farm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Expense Management</h3>
              <p className="text-gray-600">Track all your farm expenses and income in one place for better financial planning.</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-farm-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-farm-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Insightful Reports</h3>
              <p className="text-gray-600">Get valuable insights with easy-to-understand reports and charts for informed decision making.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview Section */}
      <section className="py-16 px-4 sm:px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800">Dashboard Preview</h2>
            <p className="text-xl text-gray-600 mt-2">See your key farm metrics at a glance</p>
          </div>
          
          <DashboardPreview />
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-6 bg-farm-50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-farm-900 mb-4">
            Ready to transform your livestock management?
          </h2>
          <p className="text-xl text-farm-800 mb-8 max-w-2xl mx-auto">
            Join Green Pastures and take control of your farm operations with our comprehensive management system.
          </p>
          <Link to="/register">
            <button className="bg-farm-600 hover:bg-farm-700 text-white font-medium py-3 px-8 rounded text-lg">
              Start Your Free Trial
            </button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-4 sm:px-6 mt-auto">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <span className="text-lg font-semibold text-farm-800">Green Pastures</span>
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
