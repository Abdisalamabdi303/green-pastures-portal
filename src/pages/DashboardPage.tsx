import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { User } from '../types';
import { statCardsData, expenseChartData } from '../data/mockData';

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in
    const storedUser = localStorage.getItem('user');
    if (!storedUser) {
      navigate('/login');
      return;
    }
    
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  if (!user) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
            <div className="text-sm text-gray-500">
              Welcome back, {user.name}
            </div>
          </div>
          
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {statCardsData.map((card, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
                <h3 className="text-lg font-medium text-gray-500">{card.title}</h3>
                <p className="text-3xl font-bold text-gray-800 mt-2">
                  {card.unit && card.unit}{card.value.toLocaleString()}
                </p>
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Expense Chart */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Monthly Expenses</h3>
              <div className="h-80">
                {/* Simple bar chart representation */}
                <div className="flex h-64 items-end space-x-2">
                  {expenseChartData.map((item, index) => (
                    <div key={index} className="flex flex-col items-center flex-1">
                      <div 
                        className="w-full bg-farm-400 rounded-t"
                        style={{ height: `${(item.amount / 300000) * 100}%` }}
                      ></div>
                      <div className="flex flex-col items-center mt-2">
                        <span className="text-xs">{item.name}</span>
                        <span className="text-xs font-medium">${(item.amount/1000).toFixed(1)}k</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Quick Actions */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <h3 className="text-lg font-medium text-gray-800 mb-4">Quick Actions</h3>
              <div className="space-y-4">
                <button 
                  className="w-full bg-farm-50 hover:bg-farm-100 text-farm-700 py-3 px-4 rounded border border-farm-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add New Animal
                </button>
                <button 
                  className="w-full bg-farm-50 hover:bg-farm-100 text-farm-700 py-3 px-4 rounded border border-farm-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Record Expense
                </button>
                <button 
                  className="w-full bg-farm-50 hover:bg-farm-100 text-farm-700 py-3 px-4 rounded border border-farm-200 flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Generate Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
