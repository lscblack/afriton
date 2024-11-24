import React, { useState, useEffect } from "react";
import { ArrowRight, Loader2, RefreshCw, Search } from "lucide-react";
import axios from "axios";
import { toast } from "react-toastify";

const ExchangeRate = () => {
  const [conversionRates, setConversionRates] = useState([]);
  const [conversionResult, setConversionResult] = useState(null);
  const [formData, setFormData] = useState({
    amount: "",
    currency: "RWF",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isConverting, setIsConverting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const token = localStorage.getItem('token');

  // Transform currency codes to match API expectations
  const formatCurrencyCode = (code) => {
    return code.toLowerCase().replace(/\s+/g, '_');
  };

  // Handle real-time conversion
  useEffect(() => {
    const getConversion = async () => {
      if (!formData.amount || !formData.currency) return;

      try {
        const formattedCurrency = formatCurrencyCode(formData.currency);
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/rate/convert/${formData.amount}/${formattedCurrency}/to/afriton`,
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

  // Transform the API response data into a proper format
  const transformCurrencyData = (data) => {
    const allRates = [
      ...Object.entries(data.african_currencies || {}).map(([key, value]) => ({
        code: key,
        name: key.replace(/_/g, ' ').toUpperCase(),
        rate: parseFloat(value.split('=')[1].trim().split(' ')[0]),
        category: 'African Currencies',
        currencyCode: value.split(' ').pop()
      })),
      ...Object.entries(data.european_currencies || {}).map(([key, value]) => ({
        code: key,
        name: key.replace(/_/g, ' ').toUpperCase(),
        rate: parseFloat(value.split('=')[1].trim().split(' ')[0]),
        category: 'European Currencies',
        currencyCode: value.split(' ').pop()
      })),
      ...Object.entries(data.other_global_currencies || {}).map(([key, value]) => ({
        code: key,
        name: key.replace(/_/g, ' ').toUpperCase(),
        rate: parseFloat(value.split('=')[1].trim().split(' ')[0]),
        category: 'Other Global Currencies',
        currencyCode: value.split(' ').pop()
      }))
    ];
    return allRates;
  };

  // Fetch rates with transformed data
  const fetchRates = async () => {
    try {
      setIsRefreshing(true);
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/rate/conversion-rates`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      const transformedRates = transformCurrencyData(response.data);
      setConversionRates(transformedRates);
    } catch (error) {
      toast.error("Error fetching conversion rates");
    } finally {
      setIsRefreshing(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRates();
  }, [token]);

  const handleConversion = async (e) => {
    e.preventDefault();
    setIsConverting(true);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_URL}/rate/convert/${formData.amount}/${formData.currency}/to/afriton`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setConversionResult(response.data);
    } catch (error) {
      toast.error("Error converting currency");
    } finally {
      setIsConverting(false);
    }
  };

  // Filter rates based on search and add category grouping
  const filteredRates = conversionRates.filter(rate =>
    rate.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    rate.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Group rates by category
  const groupedRates = filteredRates.reduce((acc, rate) => {
    if (!acc[rate.category]) {
      acc[rate.category] = [];
    }
    acc[rate.category].push(rate);
    return acc;
  }, {});

  return (
    <div className="min-h-screen p-4 sm:p-6 md:p-8">
      <div className="md:max-w-8xl w-full mx-auto">
        <div className="relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl">
          <div className="absolute inset-0 bg-grid-gray-100/5 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] dark:[mask-image:linear-gradient(0deg,black,rgba(0,0,0,0.6))]" />
          
          <div className="relative flex flex-col lg:flex-row items-stretch">
            {/* Left Section - Conversion Form */}
            <div className="lg:w-1/2 p-8 lg:p-12 space-y-8">
              <div className="space-y-4">
                <h3 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Currency Exchange
                </h3>
                <p className="text-gray-600 dark:text-gray-400 text-lg">
                  Convert between different currencies with real-time exchange rates.
                </p>
              </div>

              <form onSubmit={handleConversion} className="space-y-6">
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

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      From Currency
                    </label>
                    <select
                      value={formData.currency}
                      onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                      className="w-full px-4 py-4 outline-none rounded-lg border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    >
                      {conversionRates.map((rate) => (
                        <option key={rate.code} value={rate.code}>
                          {rate.name}
                        </option>
                      ))}
                    </select>
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

                <button
                  type="submit"
                  disabled={isConverting || !formData.amount}
                  className="w-full relative group overflow-hidden rounded-xl px-4 py-3.5 
                    bg-gradient-to-r from-yellow-500 to-yellow-600 
                    text-white font-semibold transition-all duration-300 
                    hover:from-yellow-600 hover:to-yellow-700
                    disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="relative flex items-center justify-center gap-2">
                    {isConverting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Converting...</span>
                      </>
                    ) : (
                      <>
                        <ArrowRight className="w-5 h-5" />
                        <span>Convert Currency</span>
                      </>
                    )}
                  </div>
                </button>
              </form>
            </div>

            {/* Right Section - Rates List */}
            <div className="lg:w-1/2 p-8 lg:p-12 bg-gray-50 dark:bg-gray-900">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                    Current Exchange Rates
                  </h3>
                  <button
                    onClick={fetchRates}
                    disabled={isRefreshing}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
                  >
                    <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <input
                    type="text"
                    placeholder="Search currencies..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>

                {isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="w-8 h-8 animate-spin text-yellow-600" />
                  </div>
                ) : (
                  <div className="space-y-6 max-h-[600px] overflow-y-auto">
                    {Object.entries(groupedRates).map(([category, rates]) => (
                      <div key={category} className="space-y-2">
                        <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                          {category}
                        </h4>
                        {rates.map((rate) => (
                          <div
                            key={rate.code}
                            className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-yellow-100 dark:bg-yellow-900 flex items-center justify-center text-yellow-600 dark:text-yellow-400 font-bold">
                                {rate.code.slice(0, 2)}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {rate.name}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  1 AFT = {rate.rate} {rate.code.split('_')[0]}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ExchangeRate;