// src/components/doctor/Sidebar.jsx
import React from 'react'
import { assets } from '../../assets/assets'
import { NavLink } from 'react-router-dom'

const DoctorSidebar = () => {
  return (
    <div className='min-h-screen bg-white border-r'>
      <ul className='text-[#515151] mt-5'>
        <NavLink 
          to='/dashboard' 
          className={({ isActive }) => 
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : 'hover:bg-gray-50'
            }`
          }
        >
          <img className='min-w-5' src={assets.home_icon} alt='' />
          <p className='hidden md:block'>Dashboard</p>
        </NavLink>
        
        <NavLink 
          to='/appointments' 
          className={({ isActive }) => 
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : 'hover:bg-gray-50'
            }`
          }
        >
          <img className='min-w-5' src={assets.appointment_icon} alt='' />
          <p className='hidden md:block'>Appointments</p>
        </NavLink>
        
        <NavLink 
          to='/profile' 
          className={({ isActive }) => 
            `flex items-center gap-3 py-3.5 px-3 md:px-9 md:min-w-72 cursor-pointer ${
              isActive ? 'bg-[#F2F3FF] border-r-4 border-primary' : 'hover:bg-gray-50'
            }`
          }
        >
          <img className='min-w-5' src={assets.people_icon} alt='' />
          <p className='hidden md:block'>Profile</p>
        </NavLink>
      </ul>
    </div>
  )
}

export default DoctorSidebar