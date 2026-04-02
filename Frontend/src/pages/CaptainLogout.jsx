import React, { useEffect } from 'react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const CaptainLogout = () => {

    const token = localStorage.getItem('captainToken')
    const navigate = useNavigate()

    useEffect(() => {
        axios.get(`${import.meta.env.VITE_BASE_URL}/captains/logout`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
        .then(response => {
            if(response.status === 200){
                localStorage.removeItem('captainToken')
                navigate('/captain-login')
            }
        })
        .catch(error => {
            console.error('Logout failed:', error.response?.data || error.message)
            alert(error.response?.data?.message || 'Logout failed. Please try again.')
        })
    }, [token, navigate])

  return (
    <div>Logging out...</div>
  )
}

export default CaptainLogout
