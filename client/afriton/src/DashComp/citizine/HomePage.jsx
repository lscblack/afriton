
import React from 'react'
import CitizenMainBodyStart from '../sharedComps/CitizenMainBodyStart'
import CitizineCount from '../sharedComps/CitizineCount.jsx'

export const HomePage = () => {
  return (
    <>
    <div className='h-full overflow-y-auto'>
    <CitizineCount />
    <CitizenMainBodyStart />
    </div>
    </>
  )
}
