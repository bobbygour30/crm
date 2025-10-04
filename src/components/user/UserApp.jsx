import { useState } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import UserDashboard from "./UserDashboard";
import UserLeadTable from "./UserLeadTable";
import UserTaskList from "./UserTaskList";
import UserProfile from "./UserProfile";
import UserActivity from "./UserActivity";
import HomePage from "./HomePage";
import Attendance from "./Attendance";
import UserCampaigns from "./UserCampaigns";
import VehicleQuote from "./VehicleQuote";
import {
  leads,
  tasks,
  activities,
  users,
  campaigns,
} from "../../data/mockData";

function UserApp({ handleLogout }) {
  const [activeTab, setActiveTab] = useState("home");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [selectedLead, setSelectedLead] = useState(null);
  const [taskList, setTaskList] = useState(tasks);
  const [newTask, setNewTask] = useState({
    title: "",
    dueDate: "",
    priority: "Medium",
  });
  const [campaignList, setCampaignList] = useState(campaigns);
  const navigate = useNavigate();

  // ----------------------------------------------------------------------
  // NEW: read username from localStorage (fallback to generic name)
  // ----------------------------------------------------------------------
  const username = localStorage.getItem('username') || 'User';

  // ----------------------------------------------------------------------
  // Task handling
  // ----------------------------------------------------------------------
  const handleAddTask = (e) => {
    e.preventDefault();
    setTaskList([...taskList, { id: `${taskList.length + 1}`, ...newTask }]);
    setNewTask({ title: "", dueDate: "", priority: "Medium" });
  };

  // ----------------------------------------------------------------------
  // Logout (clears everything)
  // ----------------------------------------------------------------------
  const handleUserLogout = () => {
    handleLogout();
    localStorage.removeItem('username'); // explicit clear
    navigate("/login");
  };

  // ----------------------------------------------------------------------
  // Mock logged-in user (replace with real data when you fetch from API)
  // ----------------------------------------------------------------------
  const loggedInUser = users.find((user) => user.role === "User") || users[1];

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex">
      {/* Navbar – you can also pass username here if you want it displayed */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleUserLogout}
        username={username}   
      />

      <div className="flex-1 flex flex-col">
        <div>
          <Routes>
            <Route path="/" element={<HomePage handleLogout={handleUserLogout} />} />
            <Route
              path="/dashboard"
              element={
                <UserDashboard
                  leads={leads}
                  activities={activities}
                  user={loggedInUser}
                />
              }
            />
            <Route
              path="/leads"
              element={
                <UserLeadTable
                  leads={leads.filter(
                    (lead) => lead.assignedTo === loggedInUser.id
                  )}
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
                      (lead) =>
                        lead.id === activity.leadId &&
                        lead.assignedTo === loggedInUser.id
                    )
                  )}
                  leads={leads}
                />
              }
            />
            <Route path="/attendance" element={<Attendance user={loggedInUser} />} />
            <Route
              path="/mycampaigns"
              element={<UserCampaigns campaigns={campaignList} user={loggedInUser} />}
            />
            <Route path="/vehicle-quote" element={<VehicleQuote />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default UserApp;