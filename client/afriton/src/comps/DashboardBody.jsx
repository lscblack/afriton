import React, { useState } from 'react';

const DashboardContent = ({ selectedMenu }) => {
  const renderContent = () => {
    switch (selectedMenu) {
      case 'User Account Management':
        return <div>User Account Management Dashboard Content</div>;
      case 'Savings Management':
        return <div>Savings Management Dashboard Content</div>;
      case 'Agents Management':
        return <div>Agents Management Dashboard Content</div>;
      case 'Managers Management':
        return <div>Managers Management Dashboard Content</div>;
      case 'Business Management':
        return <div>Business Management Dashboard Content</div>;
      case 'Easy Deposits':
        return <div>Easy Deposits Content</div>;
      case 'Quick Withdrawals':
        return <div>Quick Withdrawals Content</div>;
      case 'Verify Fingerprint':
        return <div>Verify Fingerprint Content</div>;
      case 'Cross Border Payments':
        return (
          <div>
            <h1>Cross Border Payments</h1>
            <p>Send money seamlessly to any Afriton user across Africa with minimal fees and instant processing.</p>
          </div>
        );
      case 'Banking Services':
        return (
          <div>
            <h1>Banking Services</h1>
            <p>Comprehensive banking solutions including deposits, withdrawals, and account management.</p>
          </div>
        );
      case 'Money Flow Control':
        return (
          <div>
            <h1>Money Flow Control</h1>
            <p>Take full control of your finances with advanced money management tools and tracking.</p>
          </div>
        );
      case 'Multi-Channel Access':
        return (
          <div>
            <h1>Multi-Channel Access</h1>
            <p>Access your account through fingerprint, card, mobile app, or USSD banking options.</p>
          </div>
        );
      default:
        return <div>Welcome to the Dashboard!</div>;
    }
  };

  return (
    <div className="p-6 bg-gray-100 h-screen overflow-y-auto">
      {renderContent()}
    </div>
  );
};

export default DashboardContent;
