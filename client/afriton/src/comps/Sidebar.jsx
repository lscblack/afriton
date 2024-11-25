import { useState } from 'react';
import {
  Settings, Map, Users, PieChart, Building2, UserRound, ClipboardList,ChartArea,
   X, LogOut, 
  ArrowLeftRight, Send, CreditCard, Shield, Wallet,
  Wallet2Icon, 
} from 'lucide-react';
import { useApp } from '../context/AppContext';

const Sidebar = ({ sidebarOpen, toggleSidebar, handleLogout}) => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  // Extended Sidebar Links Configuration
  const sidebarLinks = {
    citizen: [
      {
        icon:<ChartArea/>,
        label:"Dashboard",
        details:[
          'View your dashboard',
          'Track your financial activities',
          'Monitor your account balance',
        ],
        viewpanelS: 'dashboard',
      },
      {
        icon: <Send />,
        label: 'Cross Border Payments',
        details: [
          'Instant transfers across Africa',
          'Low transaction fees',
          'Real-time tracking',
          'Secure transactions',
        ],
        viewpanelS: 'transfers',
      },
      {
        icon: <CreditCard />,
        label: 'Withdrawal Requests',
        details: [
          'View withdrawal requests',
          'Process withdrawal requests',
          'Track withdrawal history',
        ],
        viewpanelS: 'withdraw',
      },
      {
        icon: <Wallet2Icon />,
        label: 'Wallets',
        details: [
          'Create a new wallet',
          'Activate your wallet',
          'Manage your wallets',
          'View your wallet balance',
        ],
        viewpanelS: 'wallets',
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
        viewpanelS: 'money-flow',
      },
      {
        icon: <PieChart />,
        label: 'Exchange Rates',
        details: [
          'View exchange rates',
        ],
        viewpanelS: 'rates',
      },
    ],
    agent: [
      {
        icon: <ChartArea/>,
        label:"Dashboard",
        details:[
          'View your dashboard',
          'Track your financial activities',
          'Monitor your account balance',
        ],
        viewpanelS: 'dashboard',
      },
      {
        icon: <CreditCard />,
        label: 'Deposit Money',
        details: [
          'Deposit funds on behalf of users',
          'Real-time confirmations',
          'Track deposit history',
          'Low processing fees',
        ],
        viewpanelS: 'deposit',
      },
      {
        icon: <Send />,
        label: 'Withdraw Money',
        details: [
          'Process user withdrawals',
          'Instant wallet updates',
          'Secure transactions',
          'Track withdrawal history',
        ],
        viewpanelS: 'withdraw',
      },
      {
        icon: <PieChart />,
        label: 'Commission Overview',
        details: [
          'View earned commissions',
          'Track monthly summaries',
          'Performance-based bonuses',
          'Detailed commission breakdown',
        ],
        viewpanelS: 'commission',
      },
      {
        icon: <Wallet />,
        label: 'Agent Wallet',
        details: [
          'Monitor current wallet balance',
          'View transaction history',
          'Set withdrawal goals',
          'Manage linked accounts',
        ],
        viewpanelS: 'agent-wallets',
      },
      {
        icon: <ClipboardList />,
        label: 'Transaction History',
        details: [
          'Access detailed transaction logs',
          'Filter by deposits, withdrawals, or transfers',
          'Export history reports',
          'Track user-specific activity',
        ],
        viewpanelS: 'agent-transactions',
      },
    ],
    admin: [
      {
        icon: <ChartArea/>,
        label:"Dashboard",
        details:[
          'View system dashboard',
          'Track system financial activities',
          'Monitor System account balance',
        ],
        viewpanelS: 'dashboard',
      },
      {
        icon: <Users />,
        label: 'User Management',
        details: [
          'Add or remove agents and managers',
          'Promote users to different roles',
          'Track user activity logs',
          'Reset account credentials',
        ],
        viewpanelS: 'user-management',
      },
      {
        icon: <Wallet />,
        label: 'Wallet Management',
        details: [
          'Monitor all wallets',
          'Resolve wallet discrepancies',
          'Enable or disable wallets',
          'View system-wide wallet growth',
        ],
        viewpanelS: 'wallet-management',
      },
      {
        icon: <PieChart />,
        label: 'System Commission Overview',
        details: [
          'Track commissions across all regions',
          'Set commission rates for agents and managers',
          'Generate financial reports',
          'Analyze overall commission trends',
        ],
        viewpanelS: 'system-commission',
      },
      {
        icon: <ClipboardList />,
        label: 'Role Management',
        details: [
          'Change user roles',
          'Promote users to agent or manager',
          'Demote or reassign roles',
          'Ensure compliance with access permissions',
        ],
        viewpanelS: 'role-management',
      },
    ],
    manager: [
      {
        icon: <ChartArea/>,
        label:"Dashboard",
        details:[
          'View your dashboard',
          'Track your financial activities',
          'Monitor your account balance',
        ],
        viewpanelS: 'dashboard',
      },
      {
        icon: <Users />,
        label: 'Agent Overview',
        details: [
          'View agents in your region',
          'Track agent performance',
          'Assign tasks and monitor completion',
          'Access detailed agent logs',
        ],
        viewpanelS: 'agent-overview',
      },

      {
        icon: <ClipboardList />,
        label: 'Withdraw Commission',
        details: [
          'View earned commissions',
          'Withdraw commission earnings',
          'Set withdrawal schedules',
          'Access detailed commission logs',
        ],
        viewpanelS: 'withdraw-commission',
      },

      {
        icon: <Users />,
        label: 'User Role Management',
        details: [
          'Promote users to agents',
          'Monitor role-based performance',
          'Reassign user responsibilities',
          'Track user role changes',
        ],
        viewpanelS: 'user-role-management',
      },
    ],
  };
  
  // Determine links based on userType
  const links = sidebarLinks[viewUser] || sidebarLinks.citizen;

  return (
    <>
      {/* Sidebar */}
      <aside
        className={`
        fixed lg:relative w-[300px] bg-white dark:bg-[#0c0a1f] h-screen top-0 p-4 z-40 max-lg:z-50 transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
  `}
      >
        

        {/* <button className="w-full max-md:hidden bg-amber-600 hover:bg-amber-700 text-white rounded-lg p-3 mb-6 flex items-center gap-2">
          AI Assistant <MagnetIcon size={20} />
        </button> */}
        
        <div className="flex justify-between items-center gap-4">
        <h2 className='dark:text-white text-xl font-bold capitalize p-3'>Menu</h2>
        <button className=" bg-amber-600 top-2 lg:hidden block rounded-full p-1 right-3" onClick={toggleSidebar}>
          <ArrowLeftRight className="text-gray-50" />
        </button>
        </div>

        <nav className="space-y-2 overflow-auto  pb-[200px] pl-4 dark:text-white">
          {links.map(({ icon, label, details, viewpanelS }) => (
            <div key={label} className="group cursor-pointer">
              <a
                onClick={() => setViewPanel(viewpanelS)}
                className="flex items-center gap-3 p-3 text-gray-700 dark:text-slate-200 text-sm hover:bg-amber-50 hover:dark:bg-black rounded-lg"
              >
                {icon}
                {label}
              </a>
              <div className="hidden group-hover:block pl-4 p-2 rounded-md dark:bg-black dark:text-slate-300 text-sm text-gray-500 fixed bg-white left-[16rem] w-64 z-50">
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
            className="flex items-center gap-3 p-3 text-red-600 hover:bg-red-50 hover:dark:bg-black rounded-lg w-full mt-4"
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
