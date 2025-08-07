import { FaBars, FaTimes, FaHome, FaUsers, FaClipboardList, FaUser, FaChartPie, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

function UserSidebar({ activeTab, setActiveTab, isSidebarOpen, setIsSidebarOpen, handleLogout }) {
  const tabs = [
    { name: 'Home', icon: FaHome, path: '/' },
    { name: 'Dashboard', icon: FaHome, path: '/dashboard' },
    { name: 'Leads', icon: FaUsers, path: '/leads' },
    { name: 'Tasks', icon: FaClipboardList, path: '/tasks' },
    { name: 'Profile', icon: FaUser, path: '/profile' },
    { name: 'Activity', icon: FaChartPie, path: '/activity' },
    { name: 'Attendance', icon: FaClock, path: '/attendance' },
  ];
  const navigate = useNavigate();

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
          className="fixed top-4 left-4 z-50 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 md:bg-transparent md:hover:bg-gray-200 md:text-gray-800 transition-all duration-200 shadow-lg md:shadow-none"
        >
          <FaBars className="h-6 w-6" />
        </button>
      )}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full bg-gradient-to-b from-indigo-800 to-indigo-900 text-white z-40 md:z-10 w-3/4 sm:w-2/3 md:w-16 md:[&[data-open=true]]:w-64 shadow-xl md:rounded-none rounded-r-2xl"
        data-open={isSidebarOpen}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Lead CRM</h1>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          )}
        </div>
        <nav className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => (
            <motion.button
              key={tab.name}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-sm md:text-base transition-colors duration-200 ${
                activeTab.toLowerCase() === tab.name.toLowerCase()
                  ? 'bg-indigo-600 shadow-md'
                  : 'hover:bg-indigo-700'
              }`}
              onClick={() => {
                setActiveTab(tab.name.toLowerCase());
                navigate(tab.path);
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <tab.icon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
              <span>{tab.name}</span>
            </motion.button>
          ))}
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-sm md:text-base hover:bg-indigo-700 transition-colors"
            onClick={handleLogout}
          >
            <FaUser className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
            <span>Logout</span>
          </motion.button>
        </nav>
      </motion.div>
    </>
  );
}

export default UserSidebar;