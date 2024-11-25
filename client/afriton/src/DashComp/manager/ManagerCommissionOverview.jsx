import React, { useState, useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell,
  Legend,
  BarChart,
  Bar
} from 'recharts';
import { 
  Wallet, 
  ArrowRight, 
  Loader2, 
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Send,
  Users,
  Download
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerCommissionOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [commissionData, setCommissionData] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [agentPerformance, setAgentPerformance] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchCommissionData();
  }, []);

  const fetchCommissionData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/counts/manager-commission-stats`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCommissionData(response.data);
      
      // Format agent performance data for the bar chart
      const performanceData = response.data.agent_commissions.map(agent => ({
        name: agent.agent_name,
        commission: agent.commission,
        transactions: agent.transaction_count
      }));
      setAgentPerformance(performanceData);
    } catch (error) {
      toast.error('Failed to fetch commission data');
      setError(error.response?.data?.detail || 'Failed to fetch data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferAmount || isNaN(transferAmount) || transferAmount <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    setIsTransferring(true);
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo'));
      
      if (!userInfo?.account_id) {
        throw new Error('User account ID not found');
      }

      await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/transfer`,
        null,
        {
          params: {
            recipient_account_id: userInfo.account_id,
            amount: transferAmount,
            currency: 'AFT',
            from_wallet_type: 'manager-wallet'
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Transfer successful');
      setShowTransferModal(false);
      setTransferAmount('');
      fetchCommissionData();
      setError(null);
    } catch (error) {
      let errorMessage = 'Transfer failed';
      
      if (error.response) {
        const detail = error.response.data?.detail;
        
        if (detail) {
          if (detail.includes('Insufficient balance')) {
            const match = detail.match(/Available: ([\d.]+) AFT, Required: ([\d.]+) AFT/);
            if (match) {
              errorMessage = `Insufficient balance\nAvailable: ${match[1]} AFT\nRequired: ${match[2]} AFT`;
            } else {
              errorMessage = 'Insufficient balance for this transfer';
            }
          } else {
            errorMessage = detail;
          }
        }
      }

      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsTransferring(false);
    }
  };

  const downloadReport = () => {
    const content = agentPerformance.map(agent => ({
      AgentName: agent.name,
      Commission: agent.commission,
      Transactions: agent.transactions
    }));

    const csv = [
      Object.keys(content[0]).join(','),
      ...content.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'commission-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
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
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Network Commission Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage network-wide commission earnings
              </p>
            </div>
            <div className="flex gap-4 mt-4 md:mt-0">
              <button
                onClick={() => setShowTransferModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg 
                  hover:bg-yellow-700 transition-colors"
              >
                <Send className="w-4 h-4" />
                Transfer to Savings
              </button>
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg 
                  hover:bg-gray-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Commission */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Total Commission</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{commissionData?.total_commission.toFixed(2)}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* Monthly Commission */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Monthly Commission</p>
                  <h3 className="text-2xl font-bold mt-1">
                    ₳{commissionData?.monthly_commission.toFixed(2)}
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Total Agents */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Total Agents</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {commissionData?.total_agents}
                  </h3>
                </div>
                <Users className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            {/* Active Agents */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Active Agents</p>
                  <h3 className="text-2xl font-bold mt-1">
                    {commissionData?.active_agents}
                  </h3>
                </div>
                <Users className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Agent Performance Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Performance
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentPerformance}>
                    <XAxis dataKey="name" stroke="#888888" />
                    <YAxis stroke="#888888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="commission" fill="#EAB308" />
                    <Bar dataKey="transactions" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Agent List */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Agent Commission Details
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left">
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Agent</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Commission</th>
                      <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Transactions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {commissionData?.agent_commissions.map((agent, index) => (
                      <tr key={index}>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {agent.agent_name}
                        </td>
                        <td className="py-3">
                          <span className="text-green-600">
                            ₳{agent.commission.toFixed(2)}
                          </span>
                        </td>
                        <td className="py-3 text-gray-900 dark:text-white">
                          {agent.transaction_count}
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

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Transfer to Savings
              </h3>
              <button
                onClick={() => setShowTransferModal(false)}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Available Commission
                </label>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  ₳{commissionData?.total_commission.toFixed(2)}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Transfer Amount
                </label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter amount"
                />
              </div>

              <button
                onClick={handleTransfer}
                disabled={isTransferring}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white 
                  rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Transfer Now</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerCommissionOverview; 