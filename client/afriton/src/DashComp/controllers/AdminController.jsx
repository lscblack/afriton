import React from 'react'
import { useApp } from '../../context/AppContext';
import { AdminMainBodyStart } from '../sharedComps/AdminMainBodyStart';
import { AdminCount } from '../sharedComps/AdminCount';

export const AdminController = () => {
  const { userInfo,viewUser, setViewUser,viewPanel, setViewPanel } = useApp();
  return (
    <>
    {viewPanel == "dashboard" && <><AdminCount /><AdminMainBodyStart /></>}
    
    </>
  )
}
