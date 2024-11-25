import React, { useState, useEffect } from 'react';
import { 
  ArrowDownRight, 
  ArrowUpRight, 
  Search, 
  SlidersHorizontal,
  ArrowUpDown,
  Download,
  CheckCircle,
  XCircle,
  Loader2,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserWithdrawRequest = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [requests, setRequests] = useState([]);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [isDetailsPanelOpen, setIsDetailsPanelOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' });
  const [filters, setFilters] = useState({
    status: 'all',
    currency: 'all'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loadingStates, setLoadingStates] = useState({
    approve: false,
    reject: false,
    download: false
  });
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchRequests();
  }, [token]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/my-withdrawal-requests`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setRequests(response.data.requests);
    } catch (error) {
      setError('Failed to fetch withdrawal requests');
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (key) => {
    const direction = sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc';
    setSortConfig({ key, direction });
  };

  const handleRequestAction = async (requestId, action) => {
    const actionKey = action.toLowerCase();
    try {
      setLoadingStates(prev => ({ ...prev, [actionKey]: true }));
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/respond-withdrawal-request/${requestId}`,
        null,
        {
          headers: { Authorization: `Bearer ${token}` },
          params: { action }
        }
      );

      toast.success(`Request ${actionKey}ed successfully`);
      fetchRequests();
      setIsDetailsPanelOpen(false);
    } catch (error) {
      let errorMessage = 'An error occurred';
      if (error.response) {
        errorMessage = error.response.data?.detail || 
                      `Failed to ${actionKey} request (${error.response.status})`;
        
        if (error.response.status === 400) {
          errorMessage = error.response.data?.detail || 'Invalid request data';
        } else if (error.response.status === 403) {
          errorMessage = 'You do not have permission to perform this action';
        } else if (error.response.status === 404) {
          errorMessage = 'Request not found or already processed';
        }
      } else if (error.request) {
        errorMessage = 'No response from server. Please check your connection.';
      }
      
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
      });

      console.error('Withdrawal request error:', {
        error: error,
        requestId: requestId,
        action: action,
        errorDetails: error.response?.data
      });
    } finally {
      setLoadingStates(prev => ({ ...prev, [actionKey]: false }));
    }
  };

  const handleDownload = async (request) => {
    try {
      setLoadingStates(prev => ({ ...prev, download: true }));
      
      const content = `
Withdrawal Request Details
-------------------------
Request ID: ${request.id}
Amount: ${request.amount} AFT
Withdrawal Amount: ${request.withdrawal_amount} ${request.withdrawal_currency}
Status: ${request.status}
Created: ${new Date(request.created_at).toLocaleString()}
Processed: ${request.processed_at ? new Date(request.processed_at).toLocaleString() : 'Not processed'}
Wallet Type: ${request.wallet_type}
Service Fee: ${request.charges} AFT
Total Amount: ${request.total_amount} AFT
      `.trim();

      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `withdrawal-request-${request.id}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Request details downloaded successfully');
    } catch (error) {
      toast.error('Failed to download request details');
      console.error('Download error:', error);
    } finally {
      setLoadingStates(prev => ({ ...prev, download: false }));
    }
  };

  // Filter and sort requests
  const filteredRequests = requests.filter(request => {
    const matchesSearch = 
      request.id.toString().includes(searchTerm) ||
      request.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      request.withdrawal_currency.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' || request.status === filters.status;
    const matchesCurrency = filters.currency === 'all' || request.withdrawal_currency === filters.currency;

    return matchesSearch && matchesStatus && matchesCurrency;
  }).sort((a, b) => {
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (sortConfig.direction === 'asc') {
      return aValue > bValue ? 1 : -1;
    }
    return aValue < bValue ? 1 : -1;
  });

  const StatusBadge = ({ status }) => {
    const styles = {
      Pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-800",
      Approved: "bg-green-100 text-green-800 dark:bg-green-600",
      Rejected: "bg-red-100 text-red-800 dark:bg-red-600"
    };
    
    return (
      <span className={`${styles[status]} px-2 py-1 dark:text-white rounded-full  text-xs font-medium`}>
        {status}
      </span>
    );
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-6 max-w-md w-full text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-red-700 dark:text-red-400 mb-2">
            Error Loading Requests
          </h3>
          <p className="text-red-600 dark:text-red-300">
            {error}
          </p>
          <button
            onClick={() => {
              setError(null);
              fetchRequests();
            }}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#0c0a1f] rounded-xl p-6">
      <div className="max-w-[2000px] mx-auto">
        {/* Header and Controls */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Withdrawal Requests
          </h1>
          
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search requests..."
                className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 transition-all dark:bg-gray-800 dark:border-gray-700"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            {/* Filter Toggle */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors dark:border-gray-700 dark:hover:bg-gray-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters
            </button>
          </div>

          {/* Filters Panel */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4 transition-all duration-300 ${
            showFilters ? 'opacity-100 max-h-96' : 'opacity-0 max-h-0 overflow-hidden'
          }`}>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:bg-gray-800 dark:border-gray-700"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Approved">Approved</option>
              <option value="Rejected">Rejected</option>
            </select>
            <select
              className="px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-600 dark:bg-gray-800 dark:border-gray-700"
              value={filters.currency}
              onChange={(e) => setFilters(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="all">All Currencies</option>
              <option value="RWF">RWF</option>
              <option value="USD">USD</option>
              <option value="KES">KES</option>
            </select>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Requests List */}
          <div className="flex-1 rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 dark:bg-gray-800">
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleSort('id')}
                        className="flex items-center gap-2"
                      >
                        Request ID
                        <ArrowUpDown className="w-4 h-4" />
                      </button>
                    </th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-gray-500 dark:text-gray-400">
                      <button
                        onClick={() => handleSort('created_at')}
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
                        <Loader2 className="w-6 h-6 animate-spin mx-auto" />
                      </td>
                    </tr>
                  ) : filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan="4" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                        No withdrawal requests found
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map((request) => (
                      <tr
                        key={request.id}
                        onClick={() => {
                          setSelectedRequest(request);
                          setIsDetailsPanelOpen(true);
                        }}
                        className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 dark:text-white">
                            #{request.id}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-400">
                          {new Date(request.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-gray-900 dark:text-white">
                            {request.withdrawal_amount} {request.withdrawal_currency}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ({request.amount} AFT)
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <StatusBadge status={request.status} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Details Panel */}
          {selectedRequest && (
            <div className={`lg:w-1/3 bg-white dark:bg-[#0c0a1f] rounded-xl shadow-sm transition-all duration-300 transform ${
              isDetailsPanelOpen ? 'translate-x-0' : 'translate-x-0'
            }`}>
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Request Details
                  </h2>
                  <button
                    onClick={() => setIsDetailsPanelOpen(false)}
                    className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
                  >
                    ×
                  </button>
                </div>

                <div className="space-y-6">
                  {/* Status and Amount */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Status</p>
                        <StatusBadge status={selectedRequest.status} />
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                        <p className="text-xl font-bold text-gray-900 dark:text-white">
                          {selectedRequest.withdrawal_amount} {selectedRequest.withdrawal_currency}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          ({selectedRequest.amount} AFT)
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Request Details */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Request ID</p>
                        <p className="font-medium text-gray-900 dark:text-white">#{selectedRequest.id}</p>
                      </div>
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Wallet Type</p>
                        <p className="font-medium text-gray-900 dark:text-white">{selectedRequest.wallet_type}</p>
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Service Fee</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRequest.charges} AFT
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Total Amount</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {selectedRequest.total_amount} AFT
                      </p>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-sm text-gray-500 dark:text-gray-400">Created At</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {new Date(selectedRequest.created_at).toLocaleString()}
                      </p>
                    </div>

                    {selectedRequest.processed_at && (
                      <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Processed At</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(selectedRequest.processed_at).toLocaleString()}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    {selectedRequest.status === 'Pending' && (
                      <>
                        <button
                          onClick={() => handleRequestAction(selectedRequest.id, 'Approve')}
                          disabled={loadingStates.approve || loadingStates.reject}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                        >
                          {loadingStates.approve ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CheckCircle className="w-4 h-4" />
                          )}
                          {loadingStates.approve ? 'Approving...' : 'Approve'}
                        </button>
                        <button
                          onClick={() => handleRequestAction(selectedRequest.id, 'Reject')}
                          disabled={loadingStates.approve || loadingStates.reject}
                          className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                        >
                          {loadingStates.reject ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <XCircle className="w-4 h-4" />
                          )}
                          {loadingStates.reject ? 'Rejecting...' : 'Reject'}
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => handleDownload(selectedRequest)}
                      disabled={loadingStates.download}
                      className="col-span-2 flex items-center justify-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors disabled:opacity-50"
                    >
                      {loadingStates.download ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Download className="w-4 h-4" />
                      )}
                      {loadingStates.download ? 'Downloading...' : 'Download Details'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserWithdrawRequest;