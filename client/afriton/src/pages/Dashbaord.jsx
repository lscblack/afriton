import React, { useState } from 'react';
import Sidebar from '../comps/Sidebar';
import TopNavBar from '../comps/TopNavBar';
import { useNavigate } from 'react-router-dom';


import { useApp } from '../context/AppContext';
import { CitizenController } from '../DashComp/controllers/CitizenController.jsx';
import { AdminController } from '../DashComp/controllers/AdminController.jsx';
import { AgentController } from '../DashComp/controllers/AgentController.jsx';
import ManagerController from '../DashComp/controllers/ManagerController.jsx';




const Dashboard = () => {
  const navigate = useNavigate();
  const { userInfo,viewUser, setViewUser } = useApp();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  // Close dropdowns when clicking outside
  const handleClickOutside = (e) => {
    if (!e.target.closest('.profile-menu')) {
      setProfileOpen(false);
    }
    if (!e.target.closest('.notification-menu')) {
      setNotificationsOpen(false);
    }
  };

  React.useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    // Clear all authentication-related items from localStorage
    localStorage.removeItem('userInfo');
    localStorage.removeItem('token');
    localStorage.removeItem('ViewUser');
    localStorage.removeItem('ViewPanel');
    window.location.href = '/login';
  };
  return (
    <div className=" bg-gray-50  dark:bg-[#08030e]">
      {/* Header */}
      <TopNavBar profileOpen={profileOpen} setProfileOpen={setProfileOpen} toggleSidebar={toggleSidebar} handleLogout={handleLogout} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} />

      <div className="flex relative">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={toggleSidebar}
          />
        )}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleSidebar={toggleSidebar} handleLogout={handleLogout} />

        {/** Sidebar imports */}
        {/* Main Content */}
        {/* ... (rest of the main content remains the same) ... */}
        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 md:p-8 overflow-auto pb-10 z-0">
          {/* Stats */}
          {viewUser === "citizen" && <CitizenController/>}
          {viewUser === "admin" && <AdminController />}
          {viewUser === "agent" && <AgentController />}
          {viewUser === "manager" && <ManagerController />}
        </main>
      </div>
    </div>
  );
};

export default Dashboard;