import React from 'react'
import { useApp } from '../../context/AppContext';
import { HomePage } from '../citizine/HomePage';
import WalletActivationForm from '../sharedComps/WalletActivationForm';


export const CitizenController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <HomePage />}
    {viewPanel == "wallets" && <WalletActivationForm />}
    </>
  )
}
