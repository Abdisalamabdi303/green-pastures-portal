import { Mail, Phone, MapPin, Globe } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#004225] text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <img
              src="/logoQowsaar.png"
              alt="Qowsaar Livestock"
              className="h-12 w-auto mb-4"
            />
            <p className="text-sm text-gray-300 mb-4">
              Leading livestock development organization specializing in goat and sheep care across Somalia
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-white">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-white">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-300 hover:text-white">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-white">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2" />
                <a href="tel:+252615556520" className="text-gray-300 hover:text-white">
                  +252 61 555 6520
                </a>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2" />
                <a href="mailto:abumascuud75@gmail.com" className="text-gray-300 hover:text-white">
                  abumascuud75@gmail.com
                </a>
              </li>
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mr-2 mt-1" />
                <span className="text-gray-300">
                  Mogadishu, Banadir Region<br />
                  Somalia
                </span>
              </li>
            </ul>
          </div>

          {/* Coverage Area */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Coverage Area</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Globe className="h-5 w-5 mr-2" />
                <span className="text-gray-300">Southwest Regions of Somalia</span>
              </li>
              <li className="text-gray-300 ml-7">Regional State Branches</li>
              <li className="text-gray-300 ml-7">International Representatives</li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-300 text-sm">
            © {new Date().getFullYear()} Qowsaar Livestock. All rights reserved.
          </p>
          <p className="text-gray-300 text-sm mt-4 md:mt-0">
            Built by{' '}
            <a 
              href="https://www.innovatextech.com" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-white hover:text-gray-300"
            >
              InnovateX Tech
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer; 