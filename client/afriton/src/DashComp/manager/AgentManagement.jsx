import React, { useState, useEffect, useCallback } from 'react';
import { 
  Users, 
  Search, 
  SlidersHorizontal, 
  UserPlus,
  Loader2,
  CheckCircle,
  XCircle,
  Edit,
  UserCheck,
  AlertCircle
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

// Add debounce function at the top of your component
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const AgentManagement = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showPromoteModal, setShowPromoteModal] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState(null);
  const [isPromoting, setIsPromoting] = useState(false);
  const [filters, setFilters] = useState({
    status: 'all',
    location: 'all'
  });
  const [promoteForm, setPromoteForm] = useState({
    email: '',
    location: '',
    allowed_balance: ''
  });
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/counts/manager-agents`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setAgents(response.data.agents);
    } catch (error) {
      toast.error('Failed to fetch agents');
    } finally {
      setIsLoading(false);
    }
  };

  // Create debounced search function
  const debouncedSearch = useCallback(
    debounce(async (searchTerm) => {
      if (!searchTerm || searchTerm.length < 2) {
        setSearchResults([]);
        setIsSearching(false);
        return;
      }
      
      setIsSearching(true);
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/auth/search-users?search=${searchTerm}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSearchResults(response.data);
      } catch (error) {
        toast.error('Failed to search users');
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    [token]
  );

  const handlePromoteUser = async (e) => {
    e.preventDefault();
    
    if (!selectedUser && !selectedAgent) {
      toast.error('Please select a user to promote');
      return;
    }

    if (!promoteForm.location) {
      toast.error('Please enter a location');
      return;
    }

    setIsPromoting(true);
    setError(null);
    
    try {
      const payload = {
        user_id: selectedAgent?.id || selectedUser?.id,
        user_type: 'agent',
        location: promoteForm.location.toLowerCase().trim()
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/change-user-type`,
        payload,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      toast.success(response.data.message || 'User promoted successfully');
      setShowPromoteModal(false);
      setPromoteForm({ email: '', location: '', allowed_balance: '' });
      setSelectedAgent(null);
      setSelectedUser(null);
      setSearchResults([]);
      fetchAgents();
    } catch (error) {
      let errorMessage = 'Failed to promote user';
      
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.status === 422) {
        errorMessage = 'Please check all required fields';
      } else if (error.response?.status === 403) {
        errorMessage = error.response?.data?.detail || 'You do not have permission to perform this action';
      }
      
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsPromoting(false);
    }
  };

  const handleUpdateAgent = async (agentId, updates) => {
    try {
      await axios.put(
        `${import.meta.env.VITE_API_URL}/counts/update-agent/${agentId}`,
        updates,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true
        }
        
      );
      toast.success('Agent updated successfully');
      fetchAgents();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update agent');
    }
  };

  // Filter agents based on search and filters
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = 
      agent.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      agent.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === 'all' || agent.status === (filters.status === 'active');
    const matchesLocation = filters.location === 'all' || agent.location === filters.location;

    return matchesSearch && matchesStatus && matchesLocation;
  });

  // Get unique locations for filter dropdown
  const locations = [...new Set(agents.map(agent => agent.location))];

  // When editing an existing agent, populate the form with their data
  useEffect(() => {
    if (selectedAgent) {
      setPromoteForm({
        email: selectedAgent.email,
        location: selectedAgent.location,
        allowed_balance: selectedAgent.allowed_balance
      });
    }
  }, [selectedAgent]);

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl p-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Agent Management
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                Manage your network's agents and promote new ones
              </p>
            </div>
            <button
              onClick={() => setShowPromoteModal(true)}
              className="mt-4 md:mt-0 flex items-center gap-2 px-4 py-2 bg-yellow-600 text-white rounded-lg 
                hover:bg-yellow-700 transition-colors"
            >
              <UserPlus className="w-4 h-4" />
              Promote User to Agent
            </button>
          </div>

          {/* Filters Section */}
          <div className="mb-6">
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search agents..."
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>

                <select
                  className="px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-800 dark:border-gray-700 dark:text-white"
                  value={filters.location}
                  onChange={(e) => setFilters(prev => ({ ...prev, location: e.target.value }))}
                >
                  <option value="all">All Locations</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Agents Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
              </div>
            ) : filteredAgents.length === 0 ? (
              <div className="col-span-full text-center py-12 text-gray-500 dark:text-gray-400">
                No agents found
              </div>
            ) : (
              filteredAgents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center">
                        <Users className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {agent.name}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {agent.email}
                        </p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      agent.status
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {agent.status ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Location</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {agent.location}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400">Balance Limit</p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₳{agent.allowed_balance.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex justify-between items-center">
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Available Balance
                      </p>
                      <p className="font-medium text-gray-900 dark:text-white">
                        ₳{agent.available_balance.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleUpdateAgent(agent.id, { status: !agent.status })}
                      className={`flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-medium ${
                        agent.status
                          ? 'bg-red-100 text-red-600 hover:bg-red-200 dark:bg-red-900/20 dark:hover:bg-red-900/30'
                          : 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/20 dark:hover:bg-green-900/30'
                      }`}
                    >
                      {agent.status ? (
                        <>
                          <XCircle className="w-4 h-4" />
                          Deactivate
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Activate
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setSelectedAgent(agent);
                        setShowPromoteModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gray-100 text-gray-600 
                        hover:bg-gray-200 rounded-lg text-sm font-medium dark:bg-gray-700 dark:text-gray-300 
                        dark:hover:bg-gray-600"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Promote User Modal */}
      {showPromoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {selectedAgent ? 'Edit Agent' : 'Promote User to Agent'}
              </h3>
              <button
                onClick={() => {
                  setShowPromoteModal(false);
                  setSelectedAgent(null);
                  setSelectedUser(null);
                  setPromoteForm({ email: '', location: '', allowed_balance: '' });
                  setSearchResults([]);
                }}
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                ×
              </button>
            </div>

            <form onSubmit={handlePromoteUser} className="space-y-4">
              {!selectedAgent && (
                <div className="relative">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Search User
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={promoteForm.email}
                      onChange={(e) => {
                        const value = e.target.value;
                        setPromoteForm(prev => ({ ...prev, email: value }));
                        debouncedSearch(value);
                      }}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 
                        dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Search by email or name"
                      required={!selectedUser}
                      disabled={selectedUser}
                    />
                    {isSearching && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                      </div>
                    )}
                  </div>
                  
                  {/* Search Results Dropdown */}
                  {promoteForm.email && !selectedUser && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-800 rounded-md shadow-lg max-h-60 overflow-y-auto">
                      {isSearching ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Searching...
                        </div>
                      ) : searchResults.length > 0 ? (
                        <>
                          {/* Exact Matches */}
                          {searchResults.filter(user => user.match_type === "exact").length > 0 && (
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                              Exact Matches
                            </div>
                          )}
                          {searchResults
                            .filter(user => user.match_type === "exact")
                            .map((user) => (
                              <div
                                key={user.id}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer border-l-2 border-yellow-500"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPromoteForm(prev => ({ ...prev, email: user.email }));
                                  setSearchResults([]);
                                }}
                              >
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            ))}

                          {/* Partial Matches */}
                          {searchResults.filter(user => user.match_type === "partial").length > 0 && (
                            <div className="px-3 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700">
                              Similar Matches
                            </div>
                          )}
                          {searchResults
                            .filter(user => user.match_type === "partial")
                            .map((user) => (
                              <div
                                key={user.id}
                                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer"
                                onClick={() => {
                                  setSelectedUser(user);
                                  setPromoteForm(prev => ({ ...prev, email: user.email }));
                                  setSearchResults([]);
                                }}
                              >
                                <div className="font-medium">{user.name}</div>
                                <div className="text-sm text-gray-500">{user.email}</div>
                              </div>
                            ))}
                        </>
                      ) : promoteForm.email.length >= 2 ? (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          No matching users found
                        </div>
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">
                          Type at least 2 characters to search
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Selected User Display */}
                  {selectedUser && (
                    <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg flex justify-between items-center">
                      <div>
                        <div className="font-medium">{selectedUser.name}</div>
                        <div className="text-sm text-gray-500">{selectedUser.email}</div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedUser(null);
                          setPromoteForm(prev => ({ ...prev, email: '' }));
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        ×
                      </button>
                    </div>
                  )}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={promoteForm.location}
                  onChange={(e) => {
                    const value = e.target.value.toLowerCase().trim();
                    setPromoteForm(prev => ({ ...prev, location: value }));
                  }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 
                    dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Enter agent's location (e.g., kampala)"
                  required
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Location will be automatically converted to lowercase
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    <AlertCircle className="inline-block w-4 h-4 mr-2" />
                    {error}
                  </p>
                </div>
              )}

              <button
                type="submit"
                disabled={isPromoting || (!selectedAgent && !selectedUser) || !promoteForm.location}
                className={`w-full flex items-center justify-center gap-2 px-4 py-2 
                  ${isPromoting ? 'bg-yellow-400' : error ? 'bg-red-600 hover:bg-red-700' : 'bg-yellow-600 hover:bg-yellow-700'} 
                  text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isPromoting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing...</span>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="w-4 h-4" />
                    <span>Try Again</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>{selectedAgent ? 'Update Agent' : 'Promote to Agent'}</span>
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

export default AgentManagement; 