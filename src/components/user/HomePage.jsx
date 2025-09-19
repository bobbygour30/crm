import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  FaArrowLeft, FaArrowRight, FaCheck, FaChevronRight, FaPlay, FaQuoteLeft,
  FaRocket, FaChartLine, FaUsers, FaTasks, FaStar, FaTwitter, FaLinkedin, FaFacebook
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';

function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      alt: 'Lead Management',
      title: 'Master Your Sales Pipeline',
      subtitle: 'Transform your sales process with intelligent tools',
      description: 'Lead CRM empowers you to track, manage, and convert leads with precision, streamlining your entire sales workflow.',
      primaryCta: { text: 'Get Started', to: '/dashboard' },
      secondaryCta: { text: 'Try Free', to: '/login' },
    },
    {
      image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      alt: 'Real-Time Analytics',
      title: 'Actionable Insights',
      subtitle: 'Make data-driven decisions in real time',
      description: 'Our advanced analytics dashboard provides deep insights to optimize your sales strategy and boost conversion rates.',
      primaryCta: { text: 'Explore Features', to: '/activity' },
      secondaryCta: { text: 'Try Free', to: '/login' },
    },
    {
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1600&q=80',
      alt: 'Task Automation',
      title: 'Boost Productivity',
      subtitle: 'Automate tasks, close deals faster',
      description: 'Seamless workflow automation lets you focus on building relationships and driving revenue growth.',
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

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative h-screen flex items-center justify-center overflow-hidden">
        <AnimatePresence mode="wait">
          {slides.map((slide, index) => (
            index === currentSlide && (
              <motion.div
                key={index}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/60 z-10"></div>
                <img 
                  src={slide.image} 
                  alt={slide.alt} 
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 z-20 flex items-center justify-center">
                  <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
                    <motion.h1 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2, duration: 0.7 }}
                      className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.h2 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.7 }}
                      className="text-xl sm:text-2xl md:text-3xl font-semibold mb-6 text-indigo-100"
                    >
                      {slide.subtitle}
                    </motion.h2>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4, duration: 0.7 }}
                      className="text-lg sm:text-xl max-w-2xl mx-auto mb-8 text-indigo-100"
                    >
                      {slide.description}
                    </motion.p>
                    <motion.div 
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5, duration: 0.7 }}
                      className="flex flex-col sm:flex-row gap-4 justify-center"
                    >
                      <Link 
                        to={slide.primaryCta.to} 
                        className="bg-white text-indigo-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        {slide.primaryCta.text}
                      </Link>
                      <Link 
                        to={slide.secondaryCta.to} 
                        className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white/10 transition-all duration-300"
                      >
                        {slide.secondaryCta.text}
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            )
          ))}
        </AnimatePresence>
        
        {/* Carousel Controls */}
        <button
          onClick={handlePrevSlide}
          className="absolute left-4 z-30 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
        >
          <FaArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={handleNextSlide}
          className="absolute right-4 z-30 bg-white/20 text-white p-3 rounded-full hover:bg-white/30 transition-all duration-300 backdrop-blur-sm"
        >
          <FaArrowRight className="h-5 w-5" />
        </button>
        
        {/* Indicators */}
        <div className="absolute bottom-8 left-0 right-0 z-30 flex justify-center space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2 w-2 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'bg-white scale-125' : 'bg-white/50'
              }`}
            />
          ))}
        </div>
        
        {/* Scroll indicator */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-30">
          <div className="animate-bounce flex flex-col items-center">
            <span className="text-white text-sm mb-1">Scroll down</span>
            <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
              <div className="w-1 h-3 bg-white rounded-full mt-2 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Logo Cloud Section */}
      <section className="py-12 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-10"
          >
            <p className="text-gray-500 text-sm uppercase tracking-wider font-semibold">
              Trusted by industry leaders
            </p>
          </motion.div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center justify-center">
            {['Company A', 'Company B', 'Company C', 'Company D', 'Company E', 'Company F'].map((company, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex items-center justify-center grayscale hover:grayscale-0 transition-all duration-300 opacity-70 hover:opacity-100"
              >
                <div className="h-12 w-32 bg-gray-200 rounded-lg flex items-center justify-center">
                  <span className="text-gray-500 font-medium">{company}</span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to grow your business
            </h2>
            <p className="text-xl text-gray-600">
              LeadCRM provides all the tools you need to manage leads, automate tasks, and drive revenue growth.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <FaRocket className="h-8 w-8 text-indigo-600" />,
                title: "Increase Efficiency",
                description: "Automate repetitive tasks and streamline workflows to save time and focus on high-value activities."
              },
              {
                icon: <FaChartLine className="h-8 w-8 text-indigo-600" />,
                title: "Data-Driven Growth",
                description: "Leverage real-time analytics to identify opportunities and optimize your sales strategy."
              },
              {
                icon: <FaUsers className="h-8 w-8 text-indigo-600" />,
                title: "Enhanced Collaboration",
                description: "Centralize lead data for seamless team collaboration and improved customer interactions."
              },
              {
                icon: <FaTasks className="h-8 w-8 text-indigo-600" />,
                title: "Scalable Solutions",
                description: "Adaptable tools that grow with your business, from startups to enterprises."
              }
            ].map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100"
              >
                <div className="mb-4">{benefit.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                <p className="text-gray-600">{benefit.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Powerful features designed for your success
            </h2>
            <p className="text-xl text-gray-600">
              Discover how LeadCRM can transform your sales process and drive growth.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-indigo-100 rounded-2xl opacity-30"></div>
                <div className="relative bg-white p-2 rounded-2xl shadow-xl">
                  <img 
                    src="https://images.unsplash.com/photo-1552664730-d307ca884978?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80" 
                    alt="Dashboard" 
                    className="rounded-xl w-full h-auto"
                  />
                </div>
                <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-indigo-600 rounded-2xl shadow-xl flex items-center justify-center">
                  <FaPlay className="h-8 w-8 text-white" />
                </div>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6">Intuitive lead management</h3>
              <p className="text-gray-600 mb-8">
                Our advanced lead management system helps you track, prioritize, and convert leads with ease. 
                Customize pipelines to match your sales process and never miss an opportunity.
              </p>
              
              <div className="space-y-4">
                {[
                  "Customizable sales pipelines",
                  "Lead scoring and prioritization",
                  "Automated lead assignment",
                  "Real-time notifications",
                  "Email integration",
                  "Activity tracking"
                ].map((feature, index) => (
                  <div key={index} className="flex items-start">
                    <div className="flex-shrink-0 mt-1">
                      <FaCheck className="h-5 w-5 text-indigo-600" />
                    </div>
                    <p className="ml-3 text-gray-700 font-medium">{feature}</p>
                  </div>
                ))}
              </div>
              
              <Link 
                to="/features" 
                className="inline-flex items-center mt-8 text-indigo-600 font-semibold group"
              >
                Explore all features
                <FaChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-indigo-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { number: "10K+", label: "Active Users" },
              { number: "1M+", label: "Leads Managed" },
              { number: "99%", label: "Customer Satisfaction" },
              { number: "24/7", label: "Support Available" }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="text-4xl md:text-5xl font-bold mb-2">{stat.number}</div>
                <div className="text-indigo-100">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Loved by businesses worldwide
            </h2>
            <p className="text-xl text-gray-600">
              See what our customers have to say about their experience with LeadCRM.
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                name: "Sarah Johnson",
                role: "Sales Manager",
                image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                content: "Lead CRM transformed our sales process, saving us hours every week. The automation features are incredible."
              },
              {
                name: "Michael Lee",
                role: "Business Owner",
                image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                content: "The analytics dashboard is a game-changer for our decision-making. We've increased conversions by 35% since implementing LeadCRM."
              },
              {
                name: "Emily Chen",
                role: "Marketing Director",
                image: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&q=80",
                content: "Integration with our tools was seamless and boosted our efficiency. The support team is always helpful and responsive."
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-gray-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center mb-6">
                  <div className="flex-shrink-0 mr-4">
                    <img 
                      src={testimonial.image} 
                      alt={testimonial.name} 
                      className="h-14 w-14 rounded-full object-cover"
                    />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{testimonial.name}</h4>
                    <p className="text-indigo-600">{testimonial.role}</p>
                  </div>
                </div>
                
                <div className="mb-6">
                  <FaQuoteLeft className="h-6 w-6 text-indigo-100 mb-2" />
                  <p className="text-gray-600 italic">"{testimonial.content}"</p>
                </div>
                
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar key={i} className="h-5 w-5 text-yellow-400" />
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to transform your sales process?</h2>
            <p className="text-xl text-indigo-100 mb-8">
              Join thousands of professionals using LeadCRM to streamline workflows and accelerate growth.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link 
                to="/signup" 
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                Start Free Trial
              </Link>
              <Link 
                to="/demo" 
                className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-white/10 transition-all duration-300"
              >
                Request a Demo
              </Link>
            </div>
            <p className="mt-6 text-indigo-200">No credit card required. Free 14-day trial.</p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white pt-16 pb-8">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center">
                  <span className="font-bold text-white">LC</span>
                </div>
                <span className="text-xl font-bold">LeadCRM</span>
              </div>
              <p className="text-gray-400 mb-6">
                Empowering businesses to manage leads and drive growth with intuitive, scalable solutions.
              </p>
              <div className="flex space-x-4">
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaTwitter className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaLinkedin className="h-5 w-5" />
                </a>
                <a href="#" className="text-gray-400 hover:text-white transition-colors">
                  <FaFacebook className="h-5 w-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Product</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Integrations</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Updates</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Resources</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Documentation</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Webinars</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Community</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Company</h3>
              <ul className="space-y-3">
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">About us</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="text-gray-400 hover:text-white transition-colors">Legal</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">© 2023 LeadCRM. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Service</a>
              <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Cookie Policy</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;