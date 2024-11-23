import React from 'react'
import { useApp } from '../../context/AppContext';
import { HomePage } from '../citizine/HomePage';


export const CitizenController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <HomePage />}
    </>
  )
}
