import React, { useContext, useState } from 'react'
import { AppContext } from '../../context/AppContext'

const DoctorProfile = () => {
  const { profileData, setProfileData, updateDoctorProfile } = useContext(AppContext)
  const [isEdit, setIsEdit] = useState(false)

  const handleUpdate = () => {
    updateDoctorProfile(profileData)
    setIsEdit(false)
  }

  return (
    <div className='m-5'>
      <div className='flex flex-col gap-4'>
        <div>
          <img 
            className='bg-primary/80 w-full sm:max-w-64 rounded-lg' 
            src={profileData.image} 
            alt="Doctor" 
          />
        </div>

        <div className='flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white'>
          <p className='flex items-center gap-2 text-3xl font-medium text-gray-700'>
            {profileData.name}
          </p>
          <div className='flex items-center gap-2 mt-1 text-gray-600'>
            <p>{profileData.degree} - {profileData.speciality}</p>
            <button className='py-0.5 px-2 border text-xs rounded-full'>
              {profileData.experience}
            </button>
          </div>

          <div className='mt-4'>
            <p className='flex items-center gap-1 text-sm font-medium text-[#262626] mt-3'>
              About:
            </p>
            <div className='text-sm text-gray-600 max-w-[700px] mt-1'>
              {isEdit ? (
                <textarea 
                  onChange={(e) => setProfileData(prev => ({ ...prev, about: e.target.value }))} 
                  className='w-full outline-primary p-2 border rounded' 
                  rows={6} 
                  value={profileData.about} 
                />
              ) : (
                <p>{profileData.about}</p>
              )}
            </div>
          </div>

          <p className='text-gray-600 font-medium mt-4'>
            Appointment fee: 
            <span className='text-gray-800'>
              ${isEdit ? (
                <input 
                  type='number' 
                  onChange={(e) => setProfileData(prev => ({ ...prev, fees: e.target.value }))} 
                  value={profileData.fees}
                  className='ml-1 border rounded px-2 py-1 w-20'
                />
              ) : (
                profileData.fees
              )}
            </span>
          </p>

          <div className='flex gap-2 py-2 mt-2'>
            <p className='font-medium'>Address:</p>
            <div className='text-sm'>
              {isEdit ? (
                <>
                  <input 
                    type='text' 
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line1: e.target.value } 
                    }))} 
                    value={profileData.address.line1}
                    className='border rounded px-2 py-1 mb-1 w-full'
                  />
                  <br />
                  <input 
                    type='text' 
                    onChange={(e) => setProfileData(prev => ({ 
                      ...prev, 
                      address: { ...prev.address, line2: e.target.value } 
                    }))} 
                    value={profileData.address.line2}
                    className='border rounded px-2 py-1 w-full'
                  />
                </>
              ) : (
                <>
                  <p>{profileData.address.line1}</p>
                  <p>{profileData.address.line2}</p>
                </>
              )}
            </div>
          </div>

          <div className='flex gap-1 pt-2'>
            <input 
              type="checkbox" 
              onChange={() => isEdit && setProfileData(prev => ({ ...prev, available: !prev.available }))} 
              checked={profileData.available}
              disabled={!isEdit}
            />
            <label>Available</label>
          </div>

          <div className='mt-5'>
            {isEdit ? (
              <div className='flex gap-2'>
                <button 
                  onClick={handleUpdate} 
                  className='px-4 py-2 bg-primary text-white text-sm rounded-full hover:bg-primary/90 transition-all'
                >
                  Save Changes
                </button>
                <button 
                  onClick={() => setIsEdit(false)} 
                  className='px-4 py-2 border border-gray-300 text-sm rounded-full hover:bg-gray-50 transition-all'
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setIsEdit(true)} 
                className='px-4 py-2 border border-primary text-sm rounded-full hover:bg-primary hover:text-white transition-all'
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DoctorProfile