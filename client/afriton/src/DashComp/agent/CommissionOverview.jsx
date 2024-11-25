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
  Legend 
} from 'recharts';
import { 
  Wallet, 
  ArrowRight, 
  Loader2, 
  TrendingUp,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Send
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CommissionOverview = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [commissionData, setCommissionData] = useState(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferAmount, setTransferAmount] = useState('');
  const [isTransferring, setIsTransferring] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchCommissionData();
    fetchWallets();
  }, []);

  const fetchCommissionData = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/commission-balance`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setCommissionData(response.data);
    } catch (error) {
      toast.error('Failed to fetch commission data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchWallets = async () => {
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setWallets(response.data.wallet_details);
    } catch (error) {
      toast.error('Failed to fetch wallets');
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
            from_wallet_type: 'agent-wallet'
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success('Transfer successful');
      setShowTransferModal(false);
      setTransferAmount('');
      fetchCommissionData();
      fetchWallets();
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
        } else {
          switch (error.response.status) {
            case 400:
              errorMessage = 'Invalid transfer request';
              break;
            case 401:
              errorMessage = 'Authentication required. Please log in again.';
              break;
            case 403:
              errorMessage = 'You do not have permission to perform this transfer';
              break;
            case 404:
              errorMessage = 'Wallet not found or account not activated';
              break;
            case 500:
              errorMessage = 'Server error. Please try again later.';
              break;
            default:
              errorMessage = `Error: ${error.response.status}`;
          }
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        errorMessage = error.message || 'An unexpected error occurred';
      }

      toast.error(errorMessage)
      setError(errorMessage)
      console.error('Transfer error:', {
        error: error,
        response: error.response?.data,
        status: error.response?.status,
        message: errorMessage
      });
    } finally {
      setIsTransferring(false);
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
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Commission Overview
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Track and manage your commission earnings
              </p>
            </div>
            <button
              onClick={() => setShowTransferModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg 
                hover:bg-yellow-700 transition-colors"
            >
              <Send className="w-4 h-4" />
              Transfer to Savings
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {/* Total Commission */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Total Commission</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{commissionData?.balance.toFixed(2)}
                  </h3>
                </div>
                <DollarSign className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* Monthly Growth */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Monthly Growth</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    +15.2%
                  </h3>
                </div>
                <TrendingUp className="w-8 h-8 text-green-500" />
              </div>
            </div>

            {/* Available Balance */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 dark:text-gray-400">Available Balance</p>
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                    ₳{commissionData?.balance.toFixed(2)}
                  </h3>
                </div>
                <Wallet className="w-8 h-8 text-yellow-600" />
              </div>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Line Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Commission Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={commissionData?.trend || []}>
                    <XAxis dataKey="date" stroke="#888888" />
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

            {/* Pie Chart */}
            <div className="bg-gray-50 dark:bg-gray-800 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Commission Sources
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={commissionData?.sources || []}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {commissionData?.sources?.map((entry, index) => (
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

      {/* Transfer Modal */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
              {error && <p className="text-red-500 block">{error}</p>}
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
                  ₳{commissionData?.balance.toFixed(2)}
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

export default CommissionOverview; 