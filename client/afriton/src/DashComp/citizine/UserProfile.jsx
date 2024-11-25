import React, { useState, useEffect } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Edit2, 
  Wallet,
  Shield,
  UserCheck,
  Loader2,
  Camera,
  MapPin
} from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserProfile = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [editedData, setEditedData] = useState({});

  const token = localStorage.getItem('token');
  const userInfo = JSON.parse(localStorage.getItem('userInfo'));

  useEffect(() => {
    fetchUserData();
  }, [token]);

  const fetchUserData = async () => {
    try {
      setIsLoading(true);
      const [userResponse, walletsResponse] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/auth/user-profile`, {
          headers: { Authorization: `Bearer ${token}` }
        }),
        axios.post(`${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      setUserData(userResponse.data);
      setWallets(walletsResponse.data.wallet_details);
      setEditedData(userResponse.data);
    } catch (error) {
      toast.error('Failed to fetch user data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append('avatar', file);

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/update-avatar`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );

      toast.success('Profile picture updated successfully');
      fetchUserData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile picture');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      // Send data as query parameters instead of form data
      const params = new URLSearchParams({
        fname: editedData.fname || '',
        mname: editedData.mname || '',
        lname: editedData.lname || '',
        phone: editedData.phone || ''
      });

      await axios.post(
        `${import.meta.env.VITE_API_URL}/auth/update-profile?${params.toString()}`,
        null,  // empty body since we're using query params
        {
          headers: { 
            Authorization: `Bearer ${token}`
          }
        }
      );

      toast.success('Profile updated successfully');
      setIsEditMode(false);
      fetchUserData();  // Refresh the data
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Failed to update profile');
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
      <div className="max-w-7xl mx-auto">
        <div className="bg-white dark:bg-[#0c0a1f] rounded-xl shadow-xl overflow-hidden">
          {/* Profile Header */}
          <div className="relative h-48 bg-gradient-to-r from-yellow-500 to-yellow-600">
            <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
              <div className="relative">
                <div className="w-32 h-32 rounded-full border-4 border-white dark:border-gray-800 overflow-hidden bg-white dark:bg-gray-800">
                  {userData?.avatar ? (
                    <img
                      src={userData.avatar}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-yellow-100 dark:bg-yellow-900">
                      <User className="w-12 h-12 text-yellow-600 dark:text-yellow-400" />
                    </div>
                  )}
                  <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                      disabled={isUploading}
                    />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin text-white" />
                    ) : (
                      <Camera className="w-6 h-6 text-white" />
                    )}
                  </label>
                </div>
              </div>
              <div className="mb-4 pt-10 dark:text-white">
                <h1 className="text-2xl font-bold">
                  {userData?.fname} {userData?.mname} {userData?.lname}
                </h1>
                <p className="dark:text-yellow-100 text-yellow-600">@{userData?.account_id}</p>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="mt-24 p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Personal Information */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                    Personal Information
                  </h2>
                  <button
                    onClick={() => setIsEditMode(!isEditMode)}
                    className="flex items-center gap-2 text-yellow-600 hover:text-yellow-700"
                  >
                    <Edit2 className="w-4 h-4" />
                    {isEditMode ? 'Cancel' : 'Edit'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Basic Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Full Name</p>
                        {isEditMode ? (
                          <div className="space-y-2">
                            <input
                              type="text"
                              value={editedData.fname || ''}
                              onChange={(e) => setEditedData({ ...editedData, fname: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                              placeholder="First Name"
                            />
                            <input
                              type="text"
                              value={editedData.mname || ''}
                              onChange={(e) => setEditedData({ ...editedData, mname: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                              placeholder="Middle Name"
                            />
                            <input
                              type="text"
                              value={editedData.lname || ''}
                              onChange={(e) => setEditedData({ ...editedData, lname: e.target.value })}
                              className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                              placeholder="Last Name"
                            />
                          </div>
                        ) : (
                          <p className="font-medium text-gray-900 dark:text-white">
                            {userData?.fname} {userData?.mname} {userData?.lname}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                        <p className="font-medium text-gray-900 dark:text-white">{userData?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Phone</p>
                        {isEditMode ? (
                          <input
                            type="tel"
                            value={editedData.phone || ''}
                            onChange={(e) => setEditedData({ ...editedData, phone: e.target.value })}
                            className="w-full px-3 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
                          />
                        ) : (
                          <p className="font-medium text-gray-900 dark:text-white">{userData?.phone}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Additional Info */}
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Member Since</p>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {new Date(userData?.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Shield className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Type</p>
                        <p className="font-medium text-gray-900 dark:text-white capitalize">
                          {userData?.user_type}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <UserCheck className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Account Status</p>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          userData?.acc_status
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {userData?.acc_status ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {isEditMode && (
                  <div className="flex justify-end space-x-4 mt-6">
                    <button
                      onClick={() => setIsEditMode(false)}
                      className="px-4 py-2 text-gray-600 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSaveChanges}
                      className="px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700"
                    >
                      Save Changes
                    </button>
                  </div>
                )}
              </div>

              {/* Wallets */}
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Wallet Information
                </h2>
                <div className="space-y-4">
                  {wallets.map((wallet) => (
                    <div
                      key={wallet.wallet_type}
                      className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <Wallet className="w-5 h-5 text-yellow-600" />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white capitalize">
                              {wallet.wallet_type.replace('-', ' ')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">
                              Balance: ₳{wallet.balance.toFixed(2)}
                            </p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          wallet.wallet_status
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {wallet.wallet_status ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 