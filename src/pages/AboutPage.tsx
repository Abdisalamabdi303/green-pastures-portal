import { MapPin, Mail, Phone, Globe, Building2, Users } from 'lucide-react';
import Layout from '../components/layout/Layout';

const AboutPage = () => {
  return (
    <Layout requireAuth={false}>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <img
              src="/logoQowsaar.png"
              alt="Qowsaar Livestock"
              className="mx-auto h-24 w-auto mb-8"
            />
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Qowsaar Livestock
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              A leading livestock development company specializing in goat and sheep care across Somalia
            </p>
          </div>

          {/* Leadership Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Leadership
            </h2>
            <div className="max-w-3xl mx-auto">
              <div className="bg-white rounded-2xl shadow-sm p-8">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="w-48 h-48 relative">
                    <div className="absolute inset-0 bg-[#004225]/5 rounded-2xl transform rotate-3"></div>
                    <img
                      src="/chairman-profile.jpg"
                      alt="Ahmed Abdullahi Farah - Chairman"
                      className="relative w-full h-full object-cover rounded-2xl"
                    />
                  </div>
                  <div className="flex-1 text-center md:text-left">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">Ahmed Abdullahi Farah</h3>
                    <p className="text-[#004225] font-medium mb-4">Chairman</p>
                    <p className="text-gray-600 mb-6">
                      Leading Qowsaar Livestock's mission to revolutionize livestock management 
                      across Somalia. With extensive experience in livestock development, 
                      Ahmed guides our organization's commitment to sustainable livestock practices 
                      and regional economic growth.
                    </p>
                    <div className="flex flex-col md:flex-row gap-4 items-center md:items-start">
                      <a
                        href="mailto:abumascuud75@gmail.com"
                        className="flex items-center text-[#004225] hover:text-[#003820]"
                      >
                        <Mail className="h-5 w-5 mr-2" />
                        abumascuud75@gmail.com
                      </a>
                      <a
                        href="tel:+252615556520"
                        className="flex items-center text-[#004225] hover:text-[#003820]"
                      >
                        <Phone className="h-5 w-5 mr-2" />
                        +252 61 555 6520
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* About Section */}
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                About Our Organization
              </h2>
              <p className="text-gray-600 mb-4">
                Established in 2024, Qowsaar Livestock is a non-profit, non-government, 
                non-political, and non-religious organization dedicated to livestock development. 
                Our focus is primarily on goats and sheep care, with a comprehensive approach 
                to livestock management and development.
              </p>
              <p className="text-gray-600 mb-4">
                Operating both locally and internationally, we maintain our headquarters in 
                Mogadishu while extending our presence across all regional states of Somalia 
                and maintaining representatives abroad.
              </p>
              <div className="space-y-4 mt-8">
                <div className="flex items-center text-gray-700">
                  <div className="w-12 h-12 bg-[#004225]/10 rounded-lg flex items-center justify-center mr-4">
                    <Building2 className="h-6 w-6 text-[#004225]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Headquarters</h3>
                    <p className="text-gray-600">Mogadishu, Banadir Region</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-12 h-12 bg-[#004225]/10 rounded-lg flex items-center justify-center mr-4">
                    <Globe className="h-6 w-6 text-[#004225]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Coverage Area</h3>
                    <p className="text-gray-600">Southwest Regions of Somalia & International</p>
                  </div>
                </div>
                <div className="flex items-center text-gray-700">
                  <div className="w-12 h-12 bg-[#004225]/10 rounded-lg flex items-center justify-center mr-4">
                    <Users className="h-6 w-6 text-[#004225]" />
                  </div>
                  <div>
                    <h3 className="font-medium">Leadership Structure</h3>
                    <p className="text-gray-600">Chairman and Deputy Chairman</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="absolute inset-0 bg-[#004225]/5 rounded-3xl transform rotate-3"></div>
              <div className="absolute inset-0 bg-[#004225]/10 rounded-3xl transform -rotate-3"></div>
              <img
                src="/livestock-management.jpg"
                alt="Livestock Management"
                className="relative rounded-3xl shadow-xl w-full h-[500px] object-cover"
              />
            </div>
          </div>

          {/* Objectives Section */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              Our Objectives
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#004225]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-[#004225]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Livestock Care</h3>
                <p className="text-gray-600">Specialized care for goats and sheep, including raising newborn livestock.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#004225]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-[#004225]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Market Access</h3>
                <p className="text-gray-600">Marketing live animals and establishing logistics networks.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-[#004225]/10 rounded-lg flex items-center justify-center mb-4">
                  <svg className="h-6 w-6 text-[#004225]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Community Impact</h3>
                <p className="text-gray-600">Creating job opportunities and fostering cooperative relationships.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default AboutPage; 