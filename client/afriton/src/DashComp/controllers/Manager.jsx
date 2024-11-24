import React from 'react'
import { useApp } from '../../context/AppContext';
import UserProfile from '../citizine/UserProfile';
import { HomePage } from '../agent/HomeAgent';

export const Manager = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <HomePage />}
    {viewPanel == "profile" && <UserProfile />}
    </>
  )
}
