import React from 'react'
import { useApp } from '../../context/AppContext';
import { HomePage } from '../agent/HomeAgent';
import DepositForm from '../agent/DepositForm';
import WithdrawRequest from '../agent/WithdrawRequest';
import UserProfile from '../citizine/UserProfile';
import CommissionOverview from '../agent/CommissionOverview';
import AgentTransactionReport from '../agent/AgentTransactionReport';
import AgentWallet from '../agent/AgentWallet';

export const AgentController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel } = useApp();
  return (
    <>
       {viewPanel == "dashboard" && <HomePage/>}
       {viewPanel == "deposit" && <DepositForm/>}
       {viewPanel == "withdraw" && <WithdrawRequest/>}
       {viewPanel == "profile" && <UserProfile />}
       {viewPanel == "commission" && <CommissionOverview/>}
       {viewPanel == "agent-transactions" && <AgentTransactionReport/>}
       {viewPanel == "agent-wallets" && <AgentWallet/>}
    </>
  )
}
