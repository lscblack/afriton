import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Wallet, Building2, Users, Shield, Target } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useApp } from '../../context/AppContext';

const WalletActivationForm = () => {
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [activatingWallet, setActivatingWallet] = useState(false);
  const [isHovered, setIsHovered] = useState(null);
  const [existingWallets, setExistingWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const { userInfo } = useApp();

  const walletTypes = [
    {
      value: 'savings',
      label: 'Savings Wallet',
      description: 'Your primary wallet for daily transactions and savings across Africa',
      icon: <Wallet className="w-6 h-6" />,
      color: 'from-blue-400 to-blue-600'
    },
    {
      value: 'business',
      label: 'Business Wallet',
      description: 'Manage your business finances and cross-border transactions',
      icon: <Building2 className="w-6 h-6" />,
      color: 'from-yellow-400 to-yellow-600'
    },
    {
      value: 'family',
      label: 'Family Wallet',
      description: 'Share and manage family expenses with controlled access',
      icon: <Users className="w-6 h-6" />,
      color: 'from-purple-400 to-purple-600'
    },
    {
      value: 'emergency',
      label: 'Emergency Wallet',
      description: 'Keep funds secure for unexpected situations and quick access',
      icon: <Shield className="w-6 h-6" />,
      color: 'from-red-400 to-red-600'
    },
    {
      value: 'goal',
      label: 'Goal Wallet',
      description: 'Set and track your financial goals with dedicated savings',
      icon: <Target className="w-6 h-6" />,
      color: 'from-green-400 to-green-600'
    }
  ];

  // Fetch existing wallets
  useEffect(() => {
    const fetchExistingWallets = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
          {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            withCredentials: true
          }
        );
        setExistingWallets(response.data.wallet_details.map(w => w.wallet_type));
      } catch (error) {
        console.error('Error fetching wallets:', error);
        toast.error('Failed to fetch existing wallets');
      } finally {
        setLoading(false);
      }
    };

    fetchExistingWallets();
  }, []);

  const activateWallet = async () => {
    if (!selectedWalletType) {
      toast.warning('Please select a wallet type');
      return;
    }

    // Check if wallet already exists
    if (existingWallets.includes(selectedWalletType)) {
      toast.warning(`${selectedWalletType.charAt(0).toUpperCase() + selectedWalletType.slice(1)} wallet is already activated`);
      return;
    }

    setActivatingWallet(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/update-wallet-status?wallet_type=${selectedWalletType}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`
          },
          withCredentials: true
        }
      );

      toast.success(`${selectedWalletType.charAt(0).toUpperCase() + selectedWalletType.slice(1)} wallet activated successfully!`);
      // Refresh the page to show new wallet
      localStorage.removeItem('ViewPanel');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      window.location.reload();

    } catch (error) {
      console.error('Activation error:', error);
      toast.error(error.response?.data?.detail || 'Failed to activate wallet');
    } finally {
      setActivatingWallet(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8 ">
      <div className=" mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="absolute inset-0 bg-grid-gray-100/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))]" />
          
          <div className="relative flex flex-col lg:flex-row items-stretch">
            {/* Image Section */}
            <div className="lg:w-1/2 overflow-hidden">
              <div className="relative h-full min-h-[300px] lg:min-h-[700px]">
                <img
                  src="https://www.famoco.com/wp-content/uploads/2019/05/FP201-optical-scanner-insitu-webpage.gif"
                  alt="Wallet Animation"
                  className="absolute inset-0 w-full h-full object-cover transform hover:scale-105 transition-transform duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-0 left-0 p-8">
                    <h2 className="text-white text-3xl font-bold mb-2">Welcome to Afriton</h2>
                    <p className="text-gray-200 text-lg">Your journey to financial freedom starts here</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Form Section */}
            <div className="lg:w-1/2 p-8 lg:p-12 space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Activate Your First Wallet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Choose the perfect wallet type that aligns with your financial goals and get started in minutes.
                </p>
              </div>

              <div className="space-y-6">
                {/* Wallet Type Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {walletTypes.map((type) => {
                    const isActivated = existingWallets.includes(type.value);
                    return (
                      <div
                        key={type.value}
                        onClick={() => !isActivated && setSelectedWalletType(type.value)}
                        onMouseEnter={() => !isActivated && setIsHovered(type.value)}
                        onMouseLeave={() => setIsHovered(null)}
                        className={`relative group cursor-pointer rounded-xl p-4 transition-all duration-300 
                          ${isActivated 
                            ? 'opacity-50 cursor-not-allowed bg-gray-100 dark:bg-gray-800' 
                            : selectedWalletType === type.value 
                              ? 'bg-gradient-to-r ' + type.color + ' ring-2 ring-yellow-500 ring-offset-2' 
                              : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'}`}
                      >
                        <div className="flex items-start gap-4">
                          <div className={`p-2 rounded-lg ${
                            selectedWalletType === type.value 
                              ? 'bg-white/20' 
                              : 'bg-white dark:bg-gray-600'
                          }`}>
                            {type.icon}
                          </div>
                          <div>
                            <h4 className={`font-semibold ${
                              selectedWalletType === type.value 
                                ? 'text-white' 
                                : 'text-gray-900 dark:text-white'
                            }`}>
                              {type.label}
                            </h4>
                            <p className={`text-sm mt-1 line-clamp-2 ${
                              selectedWalletType === type.value 
                                ? 'text-white/80' 
                                : 'text-gray-500 dark:text-gray-400'
                            }`}>
                              {type.description}
                            </p>
                          </div>
                        </div>
                        
                        {/* Animated Selection Indicator */}
                        <div className={`absolute inset-0 border-2 rounded-xl transition-all duration-300 ${
                          isHovered === type.value 
                            ? 'border-yellow-500 scale-105 opacity-100' 
                            : 'border-transparent scale-100 opacity-0'
                        }`} />
                        {isActivated && (
                          <div className="absolute inset-0 flex items-center bg-gray-200/80 justify-center dark:bg-black/80 rounded-xl">
                            <span className="text-sm font-bold text-red-600 dark:text-white">
                              Already Activated
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Activation Button */}
                <button
                  onClick={activateWallet}
                  disabled={!selectedWalletType || activatingWallet}
                  className={`w-full relative group overflow-hidden rounded-xl px-4 py-3.5 
                    ${selectedWalletType 
                      ? 'bg-gradient-to-r from-yellow-500 text-white to-yellow-600 hover:from-yellow-600 hover:to-yellow-700' 
                      : 'bg-gray-200 dark:bg-gray-700 '} 
                    text-white font-semibold transition-all duration-300 
                    disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {activatingWallet ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Activating Your Wallet...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-5 h-5" />
                        <span>Activate {selectedWalletType ? walletTypes.find(t => t.value === selectedWalletType)?.label : 'Wallet'}</span>
                      </>
                    )}
                  </div>
                  
                  {/* Button Hover Effect */}
                  <div className="absolute inset-0 -translate-x-full group-hover:translate-x-0 bg-gradient-to-r from-yellow-600 to-yellow-700 transition-transform duration-300" />
                </button>
              </div>

              {/* Additional Information */}
              <div className="text-center text-sm text-gray-500 dark:text-gray-400">
                By activating a wallet, you agree to our{' '}
                <a href="#" className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-500">Terms of Service</a>
                {' '}and{' '}
                <a href="#" className="text-yellow-600 hover:text-yellow-700 dark:text-yellow-500">Privacy Policy</a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Background Grid Animation */}
      <style jsx>{`
        .bg-grid-gray-100\/5 {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40' viewBox='0 0 40 40'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M0 38.59l2.83-2.83 1.41 1.41L1.41 40H0v-1.41zM0 1.4l2.83 2.83 1.41-1.41L1.41 0H0v1.41zM38.59 40l-2.83-2.83 1.41-1.41L40 38.59V40h-1.41zM40 1.41l-2.83 2.83-1.41-1.41L38.59 0H40v1.41zM20 18.6l2.83-2.83 1.41 1.41L21.41 20l2.83 2.83-1.41 1.41L20 21.41l-2.83 2.83-1.41-1.41L18.59 20l-2.83-2.83 1.41-1.41L20 18.59z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E");
        }
      `}</style>
    </div>
  );
};

export default WalletActivationForm;