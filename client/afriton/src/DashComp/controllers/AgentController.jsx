import React from 'react'
import { useApp } from '../../context/AppContext';
export const AgentController = () => {
  const { userInfo,viewUser, setViewUser } = useApp();
  return (
    <div>AgentController</div>
  )
}
