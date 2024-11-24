import React from 'react'
import { useApp } from '../../context/AppContext';
import { HomePage } from '../citizine/HomePage';
import WalletActivationForm from '../sharedComps/WalletActivationForm';
import RateConversionOverview from '../citizine/ExchangeRate';
import UserWithdrawRequest from '../citizine/UserWithdrawRequest';
import UserTransfers from '../citizine/UserTransfers';
import MoneyFlow from '../citizine/MoneyFollow';


export const CitizenController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <HomePage />}
    {viewPanel == "wallets" && <WalletActivationForm />}
    {viewPanel == "rates" && <RateConversionOverview />}
    {viewPanel == "withdraw" && <UserWithdrawRequest />}
    {viewPanel == "transfers" && <UserTransfers />}
    {viewPanel == "money-flow" && <MoneyFlow />}
    </>
  )
}
