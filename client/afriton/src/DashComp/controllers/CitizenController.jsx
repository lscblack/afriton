import React from 'react'
import { useApp } from '../../context/AppContext';
import WalletCards from '../CitizineCount.jsx';

export const CitizenController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <WalletCards />}
    </>
  )
}
