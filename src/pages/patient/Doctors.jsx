
import React, { useContext, useEffect, useState } from 'react'
import { AppContext } from '../../context/AppContext'
import { useNavigate, useParams } from 'react-router-dom'

const Doctors = () => {
  const { speciality } = useParams()
  const [filterDoc, setFilterDoc] = useState([])
  const navigate = useNavigate();

  const { doctors } = useContext(AppContext)

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
  }

  useEffect(() => {
    applyFilter()
  }, [doctors, speciality])

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <p className="text-2xl md:text-3xl font-bold text-gray-800">
          Browse through the <span className="text-indigo-600">doctor specialists</span>
        </p>

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

      {/* Doctors Grid */}
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
              />
            </div>

            {/* Doctor Info */}
            <div className="p-5 text-center">
              <div className="flex justify-center items-center gap-2 text-green-600 text-sm mb-2">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> <p>Available</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">{item.name}</p>
              <p className="text-sm text-gray-500">{item.speciality}</p>

              <button 
                onClick={(e) => { e.stopPropagation(); navigate(`/appointment/${item._id}`) }}
                className="mt-4 px-5 py-2 bg-indigo-600 text-white text-sm rounded-full hover:bg-indigo-700 transition-all"
              >
                Book Appointment
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Doctors
