import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { DndContext } from '@dnd-kit/core';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import LeadTable from './components/LeadTable';
import PipelineBoard from './components/PipelineBoard';
import TaskList from './components/TaskList';
import Analytics from './components/Analytics';
import UserManagement from './components/UserManagement';
import LeadModal from './components/LeadModal';
import { leads, tasks, users, activities } from './data/mockData';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [filter, setFilter] = useState('All');
  const [isAdmin] = useState(true); // Mock auth
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // Changed to true for visibility
  const [selectedLead, setSelectedLead] = useState(null);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'Medium' });
  const [taskList, setTaskList] = useState(tasks);
  const [pipeline, setPipeline] = useState({
    New: leads.filter((lead) => lead.status === 'New'),
    Contacted: leads.filter((lead) => lead.status === 'Contacted'),
    Qualified: leads.filter((lead) => lead.status === 'Qualified'),
    Closed: leads.filter((lead) => lead.status === 'Closed'),
  });

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over) return;

    const sourceColumnId = active.data.current.sortable.containerId;
    const destinationColumnId = over.id;

    if (sourceColumnId !== destinationColumnId) {
      const sourceColumn = [...pipeline[sourceColumnId]];
      const destinationColumn = [...pipeline[destinationColumnId]];
      const [movedLead] = sourceColumn.splice(active.data.current.sortable.index, 1);
      movedLead.status = destinationColumnId;
      destinationColumn.push(movedLead);

      setPipeline({
        ...pipeline,
        [sourceColumnId]: sourceColumn,
        [destinationColumnId]: destinationColumn,
      });
    }
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    setTaskList([...taskList, { id: `${taskList.length + 1}`, ...newTask }]);
    setNewTask({ title: '', dueDate: '', priority: 'Medium' });
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans flex" data-sidebar-open={isSidebarOpen}>
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isAdmin={isAdmin}
        isSidebarOpen={isSidebarOpen}
        setIsSidebarOpen={setIsSidebarOpen}
      />
      <div className="flex-1 p-4 sm:p-6 transition-all duration-300 md:ml-16 md:[&[data-sidebar-open=true]]:ml-64">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl sm:text-3xl font-bold text-gray-800 mb-4 sm:mb-6"
        >
          {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Panel
        </motion.h1>
        <AnimatePresence>
          {activeTab === 'dashboard' && <Dashboard leads={leads} activities={activities} />}
          {activeTab === 'leads' && (
            <LeadTable
              leads={leads}
              filter={filter}
              setFilter={setFilter}
              setSelectedLead={setSelectedLead}
            />
          )}
          {activeTab === 'pipeline' && (
            <DndContext onDragEnd={handleDragEnd}>
              <PipelineBoard pipeline={pipeline} />
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
          {activeTab === 'analytics' && <Analytics leads={leads} />}
          {activeTab === 'users' && isAdmin && <UserManagement users={users} />}
        </AnimatePresence>
        {selectedLead && (
          <LeadModal lead={selectedLead} setSelectedLead={setSelectedLead} activities={activities} />
        )}
      </div>
    </div>
  );
}

export default App;