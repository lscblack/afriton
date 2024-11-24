
import React from 'react'
import CitizenMainBodyStart from '../sharedComps/CitizenMainBodyStart.jsx'
import CitizineCount from '../sharedComps/CitizineCount.jsx.jsx'
import { useApp } from '../../context/AppContext.jsx'
import AgentTopCounts from './AgentTopCounts.jsx'


export const HomePage = () => {
    const {userInfo} = useApp()
  return (
    <>
    <div className='h-full overflow-y-auto'>
    <AgentTopCounts/>
    </div>
    </>
  )
}
