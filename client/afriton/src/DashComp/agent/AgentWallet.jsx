import React, { useState, useEffect } from 'react';
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  Download,
  TrendingUp,
  DollarSign,
  Send,
  Loader2,
  Calendar
} from 'lucide-react';
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
  Legend
} from 'recharts';
import axios from 'axios';
import { toast } from 'react-toastify';

const AgentWallet = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [walletData, setWalletData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stats, setStats] = useState({
    totalCommission: 0,
    monthlyGrowth: 0,
    pendingTransfers: 0
  });

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchWalletData();
    fetchTransactions();
  }, []);

  const fetchWalletData = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const agentWallet = response.data.wallet_details.find(
        w => w.wallet_type === 'agent-wallet'
      );
      setWalletData(agentWallet);

      // Calculate stats
      const monthlyGrowth = calculateMonthlyGrowth(agentWallet);
      setStats(prev => ({ ...prev, monthlyGrowth }));
    } catch (error) {
      toast.error('Failed to fetch wallet data');
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/transactions/all`,
        {
          params: {
            account_id: userInfo?.account_id,
            wallet_type: 'agent-wallet'
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTransactions(response.data.transactions);

      // Calculate total commission
      const totalCommission = response.data.transactions
        .filter(tx => tx.transaction_type === 'commission')
        .reduce((sum, tx) => sum + tx.amount, 0);

      // Count pending transfers
      const pendingTransfers = response.data.transactions
        .filter(tx => tx.transaction_type === 'transfer' && !tx.status)
        .length;

      setStats(prev => ({
        ...prev,
        totalCommission,
        pendingTransfers
      }));
    } catch (error) {
      toast.error('Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMonthlyGrowth = (wallet) => {
    // This would ideally come from your backend
    return 15.2; // Placeholder
  };

  const downloadReport = () => {
    const content = transactions.map(tx => ({
      Type: tx.transaction_type,
      Amount: tx.amount,
      Date: new Date(tx.created_at).toLocaleString(),
      Status: tx.status ? 'Completed' : 'Pending'
    }));

    const csv = [
      Object.keys(content[0]).join(','),
      ...content.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-wallet-report.csv';
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
                Agent Wallet
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your commission earnings and transfers
              </p>
            </div>
            <button
              onClick={downloadReport}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg 
                hover:bg-yellow-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Wallet Balance */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Wallet Balance</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{walletData?.balance.toFixed(2)}
                  </h3>
                </div>
                <Wallet className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Monthly Growth</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    +{stats.monthlyGrowth}%
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Total Commission */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Total Commission</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₳{stats.totalCommission.toFixed(2)}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-8">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Recent Transactions
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left">
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Type</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Amount</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Date</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {transactions.slice(0, 5).map((tx, index) => (
                    <tr key={index} className="text-sm">
                      <td className="py-3 text-gray-900 dark:text-white">
                        {tx.transaction_type.replace('_', ' ').toUpperCase()}
                      </td>
                      <td className="py-3">
                        <span className={tx.amount > 0 ? 'text-green-600' : 'text-red-600'}>
                          {tx.amount > 0 ? '+' : '-'}₳{Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="py-3 text-gray-500 dark:text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          tx.status
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {tx.status ? 'Completed' : 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Commission Trend */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Commission Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={transactions}>
                    <XAxis 
                      dataKey="created_at" 
                      tickFormatter={(date) => new Date(date).toLocaleDateString()}
                      stroke="#888888" 
                    />
                    <YAxis stroke="#888888" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(17, 24, 39, 0.8)',
                        border: 'none',
                        borderRadius: '4px',
                        color: '#fff'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#EAB308" 
                      strokeWidth={2} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Transaction Types */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Transaction Types
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Commission', value: stats.totalCommission, color: '#EAB308' },
                        { name: 'Transfers', value: Math.abs(transactions
                          .filter(tx => tx.transaction_type === 'transfer')
                          .reduce((sum, tx) => sum + tx.amount, 0)), color: '#3B82F6' }
                      ]}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {data => data.map((entry, index) => (
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
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentWallet; 