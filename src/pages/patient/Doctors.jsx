// src/pages/patient/Doctors.jsx
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate();

  const { doctors, fetchDoctors } = useContext(AppContext)

  const specializations = [
    'All Doctors',
    'General physician',
    'Gynecologist',
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ]

  const applyFilter = () => {
    if (speciality) {
      setFilterDoc(doctors.filter(doc => doc.speciality === speciality))
    } else {
      setFilterDoc(doctors)
    }
    setLoading(false)
  }

  useEffect(() => {
    // Refresh doctors list when component mounts
    if (fetchDoctors) {
      fetchDoctors()
    }
  }, [])

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  if (loading && doctors.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-6">
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading doctors...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <p className="text-2xl md:text-3xl font-bold text-gray-800">
            Browse through the <span className="text-indigo-600">doctor specialists</span>
          </p>
          <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-700">
              <span className="font-medium">💡 Note:</span> Doctors marked as "Demo" are sample profiles for demonstration. 
              Real registered doctors can accept actual bookings.
            </p>
          </div>
        </div>

        {/* Dropdown filter */}
        <div className="relative w-52">
          <select
            value={speciality || 'All Doctors'}
            onChange={(e) => {
              if (e.target.value === 'All Doctors') {
                navigate('/doctors')
              } else {
                navigate(`/doctors/${e.target.value}`)
              }
            }}
            className="appearance-none w-full px-5 py-2.5 pr-10 border border-gray-300 rounded-full shadow-md text-gray-700 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 cursor-pointer transition-all duration-300"
          >
            {specializations.map((spec, i) => (
              <option key={i} value={spec} className="text-gray-700">
                {spec}
              </option>
            ))}
          </select>

          {/* Custom dropdown arrow (SVG) */}
          <div className="pointer-events-none absolute inset-y-0 right-4 flex items-center">
            <svg
              className="w-5 h-5 text-gray-500"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
      </div>

      {/* No doctors found */}
      {filterDoc.length === 0 && !loading && (
        <div className="text-center py-16">
          <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {speciality ? `No ${speciality}s found` : 'No doctors found'}
          </h3>
          <p className="text-gray-600 mb-6">
            {speciality 
              ? `We don't have any ${speciality}s available right now. Try browsing all doctors.`
              : 'No doctors are currently available. Please try again later.'
            }
          </p>
          {speciality && (
            <button 
              onClick={() => navigate('/doctors')}
              className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition"
            >
              View All Doctors
            </button>
          )}
        </div>
      )}

      {/* Doctors Grid */}
      {filterDoc.length > 0 && (
        <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {filterDoc.map((item, index) => (
            <div 
              onClick={() => { navigate(`/appointment/${item._id}`); window.scrollTo(0, 0) }} 
              key={index}
              className="bg-white rounded-2xl overflow-hidden cursor-pointer shadow-md hover:shadow-2xl hover:-translate-y-2 transition-all duration-500"
            >
              {/* Doctor Image */}
              <div className="relative bg-gradient-to-br from-indigo-50 to-blue-50 flex justify-center items-center p-6">
                <img 
                  className="w-32 h-32 object-cover rounded-full border-4 border-white shadow-md" 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    // Fallback to placeholder if image fails to load
                    e.target.src = `https://via.placeholder.com/150/4F46E5/FFFFFF?text=${encodeURIComponent(item.name.substring(0, 2))}`
                  }}
                />
              </div>

              {/* Doctor Info */}
              <div className="p-5 text-center">
                <div className="flex justify-center items-center gap-2 text-green-600 text-sm mb-2">
                  <span className="w-2 h-2 bg-green-500 rounded-full"></span> 
                  <p>Available</p>
                  {!item.isReal && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-600 text-xs rounded-full">
                      Demo
                    </span>
                  )}
                </div>
                <p className="text-lg font-semibold text-gray-800">{item.name}</p>
                <p className="text-sm text-gray-500 mb-1">{item.speciality}</p>
                
                {item.experience && (
                  <p className="text-xs text-gray-400 mb-2">{item.experience}</p>
                )}
                
                {item.fees && (
                  <p className="text-sm font-medium text-indigo-600 mb-3">
                    ${item.fees} per consultation
                  </p>
                )}

                <button 
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    navigate(`/appointment/${item._id}`) 
                  }}
                  className="w-full mt-4 px-5 py-2 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition-all"
                >
                  {item.isReal ? 'Book Appointment' : 'Try Demo Booking'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Refresh Button */}
      <div className="mt-12 text-center">
        <button 
          onClick={() => {
            if (fetchDoctors) {
              setLoading(true)
              fetchDoctors()
            }
          }}
          className="px-6 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
        >
          <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Refresh Doctors
        </button>
      </div>
    </div>
  )
}

export default Doctors