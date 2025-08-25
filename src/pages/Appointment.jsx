
import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'   // ⬅ added useNavigate
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'
import RelatedDoctors from '../components/RelatedDoctors'

const Appointment = () => {
    const navigate = useNavigate()
    const { docId } = useParams()
    const { doctors, currencySymbol } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(null)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSlots = async () => {
        setDocSlots([])
        let today = new Date()
        for (let i = 0; i < 7; i++) {
            let currentDate = new Date(today)
            currentDate.setDate(today.getDate() + i)
            let endTime = new Date()
            endTime.setDate(today.getDate() + i)
            endTime.setHours(21, 0, 0, 0)

            if (today.getDate() === currentDate.getDate()) {
                currentDate.setHours(currentDate.getHours() > 10 ? currentDate.getHours() + 1 : 10)
                currentDate.setMinutes(currentDate.getMinutes() > 30 ? 30 : 0)
            } else {
                currentDate.setHours(10)
                currentDate.setMinutes(0)
            }

            let timeSlots = []
            while (currentDate < endTime) {
                let formattedTime = currentDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                timeSlots.push({
                    datetime: new Date(currentDate),
                    time: formattedTime
                })
                currentDate.setMinutes(currentDate.getMinutes() + 30)
            }
            setDocSlots(prev => ([...prev, timeSlots]))
        }
    }

    const bookAppointment = async () => {
        const date = docSlots[slotIndex][0].datetime
        let day = date.getDate()
        let month = date.getMonth() + 1
        let year = date.getFullYear()
        const slotDate = `${day}_${month}_${year}`
        console.log(slotDate, slotTime)
    }

    useEffect(() => {
        if (doctors.length > 0) {
            fetchDocInfo()
        }
    }, [doctors, docId])

    useEffect(() => {
        if (docInfo) {
            getAvailableSlots()
        }
    }, [docInfo])

    return docInfo ? (
        <div>
            {/* ---------- Back Button ----------- */}
          <button 
  onClick={() => navigate('/doctors')} 
  className="flex items-center gap-2 text-indigo-600 hover:text-indigo-800 font-semibold mb-6 transition-colors"
>
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" 
       strokeWidth={3} stroke="currentColor" className="w-6 h-6">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
  Back
</button>


            {/* ---------- Doctor Details ----------- */}
           <div className="flex flex-col sm:flex-row gap-6 bg-white rounded-2xl shadow-md p-6">
  <img 
      className="rounded-lg object-cover shadow max-h-72" 
      src={docInfo.image} 
      alt={docInfo.name} 
    />
  
  <div className="flex-1">
    <p className="flex items-center gap-2 text-2xl font-bold text-gray-900">
      {docInfo.name}
      <img className="w-5" src={assets.verified_icon} alt="" />
    </p>

    <div className="flex items-center gap-2 text-sm mt-2 text-gray-600">
      <p>{docInfo.degree} – {docInfo.speciality}</p>
      <span className="py-1 px-3 border text-xs rounded-full bg-indigo-50 text-indigo-600">
        {docInfo.experience}
      </span>
    </div>

    <div className="mt-4">
      <p className="flex items-center gap-1 text-sm font-semibold text-gray-900">
        About <img className="w-3" src={assets.info_icon} alt="" />
      </p>
      <p className="text-sm text-gray-600 leading-relaxed mt-1">{docInfo.about}</p>
    </div>

    <p className="text-gray-700 font-medium mt-6">
      Appointment fee: <span className="text-indigo-600 font-semibold">{currencySymbol}{docInfo.fees}</span>
    </p>
  </div>
</div>


            {/* Booking slots */}
           <div className="mt-8">
  <p className="text-lg font-semibold text-gray-800">Available Slots</p>

  {/* Days */}
  <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
    {docSlots.length && docSlots.map((item, index) => (
      <div
        key={index}
        onClick={() => setSlotIndex(index)}
        className={`flex flex-col items-center justify-center px-4 py-3 min-w-[70px] rounded-xl cursor-pointer transition 
          ${slotIndex === index ? 'bg-indigo-600 text-white shadow-md' : 'border border-gray-300 text-gray-600 hover:bg-gray-50'}`}
      >
        <p className="text-sm font-semibold">{daysOfWeek[item[0]?.datetime.getDay()]}</p>
        <p className="text-lg">{item[0]?.datetime.getDate()}</p>
      </div>
    ))}
  </div>

  {/* Times */}
  <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
    {docSlots.length && docSlots[slotIndex].map((item, index) => (
      <p
        key={index}
        onClick={() => setSlotTime(item.time)}
        className={`text-sm flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition 
          ${item.time === slotTime ? 'bg-indigo-600 text-white shadow-sm' : 'border border-gray-300 text-gray-600 hover:bg-gray-100'}`}
      >
        {item.time.toLowerCase()}
      </p>
    ))}
  </div>

  {/* Button */}
  <button
    onClick={bookAppointment}
    className="bg-indigo-600 hover:bg-indigo-700 transition text-white text-sm font-semibold px-10 py-3 rounded-full mt-6 shadow-md"
  >
    Book Appointment
  </button>
</div>


            {/* Listing Related Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : null
}

export default Appointment


