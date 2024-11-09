import React, { useState } from 'react';
import {
  FaHome,
  FaWallet,
  FaUsers,
  FaUsersCog,
  FaHistory,
  FaChartBar,
  FaCog,
  FaBars,
  FaUserCircle,
  FaSignOutAlt,
  FaMoneyBillWave,
  FaFingerprint,
  FaArrowLeft,
  FaArrowRight,
} from 'react-icons/fa';

// User type definitions
const USER_TYPES = {
  ADMIN: 'admin',
  MANAGER: 'manager',
  AGENT: 'agent',
  USER: 'user'
};

// Sidebar menu items for different user types
const MENU_ITEMS = {
  [USER_TYPES.ADMIN]: [
    { icon: FaHome, label: 'Dashboard', path: 'dashboard' },
    { icon: FaUsersCog, label: 'User Management', path: 'users' },
    { icon: FaChartBar, label: 'Analytics', path: 'analytics' },
    { icon: FaHistory, label: 'Transaction History', path: 'transactions' },
    { icon: FaCog, label: 'Settings', path: 'settings' }
  ],
  [USER_TYPES.MANAGER]: [
    { icon: FaHome, label: 'Dashboard', path: 'dashboard' },
    { icon: FaUsers, label: 'Agents', path: 'agents' },
    { icon: FaMoneyBillWave, label: 'Commission', path: 'commission' },
    { icon: FaHistory, label: 'Transactions', path: 'transactions' }
  ],
  [USER_TYPES.AGENT]: [
    { icon: FaHome, label: 'Dashboard', path: 'dashboard' },
    { icon: FaWallet, label: 'Wallet', path: 'wallet' },
    { icon: FaMoneyBillWave, label: 'Commission', path: 'commission' },
    { icon: FaHistory, label: 'Transactions', path: 'transactions' }
  ],
  [USER_TYPES.USER]: [
    { icon: FaHome, label: 'Dashboard', path: 'dashboard' },
    { icon: FaWallet, label: 'Wallet', path: 'wallet' },
    { icon: FaFingerprint, label: 'Biometric', path: 'biometric' },
    { icon: FaHistory, label: 'History', path: 'history' }
  ]
};

// Sidebar Component
const Sidebar = ({ isOpen, toggleSidebar, userType, activePath, setActivePath }) => {
  const menuItems = MENU_ITEMS[userType];

  return (
        <div className={`fixed left-0 top-0 h-full bg-[#f3f8ff] text-gray-600 transition-all duration-300 z-20 
      ${isOpen ? 'w-64' : 'w-20'} lg:relative`}>
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <h1 className={`font-bold ${isOpen ? 'block' : 'hidden'}`}>Afriton</h1>
        <button onClick={toggleSidebar} className="p-2 rounded hover:bg-gray-800">
          {isOpen ? <FaArrowLeft /> : <FaArrowRight />}
        </button>
      </div>
      <nav className="p-4">
        {menuItems.map((item) => (
          <button
            key={item.path}
            onClick={() => setActivePath(item.path)}
            className={`flex items-center w-full p-3 rounded mb-2 transition-colors
              ${activePath === item.path ? 'bg-blue-400 text-white' : 'hover:bg-blue-500 hover:text-white'}`}
          >
            <item.icon className={`text-xl ${isOpen ? 'mr-3' : 'mx-auto'}`} />
            <span className={isOpen ? 'block' : 'hidden'}>{item.label}</span>
          </button>
        ))}
      </nav>
    </div>
  );
};

// Header Component
const Header = ({ toggleSidebar }) => {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200 fixed w-full top-0 z-10">
      <div className="flex items-center justify-between p-4">
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 lg:hidden"
        >
          <FaBars />
        </button>
        
        <div className="relative">
          <button
            onClick={() => setShowProfile(!showProfile)}
            className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-100"
          >
            <FaUserCircle className="text-2xl text-gray-600" />
          </button>
          
          {showProfile && (
            <div className="absolute right-30 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <p className="font-semibold">John Doe</p>
                <p className="text-sm text-gray-600">john@afriton.com</p>
              </div>
              <div className="p-2">
                <button className="flex items-center space-x-2 w-full p-2 rounded-lg hover:bg-gray-100 text-red-600">
                  <FaSignOutAlt />
                  <span>Logout</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

// Stats Card Component
const StatsCard = ({ icon: Icon, title, value, change }) => (
  <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-gray-600 text-sm">{title}</p>
        <h3 className="text-2xl font-bold mt-2">{value}</h3>
        {change && (
          <p className={`text-sm mt-2 ${change >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
            {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
          </p>
        )}
      </div>
      <Icon className="text-3xl text-blue-600" />
    </div>
  </div>
);

// Dashboard View Components
const DashboardView = ({ userType }) => {
  // Different stats for different user types
  const stats = {
    [USER_TYPES.ADMIN]: [
      { icon: FaUsers, title: 'Total Users', value: '15,349', change: 12.5 },
      { icon: FaMoneyBillWave, title: 'Total Transactions', value: '$2.4M', change: 8.3 },
      { icon: FaUsersCog, title: 'Active Agents', value: '234', change: 5.7 },
      { icon: FaChartBar, title: 'System Uptime', value: '99.99%', change: 0.01 }
    ],
    [USER_TYPES.MANAGER]: [
      { icon: FaUsers, title: 'Active Agents', value: '45', change: 4.2 },
      { icon: FaMoneyBillWave, title: 'Total Commission', value: '$12,450', change: 15.8 },
      { icon: FaHistory, title: 'Monthly Transactions', value: '2,345', change: 7.3 }
    ],
    [USER_TYPES.AGENT]: [
      { icon: FaWallet, title: 'Available Balance', value: '$3,450', change: 12.3 },
      { icon: FaMoneyBillWave, title: 'Commission Earned', value: '$450', change: 8.7 },
      { icon: FaHistory, title: 'Today\'s Transactions', value: '24', change: -2.1 }
    ],
    [USER_TYPES.USER]: [
      { icon: FaWallet, title: 'Wallet Balance', value: '$1,234', change: 5.4 },
      { icon: FaHistory, title: 'Recent Transactions', value: '12', change: -1.2 },
      { icon: FaFingerprint, title: 'Biometric Status', value: 'Active', change: null }
    ]
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">Dashboard Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {stats[userType].map((stat, index) => (
          <StatsCard key={index} {...stat} />
        ))}
      </div>
      
      {/* Add more dashboard content specific to user type */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Recent Activity</h3>
          {/* Add activity list or chart here */}
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
          {/* Add quick action buttons here */}
        </div>
      </div>
    </div>
  );
};

// Main Dashboard Component
const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activePath, setActivePath] = useState('dashboard');
  const [userType, setUserType] = useState(USER_TYPES.ADMIN); // For demo purposes

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);

  return (
    <div className="h-screen bg-gray-50">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar
          isOpen={sidebarOpen}
          toggleSidebar={toggleSidebar}
          userType={userType}
          activePath={activePath}
          setActivePath={setActivePath}
        />

        {/* Main Content */}
        <div className="flex-1">
          <Header toggleSidebar={toggleSidebar} />
          
          {/* Main Content Area */}
          <main className="mt-16 p-6">
            {activePath === 'dashboard' && <DashboardView userType={userType} />}
            {activePath === 'wallet' && "hello"}
            {/* Add other views based on activePath */}
          </main>
        </div>
      </div>

      {/* User Type Switcher (for demo purposes) */}
      <div className="fixed bottom-4 right-4 bg-white p-2 rounded-lg shadow-lg">
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          className="p-2 border rounded"
        >
          <option value={USER_TYPES.ADMIN}>Admin View</option>
          <option value={USER_TYPES.MANAGER}>Manager View</option>
          <option value={USER_TYPES.AGENT}>Agent View</option>
          <option value={USER_TYPES.USER}>User View</option>
        </select>
      </div>
    </div>
  );
};

export default Dashboard;