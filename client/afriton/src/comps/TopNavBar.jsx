import { FaBell, FaUserCircle } from 'react-icons/fa';
import { useState, useEffect } from 'react';
import { Bell, Settings, Menu, X, LogOut, User, Mail, ChevronDown } from 'lucide-react';
import { useApp } from '../context/AppContext';

const TopNavBar = ({ profileOpen, setProfileOpen, notificationsOpen, setNotificationsOpen, toggleSidebar, handleLogout }) => {
  const { userInfo } = useApp();
  const [userData, setUserData] = useState(null);
  
  const notifications = [
    { id: 1, message: "New patient registration", time: "5 min ago" },
    { id: 2, message: "Staff meeting at 2 PM", time: "1 hour ago" },
    { id: 3, message: "System maintenance tonight", time: "2 hours ago" },
  ];

  useEffect(() => {
    const getUserData = () => {
      // First try to get data from context
      if (userInfo) {
        setUserData(userInfo);
        return;
      }

      // If not in context, try localStorage
      try {
        const storedUserInfo = localStorage.getItem('userInfo');
        if (!storedUserInfo) {
          setUserData(null);
          return;
        }

        // If it's already an object, use it directly
        if (typeof storedUserInfo === 'object') {
          setUserData(storedUserInfo);
          return;
        }

        // Try to parse the JSON string
        const parsedData = JSON.parse(storedUserInfo);
        setUserData(parsedData);
      } catch (error) {
        console.error('Error getting user data:', error);
        // If there's an error, clear the invalid data
        localStorage.removeItem('userInfo');
        setUserData(null);
      }
    };

    getUserData();
  }, [userInfo]);

  return (
    <>
      <header className="bg-white dark:bg-[#0c0a1f] p-4 flex justify-between items-center border-b dark:border-black sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <button className="lg:hidden" onClick={toggleSidebar}>
            <Menu className="text-gray-500" />
          </button>
          <div className="text-amber-600 font-bold text-2xl">Afri-<span className="text-black dark:text-white">Ton</span></div>
        </div>
        <div className="flex items-center gap-4">
          {/* Notifications Dropdown */}
          <div className="relative notification-menu">
            <button
              className="relative"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileOpen(false);
              }}
            >
              <Bell className="text-gray-500 h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                3
              </span>
            </button>

            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white dark: rounded-lg shadow-lg py-2 border z-50">
                <h3 className="px-4 py-2 text-lg font-semibold border-b">Notifications</h3>
                <div className="max-h-64 overflow-y-auto">
                  {notifications.map((notification) => (
                    <div key={notification.id} className="px-4 py-3 hover:bg-gray-50 border-b last:border-0">
                      <div className="text-sm">{notification.message}</div>
                      <div className="text-xs text-gray-500 mt-1">{notification.time}</div>
                    </div>
                  ))}
                </div>
                <div className="px-4 py-2 border-t">
                  <button className="text-amber-600 text-sm hover:text-amber-700 w-full text-center">
                    View all notifications
                  </button>
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
                setNotificationsOpen(false);
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
              <div className="absolute right-0 mt-2 w-56 bg-white dark: rounded-lg shadow-lg py-2 border z-50">
                <div className="px-4 py-2 border-b">
                  <div className="font-semibold">
                    {userData ? `${userData.fname} ${userData.lname}` : 'User'}
                  </div>
                  <div className="text-sm text-gray-500">
                    {userData?.email || 'No email available'}
                  </div>
                </div>
                <a href="#" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                  <User size={16} />
                  <span>Profile</span>
                </a>
                <a href="#" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                  <Settings size={16} />
                  <span>Settings</span>
                </a>
                <a href="#" className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-gray-700">
                  <Mail size={16} />
                  <span>Messages</span>
                </a>
                <div className="border-t mt-2">
                  <button
                    onClick={handleLogout}
                    className="px-4 py-2 hover:bg-gray-50 flex items-center gap-2 text-red-600 w-full"
                  >
                    <LogOut size={16} />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
      
    </>
  );
};

export default TopNavBar;
