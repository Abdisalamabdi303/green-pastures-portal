import { Link } from 'react-router-dom';
import Navbar from '../components/layout/Navbar';
import { ArrowRight, BarChart3, Users, DollarSign, LineChart, CheckCircle2 } from 'lucide-react';

const HomePage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-b from-white to-[#004225]/5">
        {/* Background Pattern */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        </div>
        
        <div className="container mx-auto px-4 sm:px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column - Content */}
            <div className="space-y-8">
              <div className="inline-flex items-center space-x-2 bg-[#004225]/5 border border-[#004225]/10 px-4 py-2 rounded-full">
                <CheckCircle2 className="h-5 w-5 text-[#004225]" />
                <span className="text-sm font-medium text-[#004225]">
                  Leading Livestock Management Solutions
                </span>
            </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 leading-tight">
                Advanced <span className="text-[#004225]">Livestock</span> Management for Somalia
            </h1>
              
              <p className="text-xl text-gray-600 leading-relaxed max-w-2xl">
                Transforming livestock management across Somalia with cutting-edge technology and expertise. 
                Our comprehensive solutions include advanced tracking, health monitoring, and breeding optimization 
                to drive both business growth and regional development.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <Link to="/about">
                  <button className="w-full sm:w-auto bg-[#004225] hover:bg-[#003820] text-white font-medium px-8 py-4 rounded-xl flex items-center justify-center gap-2 transition-all duration-200 text-lg shadow-lg hover:shadow-xl">
                    Explore Solutions
                  <ArrowRight className="w-5 h-5" />
                </button>
              </Link>
                <a href="tel:+252615556520">
                  <button className="w-full sm:w-auto border-2 border-[#004225] text-[#004225] hover:bg-[#004225] hover:text-white font-medium px-8 py-4 rounded-xl transition-all duration-200 text-lg flex items-center justify-center gap-2">
                    Business Inquiry
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                </button>
                </a>
              </div>

              {/* Key Features Pills */}
              <div className="flex flex-wrap gap-3 pt-8">
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
                  📊 Smart Tracking
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
                  🏥 Health Analytics
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
                  📈 Business Growth
                </div>
                <div className="bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100 text-sm font-medium text-gray-600">
                  🌍 Regional Network
                </div>
              </div>
            </div>

            {/* Right Column - Hero Image Composition */}
            <div className="relative hidden lg:block">
              <div className="relative w-full aspect-square">
                {/* Main Circular Image */}
                <div className="absolute inset-0 bg-[#004225]/5 rounded-full overflow-hidden border-8 border-white shadow-2xl">
                  <img 
                    src="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80&fm=webp"
                    srcSet="https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=400&q=80&fm=webp 400w,
                            https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=800&q=80&fm=webp 800w,
                            https://images.unsplash.com/photo-1596733430284-f7437764b1a9?auto=format&fit=crop&w=1200&q=80&fm=webp 1200w"
                    sizes="(max-width: 768px) 100vw,
                           50vw"
                    alt="Modern Livestock Management"
                    width={800}
                    height={800}
                    loading="eager"
                    decoding="sync"
                    fetchPriority="high"
                    className="w-full h-full object-cover object-center scale-110"
                  />
                </div>

                {/* Floating Elements */}
                <div className="absolute -left-12 top-1/4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64 transform -translate-y-1/2 animate-float-slow">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#004225]/10 rounded-lg flex items-center justify-center">
                      <Users className="w-5 h-5 text-[#004225]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Total Animals</p>
                      <p className="text-lg font-semibold text-gray-900">5,234</p>
                    </div>
                  </div>
                </div>

                <div className="absolute -right-8 bottom-1/4 bg-white p-4 rounded-xl shadow-lg border border-gray-100 w-64 animate-float">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#004225]/10 rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-5 h-5 text-[#004225]" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Monthly Growth</p>
                      <p className="text-lg font-semibold text-gray-900">+12.5%</p>
                    </div>
                  </div>
                </div>

                {/* Decorative Circles */}
                <div className="absolute -right-4 top-1/4 w-20 h-20 bg-[#004225]/10 rounded-full animate-float-slow"></div>
                <div className="absolute -left-8 bottom-1/3 w-16 h-16 bg-[#004225]/20 rounded-full animate-float"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-white to-transparent"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#004225]/5 rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#004225]/5 rounded-full blur-3xl -z-10"></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-4 sm:px-6 bg-white relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#004225]/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#004225]/5 rounded-full blur-3xl -z-10 transform -translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Trusted by Livestock Managers Worldwide</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">Our platform helps you manage your livestock with precision and ease</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#004225] rounded-xl flex items-center justify-center transform transition-transform group-hover:scale-110">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#004225]">5,000+</h3>
                  <p className="text-gray-600">Animals Tracked</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#004225] rounded-xl flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#004225]">95%</h3>
                  <p className="text-gray-600">Growth Rate</p>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#004225] rounded-xl flex items-center justify-center">
                  <LineChart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#004225]">24/7</h3>
                  <p className="text-gray-600">Monitoring</p>
                </div>
              </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 transition-all duration-300">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#004225] rounded-xl flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-3xl font-bold text-[#004225]">100%</h3>
                  <p className="text-gray-600">Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 bg-gray-50 relative overflow-hidden">
        {/* Background Decorative Elements */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#004225]/5 rounded-full blur-3xl -z-10 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#004225]/5 rounded-full blur-3xl -z-10 transform translate-x-1/2 translate-y-1/2"></div>
        
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <div className="inline-block bg-[#004225]/10 text-[#004225] px-6 py-2 rounded-full text-sm font-medium mb-4">
              Platform Features
            </div>
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Comprehensive Livestock Management</h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage your livestock efficiently and effectively
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#004225]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#004225] transition-colors duration-300">
                <Users className="h-7 w-7 text-[#004225] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Health Monitoring</h3>
              <p className="text-gray-600 leading-relaxed">
                Track health records, vaccinations, and medical history for each animal in your herd with detailed documentation.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#004225]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#004225] transition-colors duration-300">
                <BarChart3 className="h-7 w-7 text-[#004225] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Growth Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                Monitor growth rates, feed consumption, and performance metrics with intuitive analytics dashboards.
              </p>
            </div>
            
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-[#004225]/10 hover:border-[#004225]/20 hover:shadow-xl transition-all duration-300 group">
              <div className="w-14 h-14 bg-[#004225]/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-[#004225] transition-colors duration-300">
                <LineChart className="h-7 w-7 text-[#004225] group-hover:text-white transition-colors duration-300" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3">Breeding Management</h3>
              <p className="text-gray-600 leading-relaxed">
                Manage breeding cycles, track lineage, and optimize reproduction with comprehensive breeding tools.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 bg-[#004225] relative overflow-hidden">
        {/* Decorative Elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-40 h-40 bg-white rounded-full blur-2xl transform -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full blur-2xl transform translate-x-1/2 translate-y-1/2"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative">
          <h2 className="text-4xl font-bold text-white mb-6">
            Manage Your Livestock Operations
          </h2>
          <p className="text-xl text-white/90 mb-10 max-w-2xl mx-auto">
            Access our digital platform for comprehensive livestock management, or reach out to discuss 
            business opportunities and partnerships.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <button className="bg-white hover:bg-gray-50 text-[#004225] font-medium py-4 px-8 rounded-xl text-lg flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                Login to Dashboard
              <ArrowRight className="w-5 h-5" />
            </button>
          </Link>
            <a href="mailto:info@qowsaar.com">
              <button className="border-2 border-white/20 hover:border-white/40 text-white font-medium py-4 px-8 rounded-xl text-lg flex items-center gap-2 transition-all duration-200">
                Contact Us
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-16 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Column */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold text-[#004225]">Qowsaar</span>
              </div>
              <p className="text-gray-600 text-sm">
                Modern livestock management solutions for efficient and sustainable farming practices.
              </p>
              <div className="flex space-x-4 pt-2">
                <a href="#" className="text-gray-600 hover:text-[#004225] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#004225] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84" />
                  </svg>
                </a>
                <a href="#" className="text-gray-600 hover:text-[#004225] transition-colors">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                    <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Quick Links</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/about" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/features" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Features
                  </Link>
                </li>
                <li>
                  <Link to="/pricing" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link to="/blog" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Blog
                  </Link>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Support</h3>
              <ul className="space-y-3">
                <li>
                  <Link to="/help" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link to="/contact" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Contact Us
                  </Link>
                </li>
                <li>
                  <Link to="/privacy" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/terms" className="text-base text-gray-600 hover:text-[#004225] transition-colors">
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact</h3>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Mogadishu, Banadir Region
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  info@qowsaar.com
                </li>
                <li className="flex items-center text-gray-600">
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  +252615556520
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="flex flex-col md:flex-row items-center gap-4">
                <p className="text-sm text-gray-600">
                  © {new Date().getFullYear()} Qowsaar Livestock. All rights reserved.
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <span>•</span>
                  <span>Built by</span>
                  <a href="https://www.innovatextech.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-[#004225] transition-colors group">
                    <img src="/innovatex.png" alt="InnovateX Tech" className="h-5 w-auto" />
                    <span className="font-medium">InnovateX Tech</span>
                  </a>
                </div>
              </div>
              <div className="flex space-x-6 mt-4 md:mt-0">
                <Link to="/privacy" className="text-sm text-gray-600 hover:text-[#004225] transition-colors">
                  Privacy
                </Link>
                <Link to="/terms" className="text-sm text-gray-600 hover:text-[#004225] transition-colors">
                  Terms
                </Link>
                <Link to="/sitemap" className="text-sm text-gray-600 hover:text-[#004225] transition-colors">
                  Sitemap
                </Link>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;