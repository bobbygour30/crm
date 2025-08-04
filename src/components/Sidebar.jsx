import { motion } from 'framer-motion';
import { FaBars, FaTimes, FaHome, FaUsers, FaChartBar, FaClipboardList, FaChartPie, FaUserCog } from 'react-icons/fa';

function Sidebar({ activeTab, setActiveTab, isAdmin, isSidebarOpen, setIsSidebarOpen }) {
  const tabs = [
    { name: 'Dashboard', icon: FaHome },
    { name: 'Leads', icon: FaUsers },
    { name: 'Pipeline', icon: FaChartBar },
    { name: 'Tasks', icon: FaClipboardList },
    { name: 'Analytics', icon: FaChartPie },
    ...(isAdmin ? [{ name: 'Users', icon: FaUserCog }] : []),
  ];

  return (
    <>
      {/* Sidebar Overlay for Mobile */}
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
      {/* Toggle Button (Hamburger) for All Devices */}
      {!isSidebarOpen && (
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 z-50 md:left-0 md:[&[data-open=true]]:left-64 p-2 rounded bg-gray-800 text-white hover:bg-gray-700 md:bg-transparent md:hover:bg-gray-200 md:text-gray-800 transition-all"
          data-open={isSidebarOpen}
        >
          <FaBars className="h-6 w-6" />
        </button>
      )}
      {/* Sidebar */}
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isSidebarOpen ? 0 : '-100%' }}
        transition={{ duration: 0.3 }}
        className="fixed top-0 left-0 h-full bg-gray-800 text-white z-40 md:z-10 w-3/4 sm:w-2/3 md:w-16 md:[&[data-open=true]]:w-64 shadow-md md:shadow-none rounded-r-lg md:rounded-none"
        data-open={isSidebarOpen}
      >
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg md:text-xl font-bold">Lead CRM</h1>
          {isSidebarOpen && (
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="p-2 rounded hover:bg-gray-700"
            >
              <FaTimes className="h-6 w-6" />
            </button>
          )}
        </div>
        <nav className="flex flex-col space-y-2 p-2">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex items-center space-x-2 px-4 py-2 rounded text-left text-sm md:text-base ${
                activeTab.toLowerCase() === tab.name.toLowerCase() ? 'bg-blue-600' : 'hover:bg-gray-700'
              }`}
              onClick={() => {
                setActiveTab(tab.name.toLowerCase());
                if (window.innerWidth < 768) setIsSidebarOpen(false);
              }}
            >
              <tab.icon className="h-5 w-5 md:h-6 md:w-6 flex-shrink-0" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </motion.div>
    </>
  );
}

export default Sidebar;