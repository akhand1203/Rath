import React, { createContext, useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosInstance'

export const UserDataContext = createContext()

const UserContext = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Fetch user profile on mount
    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                console.log('\n📥 Fetching user profile from backend...');
                const response = await axiosInstance.get('/users/profile');
                console.log('✅ User profile fetched successfully:', response.data.user);
                setUser(response.data.user);
            } catch (error) {
                console.error('⚠️ Failed to fetch user profile:', error.message);
                // Keep user state as null if fetch fails
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('userToken');
        if (token) {
            console.log('🔐 Token exists, fetching user profile...');
            fetchUserProfile();
        } else {
            console.log('⚠️ No token found, skipping user profile fetch');
            setLoading(false);
        }
    }, []);

    return (
        <UserDataContext.Provider value={{ user, setUser, loading }}>
            {children}
        </UserDataContext.Provider>
    )
}

export default UserContext