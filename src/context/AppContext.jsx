// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { apiService } from "../services/api";
import { toast } from 'react-toastify';

export const AppContext = createContext();

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

// Default mock profile for fallback
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
    const [doctors, setDoctors] = useState([]);
    
    // Doctor-specific state (for providers)
    const [doctorAppointments, setDoctorAppointments] = useState(mockDoctorDashboard.latestAppointments);
    const [dashData, setDashData] = useState(mockDoctorDashboard);
    const [profileData, setProfileData] = useState(mockDoctorProfile);
    const [profileLoading, setProfileLoading] = useState(false);

    const currencySymbol = '$';

    // Utility functions for date formatting
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const slotDateFormat = (slotDate) => {
        const dateArray = slotDate.split('_');
        return dateArray[0] + " " + months[Number(dateArray[1]) - 1] + " " + dateArray[2];
    };

    const calculateAge = (dob) => {
        const today = new Date();
        const birthDate = new Date(dob);
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    // Fetch doctors/providers from the backend and combine with dummy data
    const fetchDoctors = async () => {
        try {
            const response = await apiService.getProviders();
            
            // Transform the provider data to match the existing doctor format
            const transformedDoctors = response.providers.map(provider => ({
                _id: provider.id,
                name: provider.name,
                email: provider.email,
                speciality: provider.speciality,
                description: provider.description,
                experience: provider.experience,
                fees: provider.appointmentFee,
                // Add default image if not provided
                image: `https://via.placeholder.com/300/4F46E5/FFFFFF?Text=${encodeURIComponent(provider.name.substring(0, 2))}`,
                // Add default about text
                about: provider.description || `${provider.name} specializes in ${provider.speciality} with ${provider.experience} of experience.`,
                degree: 'MBBS', // Default degree
                address: {
                    line1: '123 Medical Center',
                    line2: 'Healthcare District'
                },
                available: true,
                isReal: true // Flag to identify real doctors
            }));
            
            // Import dummy doctors from assets
            const { doctors: dummyDoctors } = await import("../assets/assets");
            
            // Add isReal flag to dummy doctors and ensure unique IDs
            const flaggedDummyDoctors = dummyDoctors.map((doc, index) => ({
                ...doc,
                _id: doc._id || `dummy_${index}`, // Ensure unique ID
                isReal: false // Flag to identify dummy doctors
            }));
            
            // Combine real doctors with dummy doctors (real doctors first)
            const combinedDoctors = [...transformedDoctors, ...flaggedDummyDoctors];
            
            setDoctors(combinedDoctors);
        } catch (error) {
            console.error('Failed to fetch doctors:', error);
            
            // If API fails, still show dummy doctors
            try {
                const { doctors: dummyDoctors } = await import("../assets/assets");
                const flaggedDummyDoctors = dummyDoctors.map((doc, index) => ({
                    ...doc,
                    _id: doc._id || `dummy_${index}`,
                    isReal: false
                }));
                setDoctors(flaggedDummyDoctors);
                toast.warning('Showing demo doctors. Real doctors could not be loaded.');
            } catch (importError) {
                console.error('Failed to load dummy doctors:', importError);
                setDoctors([]);
                toast.error('Failed to load doctors');
            }
        }
    };

    // Fetch provider profile from API
    const fetchProviderProfile = async () => {
        if (!user || user.role !== 'provider') return;
        
        setProfileLoading(true);
        try {
            const response = await apiService.getProviderProfile();
            setProfileData(response.profile);
        } catch (error) {
            console.error('Failed to fetch provider profile:', error);
            toast.error('Failed to load profile data');
            
            // Keep using mock data with user info if API fails
            setProfileData(prev => ({
                ...prev,
                name: user.name,
                email: user.email,
                speciality: user.speciality || prev.speciality
            }));
        } finally {
            setProfileLoading(false);
        }
    };

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    const userData = await apiService.getProfile();
                    setUser(userData);
                    setToken(storedToken);
                    
                    // Fetch provider profile if user is a provider
                    if (userData.role === 'provider') {
                        // We'll fetch the profile data in a separate effect
                        // to avoid race conditions
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

    // Fetch provider profile when user is set and is a provider
    useEffect(() => {
        if (user && user.role === 'provider') {
            fetchProviderProfile();
        }
    }, [user]);

    // Fetch doctors when component mounts
    useEffect(() => {
        fetchDoctors();
    }, []);

    const login = async (email, password) => {
        try {
            const response = await apiService.login({ email, password });
            
            localStorage.setItem('authToken', response.token);
            setToken(response.token);
            setUser(response.user);
            
            // Provider profile will be fetched automatically via useEffect
            if (response.user.role === 'provider') {
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
                    // Refresh the doctors list to include the new provider
                    fetchDoctors();
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
        // Refetch profile from API
        fetchProviderProfile();
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

    const updateDoctorProfile = async (updatedData) => {
        try {
            setProfileLoading(true);
            const response = await apiService.updateProviderProfile(updatedData);
            setProfileData(response.profile);
            toast.success('Profile updated successfully');
            return { success: true };
        } catch (error) {
            console.error('Failed to update profile:', error);
            toast.error(error.message || 'Failed to update profile');
            return { success: false, error: error.message };
        } finally {
            setProfileLoading(false);
        }
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
        fetchDoctors, // Expose this so components can refresh the doctors list
        
        // Utility functions
        slotDateFormat,
        calculateAge,
        currency: currencySymbol,
        
        // Doctor-specific properties (used when user.role === 'provider')
        dToken: user?.role === 'provider' ? token : null,
        appointments: doctorAppointments,
        dashData,
        profileData,
        profileLoading,
        setProfileData,
        getDoctorAppointments,
        getDashData,
        getDoctorProfile,
        cancelAppointment,
        completeAppointment,
        updateDoctorProfile,
        fetchProviderProfile, // Expose for manual refresh
    };

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    );
};

export default AppContextProvider;