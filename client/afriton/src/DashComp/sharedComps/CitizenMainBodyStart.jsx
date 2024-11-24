import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Building2, 
  ShoppingCart, 
  Music2, 
  Wallet,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Download,
  ChevronRight,
  Search,
  SlidersHorizontal,
  ArrowUpDown
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

const TransactionDashboard = () => {
  const navigate = useNavigate();
  const { userInfo } = useApp();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'date', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    category: 'all'
  });
//   console.log(userInfo)
  const [showFilters, setShowFilters] = useState(false);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [realTransactions, setRealTransactions] = useState([]);
  const [error, setError] = useState(null);
  const [selectedWalletType, setSelectedWalletType] = useState('savings');
  const [walletTypes, setWalletTypes] = useState([]);
  const [userWallets, setUserWallets] = useState([]);

  // Check authentication status
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUserInfo = localStorage.getItem('userInfo');
    
    if (!token || !storedUserInfo) {
      navigate('/login');
      return;
    }
  }, [navigate]);

  // Fetch user's wallets first
  const fetchUserWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !userInfo?.account_id) {
        throw new Error('Authentication information missing');
      }

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        }
      );
      setUserWallets(response.data.wallet_details);
      const types = response.data.wallet_details.map(w => w.wallet_type);
      setWalletTypes(types);
      if (types.length > 0) {
        setSelectedWalletType(types[0]);
      }
    } catch (error) {
      console.error('Error fetching wallets:', error);
      setError('Failed to load wallet information');
      if (error.message.includes('Authentication')) {
        navigate('/login');
      }
    }
  };

  // Modified fetchTransactions to use userInfo from context
  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      
      if (!token || !userInfo) {
        navigate('/login');
        return;
      }

      // Use userInfo from context directly
      if (!userInfo?.account_id) {
        throw new Error('User account information is incomplete');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/transactions/all`,
        {
          params: {
            account_id: userInfo.account_id,
            wallet_type: selectedWalletType,
            skip: 0,
            limit: 100
          },
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      // Transform transactions
      const transformedTransactions = response.data.transactions.map(tx => ({
        id: tx.id,
        merchant: tx.transaction_type.charAt(0).toUpperCase() + tx.transaction_type.slice(1),
        date: new Date(tx.created_at).toLocaleDateString(),
        type: tx.transaction_type,
        amount: tx.amount,
        status: tx.status ? 'Completed' : 'Failed',
        icon: getTransactionIcon(tx.transaction_type),
        card: tx.original_currency ? `${tx.original_currency} • ${tx.original_amount}` : 'Afriton',
        location: 'Transaction ID: ' + tx.id,
        category: tx.wallet_type
      }));

      setRealTransactions(transformedTransactions);
      setFilteredTransactions(transformedTransactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setError(error.message);
      
      if (error.message.includes('Authentication') || error.response?.status === 401) {
        navigate('/login');
      }
      
      setRealTransactions([]);
      setFilteredTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Wait for userInfo to be available before fetching transactions
  useEffect(() => {
    if (userInfo?.account_id && selectedWalletType) {
      fetchTransactions();
    }
  }, [selectedWalletType, userInfo]);

  // Initialize when userInfo is available
  useEffect(() => {
    if (userInfo?.account_id) {
      fetchUserWallets();
    }
  }, [userInfo]);

  // Helper function to get appropriate icon
  const getTransactionIcon = (type) => {
    switch(type.toLowerCase()) {
      case 'deposit':
        return <ArrowUpRight className="w-4 h-4" />;
      case 'withdrawal':
        return <ArrowDownRight className="w-4 h-4" />;
      case 'transfer':
        return <ArrowUpDown className="w-4 h-4" />;
      default:
        return <Wallet className="w-4 h-4" />;
    }
  };

  // Handle download
  const handleDownload = async (transaction) => {
    try {
      // Create CSV content
      const csvContent = `
Transaction Details
------------------
ID: ${transaction.id}
Type: ${transaction.type}
Amount: ${transaction.amount}
Date: ${transaction.date}
Status: ${transaction.status}
Category: ${transaction.category}
Card: ${transaction.card}
Location: ${transaction.location}
      `.trim();

      // Create blob and download
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `transaction-${transaction.id}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error downloading transaction:', error);
    }
  };

  // Handle sorting
  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  // Apply filters and search
  useEffect(() => {
    let result = [...realTransactions];

    // Apply search
    if (searchTerm) {
      result = result.filter(t => 
        t.merchant.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.status.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply filters
    if (filters.status !== 'all') {
      result = result.filter(t => t.status === filters.status);
    }
    if (filters.type !== 'all') {
      result = result.filter(t => t.type === filters.type);
    }
    if (filters.category !== 'all') {
      result = result.filter(t => t.category === filters.category);
    }

    // Apply sorting
    result.sort((a, b) => {
      if (sortConfig.key === 'amount') {
        return sortConfig.direction === 'asc' 
          ? a.amount - b.amount
          : b.amount - a.amount;
      }
      return sortConfig.direction === 'asc'
        ? a[sortConfig.key].localeCompare(b[sortConfig.key])
        : b[sortConfig.key].localeCompare(a[sortConfig.key]);
    });

    setFilteredTransactions(result);
  }, [searchTerm, filters, sortConfig]);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailsPanelOpen(true);
  };

  const StatusBadge = ({ status }) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800",
      Paid: "bg-green-100 text-green-800 dark:bg-green-600",
      Received: "bg-blue-100 text-blue-800 dark:bg-blue-600"
    };
    
    return (
      <span className={`${styles[status]} px-2 py-1 rounded-full text-xs dark:text-white font-medium`}>
        {status}
      </span>
    );
  };

  return (
    <div className="bg-white dark:bg-[#0c0a1f] rounded-xl p-6">
      <div className="max-w-[2000px] mx-auto">
        {/* Header and Controls */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Transactions</h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Wallet Type Selector */}
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 
              dark:bg-gray-800 dark:border-gray-700 dark:text-white"
              value={selectedWalletType}
              onChange={(e) => setSelectedWalletType(e.target.value)}
            >
              {walletTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' ')} Wallet
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500 w-4 h-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white dark:placeholder-gray-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 
              dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          <div className={`grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4 transition-all duration-300 ${
            showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            {/* Filter Selects */}
            {['status', 'type', 'category'].map((filterType) => (
              <select
                key={filterType}
                className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={filters[filterType]}
                onChange={(e) => setFilters(prev => ({ ...prev, [filterType]: e.target.value }))}
              >
                {/* ... options remain the same ... */}
              </select>
            ))}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Transactions List */}
          <div className="flex-1 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleSort('merchant')}
                        className="flex items-center gap-2"
                      >
                        Merchant
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleSort('date')}
                        className="flex items-center gap-2"
                      >
                        Date
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleSort('amount')}
                        className="flex items-center gap-2"
                      >
                        Amount
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {isLoading ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-600"></div>
                          <span className="ml-2">Loading transactions...</span>
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-red-600">
                        Failed to load transactions
                      </td>
                    </tr>
                  ) : filteredTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center">
                        No transactions found
                      </td>
                    </tr>
                  ) : (
                    filteredTransactions.map((transaction) => (
                      <tr
                        key={transaction.id}
                        onClick={() => handleTransactionClick(transaction)}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center group-hover:bg-yellow-50 transition-colors">
                              {transaction.icon}
                            </div>
                            <div>
                              <div className="font-medium text-gray-900 dark:text-white">{transaction.merchant}</div>
                              <div className="text-sm text-gray-500 dark:text-gray-400">{transaction.type}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">{transaction.date}</td>
                        <td className="px-6 py-4">
                          <div className={`flex items-center ${
                            transaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {transaction.amount < 0 ? (
                              <ArrowDownRight className="w-4 h-4 mr-1" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 mr-1" />
                            )}
                            ₳{Math.abs(transaction.amount).toFixed(2)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={transaction.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Transaction Details Panel */}
          <div className={`lg:w-1/3 bg-white dark:bg-[#0c0a1f] rounded-xl shadow-sm transition-all duration-300 transform ${
            isDetailsPanelOpen ? 'translate-x-0' : 'translate-x-0'
          }`}>
            {selectedTransaction ? (
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">Transaction Details</h2>
                  <button
                    onClick={() => setIsDetailsPanelOpen(false)}
                    className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Transaction Header */}
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-yellow-50 flex items-center justify-center">
                        {selectedTransaction.icon}
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900 dark:text-white">{selectedTransaction.merchant}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{selectedTransaction.date}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-2xl font-bold ${
                        selectedTransaction.amount < 0 ? 'text-red-600' : 'text-green-600'
                      }`}>
                        {selectedTransaction.amount < 0 ? '-' : '+'}${Math.abs(selectedTransaction.amount).toFixed(2)}
                      </p>
                      <StatusBadge status={selectedTransaction.status} />
                    </div>
                  </div>

                  {/* Transaction Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Transaction Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.type}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Category</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.category}</p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Card Used</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.card || 'N/A'}</p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">{selectedTransaction.location}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button 
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors 
                      dark:bg-yellow-700 dark:hover:bg-yellow-800 flex items-center justify-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center p-6">
                <div className="text-center">
                  <Wallet className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">No Transaction Selected</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Select a transaction to view its details</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="text-red-600 dark:text-red-400 p-4 mb-4 bg-red-50 dark:bg-red-900/50 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
};

export default TransactionDashboard;