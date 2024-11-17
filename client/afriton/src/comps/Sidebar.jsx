import { useState } from 'react';
import {
  Settings, Map, Users, PieChart, Building2, UserRound, ClipboardList,
  ArrowRight, X, LogOut, Wallet, UserPlus, BarChart4, DollarSign,
  ArrowLeftRight, Fingerprint, Send, CreditCard, Shield,
} from 'lucide-react';

const Sidebar = ({ sidebarOpen, toggleSidebar, handleLogout, userType = 'user' }) => {
  // Extended Sidebar Links Configuration
  const sidebarLinks = {
    user: [
      {
        icon: <Send />,
        label: 'Cross Border Payments',
        details: [
          'Instant transfers across Africa',
          'Low transaction fees',
          'Real-time tracking',
          'Secure transactions',
        ],
        link: '/payments',
      },
      {
        icon: <CreditCard />,
        label: 'Banking Services',
        details: [
          'Easy deposits',
          'Quick withdrawals',
          'Account management',
          '24/7 banking access',
        ],
        link: '/banking',
      },
      {
        icon: <PieChart />,
        label: 'Money Flow Control',
        details: [
          'Transaction monitoring',
          'Spending analytics',
          'Budget planning',
          'Custom alerts',
        ],
        link: '/money-flow',
      },
      {
        icon: <Shield />,
        label: 'Multi-Channel Access',
        details: [
          'Biometric security',
          'Mobile app access',
          'USSD banking',
          'Card transactions',
        ],
        link: '/access',
      },
      {
        icon: <ClipboardList />,
        label: 'Payments & Shopping',
        details: [
          'Peer-to-peer transfers',
          'Shopping payments',
          'Merchant integration',
          'Loyalty rewards',
        ],
        link: '/shopping',
      },
      {
        icon: <Wallet />,
        label: 'Financial Growth',
        details: [
          'Quick loans',
          'Referral rewards',
          'Credit system',
          'Investment options',
        ],
        link: '/growth',
      },
      {
        icon: <Building2 />,
        label: 'Business Solutions',
        details: [
          'Bulk payments',
          'Automated salaries',
          'Business analytics',
          'Employee management',
        ],
        link: '/business',
      },
      {
        icon: <Users />,
        label: 'Family & Savings',
        details: [
          'Sub-accounts',
          'Goal tracking',
          'Flexible savings plans',
          'Family management',
        ],
        link: '/savings',
      },
    ],
    // Add additional user types (admin, agent, manager) as needed
  };

  // Determine links based on userType
  const links = sidebarLinks[userType] || sidebarLinks.user;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
          fixed lg:relative w-[300px] bg-white h-screen p-4 z-20 max-lg:z-50 transition-transform duration-300
          ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        <button className="lg:hidden absolute bg-amber-600 top-2 rounded-full p-1 right-3" onClick={toggleSidebar}>
          <X className="text-gray-50" />
        </button>

        <button className="w-full max-md:hidden bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-6 flex items-center gap-2">
          Register Business <ArrowRight size={20} />
        </button>

        <nav className="space-y-2 overflow-auto h-screen pb-[200px]">
          {links.map(({ icon, label, details, link }) => (
            <div key={label} className="group">
              <a
                href={link}
                className="flex items-center gap-3 p-3 text-gray-700 hover:bg-amber-50 rounded-lg"
              >
                {icon}
                {label}
              </a>
              <div className="hidden group-hover:block pl-10 text-sm text-gray-500">
                {details.map((detail, index) => (
                  <li key={index} className="mb-1">
                     {detail}
                  </li>
                ))}
              </div>
            </div>
          ))}

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 rounded-lg w-full mt-4"
          >
            <LogOut size={20} />
            Logout
          </button>
        </nav>
      </aside>
    </>
  );
};

export default Sidebar;
