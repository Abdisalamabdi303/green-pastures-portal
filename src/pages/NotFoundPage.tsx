import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';

const NotFoundPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="flex flex-col items-center justify-center px-4 py-16">
        <div className="text-9xl font-bold text-farm-200">404</div>
        <h1 className="mt-4 text-3xl font-bold text-gray-900">Page not found</h1>
        <p className="mt-2 text-lg text-gray-600">Sorry, we couldn't find the page you're looking for.</p>
        <Link to="/" className="mt-6 bg-farm-600 hover:bg-farm-700 text-white px-6 py-3 rounded-md">
          Go back home
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
