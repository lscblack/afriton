import React, { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { CreditCard, Send, PieChart as PieChartIcon, Wallet } from 'lucide-react';
import axios from 'axios';
import Loading from '../../comps/Loader';

const CircularProgress = ({ percentage, total, label, icon, color }) => {
  const strokeDasharray = `${(percentage * 251.2) / 100} 251.2`;

  return (
    <div className="relative bg-white dark:bg-[#0c0a1f] p-6 rounded-lg shadow">
      <div className="flex items-center justify-center">
        <div className="relative w-48 h-48">
          <svg className="w-full h-full transform -rotate-90">
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke="#e2e8f0"
              className="dark:stroke-gray-700"
              strokeWidth="12"
            />
            <circle
              cx="96"
              cy="96"
              r="88"
              fill="none"
              stroke={color}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={strokeDasharray}
              strokeDashoffset="0"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="text-4xl font-bold mb-1 dark:text-white">{percentage}%</div>
            <div className="text-sm text-gray-600 dark:text-gray-300">{total}</div>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center mt-4 text-gray-600 dark:text-gray-300">
        {React.cloneElement(icon, { className: "w-6 h-6 mr-2" })}
        <span className="text-base font-medium">{label}</span>
      </div>
    </div>
  );
};

const AfritonDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState({
    metrics: null,
    dailyTransactions: [],
    weeklyActivity: [],
    commissionBreakdown: []
  });
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        const [
          metricsResponse,
          dailyResponse,
          weeklyResponse,
          commissionResponse
        ] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/counts/agent-dashboard-metrics`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/counts/agent-daily-transactions`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/counts/agent-weekly-activity`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }),
          axios.get(`${import.meta.env.VITE_API_URL}/counts/agent-commission-breakdown`, {
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          })
        ]);

        setDashboardData({
          metrics: metricsResponse.data.metrics,
          dailyTransactions: dailyResponse.data.daily_transactions,
          weeklyActivity: weeklyResponse.data.weekly_activity,
          commissionBreakdown: commissionResponse.data.commission_breakdown
        });

        setIsLoading(false);
      } catch (err) {
        setError(err.message);
        setIsLoading(false);
      }
    };

    if (token) {
      fetchDashboardData();
    }
  }, [token]);

  if (isLoading) {
    return <div><Loading/> </div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  const metrics = [
    {
      percentage: dashboardData.metrics.deposits.percentage,
      total: dashboardData.metrics.deposits.formatted_total,
      label: 'Deposit Money',
      icon: <CreditCard />,
      color: '#3b82f6'
    },
    {
      percentage: dashboardData.metrics.withdrawals.percentage,
      total: dashboardData.metrics.withdrawals.formatted_total,
      label: 'Withdraw Money',
      icon: <Send />,
      color: '#ef4444'
    },
    {
      percentage: dashboardData.metrics.commission.percentage,
      total: dashboardData.metrics.commission.formatted_total,
      label: 'Commission Overview',
      icon: <PieChartIcon />,
      color: '#10b981'
    },
    {
      percentage: dashboardData.metrics.transactions.percentage,
      total: dashboardData.metrics.transactions.formatted_total,
      label: 'Total Transactions',
      icon: <Wallet />,
      color: '#f59e0b'
    }
  ];

  return (
    <div className="p-4  min-h-screen">
      {/* Top Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {metrics.map((metric, index) => (
          <CircularProgress
            key={index}
            percentage={metric.percentage}
            total={metric.total}
            label={metric.label}
            icon={metric.icon}
            color={metric.color}
          />
        ))}
      </div>

      {/* Transaction Activity and Commission */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white dark:bg-[#0c0a1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Daily Transaction Activity</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.dailyTransactions}>
                <XAxis dataKey="hour" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                />
                <Line type="monotone" dataKey="deposits" stroke="#3b82f6" name="Deposits" />
                <Line type="monotone" dataKey="withdrawals" stroke="#ef4444" name="Withdrawals" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0a1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Commission Distribution</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dashboardData.commissionBreakdown}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {dashboardData.commissionBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Weekly Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#0c0a1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Weekly Performance</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dashboardData.weeklyActivity}>
                <XAxis dataKey="day" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="deposits" fill="#3b82f6" name="Deposits" />
                <Bar dataKey="withdrawals" fill="#ef4444" name="Withdrawals" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-[#0c0a1f] p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4 dark:text-white">Commission & Wallet Trends</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardData.weeklyActivity}>
                <XAxis dataKey="day" stroke="#888888" />
                <YAxis stroke="#888888" />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: 'rgba(17, 24, 39, 0.8)',
                    border: 'none',
                    borderRadius: '4px',
                    color: '#fff'
                  }}
                />
                <Line type="monotone" dataKey="commission" stroke="#10b981" name="Commission" />
                <Line type="monotone" dataKey="wallet" stroke="#f59e0b" name="Wallet Balance" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AfritonDashboard;