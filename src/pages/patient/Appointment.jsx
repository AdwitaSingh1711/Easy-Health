// src/pages/patient/Appointment.jsx
import React, { useContext, useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { AppContext } from '../../context/AppContext'
import { assets } from '../../assets/assets'
import RelatedDoctors from '../../components/RelatedDoctors'
import { apiService } from '../../services/api'

const Appointment = () => {
    const navigate = useNavigate()
    const { docId } = useParams()
    const { doctors, currencySymbol, isAuthenticated } = useContext(AppContext)
    const daysOfWeek = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT']

    const [docInfo, setDocInfo] = useState(null)
    const [docSlots, setDocSlots] = useState([])
    const [slotIndex, setSlotIndex] = useState(0)
    const [slotTime, setSlotTime] = useState('')
    const [isBooking, setIsBooking] = useState(false)
    const [bookingMessage, setBookingMessage] = useState('')
    const [error, setError] = useState('')
    const [reason, setReason] = useState('')

    const fetchDocInfo = async () => {
        const docInfo = doctors.find((doc) => doc._id === docId)
        setDocInfo(docInfo)
    }

    const getAvailableSlots = async () => {
        if (!docInfo) return;
        
        // If this is a dummy doctor, generate mock slots
        if (!docInfo.isReal) {
            generateMockSlots();
            return;
        }
        
        try {
            setDocSlots([])
            let today = new Date()
            
            // Generate slots for the next 7 days
            for (let i = 0; i < 7; i++) {
                let currentDate = new Date(today)
                currentDate.setDate(today.getDate() + i)
                
                // Format date as YYYY-MM-DD for the API call
                const dateStr = currentDate.toISOString().split('T')[0]
                
                try {
                    const response = await apiService.getAvailableSlots(docId, dateStr)
                    const timeSlots = response.availableSlots.map(slot => ({
                        datetime: new Date(slot.datetime),
                        time: slot.time
                    }))
                    
                    setDocSlots(prev => ([...prev, timeSlots]))
                } catch (error) {
                    console.error(`Failed to fetch slots for ${dateStr}:`, error)
                    // Add empty array for this day if API call fails
                    setDocSlots(prev => ([...prev, []]))
                }
            }
        } catch (error) {
            console.error('Failed to fetch available slots:', error)
            setError('Failed to load available time slots')
        }
    }

    // Generate mock slots for dummy doctors
    const generateMockSlots = () => {
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
        if (!isAuthenticated) {
            navigate('/login')
            return
        }

        if (!slotTime || !docSlots[slotIndex] || docSlots[slotIndex].length === 0) {
            setError('Please select a date and time slot')
            return
        }

        setIsBooking(true)
        setError('')
        setBookingMessage('')

        try {
            // If this is a dummy doctor, show demo message
            if (!docInfo.isReal) {
                setBookingMessage('Demo booking successful! This is a demo doctor. In real implementation, this would book an actual appointment.')
                
                // Reset selections
                setSlotTime('')
                setSlotIndex(0)
                setReason('')
                
                setTimeout(() => {
                    setBookingMessage('')
                }, 5000)
                
                return
            }

            // Find the selected slot
            const selectedSlot = docSlots[slotIndex].find(slot => slot.time === slotTime)
            if (!selectedSlot) {
                setError('Selected time slot is not available')
                return
            }

            const selectedDate = selectedSlot.datetime
            const day = selectedDate.getDate()
            const month = selectedDate.getMonth() + 1
            const year = selectedDate.getFullYear()
            const slotDate = `${day}_${month}_${year}`

            const appointmentData = {
                providerId: docId, // Use providerId as expected by backend
                slotDate: slotDate,
                slotTime: slotTime,
                reason: reason.trim() || null
            }

            console.log('Booking appointment with data:', appointmentData)

            const response = await apiService.bookAppointment(appointmentData)
            
            setBookingMessage('Appointment booked successfully!')
            
            // Reset selections
            setSlotTime('')
            setSlotIndex(0)
            setReason('')
            
            // Refresh available slots
            await getAvailableSlots()
            
            // Redirect to appointments page after 2 seconds
            setTimeout(() => {
                navigate('/my-appointments')
            }, 2000)

        } catch (error) {
            console.error('Booking failed:', error)
            
            // Handle specific error messages
            if (error.message === 'slot_already_booked') {
                setError('This slot is already booked. Please select another time.')
            } else if (error.message === 'cannot_book_past_slot') {
                setError('Cannot book appointments in the past.')
            } else if (error.message === 'provider_not_found') {
                setError('Doctor not found. Please try again.')
            } else if (error.message === 'missing_required_fields') {
                setError('Please fill in all required fields.')
            } else {
                setError(error.message || 'Failed to book appointment. Please try again.')
            }
        } finally {
            setIsBooking(false)
        }
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

            {/* Success/Error Messages */}
            {bookingMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-green-600 font-semibold">{bookingMessage}</p>
                </div>
            )}
            
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-red-600">{error}</p>
                    <button 
                        onClick={() => setError('')}
                        className="text-red-500 hover:text-red-700 underline text-sm mt-1"
                    >
                        Dismiss
                    </button>
                </div>
            )}

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

            {/* Reason for visit */}
            <div className="mt-8 bg-white rounded-2xl shadow-md p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-2">
                    Reason for Visit (Optional)
                </label>
                <textarea
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Please describe your symptoms or reason for the visit..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    rows={3}
                    maxLength={500}
                />
                <p className="text-sm text-gray-500 mt-1">{reason.length}/500 characters</p>
            </div>

            {/* Booking slots */}
            <div className="mt-8">
                <p className="text-lg font-semibold text-gray-800">Available Slots</p>

                {docSlots.length === 0 ? (
                    <div className="mt-4 p-6 bg-gray-50 rounded-lg text-center">
                        <p className="text-gray-600">Loading available slots...</p>
                    </div>
                ) : (
                    <>
                        {/* Days */}
                        <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                            {docSlots.map((item, index) => {
                                const hasSlots = item && item.length > 0;
                                const date = new Date();
                                date.setDate(date.getDate() + index);
                                
                                return (
                                    <div
                                        key={index}
                                        onClick={() => {
                                            if (hasSlots) {
                                                setSlotIndex(index);
                                                setSlotTime(''); // Reset time when changing date
                                                setError(''); // Clear any previous errors
                                            }
                                        }}
                                        className={`flex flex-col items-center justify-center px-4 py-3 min-w-[70px] rounded-xl transition ${
                                            !hasSlots 
                                                ? 'border border-gray-200 text-gray-400 cursor-not-allowed bg-gray-50'
                                                : slotIndex === index 
                                                    ? 'bg-indigo-600 text-white shadow-md cursor-pointer' 
                                                    : 'border border-gray-300 text-gray-600 hover:bg-gray-50 cursor-pointer'
                                        }`}
                                    >
                                        <p className="text-sm font-semibold">{daysOfWeek[date.getDay()]}</p>
                                        <p className="text-lg">{date.getDate()}</p>
                                        {!hasSlots && <p className="text-xs mt-1">No slots</p>}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Times */}
                        <div className="flex gap-3 overflow-x-auto mt-4 pb-2">
                            {docSlots[slotIndex] && docSlots[slotIndex].length > 0 ? (
                                docSlots[slotIndex].map((item, index) => (
                                    <p
                                        key={index}
                                        onClick={() => {
                                            setSlotTime(item.time);
                                            setError(''); // Clear any previous errors
                                        }}
                                        className={`text-sm flex-shrink-0 px-5 py-2 rounded-full cursor-pointer transition ${
                                            item.time === slotTime 
                                                ? 'bg-indigo-600 text-white shadow-sm' 
                                                : 'border border-gray-300 text-gray-600 hover:bg-gray-100'
                                        }`}
                                    >
                                        {item.time}
                                    </p>
                                ))
                            ) : (
                                <div className="w-full text-center py-4 text-gray-500">
                                    No available time slots for this date
                                </div>
                            )}
                        </div>
                    </>
                )}

                {/* Book Button */}
                <button
                    onClick={bookAppointment}
                    disabled={isBooking || !slotTime || docSlots.length === 0}
                    className={`text-white text-sm font-semibold px-10 py-3 rounded-full mt-6 shadow-md transition ${
                        isBooking || !slotTime || docSlots.length === 0
                            ? 'bg-gray-400 cursor-not-allowed'
                            : 'bg-indigo-600 hover:bg-indigo-700'
                    }`}
                >
                    {isBooking ? 'Booking...' : 'Book Appointment'}
                </button>

                {!isAuthenticated && (
                    <p className="text-sm text-gray-600 mt-2">
                        Please <span 
                            onClick={() => navigate('/login')} 
                            className="text-indigo-600 cursor-pointer hover:underline"
                        >
                            login
                        </span> to book an appointment.
                    </p>
                )}
            </div>

            {/* Listing Related Doctors */}
            <RelatedDoctors speciality={docInfo.speciality} docId={docId} />
        </div>
    ) : (
        <div className="min-h-[60vh] flex items-center justify-center">
            <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                <p className="mt-2 text-gray-600">Loading doctor information...</p>
            </div>
        </div>
    )
}

export default Appointment