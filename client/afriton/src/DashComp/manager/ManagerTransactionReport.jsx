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
  FileText,
  Users
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ManagerTransactionReport = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    dateRange: 'all',
    agent: 'all'
  });
  const [agents, setAgents] = useState([]);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    perPage: 10
  });
  const [sortConfig, setSortConfig] = useState({
    key: 'created_at',
    direction: 'desc'
  });

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchTransactions();
  }, [pagination.currentPage, token]);

  const fetchTransactions = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/counts/manager-transactions`,
        {
          params: {
            page: pagination.currentPage,
            per_page: pagination.perPage
          },
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      setTransactions(response.data.transactions);
      setPagination(prev => ({
        ...prev,
        totalPages: response.data.pagination.total_pages,
        totalItems: response.data.pagination.total_items
      }));

      // Extract unique agents from transactions
      const uniqueAgents = [...new Set(response.data.transactions.map(tx => tx.agent_id))];
      setAgents(uniqueAgents);
    } catch (error) {
      toast.error('Failed to fetch transactions');
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

  const downloadReport = () => {
    const content = transactions.map(tx => ({
      Type: tx.transaction_type,
      Amount: tx.amount,
      Agent: tx.agent_name,
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
    a.download = 'manager-transactions.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filter transactions based on search and filters
  const filteredTransactions = transactions.filter(tx => {
    const matchesSearch = 
      tx.transaction_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tx.agent_name.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filters.type === 'all' || tx.transaction_type === filters.type;
    const matchesStatus = filters.status === 'all' || tx.status === (filters.status === 'completed');
    const matchesAgent = filters.agent === 'all' || tx.agent_id === filters.agent;

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

    return matchesSearch && matchesType && matchesStatus && matchesAgent && matchesDate;
  }).sort((a, b) => {
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

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Network Transactions
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Monitor and analyze all transactions in your network
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
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.type}
                  onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
                >
                  <option value="all">All Types</option>
                  <option value="deposit">Deposits</option>
                  <option value="withdrawal">Withdrawals</option>
                  <option value="transfer">Transfers</option>
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

                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.agent}
                  onChange={(e) => setFilters(prev => ({ ...prev, agent: e.target.value }))}
                >
                  <option value="all">All Agents</option>
                  {agents.map(agentId => (
                    <option key={agentId} value={agentId}>
                      {transactions.find(tx => tx.agent_id === agentId)?.agent_name}
                    </option>
                  ))}
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
                      onClick={() => handleSort('agent_name')}
                      className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400"
                    >
                      Agent
                      <ArrowUpDown className="w-4 h-4" />
                    </button>
                  </th>
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
                    <td colSpan="5" className="px-6 py-4 text-center">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto text-yellow-600" />
                    </td>
                  </tr>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx) => (
                    <tr
                      key={tx.id}
                      onClick={() => {
                        setSelectedTransaction(tx);
                        setIsDetailsPanelOpen(true);
                      }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                            {tx.agent_name[0]}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">{tx.agent_name}</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{tx.agent_id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="font-medium text-gray-900 dark:text-white">
                          {tx.transaction_type.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center ${
                          tx.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {tx.amount > 0 ? (
                            <ArrowUpRight className="w-4 h-4 mr-1" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 mr-1" />
                          )}
                          ₳{Math.abs(tx.amount).toFixed(2)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400">
                        {new Date(tx.created_at).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={tx.status} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
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

          <div className="space-y-6">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                  <p className={`text-xl font-bold ${
                    selectedTransaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    ₳{Math.abs(selectedTransaction.amount).toFixed(2)}
                  </p>
                </div>
                <StatusBadge status={selectedTransaction.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Type</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedTransaction.transaction_type.replace('_', ' ').toUpperCase()}
                </p>
              </div>
              <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-500 dark:text-gray-400">Agent</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {selectedTransaction.agent_name}
                </p>
              </div>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Date & Time</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {new Date(selectedTransaction.created_at).toLocaleString()}
              </p>
            </div>

            <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400">Agent ID</p>
              <p className="font-medium text-gray-900 dark:text-white">
                {selectedTransaction.agent_id}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManagerTransactionReport; 