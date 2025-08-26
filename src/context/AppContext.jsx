// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { doctors } from "../assets/assets";
import { apiService } from "../services/api";
import { toast } from 'react-toastify'

export const AppContext = createContext()

// Mock doctor dashboard data for providers
const mockDoctorDashboard = {
  earnings: 2500,
  appointments: 25,
  patients: 180,
  latestAppointments: [
    {
      _id: '1',
      userData: {
        name: 'Richard James',
        image: 'https://via.placeholder.com/50/FFFF00/000000?Text=RJ',
        dob: '1990-05-15'
      },
      slotDate: '24_08_2025',
      slotTime: '10:00 AM',
      amount: 50,
      cancelled: false,
      isCompleted: false,
      payment: true
    },
    {
      _id: '2',
      userData: {
        name: 'John Doe',
        image: 'https://via.placeholder.com/50/FF00FF/FFFFFF?Text=JD',
        dob: '1985-08-20'
      },
      slotDate: '25_08_2025',
      slotTime: '2:00 PM',
      amount: 50,
      cancelled: false,
      isCompleted: true,
      payment: false
    }
  ]
};

const mockDoctorProfile = {
  _id: '1',
  name: 'Dr. John Smith',
  email: 'doctor@example.com',
  image: 'https://via.placeholder.com/300/0000FF/808080?Text=Dr.Smith',
  speciality: 'General physician',
  degree: 'MBBS',
  experience: '4 Years',
  about: 'Dr. Smith has a strong commitment to delivering comprehensive medical care, focusing on preventive medicine, early diagnosis, and effective treatment strategies.',
  fees: 50,
  address: { 
    line1: '17th Cross, Richmond', 
    line2: 'Circle, Ring Road, London' 
  },
  available: true
};

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);
    
    // Doctor-specific state (for providers)
    const [doctorAppointments, setDoctorAppointments] = useState(mockDoctorDashboard.latestAppointments);
    const [dashData, setDashData] = useState(mockDoctorDashboard);
    const [profileData, setProfileData] = useState(mockDoctorProfile);

    const currencySymbol = '$'

    // Utility functions for date formatting (used by both patient and doctor views)
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_')
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2]
    }

    const calculateAge = (dob) => {
        const today = new Date()
        const birthDate = new Date(dob)
        let age = today.getFullYear() - birthDate.getFullYear()
        const monthDiff = today.getMonth() - birthDate.getMonth()
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--
        }
        return age
    }

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    const userData = await apiService.getProfile();
                    setUser(userData);
                    setToken(storedToken);
                    
                    // Update doctor profile if user is a provider
                    if (userData.role === 'provider') {
                        setProfileData(prev => ({
                            ...prev,
                            name: userData.name,
                            email: userData.email,
                            speciality: userData.speciality || prev.speciality
                        }));
                    }
                } catch (error) {
                    console.error('Auth check failed:', error);
                    localStorage.removeItem('authToken');
                    setToken(null);
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiService.login({ email, password });
            
            localStorage.setItem('authToken', response.token);
            setToken(response.token);
            setUser(response.user);
            
            // Update doctor profile if user is a provider
            if (response.user.role === 'provider') {
                setProfileData(prev => ({
                    ...prev,
                    name: response.user.name,
                    email: response.user.email,
                    speciality: response.user.speciality || prev.speciality
                }));
                toast.success(`Welcome back, Dr. ${response.user.name}!`);
            } else {
                toast.success(`Welcome back, ${response.user.name}!`);
            }
            
            return { success: true };
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Login failed' 
            };
        }
    };

    const register = async (userData) => {
        try {
            await apiService.register(userData);
            
            // After successful registration, log the user in
            const loginResult = await login(userData.email, userData.password);
            
            if (loginResult.success) {
                if (userData.role === 'provider') {
                    toast.success('Doctor account created successfully!');
                } else {
                    toast.success('Patient account created successfully!');
                }
            }
            
            return loginResult;
        } catch (error) {
            return { 
                success: false, 
                error: error.message || 'Registration failed' 
            };
        }
    };

    const logout = () => {
        localStorage.removeItem('authToken');
        setToken(null);
        setUser(null);
        
        // Reset doctor-specific data
        setDoctorAppointments(mockDoctorDashboard.latestAppointments);
        setDashData(mockDoctorDashboard);
        setProfileData(mockDoctorProfile);
        
        toast.success('Logged out successfully');
    };

    // Doctor-specific functions (for providers)
    const getDoctorAppointments = () => {
        console.log('Doctor appointments loaded');
    };

    const getDashData = () => {
        console.log('Dashboard data loaded');
    };

    const getDoctorProfile = () => {
        console.log('Doctor profile loaded');
    };

    const cancelAppointment = (appointmentId) => {
        const updatedAppointments = doctorAppointments.map(apt => 
            apt._id === appointmentId ? { ...apt, cancelled: true } : apt
        );
        setDoctorAppointments(updatedAppointments);
        setDashData(prev => ({
            ...prev,
            latestAppointments: updatedAppointments
        }));
        toast.success('Appointment cancelled successfully');
    };

    const completeAppointment = (appointmentId) => {
        const updatedAppointments = doctorAppointments.map(apt => 
            apt._id === appointmentId ? { ...apt, isCompleted: true } : apt
        );
        setDoctorAppointments(updatedAppointments);
        setDashData(prev => ({
            ...prev,
            latestAppointments: updatedAppointments
        }));
        toast.success('Appointment marked as completed');
    };

    const updateDoctorProfile = (updatedData) => {
        setProfileData(prev => ({ ...prev, ...updatedData }));
        toast.success('Profile updated successfully');
    };

    const value = {
        // Common properties
        doctors,
        currencySymbol,
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token,
        
        // Utility functions
        slotDateFormat,
        calculateAge,
        currency: currencySymbol,
        
        // Doctor-specific properties (used when user.role === 'provider')
        dToken: user?.role === 'provider' ? token : null,
        appointments: doctorAppointments,
        dashData,
        profileData,
        setProfileData,
        getDoctorAppointments,
        getDashData,
        getDoctorProfile,
        cancelAppointment,
        completeAppointment,
        updateDoctorProfile,
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider