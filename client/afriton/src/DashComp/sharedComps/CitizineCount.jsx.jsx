import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Wallet, User, Users, Brain, Plus, Loader2, Clock, Building2, Shield } from 'lucide-react';
import axios from 'axios';
import { useApp } from '../../context/AppContext';
import WalletActivationForm from './WalletActivationForm';

const CitizineCount = () => {
  const { userInfo } = useApp();
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);
  const [wallets, setWallets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activatingWallet, setActivatingWallet] = useState(false);
  const [selectedWalletType, setSelectedWalletType] = useState('');
  const [transactions, setTransactions] = useState({});
  const [data, setData] = useState([]);

  const walletTypes = [
    { value: 'savings', label: 'Savings Wallet', description: 'For your personal savings and daily transactions' },
    { value: 'family', label: 'Family Wallet', description: 'Manage your family expenses together' },
    { value: 'business', label: 'Business Wallet', description: 'For your business transactions' },
    { value: 'emergency', label: 'Emergency Wallet', description: 'Keep funds for unexpected situations' },
  ];

  // Format amount with AT currency
  const formatAT = (amount) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} AT`;
  };

  // Fetch last transaction for a wallet
  const fetchLastTransaction = async (accountId, walletType) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/wallet/transactions/last-transaction?account_id=${accountId}&wallet_type=${walletType}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      return response.data?.transaction;
    } catch (err) {
      console.error('Transaction fetch error:', err);
      return null;
    }
  };

  // Activate wallet function
  const activateWallet = async () => {
    if (!selectedWalletType) return;
    
    setActivatingWallet(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/update-wallet-status?wallet_type=${selectedWalletType}`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );
      fetchWallets();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to activate wallet');
    } finally {
      setActivatingWallet(false);
    }
  };

  // Fetch wallets and their transactions
  const fetchWallets = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
        {},
        {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      const walletDetails = response.data?.wallet_details || [];
      
      // Fetch last transaction for each wallet
      const transactionPromises = walletDetails.map(wallet => 
        fetchLastTransaction(wallet.account_id, wallet.wallet_type)
      );
      const transactions = await Promise.all(transactionPromises);
      
      const transformedWallets = walletDetails.map((wallet, index) => {
        // Safely handle wallet type
        const walletType = wallet.wallet_type || 'savings';
        
        const typeConfig = {
          savings: {
            type: 'Savings',
            gradient: 'from-blue-600 to-blue-800',
            iconBg: 'bg-blue-500',
            icon: Wallet
          },
          family: {
            type: 'Family',
            gradient: 'from-purple-600 to-purple-800',
            iconBg: 'bg-purple-500',
            icon: Users
          },
          "manager-wallet": {
            type: 'Manager Wallet',
            gradient: 'from-green-600 to-green-800',
            iconBg: 'bg-green-500',
            icon: Brain
          },
          "agent-wallet": {
            type: 'Agent Wallet',
            gradient: 'from-red-600 to-red-800',
            iconBg: 'bg-red-500',
            icon: User
          },
          business: {
            type: 'Business',
            gradient: 'from-yellow-600 to-yellow-800',
            iconBg: 'bg-yellow-500',
            icon: Building2
          },
          emergency: {
            type: 'Emergency',
            gradient: 'from-orange-600 to-orange-800',
            iconBg: 'bg-orange-500',
            icon: Shield
          }
        };

        // Get config or use default savings config
        const config = typeConfig[walletType] || typeConfig.savings;
        const lastTransaction = transactions[index];

        return {
          ...config,
          balance: wallet.balance || 0,
          accountNumber: wallet.account_id || '',
          lastTransaction: lastTransaction ? new Date(lastTransaction.created_at).toLocaleString() : 'No transactions',
          lastTransactionAmount: lastTransaction?.amount || 0,
          owner: wallet.owner_name || userInfo?.fname || 'You',
          wallet_type: walletType // Use the safely handled wallet type
        };
      });

      setWallets(transformedWallets);
      setLoading(false);
    } catch (err) {
      console.error('Wallet fetch error:', err);
      setError(err.response?.data?.detail || err.message || 'Failed to fetch wallets');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWallets();
  }, []);

  // Loading Skeleton
  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <div className="animate-pulse">
          <div className="h-14 bg-gray-200 dark:bg-gray-700 rounded-xl w-1/4 mb-4"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Empty State with Wallet Activation
  if (wallets.length === 0) {
    return (
     <WalletActivationForm />
    );
  }

  // Active Wallets Display
  return (
    <div className="p-6 bg-white dark:bg-[#0c0a1f] rounded-lg mb-6 rounded-xl">
      <div className="w-full">
        {/* Header with Total Balance */}
        <div className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-yellow-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-4xl font-bold">₳</span>
            </div>
            <div>
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">
                Afri Ton Wallet
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Empowering African Financial Freedom
              </p>
            </div>
          </div>

          {/* Total Balance Strip */}
          <div 
            onClick={() => setShowAllNumbers(!showAllNumbers)}
            className="flex cursor-pointer items-center gap-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white shadow-lg"
          >
            <div>
              <p className="text-sm text-yellow-100">Total Balance</p>
              <p className="text-2xl font-bold">
                {showAllNumbers ? formatAT(wallets.reduce((sum, w) => sum + w.balance, 0)) : '****.**'}
              </p>
            </div>
            <button className="p-2 hover:bg-yellow-500/20 rounded-full transition-colors">
              {showAllNumbers ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {wallets.map((wallet, index) => (
            <div
              key={index}
              className="relative h-48 rounded-xl bg-gradient-to-r shadow-xl overflow-hidden cursor-pointer group"
              onMouseEnter={() => setSelectedCard(index)}
              onMouseLeave={() => setSelectedCard(null)}
            >
              {/* Main Card Content */}
              <div className={`absolute inset-0 bg-gradient-to-r ${wallet.gradient}
                transition-transform duration-500 ease-out
                ${selectedCard === index ? 'translate-x-0' : 'translate-x-0'}`}>
                
                {/* Currency Lines Pattern */}
                <div className="absolute inset-0 opacity-10 dark:opacity-20">
                  {[...Array(10)].map((_, i) => (
                    <div
                      key={i}
                      className="absolute h-px bg-white transform -rotate-45"
                      style={{
                        left: `${i * 15}%`,
                        top: '0',
                        width: '200%',
                      }}
                    />
                  ))}
                </div>

                {/* Card Content */}
                <div className="relative h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-gray-300 text-sm">Available Balance</p>
                      <p className="text-2xl font-bold text-white mt-1">
                        {(showAllNumbers || selectedCard === index)
                          ? formatAT(wallet.balance)
                          : '****.**'
                        }
                      </p>
                    </div>
                    <div className={`${wallet.iconBg} p-2 rounded-lg shadow-lg`}>
                      <wallet.icon className="text-white" size={24} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-300 tracking-wider font-mono text-sm">
                      {(showAllNumbers || selectedCard === index)
                        ? wallet.accountNumber
                        : '•••• •••• •••• ' + wallet.accountNumber.slice(-4)}
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold capitalize text-white flex items-center gap-2">
                        <div className={`${wallet.iconBg} p-2 rounded-lg shadow-lg`}>
                          <wallet.icon className="text-white" size={24} />
                        </div>
                        {wallet.wallet_type}
                      </h3>
                      <span className="text-yellow-300 text-2xl">₳</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Hover Panel */}
              <div className={`absolute inset-0 bg-yellow-500/80 backdrop-blur-sm
                transform transition-transform duration-500 ease-out
                ${selectedCard === index ? 'translate-x-0' : 'translate-x-full'}`}>
                <div className="h-full p-6 flex flex-col justify-between">
                  <div className="flex justify-between items-start text-white">
                    <div>
                      <div className="flex items-center gap-2">
                        <User size={16} />
                        <p className="text-sm">Owner</p>
                      </div>
                      <p className="text-lg font-semibold mt-1">{wallet.owner}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <p className="text-sm">Last Transaction</p>
                      </div>
                      <p className="text-lg font-semibold mt-1">{wallet.lastTransaction}</p>
                      {wallet.lastTransactionAmount !== 0 && (
                        <p className="text-sm font-medium">
                          {formatAT(wallet.lastTransactionAmount)}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CitizineCount;