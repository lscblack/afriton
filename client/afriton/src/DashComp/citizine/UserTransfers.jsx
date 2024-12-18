import React, { useState, useEffect } from 'react';
import { Wallet, ArrowRight, Loader2, Send } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const UserTransfers = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    recipient_account_id: '',
    amount: '',
    currency: 'RWF',
    from_wallet_type: ''
  });
  const [userWallets, setUserWallets] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [conversionResult, setConversionResult] = useState(null);

  const token = localStorage.getItem('token');

  const currencies = [
    { value: 'RWF', label: 'Rwandan Franc' },
    { value: 'KES', label: 'Kenyan Shilling' },
    { value: 'USD', label: 'US Dollar' },
    { value: 'NGN', label: 'Nigerian Naira' },
    { value: 'UGX', label: 'Ugandan Shilling' }
  ];

  // Fetch user's wallets
  useEffect(() => {
    const fetchUserWallets = async () => {
      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/wallet/get-wallet-details`,
          {},
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        
        if (response.data.wallet_details) {
          setUserWallets(response.data.wallet_details);
        }
      } catch (error) {
        toast.error('Error fetching your wallets');
      }
    };

    fetchUserWallets();
  }, [token]);

  // Handle real-time conversion
  useEffect(() => {
    const getConversion = async () => {
      if (!formData.amount || !formData.currency) return;

      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/rate/convert/${formData.amount}/${formData.currency}/to/afriton`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setConversionResult(response.data);
      } catch (error) {
        console.error('Conversion error:', error);
      }
    };

    const timeoutId = setTimeout(() => {
      if (formData.amount && formData.currency) {
        getConversion();
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [formData.amount, formData.currency, token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      // Send parameters as query parameters
      const params = new URLSearchParams({
        recipient_account_id: formData.recipient_account_id,
        amount: formData.amount,
        currency: formData.currency,
        from_wallet_type: formData.from_wallet_type
      });

      const response = await axios.post(
        `${import.meta.env.VITE_API_URL}/wallet/transfer?${params.toString()}`,
        null,  // empty body
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      toast.success('Transfer completed successfully!');
      setFormData({
        recipient_account_id: '',
        amount: '',
        currency: 'RWF',
        from_wallet_type: ''
      });
      setConversionResult(null);
    } catch (error) {
      console.error('Transfer error:', error);
      toast.error(error.response?.data?.detail || 'Failed to process transfer');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="absolute inset-0 bg-grid-gray-100/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))]" />
          
          <div className="relative flex flex-col lg:flex-row items-stretch">
            {/* Left Section - Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Transfer Money
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Send money to other Afriton users instantly with real-time conversion rates.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Recipient Account ID Input */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Recipient Account ID
                  </label>
                  <input
                    type="text"
                    value={formData.recipient_account_id}
                    onChange={(e) => setFormData({ ...formData, recipient_account_id: e.target.value })}
                    className="w-full px-4 py-4 outline-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="Enter recipient's account ID"
                    required
                  />
                </div>

                {/* Amount and Currency Inputs */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Amount
                    </label>
                    <input
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="w-full px-4 py-4 outline-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      placeholder="Enter amount"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-4 outline-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                      required
                    >
                      {currencies.map((currency) => (
                        <option key={currency.value} value={currency.value}>
                          {currency.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* From Wallet Selection */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Select Source Wallet
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {userWallets.map((wallet) => (
                      <div
                        key={wallet.wallet_type}
                        onClick={() => setFormData({ ...formData, from_wallet_type: wallet.wallet_type })}
                        className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                          formData.from_wallet_type === wallet.wallet_type
                            ? 'bg-yellow-100 dark:bg-yellow-900 ring-2 ring-yellow-500'
                            : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <Wallet className="w-5 h-5" />
                          <span className="font-medium">{wallet.wallet_type}</span>
                        </div>
                        <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                          Balance: {wallet.balance} AFT
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Conversion Result */}
                {conversionResult && (
                  <div className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Original Amount</p>
                        <p className="text-lg font-semibold dark:text-white">
                          {conversionResult.original_amount} {conversionResult.original_currency}
                        </p>
                      </div>
                      <ArrowRight className="w-6 h-6 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Converted Amount</p>
                        <p className="text-lg font-semibold dark:text-white">
                          {conversionResult.converted_amount} {conversionResult.target_currency}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing || !formData.from_wallet_type}
                  className="w-full relative group overflow-hidden rounded-xl px-4 py-3.5 
                    bg-gradient-to-r from-yellow-500 to-yellow-600 
                    text-white font-semibold transition-all duration-300 
                    hover:from-yellow-600 hover:to-yellow-700
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Transfer...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        <span>Send Money</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            </div>

            {/* Right Section - Image/Animation */}
            <div className="lg:w-1/2 overflow-hidden">
              <div className="relative h-full min-h-[300px] lg:min-h-[700px]">
                <img
                  src="https://img.freepik.com/free-vector/money-transfer-abstract-concept-vector-illustration-digital-wallet-electronic-money-transfer-online-banking-service-mobile-payment-application-e-commerce-website-shopping-abstract-metaphor_335657-1631.jpg"
                  alt="Transfer Illustration"
                  className="absolute inset-0 w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent">
                  <div className="absolute bottom-0 left-0 p-8">
                    <h2 className="text-white text-3xl font-bold mb-2">Instant Transfers</h2>
                    <p className="text-gray-200 text-lg">Send money to anyone, anywhere with real-time conversion</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserTransfers;