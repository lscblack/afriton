import React, { useState, useEffect } from 'react';
import { 
  Users, 
  ArrowUpRight, 
  ArrowDownRight, 
  DollarSign,
  Loader2,
  Building2,
  TrendingUp,
  UserCheck
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerTopCounts = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalAgents: 0,
    activeAgents: 0,
    totalTransactions: 0,
    totalCommission: 0,
    monthlyGrowth: 0,
    performanceMetrics: []
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/counts/manager-stats`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
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
        <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Performance Overview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Comprehensive view of your network's performance metrics
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Agents */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Agents</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.totalAgents}
                  </h3>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Active Agents</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.activeAgents}
                  </h3>
                </div>
                <UserCheck className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Total Commission */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Total Commission</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{stats.totalCommission.toFixed(2)}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Monthly Growth</p>
                  <h3 className="text-3xl font-bold mt-1">
                    {stats.monthlyGrowth}%
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Performance Metrics */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">
              Agent Performance Metrics
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
                  {stats.performanceMetrics.map((metric, index) => (
                    <tr key={index}>
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {metric.agentName[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{metric.agentName}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{metric.agentId}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4">
                        <span className="text-gray-900 dark:text-white">{metric.transactions}</span>
                      </td>
                      <td className="py-4">
                        <span className="text-gray-900 dark:text-white">₳{metric.commission.toFixed(2)}</span>
                      </td>
                      <td className="py-4">
                        <div className="flex items-center gap-2">
                          {metric.performance >= 0 ? (
                            <ArrowUpRight className="w-4 h-4 text-green-500" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-red-500" />
                          )}
                          <span className={`${
                            metric.performance >= 0 ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {Math.abs(metric.performance)}%
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

export default ManagerTopCounts; 