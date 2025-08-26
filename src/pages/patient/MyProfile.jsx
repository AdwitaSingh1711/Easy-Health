// src/pages/MyProfile.jsx
import React, { useState, useContext, useEffect } from 'react'
import { assets } from '../../assets/assets'
import { AppContext } from '../../context/AppContext'

const MyProfile = () => {
    const { user } = useContext(AppContext)
    const [isEdit, setIsEdit] = useState(false)
    const [userData, setUserData] = useState({
        name: '',
        image: assets.profile_pic,
        email: '',
        phone: '',
        address: {
            line1: '',
            line2: '',
        },
        gender: '',
        dob: ''
    })
    
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')

    // Initialize user data when user context is available
    useEffect(() => {
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || '',
                // Keep existing values for fields not available from backend
                address: prevData.address,
                gender: prevData.gender,
                dob: prevData.dob
            }))
        }
    }, [user])

    const handleSave = async () => {
        setLoading(true)
        setMessage('')
        
        try {
            // Here you would typically make an API call to update the profile
            // await apiService.updateProfile(userData)
            
            // For now, just simulate a save
            await new Promise(resolve => setTimeout(resolve, 1000))
            
            setIsEdit(false)
            setMessage('Profile updated successfully!')
            
            // Clear message after 3 seconds
            setTimeout(() => setMessage(''), 3000)
        } catch (error) {
            console.error('Failed to update profile:', error)
            setMessage('Failed to update profile. Please try again.')
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = () => {
        // Reset to original user data
        if (user) {
            setUserData(prevData => ({
                ...prevData,
                name: user.name || '',
                email: user.email || '',
                phone: user.phone || ''
            }))
        }
        setIsEdit(false)
        setMessage('')
    }

    if (!user) {
        return (
            <div className="min-h-[60vh] flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                    <p className="mt-2 text-gray-600">Loading profile...</p>
                </div>
            </div>
        )
    }

    return (
        <div className='max-w-2xl mx-auto'>
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">My Profile</h1>
                <p className="text-gray-600 mt-1">Manage your account information</p>
            </div>

            {/* Success/Error Messages */}
            {message && (
                <div className={`mb-6 p-4 rounded-lg ${
                    message.includes('successfully') 
                        ? 'bg-green-50 border border-green-200 text-green-600' 
                        : 'bg-red-50 border border-red-200 text-red-600'
                }`}>
                    {message}
                </div>
            )}

            <div className='bg-white rounded-xl shadow-sm border p-6'>
                {/* Profile Image and Name */}
                <div className="flex items-center gap-6 mb-8">
                    <div className="relative">
                        <img className='w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg' src={userData.image} alt="Profile" />
                        {isEdit && (
                            <button className="absolute bottom-0 right-0 bg-primary text-white rounded-full w-8 h-8 flex items-center justify-center shadow-lg hover:bg-primary/90">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93l.94-2.06a2 2 0 011.86-1.23h6.54a2 2 0 011.86 1.23L15.07 7H16a2 2 0 012 2v9a2 2 0 01-2 2H8a2 2 0 01-2-2V9z" />
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                </svg>
                            </button>
                        )}
                    </div>
                    
                    <div className="flex-1">
                        {isEdit ? (
                            <input 
                                className='text-2xl font-semibold bg-gray-50 border border-gray-200 rounded-lg px-4 py-2 w-full max-w-md focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                type="text" 
                                onChange={(e) => setUserData(prev => ({ ...prev, name: e.target.value }))} 
                                value={userData.name} 
                            />
                        ) : (
                            <div>
                                <h2 className='text-2xl font-semibold text-gray-900'>{userData.name}</h2>
                                <p className="text-gray-600 capitalize">{user.role}</p>
                            </div>
                        )}
                    </div>
                </div>

                <hr className='border-gray-200 mb-8' />

                {/* Contact Information */}
                <div className="mb-8">
                    <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        Contact Information
                    </h3>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Email Address</label>
                            <input 
                                className='w-full p-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-600 cursor-not-allowed' 
                                type="email" 
                                value={userData.email} 
                                disabled 
                            />
                            <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Phone Number</label>
                            {isEdit ? (
                                <input 
                                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                    type="tel" 
                                    onChange={(e) => setUserData(prev => ({ ...prev, phone: e.target.value }))} 
                                    value={userData.phone} 
                                    placeholder="Enter phone number"
                                />
                            ) : (
                                <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                    {userData.phone || 'Not provided'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Address Information */}
                <div className="mb-8">
                    <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        Address
                    </h3>
                    
                    <div className='space-y-4'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Address Line 1</label>
                            {isEdit ? (
                                <input 
                                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                    type="text" 
                                    onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line1: e.target.value } }))} 
                                    value={userData.address.line1} 
                                    placeholder="Enter address line 1"
                                />
                            ) : (
                                <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                    {userData.address.line1 || 'Not provided'}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Address Line 2</label>
                            {isEdit ? (
                                <input 
                                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                    type="text" 
                                    onChange={(e) => setUserData(prev => ({ ...prev, address: { ...prev.address, line2: e.target.value } }))} 
                                    value={userData.address.line2} 
                                    placeholder="Enter address line 2"
                                />
                            ) : (
                                <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                    {userData.address.line2 || 'Not provided'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Basic Information */}
                <div className="mb-8">
                    <h3 className='text-lg font-medium text-gray-900 mb-4 flex items-center gap-2'>
                        <svg className="w-5 h-5 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        Basic Information
                    </h3>
                    
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Gender</label>
                            {isEdit ? (
                                <select 
                                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                    onChange={(e) => setUserData(prev => ({ ...prev, gender: e.target.value }))} 
                                    value={userData.gender}
                                >
                                    <option value="">Select gender</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            ) : (
                                <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                    {userData.gender || 'Not specified'}
                                </p>
                            )}
                        </div>
                        
                        <div>
                            <label className='block text-sm font-medium text-gray-700 mb-2'>Date of Birth</label>
                            {isEdit ? (
                                <input 
                                    className='w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary' 
                                    type='date' 
                                    onChange={(e) => setUserData(prev => ({ ...prev, dob: e.target.value }))} 
                                    value={userData.dob} 
                                />
                            ) : (
                                <p className='p-3 text-gray-600 bg-gray-50 rounded-lg'>
                                    {userData.dob || 'Not provided'}
                                </p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className='flex gap-3 pt-6 border-t border-gray-200'>
                    {isEdit ? (
                        <>
                            <button 
                                onClick={handleSave}
                                disabled={loading}
                                className={`flex items-center gap-2 px-6 py-3 rounded-full text-white font-medium transition ${
                                    loading 
                                        ? 'bg-gray-400 cursor-not-allowed' 
                                        : 'bg-primary hover:bg-primary/90'
                                }`}
                            >
                                {loading ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button 
                                onClick={handleCancel}
                                disabled={loading}
                                className="px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50 transition disabled:opacity-50"
                            >
                                Cancel
                            </button>
                        </>
                    ) : (
                        <button 
                            onClick={() => setIsEdit(true)} 
                            className="flex items-center gap-2 px-6 py-3 border border-primary text-primary rounded-full hover:bg-primary hover:text-white transition"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                            Edit Profile
                        </button>
                    )}
                </div>
            </div>
        </div>
    )
}

export default MyProfile