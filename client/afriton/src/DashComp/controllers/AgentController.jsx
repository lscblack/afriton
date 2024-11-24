import React from 'react'
import { useApp } from '../../context/AppContext';
import { HomePage } from '../agent/HomeAgent';
import DepositForm from '../agent/DepositForm';
import WithdrawRequest from '../agent/WithdrawRequest';
import UserProfile from '../citizine/UserProfile';
export const AgentController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel } = useApp();
  return (
    <>
       {viewPanel == "dashboard" && <HomePage/>}
       {viewPanel == "deposit" && <DepositForm/>}
       {viewPanel == "withdraw" && <WithdrawRequest/>}
       {viewPanel == "profile" && <UserProfile />}

    </>
  )
}
