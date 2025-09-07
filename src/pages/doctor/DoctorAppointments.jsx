// src/pages/doctor/DoctorAppointments.jsx - Updated to use real API data
import React, { useContext, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'

const DoctorAppointments = () => {
  const { 
    dToken, 
    appointments, 
    getDoctorAppointments, 
    cancelAppointment, 
    completeAppointment, 
    slotDateFormat, 
    calculateAge, 
    currency,
    appointmentsLoading 
  } = useContext(AppContext)

  useEffect(() => {
    if (dToken) {
      getDoctorAppointments()
    }
  }, [dToken])

  // Show loading state
  if (appointmentsLoading) {
    return (
      <div className='w-full max-w-6xl m-5'>
        <p className='mb-3 text-lg font-medium'>All Appointments</p>
        <div className='flex items-center justify-center h-64 bg-white border rounded'>
          <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500'></div>
          <p className='ml-3 text-gray-600'>Loading appointments...</p>
        </div>
      </div>
    )
  }

  return (
    <div className='w-full max-w-6xl m-5'>
      <div className='flex items-center justify-between mb-3'>
        <p className='text-lg font-medium'>All Appointments</p>
        <button 
          onClick={() => getDoctorAppointments()}
          className='bg-blue-500 text-white px-4 py-2 rounded text-sm hover:bg-blue-600 transition-colors'
        >
          Refresh
        </button>
      </div>

      <div className='bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll'>
        <div className='max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 py-3 px-6 border-b'>
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments && appointments.length > 0 ? (
          appointments.map((item, index) => (
            <div className='flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_1fr_3fr_1fr_1fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50' key={item._id || index}>
              <p className='max-sm:hidden'>{index + 1}</p>
              <div className='flex items-center gap-2'>
                
                <div>
                  <p className='font-medium text-gray-800'>{item.userData.name}</p>
                  <p className='text-xs text-gray-500'>{item.userData.email}</p>
                </div>
              </div>
              <div>
                <p className='text-xs inline border border-primary px-2 rounded-full'>
                  {item.payment ? 'Online' : 'CASH'}
                </p>
              </div>
              <p className='max-sm:hidden'>
                {item.userData.age || calculateAge(item.userData.dob)}
              </p>
              <div>
                <p className='font-medium'>{slotDateFormat(item.slotDate)}</p>
                <p className='text-xs text-gray-500'>{item.slotTime}</p>
              </div>
              <p className='font-semibold text-gray-800'>{currency}{item.amount}</p>
              <div className='flex items-center justify-center'>
                {item.cancelled
                  ? <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                  : item.isCompleted
                    ? <p className='text-green-500 text-xs font-medium'>Completed</p>
                    : <div className='flex gap-1'>
                      <img 
                        onClick={() => cancelAppointment(item._id)} 
                        className='w-8 h-8 cursor-pointer hover:scale-110 transition-transform' 
                        src={assets.cancel_icon} 
                        alt="Cancel" 
                        title="Cancel appointment"
                      />
                      <img 
                        onClick={() => completeAppointment(item._id)} 
                        className='w-8 h-8 cursor-pointer hover:scale-110 transition-transform' 
                        src={assets.tick_icon} 
                        alt="Complete" 
                        title="Mark as completed"
                      />
                    </div>
                }
              </div>
            </div>
          ))
        ) : (
          <div className='px-6 py-12 text-center text-gray-500'>
            <div className='mb-4'>
              <img 
                src={assets.appointments_icon || 'https://via.placeholder.com/64/E5E7EB/9CA3AF?Text=📅'} 
                alt="No appointments" 
                className='w-16 h-16 mx-auto opacity-50'
              />
            </div>
            <p className='text-lg mb-2'>No appointments found</p>
            <p className='text-sm'>Patient appointments will appear here once they book with you</p>
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {appointments && appointments.length > 0 && (
        <div className='mt-4 bg-white border rounded p-4'>
          <h3 className='font-medium mb-3 text-gray-700'>Appointment Summary</h3>
          <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
            <div className='text-center p-3 bg-gray-50 rounded'>
              <p className='text-xl font-bold text-gray-800'>{appointments.length}</p>
              <p className='text-gray-600'>Total</p>
            </div>
            <div className='text-center p-3 bg-green-50 rounded'>
              <p className='text-xl font-bold text-green-600'>
                {appointments.filter(apt => apt.isCompleted).length}
              </p>
              <p className='text-gray-600'>Completed</p>
            </div>
            <div className='text-center p-3 bg-yellow-50 rounded'>
              <p className='text-xl font-bold text-yellow-600'>
                {appointments.filter(apt => !apt.cancelled && !apt.isCompleted).length}
              </p>
              <p className='text-gray-600'>Pending</p>
            </div>
            <div className='text-center p-3 bg-red-50 rounded'>
              <p className='text-xl font-bold text-red-600'>
                {appointments.filter(apt => apt.cancelled).length}
              </p>
              <p className='text-gray-600'>Cancelled</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default DoctorAppointments