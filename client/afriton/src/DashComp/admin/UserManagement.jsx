import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Search, 
  Filter,
  Mail,
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  Edit,
  UserCheck,
  AlertCircle,
  Send,
  ChevronDown
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userType: 'all',
    status: 'all'
  });
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [emailForm, setEmailForm] = useState({
    subject: '',
    message: '',
    userType: 'all',
    emails: []
  });
  const [promoteForm, setPromoteForm] = useState({
    userType: '',
    location: ''
  });
  const [isSending, setIsSending] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchUsers();
  }, [currentPage, filters.userType, filters.status]);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/auth/api/all/users`,
        {
          params: {
            page: currentPage,
            limit: 10,
            userType: filters.userType,
            status: filters.status
          },
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      setUsers(response.data.users);
      setTotalPages(response.data.total_pages);
    } catch (error) {
      let errorMessage = 'Failed to fetch users';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = async (e) => {
    e.preventDefault();
    setIsSending(true);
    try {
      // Validate form data
      if (!emailForm.subject.trim() || !emailForm.message.trim()) {
        toast.error('Subject and message are required');
        return;
      }

      const payload = {
        subject: emailForm.subject.trim(),
        message: emailForm.message.trim(),
        user_type: emailForm.userType,
        emails: emailForm.userType === 'single' ? emailForm.emails.filter(Boolean) : undefined
      };

      console.log('Sending email payload:', payload);

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/send-emails`,
        payload,
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      toast.success(response.data.message || 'Email sent successfully');
      setShowEmailModal(false);
      setEmailForm({
        subject: '',
        message: '',
        userType: 'all',
        emails: []
      });
    } catch (error) {
      console.error('Email error:', error.response?.data);
      let errorMessage = 'Failed to send email';
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      }
      toast.error(errorMessage);
    } finally {
      setIsSending(false);
    }
  };

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    setIsPromoting(true);
    try {
      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-user-type`,
        {
          user_id: selectedUser.id,
          user_type: promoteForm.userType,
          location: promoteForm.location
        },
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
      );
      toast.success('User role updated successfully');
      setShowPromoteModal(false);
      setSelectedUser(null);
      setPromoteForm({ userType: '', location: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update user role');
    } finally {
      setIsPromoting(false);
    }
  };

  const filteredUsers = users ? users.filter(user => {
    const matchesSearch = 
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.fname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lname.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = filters.userType === 'all' || user.user_type === filters.userType;
    const matchesStatus = filters.status === 'all' || user.acc_status === (filters.status === 'active');

    return matchesSearch && matchesType && matchesStatus;
  }) : [];

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                User Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage all users, agents, and managers
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4 md:mt-0">
              <button
                onClick={() => setShowEmailModal(true)}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg 
                  hover:bg-blue-700 transition-colors"
              >
                <Mail className="w-4 h-4" />
                Send Email
              </button>
            </div>
          </div>

          {/* Filters Section */}
          <div className="mb-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search users..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filters.userType}
                onChange={(e) => setFilters(prev => ({ ...prev, userType: e.target.value }))}
              >
                <option value="all">All User Types</option>
                <option value="citizen">Citizens</option>
                <option value="agent">Agents</option>
                <option value="manager">Managers</option>
              </select>

              <select
                className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 
                  dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                No users found
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
                      Status
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${user.acc_status ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 
                          'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'}`}>
                          {user.acc_status ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedUser(user);
                            setShowPromoteModal(true);
                          }}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          Change Role
                        </button>
                        <button
                          onClick={() => {
                            setEmailForm(prev => ({
                              ...prev,
                              userType: 'single',
                              emails: [user.email]
                            }));
                            setShowEmailModal(true);
                          }}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                        >
                          Email
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
                className="px-4 py-2 text-white border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-white border border-gray-200 rounded-lg disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0c0a1f] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Send Email
              </h3>
              <button
                onClick={() => {
                  setShowEmailModal(false);
                  setEmailForm({ subject: '', message: '', userType: 'all', emails: [] });
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleSendEmail} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Send To
                </label>
                <select
                  value={emailForm.userType}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, userType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="all">All Users</option>
                  <option value="citizen">All Citizens</option>
                  <option value="agent">All Agents</option>
                  <option value="manager">All Managers</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject
                </label>
                <input
                  type="text"
                  value={emailForm.subject}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter email subject"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Message
                </label>
                <textarea
                  value={emailForm.message}
                  onChange={(e) => setEmailForm(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white h-32"
                  placeholder="Enter email message"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSending}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white 
                  rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Promote User Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-[#0c0a1f] rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Change User Role
              </h3>
              <button
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedUser(null);
                  setPromoteForm({ userType: '', location: '' });
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePromoteUser} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  New Role
                </label>
                <select
                  value={promoteForm.userType}
                  onChange={(e) => setPromoteForm(prev => ({ ...prev, userType: e.target.value }))}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  required
                >
                  <option value="">Select role</option>
                  <option value="agent">Agent</option>
                  <option value="manager">Manager</option>
                </select>
              </div>

              {promoteForm.userType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Location
                  </label>
                  <input
                    type="text"
                    value={promoteForm.location}
                    onChange={(e) => setPromoteForm(prev => ({ ...prev, location: e.target.value.toLowerCase() }))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 
                      dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter location"
                    required
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isPromoting}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white 
                  rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {isPromoting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Update Role</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;