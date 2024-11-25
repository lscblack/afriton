import React, { useState, useEffect } from 'react';
import { 
  Users, 
  TrendingUp,
  DollarSign,
  Activity,
  BarChart,
  PieChart,
  MapPin,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  BarChart as RechartsBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const AdminView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/counts/admin-dashboard-stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch statistics');
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-8xl mx-auto">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-xl p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              System Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive view of system performance and metrics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* User Stats */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Users</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.overview.total_users}
                  </h3>
                  <p className="text-sm text-blue-100 mt-1">
                    {stats.overview.active_users} active
                  </p>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            {/* Transaction Volume */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Transaction Volume</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{stats.overview.total_volume.toFixed(2)}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">
                    Last 30 days
                  </p>
                </div>
                <Activity className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Total Commission */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Total Commission</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{stats.overview.total_commission.toFixed(2)}
                  </h3>
                  <p className="text-sm text-yellow-100 mt-1">
                    Distributed to agents
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* System Profit */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">System Profit</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{stats.overview.total_profit.toFixed(2)}
                  </h3>
                  <p className="text-sm text-purple-100 mt-1">
                    Total earnings
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Transaction Volume Chart */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Transaction Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsBarChart
                    data={[
                      { name: 'Deposits', value: stats.overview.total_deposits },
                      { name: 'Withdrawals', value: stats.overview.total_withdrawals }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </RechartsBarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Location Distribution */}
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Location Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={stats.location_stats}
                      dataKey="agent_count"
                      nameKey="location"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.location_stats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Recent Activities */}
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Recent Activities
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-sm font-medium text-gray-500">Type</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">User</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Amount</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {stats.recent_activities.map((activity) => (
                    <tr key={activity.id}>
                      <td className="py-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          activity.type === 'deposit' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {activity.type}
                        </span>
                      </td>
                      <td className="py-4">
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{activity.user}</p>
                          <p className="text-sm text-gray-500">{activity.email}</p>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className={`font-medium ${
                          activity.amount >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          ₳{Math.abs(activity.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4 text-gray-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminView;