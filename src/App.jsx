// src/App.jsx
import React, { useContext } from 'react'
import { Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Patient Components
import PatientNavbar from './components/patient/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Footer from './components/Footer'

// Doctor Components  
import DoctorNavbar from './components/doctor/Navbar'
import DoctorSidebar from './components/doctor/Sidebar'

// Patient Pages
import Home from './pages/patient/Home'
import Doctors from './pages/patient/Doctors'
import Appointment from './pages/patient/Appointment'
import MyAppointments from './pages/patient/MyAppointments'
import MyProfile from './pages/patient/MyProfile'

// Doctor Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard'
import DoctorAppointments from './pages/doctor/DoctorAppointments'
import DoctorProfile from './pages/doctor/DoctorProfile'

// Auth Pages
import Login from './pages/Login'

// Contexts
import { AppContext } from './context/AppContext'

const App = () => {
  const { user, isAuthenticated, loading } = useContext(AppContext)

  // Show loading screen while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated and is a doctor/provider, show doctor dashboard
  if (isAuthenticated && user?.role === 'provider') {
    return (
      <div className='bg-[#F8F9FD] min-h-screen'>
        <ToastContainer />
        <DoctorNavbar />
        <div className='flex items-start'>
          <DoctorSidebar />
          <Routes>
            <Route path='/' element={<DoctorDashboard />} />
            <Route path='/dashboard' element={<DoctorDashboard />} />
            <Route path='/appointments' element={<DoctorAppointments />} />
            <Route path='/profile' element={<DoctorProfile />} />
            <Route path='/login' element={<Login />} />
            {/* Redirect any patient routes to doctor dashboard */}
            <Route path='/doctors' element={<DoctorDashboard />} />
            <Route path='/doctors/:speciality' element={<DoctorDashboard />} />
            <Route path='/appointment/:docId' element={<DoctorDashboard />} />
            <Route path='/my-appointments' element={<DoctorAppointments />} />
            <Route path='/my-profile' element={<DoctorProfile />} />
          </Routes>
        </div>
      </div>
    )
  }

  // For patients or unauthenticated users, show patient interface
  return (
    <div className='mx-4 sm:mx-[10%]'>
      <ToastContainer />
      <PatientNavbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/doctors' element={<Doctors />} />
        <Route path='/doctors/:speciality' element={<Doctors />} />
        <Route path='/login' element={<Login />} />
        
        {/* Protected Patient Routes - require authentication and patient role */}
        <Route path='/appointment/:docId' element={
          <ProtectedRoute>
            <Appointment />
          </ProtectedRoute>
        } />
        <Route path='/my-appointments' element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        } />
        <Route path='/my-profile' element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />

        {/* Redirect doctor routes to patient home if patient is logged in */}
        <Route path='/dashboard' element={<Home />} />
        <Route path='/profile' element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        } />
        <Route path='/appointments' element={
          <ProtectedRoute>
            <MyAppointments />
          </ProtectedRoute>
        } />
      </Routes>
      <Footer />
    </div>
  )
}

export default App