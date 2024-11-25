const fetchWallets = async () => {
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

    const walletDetails = response.data?.wallet_details || [];
    
    // Fetch last transaction for each wallet
    const transactionPromises = walletDetails.map(wallet => 
      fetchLastTransaction(wallet.account_id, wallet.wallet_type)
    );
    const transactions = await Promise.all(transactionPromises);
    
    const transformedWallets = walletDetails.map((wallet, index) => {
      // Rest of the transformation code...
    });

    setWallets(transformedWallets);
    setLoading(false);
  } catch (err) {
    console.error('Wallet fetch error:', err);
    setError(err.response?.data?.detail || err.message || 'Failed to fetch wallets');
    setLoading(false);
  }
}; 