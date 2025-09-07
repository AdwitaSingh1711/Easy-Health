import React, { useContext, useState, useEffect } from 'react'
import { AppContext } from '../../context/AppContext'

const DoctorProfile = () => {
  const { 
    profileData, 
    setProfileData, 
    updateDoctorProfile, 
    profileLoading,
    getDoctorProfile,
    user 
  } = useContext(AppContext)
  
  const [isEdit, setIsEdit] = useState(false)
  const [saving, setSaving] = useState(false)
  const [localProfileData, setLocalProfileData] = useState(profileData)

  // Update local state when profile data changes
  useEffect(() => {
    setLocalProfileData(profileData)
  }, [profileData])

  // Refresh profile data when component mounts
  useEffect(() => {
    if (user && user.role === 'provider') {
      getDoctorProfile()
    }
  }, [user])

  const handleUpdate = async () => {
    setSaving(true)
    try {
      const result = await updateDoctorProfile(localProfileData)
      if (result.success) {
        setIsEdit(false)
      }
    } catch (error) {
      console.error('Update failed:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    // Reset local state to original data
    setLocalProfileData(profileData)
    setIsEdit(false)
  }

  const handleInputChange = (field, value) => {
    setLocalProfileData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleAddressChange = (line, value) => {
    setLocalProfileData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [line]: value
      }
    }))
  }

  // Show loading spinner while profile data is being fetched
  if (profileLoading && !profileData) {
    return (
      <div className='m-5'>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className='m-5'>
      <div className='flex flex-col gap-4'>
        <div>
          
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          {/* Profile Header with Loading State */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
                {isEdit ? (
                  <input 
                    type="text"
                    value={localProfileData.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className='text-3xl font-medium border-b-2 border-gray-300 focus:border-primary outline-none bg-transparent'
                    placeholder="Doctor Name"
                  />
                ) : (
                  localProfileData.name
                )}
                {profileLoading && (
                  <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                )}
              </p>
              <div className='flex items-center gap-2 mt-1 text-gray-600'>
                <p>
                  {localProfileData.degree} - {' '}
                  {isEdit ? (
                    <input 
                      type="text"
                      value={localProfileData.speciality || ''}
                      onChange={(e) => handleInputChange('speciality', e.target.value)}
                      className='border border-gray-300 rounded px-2 py-1 text-sm'
                      placeholder="Speciality"
                    />
                  ) : (
                    localProfileData.speciality
                  )}
                </p>
                <button className='py-0.5 px-2 border text-xs rounded-full'>
                  {isEdit ? (
                    <input 
                      type="text"
                      value={localProfileData.experience || ''}
                      onChange={(e) => handleInputChange('experience', e.target.value)}
                      className='w-16 text-center outline-none bg-transparent'
                      placeholder="Experience"
                    />
                  ) : (
                    localProfileData.experience
                  )}
                </button>
              </div>
            </div>
            
            {/* Refresh Button */}
            <button 
              onClick={getDoctorProfile}
              disabled={profileLoading}
              className="p-2 text-gray-500 hover:text-primary transition-colors"
              title="Refresh profile"
            >
              <svg 
                className={`w-5 h-5 ${profileLoading ? 'animate-spin' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                />
              </svg>
            </button>
          </div>

          {/* About Section */}
          <div className='mt-4'>
            <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>
              About:
            </p>
            <div className='text-sm text-gray-600 max-w-[700px] mt-1'>
              {isEdit ? (
                <textarea 
                  onChange={(e) => handleInputChange('about', e.target.value)} 
                  className='w-full outline-primary p-2 border rounded' 
                  rows={6} 
                  value={localProfileData.about || ''} 
                  placeholder="Tell patients about your experience and approach to healthcare..."
                />
              ) : (
                <p>{localProfileData.about || 'No description provided.'}</p>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className='mt-4'>
            <p className='text-sm font-medium text-[#262626] mb-2'>Contact Information:</p>
            <div className='text-sm text-gray-600 space-y-1'>
              <p><strong>Email:</strong> {localProfileData.email}</p>
              <p>
                <strong>Phone:</strong> {' '}
                {isEdit ? (
                  <input 
                    type="tel"
                    value={localProfileData.phone || ''}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    className='border border-gray-300 rounded px-2 py-1 ml-1'
                    placeholder="Phone number"
                  />
                ) : (
                  localProfileData.phone || 'Not provided'
                )}
              </p>
            </div>
          </div>

          {/* Appointment Fee */}
          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee: 
            <span className='text-gray-800'>
              ${isEdit ? (
                <input 
                  type='number' 
                  min="10"
                  max="1000"
                  onChange={(e) => handleInputChange('fees', e.target.value)} 
                  value={localProfileData.fees || ''}
                  className='ml-1 border rounded px-2 py-1 w-20'
                  placeholder="50"
                />
              ) : (
                localProfileData.fees
              )}
            </span>
          </p>

          {/* Address Information */}
          <div className='flex gap-2 py-2 mt-2'>
            <p className='font-medium'>Address:</p>
            <div className='text-sm'>
              {isEdit ? (
                <>
                  <input 
                    type='text' 
                    onChange={(e) => handleAddressChange('line1', e.target.value)} 
                    value={localProfileData.address?.line1 || ''}
                    className='border rounded px-2 py-1 mb-1 w-full'
                    placeholder="Address line 1"
                  />
                  <br />
                  <input 
                    type='text' 
                    onChange={(e) => handleAddressChange('line2', e.target.value)} 
                    value={localProfileData.address?.line2 || ''}
                    className='border rounded px-2 py-1 w-full'
                    placeholder="Address line 2"
                  />
                </>
              ) : (
                <>
                  <p>{localProfileData.address?.line1 || 'Not provided'}</p>
                  <p>{localProfileData.address?.line2 || ''}</p>
                </>
              )}
            </div>
          </div>

          {/* Availability Status */}
          <div className='flex gap-1 pt-2'>
            <input 
              type="checkbox" 
              onChange={(e) => isEdit && handleInputChange('available', e.target.checked)} 
              checked={localProfileData.available || false}
              disabled={!isEdit}
            />
            <label>Available for appointments</label>
          </div>

          {/* Action Buttons */}
          <div className='mt-5'>
            {isEdit ? (
              <div className='flex gap-2'>
                <button 
                  onClick={handleUpdate} 
                  disabled={saving || profileLoading}
                  className={`px-4 py-2 text-white text-sm rounded-full transition-all ${
                    saving || profileLoading
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-primary/90'
                  }`}
                >
                  {saving ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    'Save Changes'
                  )}
                </button>
                <button 
                  onClick={handleCancel} 
                  disabled={saving}
                  className='px-4 py-2 border border-gray-300 text-sm rounded-full hover:bg-gray-50 transition-all disabled:opacity-50'
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEdit(true)} 
                disabled={profileLoading}
                className={`px-4 py-2 border border-primary text-sm rounded-full transition-all ${
                  profileLoading 
                    ? 'opacity-50 cursor-not-allowed'
                    : 'hover:bg-primary hover:text-white'
                }`}
              >
                Edit Profile
              </button>
            )}
          </div>

          {/* Profile Status Indicator */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              <div className={`w-2 h-2 rounded-full ${
                profileLoading ? 'bg-yellow-400' : 'bg-green-400'
              }`}></div>
              {profileLoading ? 'Syncing profile data...' : 'Profile data synchronized'}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile