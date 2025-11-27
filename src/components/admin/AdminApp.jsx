// src/components/AdminApp.jsx
import { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import LeadTable from './LeadTable';
import TaskList from './TaskList';
import Analytics from './Analytics';
import UserManagement from './UserManagement';
import AdminAttendance from './AdminAttendance';
import InvoiceGenerator from './InvoiceGenerator';
import VehicleAdmin from './VehicleAdmin';
import PolicyUpload from './PolicyUpload';
import LeadModal from './LeadModal';
import { tasks, activities } from '../../data/mockData';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';
import assets from '../../assets/assets';
import SalarySlipGenerator from './SalarySlipGenerator';
import WelcomeLetterGenerator from './WelcomeLetterGenerator'; // ← ADDED ONLY THIS

function AdminApp({ handleLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem('token');
  const username = localStorage.getItem('username') || 'Admin';

  // Initialize activeTab based on initial pathname
  const initialTab = useMemo(() => {
    const tabPathMap = {
      dashboard: '/admin',
      leads: '/admin/leads',
      tasks: '/admin/tasks',
      analytics: '/admin/analytics',
      users: '/admin/users',
      attendance: '/admin/attendance',
      invoice: '/admin/invoice',
      'vehicle-admin': '/admin/vehicle-admin',
      'salary-slip': '/admin/salary-slip',
      'policy-upload': '/admin/policy-upload',
      'welcome-letter': '/admin/welcome-letter', // ← ADDED
    };
    const pathToTab = (pathname) => {
      const entry = Object.entries(tabPathMap).find(([tab, path]) => path === pathname);
      return entry ? entry[0] : 'dashboard';
    };
    return pathToTab(location.pathname);
  }, [location.pathname]);

  const [leads, setLeads] = useState([]);
  const [activeTab, setActiveTab] = useState(initialTab);
  const [filter, setFilter] = useState('All');
  const [isAdmin] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'Medium' });
  const [taskList, setTaskList] = useState(tasks);
  const [userList, setUserList] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [errorUsers, setErrorUsers] = useState('');

  // Define tabPathMap with useMemo for stability
  const tabPathMap = useMemo(
    () => ({
      dashboard: '/admin',
      leads: '/admin/leads',
      tasks: '/admin/tasks',
      analytics: '/admin/analytics',
      users: '/admin/users',
      attendance: '/admin/attendance',
      invoice: '/admin/invoice',
      'vehicle-admin': '/admin/vehicle-admin',
      'salary-slip': '/admin/salary-slip',
      'policy-upload': '/admin/policy-upload',
      'welcome-letter': '/admin/welcome-letter', // ← ADDED
    }),
    []
  );

  // Inverse mapping helper (path -> tab)
  const pathToTab = useCallback(
    (pathname) => {
      const entry = Object.entries(tabPathMap).find(([tab, path]) => path === pathname);
      return entry ? entry[0] : 'dashboard';
    },
    [tabPathMap]
  );

  // Fetch users from backend
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserList(res.data);
        setLoadingUsers(false);
      } catch (err) {
        console.error('Fetch users error:', err);
        setErrorUsers('Failed to fetch users. Please try again.');
        setLoadingUsers(false);
      }
    };
    if (token) {
      fetchUsers();
    } else {
      setErrorUsers('No authentication token found. Please log in.');
      setLoadingUsers(false);
    }
  }, [token]);

  // Sync activeTab with URL and navigate
  useEffect(() => {
    const pathname = location.pathname;
    const mappedTab = pathToTab(pathname);

    if (mappedTab !== activeTab) {
      console.log(`Syncing activeTab to ${mappedTab} for pathname ${pathname}`);
      setActiveTab(mappedTab);
    } else {
      const desiredPath = tabPathMap[activeTab];
      if (desiredPath && desiredPath !== pathname) {
        console.log(`Navigating to ${desiredPath} for activeTab ${activeTab}`);
        navigate(desiredPath, { replace: true });
      }
    }
  }, [location.pathname, activeTab, navigate, pathToTab, tabPathMap]);

  // Sidebar open/close on resize
  useEffect(() => {
    const handleResize = () => setIsSidebarOpen(window.innerWidth >= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Logout handler
  const handleAdminLogout = useCallback(() => {
    handleLogout();
    localStorage.removeItem('username');
    navigate('/login');
  }, [handleLogout, navigate]);

  // Helper CRUD actions
  const handleAddLead = useCallback((newLead) => {
    setLeads((prev) => [...prev, { ...newLead, id: Date.now() }]);
  }, []);

  const handleDragEnd = useCallback((event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = active.data.current.sortable.containerId;
    const destinationColumnId = over.id;

    if (sourceColumnId !== destinationColumnId) {
      const updatedLeads = leads.map((lead) =>
        lead.id === active.id ? { ...lead, status: destinationColumnId } : lead
      );
      setLeads(updatedLeads);
    }
  }, [leads]);

  const handleAddTask = useCallback((e) => {
    e.preventDefault();
    setTaskList([...taskList, { id: `${taskList.length + 1}`, ...newTask }]);
    setNewTask({ title: '', dueDate: '', priority: 'Medium' });
  }, [taskList, newTask]);

  const handleAssignLead = useCallback((leadId, userId) => {
    const updatedLeads = leads.map((lead) =>
      lead.id === leadId ? { ...lead, assignedTo: userId } : lead
    );
    setLeads(updatedLeads);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, assignedTo: userId });
    }
  }, [leads, selectedLead]);

  // Page title / description helpers
  const getPageTitle = useCallback(() => {
    const titles = {
      dashboard: 'Dashboard',
      leads: 'Lead Management',
      tasks: 'Task Management',
      analytics: 'Analytics & Reports',
      users: 'User Management',
      attendance: 'Attendance Tracking',
      invoice: 'Invoice Generator',
      'vehicle-admin': 'Vehicle Admin',
      'salary-slip': 'Salary Slip Generator',
      'policy-upload': 'Policy Upload',
      'welcome-letter': 'Arshyan Portable Equipments Insurance', // ← ADDED
    };
    return (
      <div className="flex items-center space-x-3">
        <img src={assets.logo} alt="Logo" className="w-64 object-contain" />
        <div className="hidden md:block">
          <div className="text-lg font-semibold">{titles[activeTab] || 'Admin'}</div>
        </div>
      </div>
    );
  }, [activeTab]);

  const getPageDescription = useCallback(() => {
    const descriptions = {
      dashboard: 'Get an overview of your CRM performance',
      leads: 'Manage and track all your leads in one place',
      tasks: 'Keep track of all tasks and deadlines',
      analytics: 'Analyze your business performance with detailed reports',
      users: 'Manage user accounts and permissions',
      attendance: 'Track and manage employee attendance',
      invoice: 'Generate invoices for your services',
      'vehicle-admin': 'Manage all vehicle administration tasks',
      'salary-slip': 'Generate detailed employee salary slips',
      'policy-upload': 'Upload and manage policy documents',
      'welcome-letter': 'Generate professional welcome letters for mobile insurance customers', // ← ADDED
    };
    return descriptions[activeTab] || 'Manage your CRM efficiently';
  }, [activeTab]);

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 flex relative">
      <button
        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg hover:shadow-xl transition-shadow"
      >
        {isSidebarOpen ? <FiX size={24} /> : <FiMenu size={24} />}
      </button>

      {isSidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
        handleLogout={handleAdminLogout}
        username={username}
      />

      <div
        className={`flex-1 transition-all duration-300 ${isSidebarOpen ? 'md:ml-64' : 'md:ml-16'} ml-0`}
      >
        <div className="p-4 sm:p-6 lg:p-8 pt-16 md:pt-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6 sm:mb-8"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight flex items-center space-x-2">
                  {getPageTitle()}
                </h1>
                <p className="text-gray-600 mt-2 text-sm sm:text-base">
                  {getPageDescription()}
                </p>
              </div>

              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-sm text-gray-500 bg-white px-4 py-2 rounded-lg shadow-sm"
                >
                  Last updated: {new Date().toLocaleTimeString()}
                </motion.div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleAdminLogout}
                  className="flex items-center space-x-2 bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  <FiLogOut size={16} />
                  <span>Logout</span>
                </motion.button>
              </div>
            </div>
          </motion.div>

          {loadingUsers && <p>Loading users...</p>}
          {errorUsers && <p className="text-red-600">{errorUsers}</p>}
          {!loadingUsers && !errorUsers && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="min-h-[calc(100vh-200px)]"
              >
                {activeTab === 'dashboard' && <Dashboard leads={leads} activities={activities} />}
                {activeTab === 'leads' && (
                  <LeadTable
                    leads={leads}
                    filter={filter}
                    setFilter={setFilter}
                    setSelectedLead={setSelectedLead}
                    users={userList}
                    onAssignLead={handleAssignLead}
                    onAddLead={handleAddLead}
                  />
                )}
                {activeTab === 'tasks' && (
                  <TaskList
                    tasks={taskList}
                    newTask={newTask}
                    setNewTask={setNewTask}
                    handleAddTask={handleAddTask}
                  />
                )}
                {activeTab === 'analytics' && <Analytics leads={leads} />}
                {activeTab === 'users' && isAdmin && <UserManagement users={userList} setUsers={setUserList} />}
                {activeTab === 'attendance' && isAdmin && <AdminAttendance users={userList} />}
                {activeTab === 'invoice' && <InvoiceGenerator />}
                {activeTab === 'vehicle-admin' && <VehicleAdmin isAdmin={isAdmin} />}
                {activeTab === 'salary-slip' && <SalarySlipGenerator isAdmin={isAdmin} />}
                {activeTab === 'policy-upload' && <PolicyUpload />}
                {activeTab === 'welcome-letter' && <WelcomeLetterGenerator />} {/* ← ADDED */}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>

      <AnimatePresence>
        {selectedLead && (
          <LeadModal
            lead={selectedLead}
            setSelectedLead={setSelectedLead}
            activities={activities}
            users={userList}
            onAssignLead={handleAssignLead}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default AdminApp;