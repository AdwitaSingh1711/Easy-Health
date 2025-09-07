// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'
import { assets } from '../assets/assets'

const Login = () => {
  const navigate = useNavigate()
  const { login, register, isAuthenticated, loading, user } = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [userType, setUserType] = useState('patient') // 'patient' or 'doctor'
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  
  // Patient-specific fields
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('')
  const [address, setAddress] = useState('')
  
  // Provider-specific fields
  const [speciality, setSpeciality] = useState('General physician')
  const [experience, setExperience] = useState('1 Years')
  const [description, setDescription] = useState('')
  const [appointmentFee, setAppointmentFee] = useState(50)
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const specialities = [
    'General physician',
    'Gynecologist', 
    'Dermatologist',
    'Pediatricians',
    'Neurologist',
    'Gastroenterologist'
  ]

  const experienceOptions = [
    '1 Years',
    '2 Years',
    '3 Years',
    '4 Years',
    '5 Years',
    '6-10 Years',
    '10+ Years'
  ]

  // Redirect based on user role after authentication
  useEffect(() => {
    if (!loading && isAuthenticated && user) {
      if (user.role === 'provider') {
        navigate('/dashboard') // Doctor dashboard
      } else {
        navigate('/') // Patient home
      }
    }
  }, [isAuthenticated, loading, navigate, user])

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError('')
    setIsSubmitting(true)

    try {
      if (state === 'Sign Up') {
        // Registration
        const userData = {
          name,
          email,
          password,
          phone: phone || undefined,
          role: userType === 'doctor' ? 'provider' : 'patient'
        }

        // Add patient-specific fields for patients
        if (userType === 'patient') {
          if (!age || !gender) {
            setError('Please provide age and gender for patient registration')
            setIsSubmitting(false)
            return
          }
          
          const ageNum = parseInt(age)
          if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) {
            setError('Please provide a valid age between 1 and 120')
            setIsSubmitting(false)
            return
          }
          
          userData.age = ageNum
          userData.gender = gender
          userData.address = address.trim() || null
        }

        // Add provider-specific fields for doctors
        if (userType === 'doctor') {
          userData.speciality = speciality
          userData.experience = experience
          userData.description = description.trim() || `${name} is a qualified ${speciality} with ${experience} of experience.`
          userData.appointmentFee = parseFloat(appointmentFee)
        }

        const result = await register(userData);

        if (result.success) {
          // Navigation will be handled by useEffect based on user role
        } else {
          setError(result.error)
        }
      } else {
        // Login - NO CHANGES TO LOGIN FUNCTIONALITY
        const result = await login(email, password);

        if (result.success) {
          // Navigation will be handled by useEffect based on user role
        } else {
          setError(result.error)
        }
      }
    } catch (error) {
      setError('An unexpected error occurred')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setName('')
    setEmail('')
    setPassword('')
    setPhone('')
    // Reset patient fields
    setAge('')
    setGender('')
    setAddress('')
    // Reset provider fields
    setSpeciality('General physician')
    setExperience('1 Years')
    setDescription('')
    setAppointmentFee(50)
    setUserType('patient')
    setError('')
  }

  const switchState = (newState) => {
    setState(newState)
    resetForm()
  }

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <img 
            className="mx-auto h-12 w-auto" 
            src={assets.MedEaseLogo} 
            alt="EasyHealth" 
          />
          <h2 className="mt-6 text-3xl font-bold text-gray-900">
            {state === 'Sign Up' ? 'Create your account' : 'Sign in to your account'}
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            {state === 'Sign Up' 
              ? 'Join EasyHealth as a patient or healthcare provider'
              : 'Access your EasyHealth dashboard'
            }
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={onSubmitHandler}>
          <div className="bg-white shadow-lg rounded-lg px-6 py-8 space-y-6">
            
            {/* User Type Selection - Only show during registration */}
            {state === 'Sign Up' && (
              <div>
                <label className="text-base font-medium text-gray-900">
                  I am a:
                </label>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setUserType('patient')}
                    className={`${
                      userType === 'patient'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                    } relative flex items-center justify-center px-4 py-3 text-sm font-medium border rounded-md transition-colors`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    Patient
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType('doctor')}
                    className={`${
                      userType === 'doctor'
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-gray-900 border-gray-200 hover:bg-gray-50'
                    } relative flex items-center justify-center px-4 py-3 text-sm font-medium border rounded-md transition-colors`}
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Doctor
                  </button>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {state === 'Sign Up' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Enter your full name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Phone Number (Optional)
                  </label>
                  <input
                    type="tel"
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                    placeholder="Enter your phone number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>

                {/* Patient-specific fields */}
                {userType === 'patient' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Age *
                        </label>
                        <input
                          type="number"
                          required
                          min="1"
                          max="120"
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                          placeholder="Enter your age"
                          value={age}
                          onChange={(e) => setAge(e.target.value)}
                          disabled={isSubmitting}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Gender *
                        </label>
                        <select
                          required
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          value={gender}
                          onChange={(e) => setGender(e.target.value)}
                          disabled={isSubmitting}
                        >
                          <option value="">Select gender</option>
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                          <option value="Other">Other</option>
                          <option value="Prefer not to say">Prefer not to say</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Address (Optional)
                      </label>
                      <textarea
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Enter your address"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                        maxLength={200}
                      />
                      <p className="text-xs text-gray-500 mt-1">{address.length}/200 characters</p>
                    </div>
                  </>
                )}

                {/* Provider-specific fields */}
                {userType === 'doctor' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Medical Speciality
                        </label>
                        <select
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          value={speciality}
                          onChange={(e) => setSpeciality(e.target.value)}
                          disabled={isSubmitting}
                        >
                          {specialities.map((spec) => (
                            <option key={spec} value={spec}>{spec}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          Experience
                        </label>
                        <select
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                          value={experience}
                          onChange={(e) => setExperience(e.target.value)}
                          disabled={isSubmitting}
                        >
                          {experienceOptions.map((exp) => (
                            <option key={exp} value={exp}>{exp}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Description (Optional)
                      </label>
                      <textarea
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="Brief description about your practice and expertise..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        disabled={isSubmitting}
                        rows={3}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-500 mt-1">{description.length}/500 characters</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Appointment Fee ($)
                      </label>
                      <input
                        type="number"
                        min="10"
                        max="500"
                        className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                        placeholder="50"
                        value={appointmentFee}
                        onChange={(e) => setAppointmentFee(e.target.value)}
                        disabled={isSubmitting}
                      />
                    </div>
                  </>
                )}
              </>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className={`group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white transition-colors ${
                  isSubmitting
                    ? 'bg-gray-400 cursor-not-allowed'
                    : 'bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary'
                }`}
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {state === 'Sign Up' ? 'Creating Account...' : 'Signing In...'}
                  </>
                ) : (
                  <>
                    {state === 'Sign Up' ? 'Create Account' : 'Sign In'}
                  </>
                )}
              </button>
            </div>

            <div className="text-center">
              {state === 'Sign Up' ? (
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchState('Login')}
                    className="font-medium text-primary hover:underline"
                  >
                    Sign in here
                  </button>
                </p>
              ) : (
                <p className="text-sm text-gray-600">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => switchState('Sign Up')}
                    className="font-medium text-primary hover:underline"
                  >
                    Create one here
                  </button>
                </p>
              )}
            </div>
          </div>
        </form>

        {/* Feature highlights - Only show during login */}
        {state === 'Login' && (
          <div className="text-center">
            <div className="grid grid-cols-2 gap-4 mt-8">
              <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <svg className="w-8 h-8 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Secure</p>
                  <p className="text-xs text-gray-500">End-to-end encrypted</p>
                </div>
              </div>
              <div className="flex items-center justify-center p-4 bg-white rounded-lg shadow-sm">
                <svg className="w-8 h-8 text-primary mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div className="text-left">
                  <p className="text-sm font-medium text-gray-900">Fast</p>
                  <p className="text-xs text-gray-500">Quick appointments</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Login