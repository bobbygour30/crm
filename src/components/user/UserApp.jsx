import { useState } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import UserSidebar from './UserSidebar';
import UserHeader from './UserHeader';
import UserDashboard from './UserDashboard';
import UserLeadTable from './UserLeadTable';
import UserTaskList from './UserTaskList';
import UserProfile from './UserProfile';
import UserActivity from './UserActivity';
import HomePage from './HomePage';
import Attendance from './Attendance';
import { leads, tasks, activities, users } from '../../data/mockData';

function UserApp(){
  const [activeTab, setActiveTab] = useState('home');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [selectedLead, setSelectedLead] = useState(null);
  const [taskList, setTaskList] = useState(tasks);
  const [newTask, setNewTask] = useState({ title: '', dueDate: '', priority: 'Medium' });
  const navigate = useNavigate();

  const handleAddTask = (e) => {
    e.preventDefault();
    setTaskList([...taskList, { id: `${taskList.length + 1}`, ...newTask }]);
    setNewTask({ title: '', dueDate: '', priority: 'Medium' });
  };

  const handleLogout = () => {
    navigate('/login');
  };

  const loggedInUser = users.find((user) => user.role === 'User') || users[1];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 font-sans flex">
      <UserSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setIsSidebarOpen={setIsSidebarOpen}
        isSidebarOpen={isSidebarOpen}
        handleLogout={handleLogout}
      />
      <div className="flex-1 flex flex-col">
        <UserHeader setIsSidebarOpen={setIsSidebarOpen} user={loggedInUser} />
        <div className="p-4 sm:p-8 md:ml-16 md:[&[data-sidebar-open=true]]:ml-64">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route
              path="/dashboard"
              element={<UserDashboard leads={leads} activities={activities} user={loggedInUser} />}
            />
            <Route
              path="/leads"
              element={
                <UserLeadTable
                  leads={leads.filter((lead) => lead.assignedTo === loggedInUser.id)}
                  filter={filter}
                  setFilter={setFilter}
                  setSelectedLead={setSelectedLead}
                  selectedLead={selectedLead}
                />
              }
            />
            <Route
              path="/tasks"
              element={
                <UserTaskList
                  tasks={taskList}
                  newTask={newTask}
                  setNewTask={setNewTask}
                  handleAddTask={handleAddTask}
                />
              }
            />
            <Route path="/profile" element={<UserProfile user={loggedInUser} />} />
            <Route
              path="/activity"
              element={
                <UserActivity
                  activities={activities.filter((activity) =>
                    leads.some(
                      (lead) => lead.id === activity.leadId && lead.assignedTo === loggedInUser.id
                    )
                  )}
                  leads={leads}
                />
              }
            />
            <Route path="/attendance" element={<Attendance user={loggedInUser} />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default UserApp;