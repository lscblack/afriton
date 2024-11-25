import React, { useState, useEffect } from 'react';
import { 
  Search, 
  SlidersHorizontal, 
  ArrowUpDown, 
  Download, 
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  Filter,
  FileText
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
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

const AgentTransactionReport = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [stats, setStats] = useState({
    totalCommission: 0,
    totalDeposits: 0,
    totalWithdrawals: 0,
    processedTransactions: 0,
    successRate: 0,
    dailyTrend: []
  });
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all'
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, token, userInfo?.account_id]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      
      const [agentWalletResponse, processedTransactionsResponse] = await Promise.all([
        axios.get(
          `${import.meta.env.VITE_API_URL}/wallet/transactions/all`,
          {
            params: {
              account_id: userInfo?.account_id,
              wallet_type: 'agent-wallet',
              page: pagination.currentPage,
              per_page: pagination.perPage
            },
            headers: { Authorization: `Bearer ${token}` },
            withCredentials: true
          }
        ),
        axios.get(
          `${import.meta.env.VITE_API_URL}/wallet/transactions/all`,
          {
            params: {
              done_by: userInfo?.user_id,
              include_processed: true,
              page: pagination.currentPage,
              per_page: pagination.perPage
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        )
      ]);

      setPagination({
        ...pagination,
        totalPages: agentWalletResponse.data.pagination.total_pages,
        totalItems: agentWalletResponse.data.pagination.total_items
      });

      const allTransactions = [
        ...agentWalletResponse.data.transactions,
        ...processedTransactionsResponse.data.transactions
      ];

      setTransactions(allTransactions);

      // Calculate statistics with proper initialization
      const calculatedStats = {
        totalCommission: 0,
        totalDeposits: 0,
        totalWithdrawals: 0,
        processedTransactions: 0,
        successRate: 0,
        dailyTrend: []
      };

      allTransactions.forEach(tx => {
        if (tx.transaction_type === 'commission') {
          calculatedStats.totalCommission += tx.amount;
        } else if (tx.transaction_type === 'deposit') {
          calculatedStats.totalDeposits += Math.abs(tx.amount);
          calculatedStats.processedTransactions++;
        } else if (tx.transaction_type === 'withdrawal') {
          calculatedStats.totalWithdrawals += Math.abs(tx.amount);
          calculatedStats.processedTransactions++;
        }
      });

      // Calculate success rate
      const successfulTransactions = allTransactions.filter(tx => tx.status).length;
      calculatedStats.successRate = allTransactions.length > 0 
        ? (successfulTransactions / allTransactions.length) * 100 
        : 0;

      setStats(calculatedStats);

    } catch (error) {
      toast.error('Failed to fetch transactions');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleDownload = () => {
    const content = transactions.map(tx => ({
      Type: tx.transaction_type,
      Amount: tx.amount,
      Date: new Date(tx.created_at).toLocaleString(),
      Status: tx.status ? 'Completed' : 'Pending',
      WalletType: tx.wallet_type
    }));

    const csv = [
      Object.keys(content[0]).join(','),
      ...content.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'agent-transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter and sort transactions
  const filteredTransactions = transactions
    .filter(tx => {
      const matchesSearch = 
        tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.wallet_type.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesType = filters.type === 'all' || tx.transaction_type === filters.type;
      const matchesStatus = filters.status === 'all' || tx.status === (filters.status === 'completed');

      let matchesDate = true;
      if (filters.dateRange !== 'all') {
        const txDate = new Date(tx.created_at);
        const now = new Date();
        switch (filters.dateRange) {
          case 'today':
            matchesDate = txDate.toDateString() === now.toDateString();
            break;
          case 'week':
            const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000);
            matchesDate = txDate >= weekAgo;
            break;
          case 'month':
            matchesDate = txDate.getMonth() === now.getMonth() && 
                         txDate.getFullYear() === now.getFullYear();
            break;
        }
      }

      return matchesSearch && matchesType && matchesStatus && matchesDate;
    })
    .sort((a, b) => {
      const aValue = a[sortConfig.key];
      const bValue = b[sortConfig.key];
      const direction = sortConfig.direction === 'asc' ? 1 : -1;
      
      if (sortConfig.key === 'amount') {
        return (a.amount - b.amount) * direction;
      }
      
      return aValue > bValue ? direction : -direction;
    });

  const StatusBadge = ({ status }) => (
    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
      status
        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
        : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    }`}>
      {status ? 'Completed' : 'Pending'}
    </span>
  );

  const TransactionRow = ({ tx }) => (
    <tr 
      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
      onClick={() => {
        setSelectedTransaction(tx);
        setIsDetailsPanelOpen(true);
      }}
    >
      <td className="px-6 py-4">
        <div className="font-medium text-gray-900 dark:text-white">
          {tx.transaction_type.replace('_', ' ').toUpperCase()}
        </div>
        {tx.user_name && (
          <div className="text-xs text-yellow-600 dark:text-yellow-400">
            {tx.transaction_type === 'deposit' ? 'Deposited for: ' : 'Withdrawn for: '}
            {tx.user_name}
          </div>
        )}
      </td>
      <td className="px-6 py-4">
        <div className={`flex items-center ${
          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
        }`}>
          {tx.amount > 0 ? (
            <ArrowUpRight className="w-4 h-4 mr-1" />
          ) : (
            <ArrowDownRight className="w-4 h-4 mr-1" />
          )}
          ₳{Math.abs(tx.amount).toFixed(2)}
        </div>
        {tx.original_amount && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {Math.abs(tx.original_amount)} {tx.original_currency}
          </div>
        )}
      </td>
      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
        {new Date(tx.created_at).toLocaleString()}
      </td>
      <td className="px-6 py-4">
        <StatusBadge status={tx.status} />
      </td>
    </tr>
  );

  const TransactionDetails = ({ transaction, onClose }) => (
    <div className="space-y-6">
      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
            <p className={`text-xl font-bold ${
              transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              ₳{Math.abs(transaction.amount).toFixed(2)}
            </p>
            {transaction.original_amount && (
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {Math.abs(transaction.original_amount)} {transaction.original_currency}
              </p>
            )}
          </div>
          <StatusBadge status={transaction.status} />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {transaction.transaction_type.replace('_', ' ').toUpperCase()}
          </p>
        </div>
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Wallet</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {transaction.wallet_type}
          </p>
        </div>
      </div>

      {transaction.is_processed_transaction && (
        <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <p className="text-sm text-gray-500 dark:text-gray-400">Customer</p>
          <p className="font-medium text-gray-900 dark:text-white">
            {transaction.user_name}
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Account ID: {transaction.account_id}
          </p>
        </div>
      )}

      <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
        <p className="font-medium text-gray-900 dark:text-white">
          {new Date(transaction.created_at).toLocaleString()}
        </p>
      </div>
    </div>
  );

  const StatsGrid = () => {
    // Add null checks and default values
    const safeStats = {
      totalCommission: stats?.totalCommission || 0,
      totalDeposits: stats?.totalDeposits || 0,
      totalWithdrawals: stats?.totalWithdrawals || 0,
      successRate: stats?.successRate || 0
    };

    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {/* Total Commission */}
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100">Total Commission</p>
              <h3 className="text-3xl font-bold mt-1">
                ₳{safeStats.totalCommission.toFixed(2)}
              </h3>
            </div>
            <FileText className="w-8 h-8 text-yellow-200" />
          </div>
        </div>

        {/* Processed Deposits */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Deposits</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₳{safeStats.totalDeposits.toFixed(2)}
              </h3>
            </div>
            <ArrowUpRight className="w-8 h-8 text-green-500" />
          </div>
        </div>

        {/* Processed Withdrawals */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Total Withdrawals</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                ₳{safeStats.totalWithdrawals.toFixed(2)}
              </h3>
            </div>
            <ArrowDownRight className="w-8 h-8 text-red-500" />
          </div>
        </div>

        {/* Success Rate */}
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 dark:text-gray-400">Success Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
                {safeStats.successRate.toFixed(1)}%
              </h3>
            </div>
            <Filter className="w-8 h-8 text-green-500" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Transaction Report
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View and analyze your transaction history
              </p>
            </div>
            <button
              onClick={handleDownload}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg 
                hover:bg-yellow-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Download Report
            </button>
          </div>

          {/* Stats Grid */}
          <StatsGrid />

          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search transactions..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 
                  dark:border-gray-700 dark:hover:bg-gray-800 dark:text-white"
              >
                <SlidersHorizontal className="w-4 h-4" />
                Filters
              </button>
            </div>

            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="all">All Types</option>
                  <option value="commission">Commission</option>
                  <option value="transfer">Transfer</option>
                  <option value="withdrawal">Withdrawal</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.dateRange}
                  onChange={(e) => setFilters(prev => ({ ...prev, dateRange: e.target.value }))}
                >
                  <option value="all">All Time</option>
                  <option value="today">Today</option>
                  <option value="week">This Week</option>
                  <option value="month">This Month</option>
                </select>
              </div>
            )}
          </div>

          {/* Transactions Table */}
          <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-700">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('transaction_type')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Type
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('amount')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Amount
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left">
                    <button
                      onClick={() => handleSort('created_at')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Date
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {isLoading ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-yellow-600" />
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <TransactionRow key={tx.id} tx={tx} />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing {((pagination.currentPage - 1) * pagination.perPage) + 1} to{' '}
              {Math.min(pagination.currentPage * pagination.perPage, pagination.totalItems)} of{' '}
              {pagination.totalItems} results
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                disabled={pagination.currentPage === 1}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-600 dark:text-gray-300">
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                disabled={pagination.currentPage === pagination.totalPages}
                className="px-3 py-1 border rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>

          {/* Transaction Details Sidebar */}
          {selectedTransaction && isDetailsPanelOpen && (
            <div className="fixed inset-y-0 right-0 w-96 bg-white dark:bg-gray-800 shadow-xl p-6 transform transition-transform duration-300 ease-in-out">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Transaction Details
                </h3>
                <button
                  onClick={() => setIsDetailsPanelOpen(false)}
                  className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                >
                  ×
                </button>
              </div>

              <TransactionDetails transaction={selectedTransaction} onClose={() => setIsDetailsPanelOpen(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AgentTransactionReport; 