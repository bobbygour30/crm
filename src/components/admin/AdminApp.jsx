import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './Sidebar';
import Dashboard from './Dashboard';
import LeadTable from './LeadTable';
import PipelineBoard from './PipelineBoard';
import TaskList from './TaskList';
import Analytics from './Analytics';
import UserManagement from './UserManagement';
import AdminAttendance from './AdminAttendance';
import LeadModal from './LeadModal';
import InvoiceGenerator from './InvoiceGenerator';
import { tasks, users, activities } from '../../data/mockData';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

function AdminApp({ handleLogout }) {
  const [leads, setLeads] = useState([]); // Replace static leads with state
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('All');
  const [isAdmin] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 768);
  const [selectedLead, setSelectedLead] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'Medium' });
  const [taskList, setTaskList] = useState(tasks);
  const [userList, setUserList] = useState(users);
  const [pipeline, setPipeline] = useState({
    New: [],
    Contacted: [],
    Qualified: [],
    Closed: [],
  });

  const navigate = useNavigate();

  // Update pipeline whenever leads change
  useEffect(() => {
    setPipeline({
      New: leads.filter((lead) => lead.status === 'New'),
      Contacted: leads.filter((lead) => lead.status === 'Contacted'),
      Qualified: leads.filter((lead) => lead.status === 'Qualified'),
      Closed: leads.filter((lead) => lead.status === 'Closed'),
    });
  }, [leads]);

  // Handle window resize for sidebar visibility
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleAdminLogout = () => {
    handleLogout();
    navigate('/login');
  };

  // Add new lead to leads state
  const handleAddLead = (newLead) => {
    setLeads((prev) => [...prev, { ...newLead, id: Date.now() }]); // Generate unique ID
  };

  const handleDragEnd = (event) => {
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
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    setTaskList([...taskList, { id: `${taskList.length + 1}`, ...newTask }]);
    setNewTask({ title: '', dueDate: '', priority: 'Medium' });
  };

  const handleAssignLead = (leadId, userId) => {
    const updatedLeads = leads.map((lead) =>
      lead.id === leadId ? { ...lead, assignedTo: userId } : lead
    );
    setLeads(updatedLeads);
    if (selectedLead && selectedLead.id === leadId) {
      setSelectedLead({ ...selectedLead, assignedTo: userId });
    }
  };

  const getPageTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      leads: 'Lead Management',
      pipeline: 'Sales Pipeline',
      tasks: 'Task Management',
      analytics: 'Analytics & Reports',
      users: 'User Management',
      attendance: 'Attendance Tracking',
      invoice: 'Invoice Generator',
    };
    return titles[activeTab] || activeTab.charAt(0).toUpperCase() + activeTab.slice(1);
  };

  const getPageDescription = () => {
    const descriptions = {
      dashboard: 'Get an overview of your CRM performance',
      leads: 'Manage and track all your leads in one place',
      pipeline: 'Visualize and manage your sales pipeline',
      tasks: 'Keep track of all tasks and deadlines',
      analytics: 'Analyze your business performance with detailed reports',
      users: 'Manage user accounts and permissions',
      attendance: 'Track and manage employee attendance',
      invoice: 'Generate invoices for your services',
    };
    return descriptions[activeTab] || 'Manage your CRM efficiently';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 font-sans flex relative">
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
      />

      <div
        className={`flex-1 transition-all duration-300 ${
          isSidebarOpen ? 'md:ml-64' : 'md:ml-16'
        } ml-0`}
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
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-gray-900 tracking-tight">
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

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="min-h-[calc(100vh-200px)]"
            >
              {activeTab === 'dashboard' && (
                <Dashboard leads={leads} activities={activities} />
              )}
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
              {activeTab === 'pipeline' && (
                <DndContext onDragEnd={handleDragEnd}>
                  <PipelineBoard pipeline={pipeline} users={userList} />
                </DndContext>
              )}
              {activeTab === 'tasks' && (
                <TaskList
                  tasks={taskList}
                  newTask={newTask}
                  setNewTask={setNewTask}
                  handleAddTask={handleAddTask}
                />
              )}
              {activeTab === 'analytics' && (
                <Analytics leads={leads} />
              )}
              {activeTab === 'users' && isAdmin && (
                <UserManagement users={userList} setUsers={setUserList} />
              )}
              {activeTab === 'attendance' && isAdmin && (
                <AdminAttendance users={userList} />
              )}
              {activeTab === 'invoice' && <InvoiceGenerator />}
            </motion.div>
          </AnimatePresence>
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