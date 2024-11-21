import React, { useState } from 'react';
import { Bell, Settings, Map, Users, PieChart, Building2, UserRound, ClipboardList, ArrowRight, Send, CreditCard, Shield, Wallet, Heart, Brain, Scissors, Menu, X, LogOut, User, Mail, ChevronDown } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts';
import Sidebar from '../comps/Sidebar';
import TopNavBar from '../comps/TopNavBar';
import { useNavigate } from 'react-router-dom';


const monthlyData = [
  { month: 'Oct 2019', inpatients: 2800, outpatients: 1200 },
  { month: 'Nov 2019', inpatients: 3000, outpatients: 1600 },
  { month: 'Dec 2019', inpatients: 3800, outpatients: 800 },
  { month: 'Jan 2020', inpatients: 2600, outpatients: 1000 },
  { month: 'Feb 2020', inpatients: 2800, outpatients: 1400 },
  { month: 'Mar 2020', inpatients: 3200, outpatients: 1000 },
];

const timeData = [
  { time: '07 am', patients: 70 },
  { time: '08 am', patients: 113 },
  { time: '09 am', patients: 85 },
  { time: '10 am', patients: 120 },
  { time: '11 am', patients: 95 },
  { time: '12 pm', patients: 110 },
];


const Dashboard = () => {
  const navigate = useNavigate();
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
    localStorage.removeItem('ViewPanel');
    window.location.href = '/login';
  };
  const data = [
    {
      icon: Send,
      label: 'Cross Border Payments',
      value: '2,580 transfers',
      iconColor: 'text-blue-500',
    },
    {
      icon: CreditCard,
      label: 'Banking Services',
      value: '$5.3M in transactions',
      iconColor: 'text-green-500',
    },
    {
      icon: PieChart,
      label: 'Money Flow Control',
      value: '12% budget growth',
      iconColor: 'text-red-500',
    },
    {
      icon: Shield,
      label: 'Multi-Channel Access',
      value: '35K active users',
      iconColor: 'text-purple-500',
    },
    {
      icon: ClipboardList,
      label: 'Payments & Shopping',
      value: '$1.2M spent',
      iconColor: 'text-amber-500',
    },
    {
      icon: Wallet,
      label: 'Financial Growth',
      value: '450 loans approved',
      iconColor: 'text-indigo-500',
    },
    {
      icon: Building2,
      label: 'Business Solutions',
      value: '$3.5M salaries processed',
      iconColor: 'text-teal-500',
    },
    {
      icon: Users,
      label: 'Family & Savings',
      value: '3.8K sub-accounts',
      iconColor: 'text-pink-500',
    },
  ];
  return (
    <div className=" bg-gray-50  dark:bg-[#08030e]">
      {/* Header */}
      <TopNavBar profileOpen={profileOpen} setProfileOpen={setProfileOpen} toggleSidebar={toggleSidebar} handleLogout={handleLogout} notificationsOpen={notificationsOpen} setNotificationsOpen={setNotificationsOpen} />

      <div className="flex relative overflow-auto">
        {/* Overlay for mobile sidebar */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={toggleSidebar}
          />
        )}

        {/** Sidebar imports */}
        <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} toggleSidebar={toggleSidebar} handleLogout={handleLogout} />
        {/* Main Content */}
        {/* ... (rest of the main content remains the same) ... */}
        {/* Main Content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-10 z-0">
          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-6">
            {data.map(({ icon: Icon, label, value, iconColor }) => (
              <div key={label}
                className="bg-white dark:bg-[#0c0a1f] p-6 cursor-pointer rounded-xl  hover:shadow-xl transition-shadow duration-200 transform hover:scale-105"
              >
                <div className="flex items-center gap-4">
                  <div className={`p-4 rounded-full shadow-md ${iconColor}`}>
                    <Icon className="text-lg" size={28} />
                  </div>
                  <div>
                    <div className="text-gray-800 dark:text-slate-300">{value}</div>
                    <div className="text-xs text-gray-700 dark:text-slate-200">{label}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
            {/* Bar Chart */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0c0a1f] p-4 lg:p-6 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold">Withdraws vs. Deposits</h2>
                <select className="text-sm text-gray-500 border rounded-lg px-2 py-1">
                  <option>by Week</option>
                  <option>by Months</option>
                  <option>by Year</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Bar dataKey="inpatients" fill="#F59E0B" />
                    <Bar dataKey="outpatients" fill="#FCD34D" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Gender Distribution */}
            <div className="bg-white dark:bg-[#0c0a1f] p-4 lg:p-6 rounded-xl shadow-sm">
              <h2 className="text-lg font-semibold mb-4 dark:text-slate-200">Withdraw & deposit</h2>
              <div className="flex justify-center">
                <div className="relative w-48 h-48">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-2xl font-bold dark:text-slate-200">28%</div>
                  </div>
                  <svg viewBox="0 0 36 36" className="w-full h-full">
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="3"
                      strokeDasharray="72, 100"
                    />
                    <path
                      d="M18 2.0845
                        a 15.9155 15.9155 0 0 1 0 31.831
                        a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="#FCD34D"
                      strokeWidth="3"
                      strokeDasharray="28, 100"
                      strokeDashoffset="-72"
                    />
                  </svg>
                </div>
              </div>
              <div className="flex justify-center gap-4 mt-4">
                <div className="flex items-center gap-2 dark:text-slate-200">
                  <div className="w-3 h-3 bg-amber-500 rounded-full "></div>
                  Widthdraw
                </div>
                <div className="flex items-center gap-2 dark:text-slate-200">
                  <div className="w-3 h-3 bg-amber-300 rounded-full "></div>
                  Deposit
                </div>
              </div>
            </div>

            {/* Time Admitted */}
            <div className="lg:col-span-2 bg-white dark:bg-[#0c0a1f] p-4 lg:p-6 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold dark:text-slate-200">Time Admitted</h2>
                <select className="text-sm text-gray-500 border rounded-lg px-2 py-1">
                  <option>Today</option>
                </select>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="time" />
                    <YAxis />
                    <Line type="monotone" dataKey="patients" stroke="#F59E0B" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Patients by Division */}
            <div className="bg-white dark:bg-[#0c0a1f] p-4 lg:p-6 rounded-xl shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between mb-4 gap-2">
                <h2 className="text-lg font-semibold">Goal Savings By Categories</h2>
                <select className="text-sm text-gray-500 border rounded-lg px-2 py-1">
                  <option>All time</option>
                </select>
              </div>
              <div className="space-y-4">
                {[
                  { icon: Heart, label: 'Buy Car', value: '20%' },
                  { icon: Brain, label: 'Buy House', value: '10%' },
                  { icon: Scissors, label: 'Money For Unversity', value: '99%' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="bg-amber-100 p-2 rounded-lg">
                      <Icon className="text-amber-600" size={20} />
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between dark:text-slate-200">
                        <div>{label}</div>
                        <div className="font-semibold">{value}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;