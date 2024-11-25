import React, { useState, useEffect } from 'react';
import { 
  DollarSign, 
  Users, 
  ArrowUpRight, 
  ArrowDownRight,
  Loader2,
  TrendingUp,
  Calendar,
  RefreshCw
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

const SystemCommissionOverView = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCommissionStats();
  }, []);

  const fetchCommissionStats = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/counts/admin-commission-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      const defaultStats = {
        total_commission: 0,
        monthly_commission: 0,
        total_agents: 0,
        active_agents: 0,
        monthly_growth: 0,
        commission_breakdown: [],
        agent_commissions: []
      };
      setStats(response.data || defaultStats);
    } catch (error) {
      toast.error('Failed to fetch commission statistics');
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await fetchCommissionStats();
    setIsRefreshing(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Commission Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and analyze system-wide commission earnings
              </p>
            </div>
            <button
              onClick={refreshData}
              className={`mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg 
                hover:bg-yellow-700 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Commission */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Total Commission</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{(stats?.total_commission || 0).toFixed(2)}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">
                    All time earnings
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Monthly Commission */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Monthly Commission</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{(stats?.monthly_commission || 0).toFixed(2)}
                  </h3>
                  <p className="text-sm text-blue-100 mt-1">
                    This month
                  </p>
                </div>
                <Calendar className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Active Agents</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {(stats?.active_agents || 0)}
                  </h3>
                  <p className="text-sm text-yellow-100 mt-1">
                    Out of {(stats?.total_agents || 0)} total
                  </p>
                </div>
                <Users className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* Growth Rate */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Monthly Growth</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {(stats?.monthly_growth || 0).toFixed(1)}%
                  </h3>
                  <p className="text-sm text-purple-100 mt-1">
                    vs last month
                  </p>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Commission Distribution Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Commission Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.commission_breakdown}
                      dataKey="amount"
                      nameKey="type"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {stats.commission_breakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent Performance Chart */}
            <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
                Top Performing Agents
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={stats.agent_commissions.slice(0, 5)}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent_name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="commission" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Agent Commission Table */}
          <div className="bg-white dark:bg-gray-900 rounded-lg p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Agent Commission Details
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Agent</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Commission</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Performance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {stats.agent_commissions.map((agent, index) => (
                    <tr key={agent.agent_id}>
                      <td className="py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            <span className="text-gray-600 dark:text-gray-300">
                              {agent.agent_name[0]}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.agent_name}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              ID: {agent.agent_id}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 text-sm text-gray-500 dark:text-gray-400">
                        {agent.transaction_count} transactions
                      </td>
                      <td className="py-4">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          ₳{agent.commission.toFixed(2)}
                        </span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center">
                          {agent.performance >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`ml-1.5 text-sm font-medium ${
                            agent.performance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(agent.performance).toFixed(1)}%
                          </span>
                        </div>
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

export default SystemCommissionOverView;