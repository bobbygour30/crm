import { useEffect, useState } from 'react';
import { FaBars, FaTimes, FaHome, FaUsers, FaClipboardList, FaUser, FaChartPie, FaClock, FaBullhorn } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

function UserSidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const tabs = [
    { name: 'Home', icon: FaHome, path: '/' },
    { name: 'Dashboard', icon: FaHome, path: '/dashboard' },
    { name: 'Leads', icon: FaUsers, path: '/leads' },
    { name: 'Tasks', icon: FaClipboardList, path: '/tasks' },
    { name: 'My Campaigns', icon: FaBullhorn, path: '/mycampaigns' },
    { name: 'Profile', icon: FaUser, path: '/profile' },
    { name: 'Activity', icon: FaChartPie, path: '/activity' },
    { name: 'Attendance', icon: FaClock, path: '/attendance' },
  ];
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const currentTab = tabs.find(tab => tab.path === location.pathname)?.name.toLowerCase() || 'home';
    setActiveTab(currentTab);
  }, [location.pathname, setActiveTab]);

  return (
    <>
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 transition-all duration-200 shadow-lg"
        >
          <FaBars className="h-6 w-6" />
        </button>
      )}
      <motion.div
        animate={{ x: isMobile && !isSidebarOpen ? '-100%' : 0 }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full bg-gradient-to-b from-indigo-800 to-indigo-900 text-white z-50 w-3/4 sm:w-2/3 md:w-16 md:[&[data-open=true]]:w-64 shadow-xl md:rounded-none rounded-r-2xl overflow-hidden"
        data-open={isSidebarOpen}
      >
        <div className={`flex items-center ${isSidebarOpen || isMobile ? 'justify-between' : 'justify-center'} p-4`}>
          <div className="flex items-center space-x-2">
            <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
              <span className="font-bold text-indigo-600">LC</span>
            </div>
            <span className="text-xl font-bold md:[data-open=false]:hidden">LeadCRM</span>
          </div>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          )}
          {!isSidebarOpen && !isMobile && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <FaBars className="h-6 w-6" />
            </button>
          )}
        </div>
        <nav className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-3 md:[data-open=false]:space-x-0 px-4 py-3 rounded-lg text-left text-sm md:text-base transition-colors duration-200 md:[data-open=false]:justify-center ${
                activeTab.toLowerCase() === tab.name.toLowerCase()
                  ? 'bg-indigo-600 shadow-md'
                  : 'hover:bg-indigo-700'
              }`}
              onClick={() => {
                setActiveTab(tab.name.toLowerCase());
                navigate(tab.path);
                if (isMobile) setIsSidebarOpen(false);
              }}
            >
              <tab.icon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
              <span className="md:[data-open=false]:hidden">{tab.name}</span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`flex items-center space-x-3 md:[data-open=false]:space-x-0 px-4 py-3 rounded-lg text-left text-sm md:text-base hover:bg-indigo-700 transition-colors md:[data-open=false]:justify-center`}
            onClick={handleLogout}
          >
            <FaUser className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
            <span className="md:[data-open=false]:hidden">Logout</span>
          </motion.button>
        </nav>
      </motion.div>
    </>
  );
}

export default UserSidebar;