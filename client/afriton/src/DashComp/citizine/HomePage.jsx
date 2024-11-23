
import React from 'react'
import CitizenMainBodyStart from '../sharedComps/CitizenMainBodyStart'
import CitizineCount from '../sharedComps/CitizineCount.jsx'
import { useApp } from '../../context/AppContext.jsx'

export const HomePage = () => {
    const {userInfo} = useApp()
  return (
    <>
    <div className='h-full overflow-y-auto'>
    <CitizineCount />
    {userInfo.is_wallet_active && <CitizenMainBodyStart />}
    </div>
    </>
  )
}
