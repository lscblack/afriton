import React, { useState, useEffect } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  SlidersHorizontal,
  ArrowUpDown,
  Calendar,
  Download,
  Filter,
  PieChart,
  BarChart as BarChartIcon,
  Wallet
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
  Legend, 
  ResponsiveContainer,
  PieChart as PieChartComponent,
  Pie,
  Cell
} from 'recharts';

const MoneyFlow = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState('all');
  const [selectedWallet, setSelectedWallet] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [wallets, setWallets] = useState([]);
  const [statistics, setStatistics] = useState({
    totalInflow: 0,
    totalOutflow: 0,
    transactionCount: 0,
    categoryBreakdown: [],
    dailyData: []
  });

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  // Fetch transactions and calculate statistics
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [transactionsResponse, walletsResponse] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/wallet/transactions/all`, {
            params: {
              account_id: userInfo?.account_id,
              wallet_type: selectedWallet === 'all' ? null : selectedWallet,
              skip: 0,
              limit: 100
            },
            headers: { Authorization: `Bearer ${token}` }
          }),
          axios.post(`${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`, {}, {
            headers: { Authorization: `Bearer ${token}` }
          })
        ]);

        if (transactionsResponse.data.transactions) {
          setTransactions(transactionsResponse.data.transactions);
          setWallets(walletsResponse.data.wallet_details);

          // Calculate statistics from live data
          const inflow = transactionsResponse.data.transactions
            .filter(tx => tx.amount > 0)
            .reduce((sum, tx) => sum + tx.amount, 0);
          
          const outflow = transactionsResponse.data.transactions
            .filter(tx => tx.amount < 0)
            .reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

          // Category breakdown from live data
          const categories = transactionsResponse.data.transactions.reduce((acc, tx) => {
            const category = tx.transaction_type;
            if (!acc[category]) acc[category] = 0;
            acc[category] += Math.abs(tx.amount);
            return acc;
          }, {});

          const categoryBreakdown = Object.entries(categories).map(([name, value]) => ({
            name: name.replace(/_/g, ' ').toUpperCase(),
            value,
            color: getRandomColor()
          }));

          // Group transactions by date for charts
          const dailyData = transactionsResponse.data.transactions.reduce((acc, tx) => {
            const date = new Date(tx.created_at).toLocaleDateString();
            if (!acc[date]) {
              acc[date] = { deposits: 0, withdrawals: 0, date };
            }
            if (tx.amount > 0) {
              acc[date].deposits += tx.amount;
            } else {
              acc[date].withdrawals += Math.abs(tx.amount);
            }
            return acc;
          }, {});

          setStatistics({
            totalInflow: inflow,
            totalOutflow: outflow,
            transactionCount: transactionsResponse.data.transactions.length,
            categoryBreakdown,
            dailyData: Object.values(dailyData)
          });
        }
      } catch (error) {
        toast.error('Failed to fetch transaction data');
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userInfo?.account_id) {
      fetchData();
    }
  }, [token, userInfo?.account_id, selectedWallet]);

  const getRandomColor = () => {
    const colors = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  // Filter transactions based on search and date range
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.wallet_type.toLowerCase().includes(searchTerm.toLowerCase());

    let matchesDate = true;
    if (dateRange !== 'all') {
      const txDate = new Date(tx.created_at);
      const now = new Date();
      switch (dateRange) {
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

    return matchesSearch && matchesDate;
  });

  // Update the charts to use live data
  const barChartData = statistics.dailyData || [];
  const pieChartData = statistics.categoryBreakdown || [];

  const handleDownload = () => {
    const content = filteredTransactions.map(tx => ({
      Type: tx.transaction_type,
      Amount: tx.amount,
      Wallet: tx.wallet_type,
      Date: new Date(tx.created_at).toLocaleString(),
      Status: tx.status ? 'Completed' : 'Failed'
    }));

    const csv = [
      Object.keys(content[0]).join(','),
      ...content.map(row => Object.values(row).join(','))
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'money-flow-report.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="max-w-[2000px] mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header Section */}
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-0">
                Money Flow Report
              </h1>
              <button
                onClick={handleDownload}
                className="flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export Report
              </button>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-blue-600 dark:text-blue-400">Total Inflow</h3>
                  <ArrowUpRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ₳{statistics.totalInflow.toFixed(2)}
                </p>
              </div>

              <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-red-600 dark:text-red-400">Total Outflow</h3>
                  <ArrowDownRight className="w-5 h-5 text-red-600 dark:text-red-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ₳{statistics.totalOutflow.toFixed(2)}
                </p>
              </div>

              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-green-600 dark:text-green-400">Net Flow</h3>
                  <BarChartIcon className="w-5 h-5 text-green-600 dark:text-green-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ₳{(statistics.totalInflow - statistics.totalOutflow).toFixed(2)}
                </p>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 p-4 rounded-lg">
                <div className="flex items-center justify-between">
                  <h3 className="text-yellow-600 dark:text-yellow-400">Transactions</h3>
                  <Wallet className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                </div>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {statistics.transactionCount}
                </p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Bar Chart */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Transaction Volume
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={barChartData}>
                      <Bar dataKey="deposits" name="Deposits" fill="#3b82f6" />
                      <Bar dataKey="withdrawals" name="Withdrawals" fill="#ef4444" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Pie Chart */}
              <div className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Category Distribution
                </h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChartComponent>
                      <Pie
                        data={pieChartData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {pieChartData.map((entry, index) => (
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
                    </PieChartComponent>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
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

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">This Week</option>
                <option value="month">This Month</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                value={selectedWallet}
                onChange={(e) => setSelectedWallet(e.target.value)}
              >
                <option value="all">All Wallets</option>
                {wallets.map(wallet => (
                  <option key={wallet.wallet_type} value={wallet.wallet_type}>
                    {wallet.wallet_type.charAt(0).toUpperCase() + wallet.wallet_type.slice(1)} Wallet
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Transactions List */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800">
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Wallet
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => {
                      setSelectedTransaction(tx);
                      setIsDetailsPanelOpen(true);
                    }}
                    className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {tx.amount > 0 ? (
                          <ArrowUpRight className="w-4 h-4 text-green-500 mr-2" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4 text-red-500 mr-2" />
                        )}
                        <span className="text-gray-900 dark:text-white">
                          {tx.transaction_type}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`${
                        tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                      } font-medium`}>
                        {tx.amount > 0 ? '+' : '-'}₳{Math.abs(tx.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-900 dark:text-white">
                        {tx.wallet_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-gray-500 dark:text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        tx.status
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {tx.status ? 'Completed' : 'Failed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Transaction Details Sidebar */}
      {selectedTransaction && (
        <div className={`fixed inset-y-0 right-0 w-full sm:w-96 bg-white dark:bg-[#0c0a1f] shadow-xl transform transition-transform duration-300 ${
          isDetailsPanelOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
          <div className="h-full overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Transaction Details
              </h2>
              <button
                onClick={() => setIsDetailsPanelOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Amount</h3>
                <p className={`text-2xl font-bold ${
                  selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  {selectedTransaction.amount > 0 ? '+' : '-'}₳{Math.abs(selectedTransaction.amount).toFixed(2)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Type</h3>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.transaction_type}
                  </p>
                </div>

                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Wallet</h3>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.wallet_type}
                  </p>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Date & Time</h3>
                <p className="font-medium text-gray-900 dark:text-white">
                  {new Date(selectedTransaction.created_at).toLocaleString()}
                </p>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="text-sm text-gray-500 dark:text-gray-400">Status</h3>
                <div className={`mt-1 px-2 py-1 text-sm font-medium rounded-full inline-block ${
                  selectedTransaction.status
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                }`}>
                  {selectedTransaction.status ? 'Completed' : 'Failed'}
                </div>
              </div>

              {selectedTransaction.original_amount && (
                <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                  <h3 className="text-sm text-gray-500 dark:text-gray-400">Original Amount</h3>
                  <p className="font-medium text-gray-900 dark:text-white">
                    {selectedTransaction.original_amount} {selectedTransaction.original_currency}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoneyFlow;