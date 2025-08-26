// src/pages/MyAppointments.jsx
import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'
import { apiService } from '../../services/api'
import { useNavigate } from 'react-router-dom'

const MyAppointments = () => {
    const navigate = useNavigate()
    const { currencySymbol } = useContext(AppContext)
    const [appointments, setAppointments] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [cancellingId, setCancellingId] = useState(null)

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments()
    }, [])

    const fetchAppointments = async () => {
        try {
            setLoading(true)
            setError('')
            const response = await apiService.getMyAppointments()
            setAppointments(response.appointments || [])
        } catch (error) {
            console.error('Failed to fetch appointments:', error)
            setError('Failed to load appointments. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const cancelAppointment = async (appointmentId) => {
        if (!confirm('Are you sure you want to cancel this appointment?')) {
            return
        }

        try {
            setCancellingId(appointmentId)
            await apiService.cancelAppointment(appointmentId)
            
            // Update the appointment status in the local state
            setAppointments(appointments.map(appointment => 
                appointment.id === appointmentId 
                    ? { ...appointment, status: 'cancelled' }
                    : appointment
            ))
            
            alert('Appointment cancelled successfully')
        } catch (error) {
            console.error('Failed to cancel appointment:', error)
            alert('Failed to cancel appointment. Please try again.')
        } finally {
            setCancellingId(null)
        }
    }

    const formatDate = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    const formatTime = (dateString) => {
        const date = new Date(dateString)
        return date.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        })
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'booked':
                return 'text-green-600 bg-green-50 border-green-200'
            case 'cancelled':
                return 'text-red-600 bg-red-50 border-red-200'
            case 'completed':
                return 'text-blue-600 bg-blue-50 border-blue-200'
            default:
                return 'text-gray-600 bg-gray-50 border-gray-200'
        }
    }

    const isUpcoming = (dateString) => {
        return new Date(dateString) > new Date()
    }

    if (loading) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading appointments...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Unable to load appointments</h3>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button 
                        onClick={fetchAppointments}
                        className="px-6 py-2 bg-primary text-white rounded-full hover:bg-primary/90 transition"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center pb-3 mt-12 border-b">
                <h1 className="text-2xl font-semibold text-zinc-800">My Appointments</h1>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {appointments.length} appointment{appointments.length !== 1 ? 's' : ''}
                </span>
            </div>
            
            {appointments.length === 0 ? (
                <div className="text-center py-16">
                    <div className="w-20 h-20 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3m6 4V3m-6 4h6m-6 0L4 7a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2l-6 0" />
                        </svg>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">No appointments yet</h3>
                    <p className="text-gray-600 mb-6">You haven't booked any appointments. Start by finding a doctor that suits your needs.</p>
                    <button 
                        onClick={() => navigate('/doctors')}
                        className="px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition"
                    >
                        Browse Doctors
                    </button>
                </div>
            ) : (
                <div className="mt-6 space-y-4">
                    {appointments.map((appointment, index) => (
                        <div key={appointment.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                            <div className="flex flex-col sm:flex-row gap-6">
                                {/* Doctor Image */}
                                <div className="flex-shrink-0">
                                    <img 
                                        className="w-24 h-24 sm:w-32 sm:h-32 rounded-xl object-cover bg-indigo-50" 
                                        src={appointment.doctor.image} 
                                        alt={appointment.doctor.name}
                                        onError={(e) => {
                                            e.target.src = '/api/placeholder/150/150'
                                        }}
                                    />
                                </div>
                                
                                {/* Appointment Details */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between mb-3">
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{appointment.doctor.name}</h3>
                                            <p className="text-gray-600">{appointment.doctor.speciality}</p>
                                        </div>
                                        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(appointment.status)}`}>
                                            {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                        </span>
                                    </div>
                                    
                                    {appointment.doctor.address && (
                                        <div className="mb-3">
                                            <p className="text-sm font-medium text-gray-700">Address:</p>
                                            <p className="text-sm text-gray-600">{appointment.doctor.address.line1}</p>
                                            {appointment.doctor.address.line2 && (
                                                <p className="text-sm text-gray-600">{appointment.doctor.address.line2}</p>
                                            )}
                                        </div>
                                    )}
                                    
                                    <div className="flex items-center gap-4 text-sm">
                                        <div className="flex items-center gap-2">
                                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0V3m6 4V3m-6 4h6m-6 0L4 7a2 2 0 00-2 2v8a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2l-6 0" />
                                            </svg>
                                            <span className="font-medium text-gray-700">
                                                {formatDate(appointment.date)} at {formatTime(appointment.date)}
                                            </span>
                                        </div>
                                    </div>

                                    {appointment.reason && (
                                        <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                                            <p className="text-sm font-medium text-gray-700">Reason:</p>
                                            <p className="text-sm text-gray-600">{appointment.reason}</p>
                                        </div>
                                    )}
                                </div>
                                
                                {/* Action Buttons */}
                                <div className="flex sm:flex-col gap-3">
                                    {appointment.status === 'booked' && isUpcoming(appointment.date) && (
                                        <>
                                            <button className="px-6 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                                                Reschedule
                                            </button>
                                            <button 
                                                onClick={() => cancelAppointment(appointment.id)}
                                                disabled={cancellingId === appointment.id}
                                                className={`px-6 py-2 text-sm border border-red-300 text-red-600 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed`}
                                            >
                                                {cancellingId === appointment.id ? 'Cancelling...' : 'Cancel'}
                                            </button>
                                        </>
                                    )}
                                    
                                    {appointment.status === 'booked' && isUpcoming(appointment.date) && (
                                        <button className="px-6 py-2 text-sm bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                                            Join Call
                                        </button>
                                    )}
                                    
                                    {appointment.status === 'cancelled' && (
                                        <button 
                                            onClick={() => navigate('/doctors')}
                                            className="px-6 py-2 text-sm bg-primary text-white rounded-full hover:bg-primary/90 transition-colors"
                                        >
                                            Book Again
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
            
            {/* Refresh Button */}
            <div className="mt-8 text-center">
                <button 
                    onClick={fetchAppointments}
                    className="px-6 py-2 text-sm border border-gray-300 rounded-full hover:bg-gray-50 transition-colors"
                >
                    <svg className="w-4 h-4 inline mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh
                </button>
            </div>
        </div>
    )
}

export default MyAppointments