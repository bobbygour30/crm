import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FaBars, FaTimes, FaChartLine, FaUsers, FaTasks, FaRocket, FaStar, FaTwitter, FaLinkedin, FaFacebook, FaArrowLeft, FaArrowRight } from 'react-icons/fa';

function HomePage() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
      alt: 'Lead Management',
      title: 'Master Your Leads',
      subtitle: 'Transform your sales pipeline with intuitive tools.',
      description: 'Lead CRM empowers you to track, manage, and convert leads with ease, streamlining your sales process.',
      primaryCta: { text: 'Get Started', to: '/dashboard' },
      secondaryCta: { text: 'Try Free', to: '/login' },
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
      alt: 'Real-Time Analytics',
      title: 'Actionable Insights',
      subtitle: 'Make data-driven decisions in real time.',
      description: 'Our advanced analytics dashboard provides deep insights to optimize your sales strategy.',
      primaryCta: { text: 'Explore Features', to: '/activity' },
      secondaryCta: { text: 'Try Free', to: '/login' },
    },
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978',
      alt: 'Task Automation',
      title: 'Boost Productivity',
      subtitle: 'Automate tasks, close deals faster.',
      description: 'Seamless workflow automation lets you focus on building relationships and driving growth.',
      primaryCta: { text: 'Try Now', to: '/tasks' },
      secondaryCta: { text: 'Try Free', to: '/login' },
    },
  ];

  // Carousel auto-advance
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [slides.length]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => {
      const navbar = document.querySelector('.navbar');
      if (window.scrollY > 50) {
        navbar.classList.add('navbar-scrolled');
      } else {
        navbar.classList.remove('navbar-scrolled');
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="bg-gray-50">
      {/* Navbar */}
      <nav className="navbar fixed top-0 left-0 right-0 z-50 bg-white transition-all duration-300">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link to="/" className="text-2xl sm:text-3xl font-extrabold text-indigo-600">Lead CRM</Link>
          <div className="hidden md:flex space-x-4 lg:space-x-6 items-center">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium text-sm lg:text-base transition-colors">Home</Link>
            <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium text-sm lg:text-base transition-colors">Dashboard</Link>
            <Link to="/leads" className="text-gray-700 hover:text-indigo-600 font-medium text-sm lg:text-base transition-colors">Leads</Link>
            <Link to="/tasks" className="text-gray-700 hover:text-indigo-600 font-medium text-sm lg:text-base transition-colors">Tasks</Link>
            <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium text-sm lg:text-base transition-colors">Profile</Link>
            <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm lg:text-base hover:bg-indigo-700 transition-colors">Login</Link>
          </div>
          <button
            className="md:hidden text-gray-700 hover:text-indigo-600 p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
          </button>
        </div>
        {isMenuOpen && (
          <div className="md:hidden bg-white shadow-lg transition-all duration-300">
            <div className="flex flex-col space-y-3 p-4">
              <Link to="/" className="text-gray-700 hover:text-indigo-600 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Home</Link>
              <Link to="/dashboard" className="text-gray-700 hover:text-indigo-600 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              <Link to="/leads" className="text-gray-700 hover:text-indigo-600 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Leads</Link>
              <Link to="/tasks" className="text-gray-700 hover:text-indigo-600 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Tasks</Link>
              <Link to="/profile" className="text-gray-700 hover:text-indigo-600 font-medium text-base" onClick={() => setIsMenuOpen(false)}>Profile</Link>
              <Link to="/login" className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-base hover:bg-indigo-700" onClick={() => setIsMenuOpen(false)}>Login</Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section with Custom Carousel */}
      <section className="pt-20 pb-12 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-xl overflow-hidden">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  index === currentSlide ? 'opacity-100' : 'opacity-0'
                }`}
              >
                <img src={slide.image} alt={slide.alt} className="w-full h-full object-cover" />
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center px-4 sm:px-6">
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold mb-2 sm:mb-4">{slide.title}</h1>
                    <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-6">{slide.subtitle}</h2>
                    <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-xl mx-auto">{slide.description}</p>
                    <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
                      <Link to={slide.primaryCta.to} className="bg-white text-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors">
                        {slide.primaryCta.text}
                      </Link>
                      <Link to={slide.secondaryCta.to} className="border border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors">
                        {slide.secondaryCta.text}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={handlePrevSlide}
              className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-indigo-600 p-2 sm:p-3 rounded-full hover:bg-white transition-colors z-10"
            >
              <FaArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <button
              onClick={handleNextSlide}
              className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-white/80 text-indigo-600 p-2 sm:p-3 rounded-full hover:bg-white transition-colors z-10"
            >
              <FaArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>
            <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`h-2 w-2 sm:h-3 sm:w-3 rounded-full transition-all duration-300 ${
                    index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
                  }`}
                ></button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-12 sm:py-16 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-12">Benefits of Lead CRM</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
            <div className="flex items-start space-x-4">
              <FaRocket className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Increase Efficiency</h3>
                <p className="text-gray-600 text-sm sm:text-base">Automate repetitive tasks and streamline workflows to save time and focus on high-value activities.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaChartLine className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Data-Driven Growth</h3>
                <p className="text-gray-600 text-sm sm:text-base">Leverage real-time analytics to identify opportunities and optimize your sales strategy.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaUsers className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Enhanced Collaboration</h3>
                <p className="text-gray-600 text-sm sm:text-base">Centralize lead data for seamless team collaboration and improved customer interactions.</p>
              </div>
            </div>
            <div className="flex items-start space-x-4">
              <FaTasks className="h-8 w-8 text-indigo-600 flex-shrink-0" />
              <div>
                <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Scalable Solutions</h3>
                <p className="text-gray-600 text-sm sm:text-base">Adaptable tools that grow with your business, from startups to enterprises.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-12">Why Lead CRM Stands Out</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center">
              <FaUsers className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Advanced Lead Tracking</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Manage leads through customizable pipelines with real-time updates and detailed insights.</p>
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978" alt="Lead Tracking" className="w-full h-24 sm:h-32 object-cover rounded-lg" />
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center">
              <FaTasks className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Task Automation</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Automate follow-ups, reminders, and workflows to focus on closing deals.</p>
              <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f" alt="Task Automation" className="w-full h-24 sm:h-32 object-cover rounded-lg" />
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center">
              <FaChartLine className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Real-Time Analytics</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Track performance metrics and gain actionable insights with dynamic dashboards.</p>
              <img src="https://images.unsplash.com/photo-1552664730-d307ca884978" alt="Analytics" className="w-full h-24 sm:h-32 object-cover rounded-lg" />
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow flex flex-col items-center text-center">
              <FaRocket className="h-10 w-10 sm:h-12 sm:w-12 text-indigo-600 mb-3 sm:mb-4" />
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-2">Seamless Integration</h3>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-4">Connect with tools like Slack, Zapier, and more for a unified workflow.</p>
              <img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f" alt="Integration" className="w-full h-24 sm:h-32 object-cover rounded-lg" />
            </div>
          </div>
        </div>
      </section>

      {/* Statistics Section */}
      <section className="py-12 sm:py-16 bg-indigo-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-12">Our Impact</h2>
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600">10K+</p>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600">1M+</p>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Leads Managed</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600">99%</p>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Customer Satisfaction</p>
            </div>
            <div className="text-center">
              <p className="text-3xl sm:text-4xl font-bold text-indigo-600">24/7</p>
              <p className="text-gray-600 text-sm sm:text-base mt-2">Support Availability</p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-12 sm:py-16 bg-gray-100">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-12">Trusted by Professionals</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330" alt="Sarah" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 object-cover" />
              <p className="text-gray-600 text-sm sm:text-base italic mb-3 sm:mb-4">"Lead CRM transformed our sales process, saving us hours every week."</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">Sarah Johnson</p>
              <p className="text-gray-500 text-xs sm:text-sm">Sales Manager</p>
              <div className="flex space-x-1 mt-2">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />)}
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d" alt="Michael" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 object-cover" />
              <p className="text-gray-600 text-sm sm:text-base italic mb-3 sm:mb-4">"The analytics dashboard is a game-changer for our decision-making."</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">Michael Lee</p>
              <p className="text-gray-500 text-xs sm:text-sm">Business Owner</p>
              <div className="flex space-x-1 mt-2">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />)}
              </div>
            </div>
            <div className="bg-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <img src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7" alt="Emily" className="w-12 h-12 sm:w-16 sm:h-16 rounded-full mb-3 sm:mb-4 object-cover" />
              <p className="text-gray-600 text-sm sm:text-base italic mb-3 sm:mb-4">"Integration with our tools was seamless and boosted our efficiency."</p>
              <p className="font-semibold text-gray-800 text-sm sm:text-base">Emily Chen</p>
              <p className="text-gray-500 text-xs sm:text-sm">Marketing Director</p>
              <div className="flex space-x-1 mt-2">
                {[...Array(5)].map((_, i) => <FaStar key={i} className="h-3 w-3 sm:h-4 sm:w-4 text-yellow-400" />)}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 text-center mb-8 sm:mb-12">Simple, Transparent Pricing</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Basic</h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-3 sm:mb-4">$29/mo</p>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-6">Perfect for small teams starting out.</p>
              <ul className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-6 space-y-2">
                <li>Lead Tracking</li>
                <li>Basic Analytics</li>
                <li>Email Support</li>
              </ul>
              <Link to="/login" className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-indigo-700 transition-colors">Choose Plan</Link>
            </div>
            <div className="bg-indigo-600 text-white p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center text-center relative">
              <span className="absolute top-0 -mt-3 sm:-mt-4 bg-yellow-400 text-gray-800 px-3 py-1 rounded-full text-xs sm:text-sm font-semibold">Most Popular</span>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Pro</h3>
              <p className="text-2xl sm:text-3xl font-bold mb-3 sm:mb-4">$99/mo</p>
              <p className="text-sm sm:text-base mb-3 sm:mb-6">Ideal for growing businesses.</p>
              <ul className="text-sm sm:text-base mb-3 sm:mb-6 space-y-2">
                <li>Advanced Lead Management</li>
                <li>Real-Time Analytics</li>
                <li>Priority Support</li>
                <li>Integrations</li>
              </ul>
              <Link to="/login" className="bg-white text-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors">Choose Plan</Link>
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-xl shadow-lg flex flex-col items-center text-center">
              <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mb-3 sm:mb-4">Enterprise</h3>
              <p className="text-2xl sm:text-3xl font-bold text-indigo-600 mb-3 sm:mb-4">Custom</p>
              <p className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-6">Tailored for large organizations.</p>
              <ul className="text-gray-600 text-sm sm:text-base mb-3 sm:mb-6 space-y-2">
                <li>Custom Pipelines</li>
                <li>Dedicated Support</li>
                <li>API Access</li>
                <li>Custom Integrations</li>
              </ul>
              <Link to="/login" className="bg-indigo-600 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-indigo-700 transition-colors">Contact Us</Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-16 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-4 sm:mb-6">Ready to Revolutionize Your Sales?</h2>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-4 sm:mb-6 max-w-xl sm:max-w-2xl mx-auto">Join thousands of professionals using Lead CRM to streamline workflows and accelerate growth.</p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
            <Link to="/dashboard" className="bg-white text-indigo-600 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-gray-100 transition-colors">Start Now</Link>
            <Link to="/login" className="border border-white text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base hover:bg-white/10 transition-colors">Try Free for 14 Days</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-8 sm:py-12">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Lead CRM</h3>
              <p className="text-gray-400 text-sm sm:text-base">Empowering businesses to manage leads and drive growth with intuitive, scalable solutions.</p>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Quick Links</h3>
              <ul className="space-y-2 text-sm sm:text-base">
                <li><Link to="/" className="text-gray-400 hover:text-white transition-colors">Home</Link></li>
                <li><Link to="/dashboard" className="text-gray-400 hover:text-white transition-colors">Dashboard</Link></li>
                <li><Link to="/leads" className="text-gray-400 hover:text-white transition-colors">Leads</Link></li>
                <li><Link to="/tasks" className="text-gray-400 hover:text-white transition-colors">Tasks</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">Connect With Us</h3>
              <div className="flex space-x-3 sm:space-x-4">
                <a href="https://twitter.com" className="text-gray-400 hover:text-white transition-colors"><FaTwitter className="h-5 w-5 sm:h-6 sm:w-6" /></a>
                <a href="https://linkedin.com" className="text-gray-400 hover:text-white transition-colors"><FaLinkedin className="h-5 w-5 sm:h-6 sm:w-6" /></a>
                <a href="https://facebook.com" className="text-gray-400 hover:text-white transition-colors"><FaFacebook className="h-5 w-5 sm:h-6 sm:w-6" /></a>
              </div>
              <p className="mt-3 sm:mt-4 text-gray-400 text-sm sm:text-base">Contact: support@leadcrm.com</p>
            </div>
          </div>
          <div className="mt-6 sm:mt-8 text-center text-gray-400 text-sm sm:text-base">
            <p>&copy; 2025 Lead CRM. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;