// src/pages/doctor/DoctorDashboard.jsx - Updated to handle loading states
import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorDashboard = () => {
  const { 
    dToken, 
    dashData, 
    getDashData, 
    cancelAppointment, 
    completeAppointment, 
    slotDateFormat, 
    currency,
    appointmentsLoading 
  } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDashData()
    }
  }, [dToken])

  // Show loading state while data is being fetched
  if (appointmentsLoading) {
    return (
      <div className='m-5'>
        <div className='flex items-center justify-center h-64'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          <p className='ml-3 text-gray-600'>Loading dashboard data...</p>
        </div>
      </div>
    )
  }

  // Show message if no dashboard data is available
  if (!dashData) {
    return (
      <div className='m-5'>
        <div className='flex items-center justify-center h-64'>
          <div className='text-center'>
            <p className='text-gray-600 mb-4'>No dashboard data available</p>
            <button 
              onClick={() => getDashData()}
              className='bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600'
            >
              Refresh Dashboard
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.earning_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{currency} {dashData.earnings || 0}</p>
            <p className='text-gray-400'>Earnings</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments || 0}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt="" />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients || 0}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      <div className='bg-white'>
        <div className='flex items-center gap-2.5 px-4 py-4 mt-10 rounded-t border'>
          <img src={assets.list_icon} alt="" />
          <p className='font-semibold'>Latest Bookings</p>
        </div>

        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments && dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.slice(0, 5).map((item, index) => (
              <div className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100' key={index}>
                <img className='rounded-full w-10' src={item.userData.image} alt="" />
                <div className='flex-1 text-sm'>
                  <p className='text-gray-800 font-medium'>{item.userData.name}</p>
                  <p className='text-gray-600'>Booking on {slotDateFormat(item.slotDate)}</p>
                </div>
                {item.cancelled
                  ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                  : item.isCompleted
                    ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                    : <div className='flex'>
                      <img 
                        onClick={() => cancelAppointment(item._id)} 
                        className='w-10 cursor-pointer hover:scale-110 transition-transform' 
                        src={assets.cancel_icon} 
                        alt="Cancel appointment" 
                        title="Cancel appointment"
                      />
                      <img 
                        onClick={() => completeAppointment(item._id)} 
                        className='w-10 cursor-pointer hover:scale-110 transition-transform' 
                        src={assets.tick_icon} 
                        alt="Complete appointment" 
                        title="Mark as completed"
                      />
                    </div>
                }
              </div>
            ))
          ) : (
            <div className='px-6 py-8 text-center text-gray-500'>
              <p className='text-lg mb-2'>No appointments found</p>
              <p className='text-sm'>Your upcoming appointments will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Additional Statistics Section */}
      {dashData.upcoming !== undefined && (
        <div className='bg-white mt-6 rounded border'>
          <div className='px-4 py-3 border-b'>
            <h3 className='font-semibold text-gray-700'>Quick Stats</h3>
          </div>
          <div className='p-4'>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4'>
              <div className='text-center'>
                <p className='text-2xl font-bold text-blue-600'>{dashData.upcoming || 0}</p>
                <p className='text-sm text-gray-600'>Upcoming</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-green-600'>{dashData.completed || 0}</p>
                <p className='text-sm text-gray-600'>Completed</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-red-600'>{dashData.cancelled || 0}</p>
                <p className='text-sm text-gray-600'>Cancelled</p>
              </div>
              <div className='text-center'>
                <p className='text-2xl font-bold text-purple-600'>{dashData.patients || 0}</p>
                <p className='text-sm text-gray-600'>Total Patients</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorDashboard