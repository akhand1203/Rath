import React, { createContext, useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosInstance'

export const UserDataContext = createContext()

const UserContext = ({children}) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchUserProfile = async () => {
            try {
                const response = await axiosInstance.get('/users/profile');
                setUser(response.data.user);
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };

        const token = localStorage.getItem('userToken');
        if (token) {
            fetchUserProfile();
        } else {
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