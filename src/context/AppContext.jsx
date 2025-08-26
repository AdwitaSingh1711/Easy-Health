// src/context/AppContext.jsx
import { createContext, useState, useEffect } from "react";
import { doctors } from "../assets/assets";
import { apiService } from "../services/api";

export const AppContext = createContext()

const AppContextProvider = (props) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('authToken'));
    const [loading, setLoading] = useState(true);

    const currencySymbol = '$'

    // Check if user is authenticated on app load
    useEffect(() => {
        const checkAuth = async () => {
            const storedToken = localStorage.getItem('authToken');
            if (storedToken) {
                try {
                    const userData = await apiService.getProfile();
                    setUser(userData);
                    setToken(storedToken);
                } catch (error) {
                    console.error('Auth check failed:', error);
                    // Clear invalid token
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
            
            // Store token and user data
            localStorage.setItem('authToken', response.token);
            setToken(response.token);
            setUser(response.user);
            
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
    };

    const value = {
        doctors,
        currencySymbol,
        user,
        token,
        loading,
        login,
        register,
        logout,
        isAuthenticated: !!token
    }

    return (
        <AppContext.Provider value={value}>
            {props.children}
        </AppContext.Provider>
    )
}

export default AppContextProvider