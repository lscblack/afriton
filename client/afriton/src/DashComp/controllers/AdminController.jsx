import React from 'react'
import { useApp } from '../../context/AppContext';

import UserProfile from '../citizine/UserProfile';
import AdminView from '../admin/AdminView';
import UserManagement from '../admin/UserManagement';
import WalletManagement from '../admin/WalletManagement';
import AgentManagement from '../manager/AgentManagement';
import SystemCommissionOverView from '../admin/SystemCommissionOverView';

export const AdminController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <><AdminView/></>}
    {viewPanel == "profile" && <UserProfile />}
    {viewPanel == "user-management" && <UserManagement/>}
    {viewPanel == "wallet-management" && <WalletManagement/>}
    {viewPanel == "system-commission-overview" && <SystemCommissionOverView/>}
    {viewPanel == "role-management" && <AgentManagement/>}
    </>
  )
}
