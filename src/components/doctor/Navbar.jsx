// src/components/doctor/Navbar.jsx
import React, { useContext } from 'react'
import { useNavigate } from 'react-router-dom'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const DoctorNavbar = () => {
  const navigate = useNavigate()
  const { logout, profileData, user } = useContext(AppContext)
  
  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className='flex justify-between items-center px-4 sm:px-10 py-3 border-b bg-white'>
      <div className='flex items-center gap-2 text-xs'>
        <img className='w-36 sm:w-40 cursor-pointer' src={assets.admin_logo || assets.logo} alt="" />
        <p className='border px-2.5 py-0.5 rounded-full border-gray-500 text-gray-600'>Doctor Dashboard</p>
      </div>
      <div className='flex items-center gap-4'>
        <p className='text-gray-600'>Welcome, {user?.name || profileData?.name || 'Doctor'}</p>
        <button 
          onClick={handleLogout}
          className='bg-red-500 hover:bg-red-600 text-white text-sm px-6 py-2 rounded-full transition-colors'
        >
          Logout
        </button>
      </div>
    </div>
  )
}

export default DoctorNavbar