// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext'

const Login = () => {
  const navigate = useNavigate()
  const { login, register, isAuthenticated, loading } = useContext(AppContext)

  const [state, setState] = useState('Sign Up')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState('patient') // Default to patient
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
      navigate('/')
    }
  }, [isAuthenticated, loading, navigate])

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    setError('')
    setIsSubmitting(true)

    try {
      if (state === 'Sign Up') {
        // Registration
        const result = await register({
          name,
          email,
          password,
          phone: phone || undefined,
          role
        });

        if (result.success) {
          navigate('/') // Redirect to home after successful registration
        } else {
          setError(result.error)
        }
      } else {
        // Login
        const result = await login(email, password);

        if (result.success) {
          navigate('/') // Redirect to home after successful login
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
    setRole('patient')
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
    <form onSubmit={onSubmitHandler} className='min-h-[80vh] flex items-center'>
      <div className='flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg'>
        <p className='text-2xl font-semibold'>{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book appointment</p>

        {error && (
          <div className="w-full p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {state === 'Sign Up' && (
          <>
            <div className='w-full'>
              <p>Full Name</p>
              <input 
                onChange={(e) => setName(e.target.value)} 
                value={name} 
                className='border border-zinc-300 rounded w-full p-2 mt-1' 
                type="text" 
                required 
                disabled={isSubmitting}
              />
            </div>

            <div className='w-full'>
              <p>Phone (Optional)</p>
              <input 
                onChange={(e) => setPhone(e.target.value)} 
                value={phone} 
                className='border border-zinc-300 rounded w-full p-2 mt-1' 
                type="tel" 
                disabled={isSubmitting}
              />
            </div>

            <div className='w-full'>
              <p>Role</p>
              <select
                onChange={(e) => setRole(e.target.value)}
                value={role}
                className='border border-zinc-300 rounded w-full p-2 mt-1'
                disabled={isSubmitting}
              >
                <option value="patient">Patient</option>
                <option value="provider">Healthcare Provider</option>
              </select>
            </div>
          </>
        )}

        <div className='w-full'>
          <p>Email</p>
          <input 
            onChange={(e) => setEmail(e.target.value)} 
            value={email} 
            className='border border-zinc-300 rounded w-full p-2 mt-1' 
            type="email" 
            required 
            disabled={isSubmitting}
          />
        </div>

        <div className='w-full'>
          <p>Password</p>
          <input 
            onChange={(e) => setPassword(e.target.value)} 
            value={password} 
            className='border border-zinc-300 rounded w-full p-2 mt-1' 
            type="password" 
            required 
            disabled={isSubmitting}
          />
        </div>

        <button 
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-2 rounded-md text-base text-white transition-colors ${
            isSubmitting 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-primary hover:bg-primary/90'
          }`}
        >
          {isSubmitting 
            ? (state === 'Sign Up' ? 'Creating account...' : 'Logging in...') 
            : (state === 'Sign Up' ? 'Create account' : 'Login')
          }
        </button>

        {state === 'Sign Up'
          ? <p>Already have an account? <span onClick={() => switchState('Login')} className='text-primary underline cursor-pointer'>Login here</span></p>
          : <p>Create a new account? <span onClick={() => switchState('Sign Up')} className='text-primary underline cursor-pointer'>Click here</span></p>
        }
      </div>
    </form>
  )
}

export default Login