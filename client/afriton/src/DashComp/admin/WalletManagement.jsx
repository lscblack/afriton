import React, { useState, useEffect } from 'react';
import { 
  Wallet,
  Search,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  RefreshCw,
  DollarSign,
  Briefcase,
  PiggyBank,
  Building2
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const WalletManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [walletStats, setWalletStats] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [showWalletModal, setShowWalletModal] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [loadingWallets, setLoadingWallets] = useState({});

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchWalletStats();
    fetchUsers();
  }, [currentPage]);

  const fetchWalletStats = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/admin-view-wallets`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setWalletStats(response.data);
    } catch (error) {
      toast.error('Failed to fetch wallet statistics');
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/api/all/users`,
        {
          params: {
            page: currentPage,
            limit: 10
          },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setUsers(response.data.users);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserWallets = async (userId) => {
    try {
      setLoadingWallets(prev => ({ ...prev, [userId]: true }));

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
        {
          params: { wallet_id: userId },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.wallet_details) {
        setSelectedUser({
          ...users.find(u => u.account_id === userId),
          wallets: response.data.wallet_details
        });
        setShowWalletModal(true);
      } else {
        toast.warning('No wallet details found for this user');
      }
    } catch (error) {
      let errorMessage = 'Failed to fetch wallet details';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setLoadingWallets(prev => ({ ...prev, [userId]: false }));
    }
  };

  const refreshData = async () => {
    setIsRefreshing(true);
    await Promise.all([fetchWalletStats(), fetchUsers()]);
    setIsRefreshing(false);
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.lname.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Wallet Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and manage all user wallets
              </p>
            </div>
            <button
              onClick={refreshData}
              className={`mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                hover:bg-blue-700 transition-colors ${isRefreshing ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={isRefreshing}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Data
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Savings Wallets */}
            <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100">Savings Wallets</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{walletStats?.savings_total?.toFixed(2) || '0.00'}
                  </h3>
                  <p className="text-sm text-blue-100 mt-1">
                    Total Balance
                  </p>
                </div>
                <PiggyBank className="w-8 h-8 text-blue-200" />
              </div>
            </div>

            {/* Agent Wallets */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100">Agent Wallets</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{walletStats?.agent_total?.toFixed(2) || '0.00'}
                  </h3>
                  <p className="text-sm text-green-100 mt-1">
                    Commission Balance
                  </p>
                </div>
                <Briefcase className="w-8 h-8 text-green-200" />
              </div>
            </div>

            {/* Manager Wallets */}
            <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-yellow-100">Manager Wallets</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{walletStats?.manager_total?.toFixed(2) || '0.00'}
                  </h3>
                  <p className="text-sm text-yellow-100 mt-1">
                    Commission Balance
                  </p>
                </div>
                <Building2 className="w-8 h-8 text-yellow-200" />
              </div>
            </div>

            {/* Total Balance */}
            <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100">Total System Balance</p>
                  <h3 className="text-3xl font-bold mt-1">
                    ₳{walletStats?.total_balance?.toFixed(2) || '0.00'}
                  </h3>
                  <p className="text-sm text-purple-100 mt-1">
                    All Wallets
                  </p>
                </div>
                <DollarSign className="w-8 h-8 text-purple-200" />
              </div>
            </div>
          </div>

          {/* Search and User List */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : (
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Account ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#0c0a1f] divide-y divide-gray-200 dark:divide-gray-700">
                  {filteredUsers.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                              <span className="text-gray-600 dark:text-gray-300">
                                {user.fname[0]}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 dark:text-white">
                              {user.fname} {user.lname}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.user_type === 'agent' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            user.user_type === 'manager' ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'}`}>
                          {user.user_type}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {user.account_id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => fetchUserWallets(user.account_id)}
                          disabled={loadingWallets[user.account_id]}
                          className="flex items-center gap-2 text-blue-600 hover:text-blue-900 
                            dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 
                            disabled:cursor-not-allowed transition-all duration-200"
                        >
                          {loadingWallets[user.account_id] ? (
                            <>
                              <Loader2 className="w-4 h-4 animate-spin" />
                              <span>Loading...</span>
                            </>
                          ) : (
                            <>
                              <Eye className="w-4 h-4" />
                              <span>View Wallets</span>
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Pagination */}
          <div className="mt-4 flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 
                  text-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 border border-gray-200 rounded-lg disabled:opacity-50 
                  text-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Wallet Details Modal */}
      {showWalletModal && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0c0a1f] rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Wallet Details - {selectedUser.fname} {selectedUser.lname}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Account ID: {selectedUser.account_id}
                </p>
              </div>
              <button
                onClick={() => {
                  setShowWalletModal(false);
                  setSelectedUser(null);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedUser.wallets.map((wallet) => (
                <div
                  key={wallet.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4"
                >
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-gray-900 dark:text-white capitalize">
                      {wallet.wallet_type.replace('-', ' ')}
                    </h4>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      wallet.wallet_status
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {wallet.wallet_status ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <div className="mt-2">
                    <p className="text-sm text-gray-500 dark:text-gray-400">Balance</p>
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">
                      ₳{wallet.balance.toFixed(2)}
                    </p>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                    {wallet.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletManagement; 