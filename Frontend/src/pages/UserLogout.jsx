import React from 'react'
import axiosInstance from '../utils/axiosInstance'
import { useNavigate } from 'react-router-dom'

const UserLogout = () => {

    const navigate = useNavigate()
    
    axiosInstance.get('/users/logout')
    .then(response => {
        if(response.status === 200){
            localStorage.removeItem('userToken')
            navigate('/login')}
    })
    .catch(error => {
        console.error('Logout failed:', error.response?.data || error.message)
        alert(error.response?.data?.message || 'Logout failed. Please try again.')
    })

  return (
    <div>UserLogout</div>
  )
}

export default UserLogout