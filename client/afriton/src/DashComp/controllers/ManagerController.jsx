import React from 'react';
import { useApp } from '../../context/AppContext';
import HomePage from '../manager/HomePage';




import ManagerTransactionReport from '../manager/ManagerTransactionReport';
import ManagerCommissionOverview from '../manager/ManagerCommissionOverview';
import ManagerWallet from '../manager/ManagerWallet';
import ManagerTopCounts from '../manager/ManagerTopCounts';
import UserProfile from '../citizine/UserProfile';
import AgentManagement from '../manager/AgentManagement';

const ManagerController = () => {
  const { viewPanel } = useApp();

  return (
    <main className="flex-1 overflow-y-auto">
      {viewPanel === "dashboard" && <HomePage />}
      {viewPanel === "agent-overview" && <ManagerTopCounts />}
      {viewPanel === "manager-wallet" && <ManagerWallet />}
      {viewPanel === "manager-transactions" && <ManagerTransactionReport />}
      {viewPanel === "withdraw-commission" && <ManagerCommissionOverview />}
      {viewPanel === "profile" && <UserProfile />}
      {viewPanel === "user-role-management" && <AgentManagement />}
    </main>
  );
};

export default ManagerController;
