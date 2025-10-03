import { useState, useEffect } from "react";
import {
  FaBars,
  FaTimes,
  FaHome,
  FaUsers,
  FaClipboardList,
  FaUser,
  FaChartPie,
  FaClock,
  FaBullhorn,
  FaCarSide,
  FaSignOutAlt,
  FaChartBar,
} from "react-icons/fa";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import assets from "../../assets/assets";

function Navbar({ activeTab, setActiveTab, handleLogout }) {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  const tabs = [
    { name: "Home", icon: FaHome, path: "/" },
    { name: "Dashboard", icon: FaChartBar, path: "/dashboard" },
    { name: "Leads", icon: FaUsers, path: "/leads" },
    { name: "Tasks", icon: FaClipboardList, path: "/tasks" },
    { name: "My Campaigns", icon: FaBullhorn, path: "/mycampaigns" },
    { name: "Vehicle Quote", icon: FaCarSide, path: "/vehicle-quote" },
    { name: "Profile", icon: FaUser, path: "/profile" },
    { name: "Activity", icon: FaChartPie, path: "/activity" },
    { name: "Attendance", icon: FaClock, path: "/attendance" },
  ];

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const currentTab =
      tabs.find((tab) => tab.path === location.pathname)?.name.toLowerCase() ||
      "home";
    setActiveTab(currentTab);
  }, [location.pathname, setActiveTab]);

  return (
    <header className="w-full bg-gradient-to-r from-indigo-900 to-indigo-700 text-white shadow-md fixed top-0 left-0 z-50">
      <div className=" flex justify-between items-center px-6 py-3">
        {/* Logo */}
        <div className="flex items-center space-x-2 cursor-pointer">
          <img src={assets.logo} className="w-36 rounded-2xl" alt="" />
          <span className="font-semibold text-lg">CRM</span>
        </div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex gap-6 items-center">
          {tabs.map((tab) => (
            <button
              key={tab.name}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-all ${
                (activeTab || "").toLowerCase() === tab.name.toLowerCase()
                  ? "bg-indigo-600 text-white shadow-md"
                  : "hover:bg-indigo-500 hover:text-white"
              }`}
              onClick={() => {
                setActiveTab(tab.name.toLowerCase());
                navigate(tab.path);
              }}
            >
              <tab.icon className="h-4 w-4" />
              {tab.name}
            </button>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-all"
          >
            <FaSignOutAlt className="h-4 w-4" />
            Logout
          </button>
        </nav>

        {/* Mobile Hamburger */}
        <button
          className="md:hidden p-2 rounded-md bg-indigo-600 hover:bg-indigo-500 transition"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes className="h-6 w-6" /> : <FaBars className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.nav
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="md:hidden flex flex-col gap-2 px-6 py-4 bg-indigo-800"
          >
            {tabs.map((tab) => (
              <button
                key={tab.name}
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium ${
                  activeTab.toLowerCase() === tab.name.toLowerCase()
                    ? "bg-indigo-600 text-white"
                    : "hover:bg-indigo-500 hover:text-white"
                }`}
                onClick={() => {
                  setActiveTab(tab.name.toLowerCase());
                  navigate(tab.path);
                  setMenuOpen(false);
                }}
              >
                <tab.icon className="h-4 w-4" />
                {tab.name}
              </button>
            ))}

            {/* Logout for mobile */}
            <button
              onClick={() => {
                handleLogout();
                setMenuOpen(false);
              }}
              className="flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium bg-red-600 hover:bg-red-700 transition-all"
            >
              <FaSignOutAlt className="h-4 w-4" />
              Logout
            </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}

export default Navbar;