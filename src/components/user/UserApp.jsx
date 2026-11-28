import { useState, useEffect } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import { useMyAccess, PATH_MODULE } from "../access/myAccess";
import RightsArea from "../access/RightsArea";
import BrdDashboard from "../dashboard/BrdDashboard";
import Navbar from "./Navbar";
import UserLeadTable from "./UserLeadTable";
import UserTaskList from "./UserTaskList";
import UserProfile from "./UserProfile";
import UserActivity from "./UserActivity";
import Attendance from "./Attendance";
import VehicleQuote from "./VehicleQuote";
import Quote from "./Quote";
import {
  leads,
  tasks,
  activities,
  users,
  campaigns,
} from "../../data/mockData";
import EmployeeSalarySlipViewer from "./EmployeeSalarySlipViewer";
import PolicyReports from "../reports/PolicyReports";
import MyHrSelf from "../hr/MyHrSelf";

function UserApp({ handleLogout }) {
  const location = useLocation();
  const { ready: accessReady, can } = useMyAccess(); // Assigned Access
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
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();

  // ----------------------------------------------------------------------
  // Get user data from localStorage on component mount
  // ----------------------------------------------------------------------
  useEffect(() => {
    try {
      const userDataStr = localStorage.getItem('userData');
      if (userDataStr) {
        const userData = JSON.parse(userDataStr);
        setLoggedInUser(userData);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    }
  }, []);

  // ----------------------------------------------------------------------
  // Get username with proper priority: fullName > username > organizationName
  // ----------------------------------------------------------------------
  const getUserDisplayName = () => {
    // First try to get from userData object
    if (loggedInUser) {
      return loggedInUser.fullName || 
             loggedInUser.username || 
             loggedInUser.name || 
             loggedInUser.organizationName || 
             'User';
    }
    
    // Fallback to localStorage keys
    const storedFullName = localStorage.getItem('fullName');
    if (storedFullName) return storedFullName;
    
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) return storedUsername;
    
    const storedOrgName = localStorage.getItem('organizationName');
    if (storedOrgName) return storedOrgName;
    
    return 'User';
  };

  const displayName = getUserDisplayName();

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
    // Clear all user-related localStorage items
    localStorage.removeItem('username');
    localStorage.removeItem('fullName');
    localStorage.removeItem('organizationName');
    localStorage.removeItem('userData');
    localStorage.removeItem('userType');
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('userId');
    navigate("/login");
  };

  // ----------------------------------------------------------------------
  // Fallback user if no user data is available
  // ----------------------------------------------------------------------
  const fallbackUser = users.find((user) => user.role === "User") || users[1];

  // Use loggedInUser if available, otherwise use fallback
  const currentUser = loggedInUser || fallbackUser;

  // ----------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-gray-100 flex">
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        handleLogout={handleUserLogout}
        username={displayName}
        user={currentUser}
      />

      <div className="flex-1 flex flex-col">
        <div className="pt-16">
          {accessReady && PATH_MODULE[location.pathname] && !can(PATH_MODULE[location.pathname]) ? <div className="p-8 text-center" data-no-access><h2 className="text-lg font-semibold text-gray-700">You don't have access to this module</h2><p className="text-sm text-gray-500 mt-1">Ask your Admin to assign it in Assigned Access.</p></div> : <Routes>
            <Route path="/rights/*" element={<RightsArea handleLogout={handleUserLogout} />} />
            <Route
              path="/"
              element={
                <BrdDashboard self />
              }
            />
            <Route
              path="/leads"
              element={
                <UserLeadTable
                  leads={leads.filter(
                    (lead) => lead.assignedTo === currentUser.id
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
            <Route path="/profile" element={<UserProfile user={currentUser} />} />
            <Route
              path="/activity"
              element={
                <UserActivity
                  activities={activities.filter((activity) =>
                    leads.some(
                      (lead) =>
                        lead.id === activity.leadId &&
                        lead.assignedTo === currentUser.id
                    )
                  )}
                  leads={leads}
                />
              }
            />
            <Route path="/attendance" element={<Attendance user={currentUser} />} />
            <Route path="/vehicle-quote" element={<VehicleQuote user={currentUser} />} />
            <Route path="/salary-slip" element={<EmployeeSalarySlipViewer user={currentUser} />} />
            <Route path="/quote" element={<Quote user={currentUser} />} />
            <Route path="/reports" element={<PolicyReports />} />
            <Route path="/my-hr" element={<MyHrSelf />} />
          </Routes>}
        </div>
      </div>
    </div>
  );
}

export default UserApp;