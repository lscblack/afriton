import React, { useState, useEffect } from 'react';
import { Bell, ChevronDown, User, LogOut, Settings, ArrowUpRight, ArrowDownRight, Menu } from 'lucide-react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from '../context/AppContext';

const TopNavBar = ({ onSidebarToggle }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [userData, setUserData] = useState(null);



  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  const {viewUser, setViewUser,viewPanel, setViewPanel} = useApp();
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/user-profile`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setUserData(response.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    if (token) {
      fetchUserData();
    }
  }, [token]);

  useEffect(() => {
    fetchRecentTransactions();
  }, [token, userInfo?.account_id]);

  const fetchRecentTransactions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/transactions/all`, {
          params: {
            account_id: userInfo?.account_id,
            limit: 5
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      // Transform transactions into notifications
      const notificationData = response.data.transactions.map(tx => ({
        id: tx.id,
        message: `${tx.transaction_type.replace('_', ' ').toUpperCase()}: ${Math.abs(tx.amount)} AFT`,
        time: new Date(tx.created_at).toLocaleString(),
        type: tx.transaction_type,
        amount: tx.amount,
        status: tx.status,
        wallet_type: tx.wallet_type
      }));

      setNotifications(notificationData);
      setIsLoading(false);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setIsLoading(false);
    }
  };

  const NotificationPopup = ({ notification, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Transaction Details
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
          >
            ×
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
              <p className={`text-lg font-semibold ${
                notification.amount > 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {notification.amount > 0 ? (
                  <ArrowUpRight className="inline w-4 h-4 mr-1" />
                ) : (
                  <ArrowDownRight className="inline w-4 h-4 mr-1" />
                )}
                ₳{Math.abs(notification.amount)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                notification.status
                  ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                  : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
              }`}>
                {notification.status ? 'Completed' : 'Failed'}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {notification.type.replace('_', ' ').toUpperCase()}
              </p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Wallet</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {notification.wallet_type}
              </p>
            </div>
          </div>

          <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <p className="text-sm text-gray-500 dark:text-gray-400">Time</p>
            <p className="font-medium text-gray-900 dark:text-white">
              {notification.time}
            </p>
          </div>

          <Link
            onClick={()=>{setShowNotifications(false);setViewPanel("money-flow");}}
            className="mt-4 w-full inline-flex justify-center items-center px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
          >
            View All Transactions
          </Link>
        </div>
      </div>
    </div>
  );

  const [selectedNotification, setSelectedNotification] = useState(null);

  const handleLogout = () => {
    // localStorage.clear();
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    localStorage.removeItem('viewUser');
    localStorage.removeItem('viewPanel');
    window.location.href = '/login';
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
    if (onSidebarToggle) {
      onSidebarToggle(!isSidebarOpen);
    }
  };

  return (
    <nav className="bg-white dark:bg-[#0c0a1f] shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className=" mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center gap-2">
            <button 
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" 
              onClick={toggleSidebar}
            >
              <Menu className="w-6 h-6 text-gray-500 dark:text-gray-400" />
            </button>
            <div className="text-amber-600 font-bold text-2xl">Afri-<span className="text-black dark:text-white">Ton</span></div>
          </div>
          <div className="flex items-center gap-4">
            {/* Notifications */}
            <div className="relative">
              <button
                onClick={() => {setShowNotifications(!showNotifications); setProfileOpen(false);}}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 relative"
              >
                <Bell className="w-6 h-6 text-gray-500 dark:text-gray-400" />
                {notifications.length > 0 && (
                  <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                )}
              </button>

              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
                  </div>
                  <div className="max-h-96 overflow-y-auto">
                    {isLoading ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        Loading...
                      </div>
                    ) : notifications.length === 0 ? (
                      <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                        No recent transactions
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <button
                          key={notification.id}
                          onClick={() => setSelectedNotification(notification)}
                          className="w-full px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center justify-between"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {notification.message}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {notification.time}
                            </p>
                          </div>
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        </button>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700">
                    <Link
                      onClick={()=>{setViewPanel("money-flow");setShowNotifications(false);}}
                      className="text-sm text-yellow-600 hover:text-yellow-700 dark:text-yellow-400 dark:hover:text-yellow-300"
                    >
                      View all transactions
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Profile Dropdown */}
            <div className="relative profile-menu">
              <button
                className="flex items-center gap-2"
                onClick={() => {
                  setProfileOpen(!profileOpen);
                  setShowNotifications(false);
                }}
              >
                
                {userData?.avatar ? (
                  <img 
                    src={userData.avatar} 
                    alt="profile" 
                    className="w-8 h-8 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                        (userData?.fname || '') + ' ' + (userData?.lname || '')
                      )}`;
                    }}
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                    {userData?.fname ? userData.fname[0].toUpperCase() : 'U'}
                  </div>
                )}
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {profileOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-[#0c0a1f] dark:text-slate-200 dark:border-black rounded-lg shadow-lg py-2 border z-50">
                  <div className="px-4 py-2 border-b dark:border-black">
                    <div className="font-semibold">
                      {userData ? `${userData.fname} ${userData.lname}` : 'User'}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-slate-400">
                      {userData?.email || 'No email available'}
                    </div>
                    {userData?.user_type !== "citizen" && (
                      <div 
                        className="text-sm text-yellow-600 font-bold text-center mt-2 cursor-pointer hover:text-yellow-700"
                        onClick={() => {
                          setViewUser(prev => prev === "citizen" ? userData?.user_type : "citizen");
                          setProfileOpen(false);
                          setViewPanel("dashboard");
                        }}
                      >
                        change to {viewUser === "citizen" ? userData?.user_type : "citizen"}
                      </div>
                    )}
                  </div>
                  <a onClick={()=>{setViewPanel("profile");setProfileOpen(false);}} className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-black flex items-center gap-2 text-gray-700 dark:text-slate-200">
                    <User size={16} />
                    <span>Profile</span>
                  </a>
                  {/* <a href="#" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-black flex items-center gap-2 text-gray-700 dark:text-slate-200 ">
                    <Settings size={16} />
                    <span>Settings</span>
                  </a>
                  <a href="#" className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-black flex items-center gap-2 text-gray-700 dark:text-slate-200 ">
                    <Mail size={16} />
                    <span>Messages</span>
                  </a> */}
                  <div className="border-t mt-2">
                    <button
                      onClick={handleLogout}
                      className="px-4 py-2 hover:bg-gray-50 dark:hover:bg-black flex items-center gap-2 text-red-600 w-full "
                    >
                      <LogOut size={16} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Notification Detail Popup */}
      {selectedNotification && (
        <NotificationPopup
          notification={selectedNotification}
          onClose={() => setSelectedNotification(null)}
        />
      )}
    </nav>
  );
};

export default TopNavBar;
