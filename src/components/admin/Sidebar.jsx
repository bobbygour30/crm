import { motion } from 'framer-motion';
import { 
  FaHome, FaUsers, FaChartBar, FaClipboardList, FaChartPie, 
  FaUserCog, FaClock, FaSignOutAlt, FaCarSide 
} from 'react-icons/fa';

function Sidebar({ activeTab, setActiveTab, isAdmin, isSidebarOpen, setIsSidebarOpen, handleLogout, username }) {
  const tabs = [
    { name: 'Dashboard', icon: FaHome, key: 'dashboard' },
    { name: 'Leads', icon: FaUsers, key: 'leads' },
    { name: 'Tasks', icon: FaClipboardList, key: 'tasks' },
    { name: 'Invoice', icon: FaClipboardList, key: 'invoice' },
    { name: 'Vehicle Admin', icon: FaCarSide, key: 'vehicle-admin' },
    ...(isAdmin ? [
      { name: 'Users', icon: FaUserCog, key: 'users' },
      { name: 'Attendance', icon: FaClock, key: 'attendance' }
    ] : []),
  ];

  return (
    <>
      {isSidebarOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.5 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full bg-gradient-to-b from-indigo-800 to-indigo-900 text-white z-40 md:z-10 w-3/4 sm:w-2/3 md:w-16 md:[&[data-open=true]]:w-64 shadow-xl md:shadow-none rounded-r-2xl md:rounded-none"
        data-open={isSidebarOpen}
      >
        <div className="flex items-center justify-between p-4">
          {/* Dynamic username instead of static "Lead CRM" */}
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">
            {username || 'Lead CRM'}
          </h1>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded-full hover:bg-indigo-700 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
        <nav className="flex flex-col space-y-2 p-2 h-[calc(100%-100px)] justify-between">
          <div>
            {tabs.map((tab) => (
              <motion.button
                key={tab.key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-sm md:text-base transition-colors duration-200 ${
                  activeTab === tab.key ? 'bg-indigo-600 shadow-md' : 'hover:bg-indigo-700'
                }`}
                onClick={() => {
                  setActiveTab(tab.key);
                  if (window.innerWidth < 768) setIsSidebarOpen(false);
                }}
              >
                <tab.icon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
                {isSidebarOpen && <span>{tab.name}</span>}
              </motion.button>
            ))}
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg text-left text-sm md:text-base hover:bg-indigo-700 transition-colors"
            onClick={handleLogout}
          >
            <FaSignOutAlt className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
            {isSidebarOpen && <span>Logout</span>}
          </motion.button>
        </nav>
      </motion.div>
    </>
  );
}

export default Sidebar;