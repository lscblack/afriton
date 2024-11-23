import React, { useState } from 'react';
import { Eye, EyeOff, TrendingUp, Wallet, User,Users,Brain, Share2, Clock } from 'lucide-react';

const WalletCards = () => {
  const [showAllNumbers, setShowAllNumbers] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const formatAT = (amount) => {
    return `${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} AT`;
  };

  const cards = [
    {
      type: 'Saving',
      gradient: 'from-blue-600 to-blue-800',
      iconBg: 'bg-blue-500',
      balance: 245678.90,
      percentage: 45,
      accountNumber: '1234 5678 9012 3456',
      lastTransaction: '2 hours ago',
      owner: 'Sarah Johnson'
    },
    {
      type: 'Agent',
      gradient: 'from-emerald-600 to-emerald-800',
      iconBg: 'bg-emerald-500',
      balance: 127890.45,
      percentage: 25,
      accountNumber: '2345 6789 0123 4567',
      lastTransaction: '5 hours ago',
      owner: 'Michael Chen'
    },
    {
      type: 'Family',
      gradient: 'from-purple-600 to-purple-800',
      iconBg: 'bg-purple-500',
      balance: 98765.32,
      percentage: 20,
      accountNumber: '3456 7890 1234 5678',
      lastTransaction: '1 day ago',
      owner: 'David Smith'
    },
    {
      type: 'Manager',
      gradient: 'from-indigo-600 to-indigo-800',
      iconBg: 'bg-indigo-500',
      balance: 56789.10,
      percentage: 10,
      accountNumber: '4567 8901 2345 6789',
      lastTransaction: '3 days ago',
      owner: 'Emma Wilson'
    },
  ];

  const totalBalance = cards.reduce((sum, card) => sum + card.balance, 0);

  return (
    <div className="p-6 bg-gray-50 dark:bg-[#0c0a1f] rounded-lg mb-6">
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
          <div onClick={() => setShowAllNumbers(!showAllNumbers)} className="flex cursor-pointer items-center gap-4 px-6 py-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl text-white shadow-lg">
            <div>
              <p className="text-sm text-yellow-100">Total Balance</p>
              <p className="text-2xl font-bold">{showAllNumbers ? formatAT(totalBalance) : '****.**'}</p>
            </div>
            <button
              className="p-2 hover:bg-yellow-500/20 rounded-full transition-colors"
            >
              {showAllNumbers ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
          {cards.map((card, index) => (
            <div
              key={index}
              className="relative h-48 rounded-xl bg-gradient-to-r shadow-xl overflow-hidden
                cursor-pointer group"
              onMouseEnter={() => setSelectedCard(index)}
              onMouseLeave={() => setSelectedCard(null)}
            >
              {/* Main Card Content */}
              <div className={`absolute inset-0 bg-gradient-to-r ${card.gradient}
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
                          ? formatAT(card.balance)
                          : '****.**'
                        }
                      </p>
                    </div>
                    <div className={`${card.iconBg} p-2 rounded-lg shadow-lg`}>
                      <Wallet className="text-white" size={24} />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="text-gray-300 tracking-wider font-mono text-sm">
                      {(showAllNumbers || selectedCard === index)
                        ? card.accountNumber
                        : '•••• •••• •••• ' + card.accountNumber.slice(-4)}
                    </div>
                    <div className="flex justify-between items-center">
                      <h3 className="text-xl font-semibold text-white flex items-center gap-2">
                        <div className={`${card.iconBg} p-2 rounded-lg shadow-lg`}>
                          {card.type === 'Saving' ? <Wallet className="text-white" size={24} /> : card.type === 'Agent' ? <User className="text-white" size={24} /> : card.type === 'Family' ? <Users className="text-white" size={24} /> : <Brain className="text-white" size={24} />}
                        </div>
                        {card.type}
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
                      <p className="text-lg font-semibold mt-1">{card.owner}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        <p className="text-sm">Last Transaction</p>
                      </div>
                      <p className="text-lg font-semibold mt-1">{card.lastTransaction}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 hidden">
                    {['View Details', 'Share', 'Transfer'].map((action, i) => (
                      <button
                        key={i}
                        className="p-2 rounded-lg bg-white/10 hover:bg-white/20 
                          text-white text-sm font-medium transition-colors"
                      >
                        {action}
                      </button>
                    ))}
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

export default WalletCards;