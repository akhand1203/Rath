import React , {useContext, useEffect, useState} from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const CaptainProtectedWrapper = ({
    children
}) => {

    const token = localStorage.getItem('captainToken')

    const navigate = useNavigate()
    const { captain, setCaptain } = useContext(CaptainDataContext)
    const [isLoding, setIsLoding] = useState(true)

        useEffect(() => {
            if (!token) {
                navigate('/captain-login')
                return
            }

            axios.get(`${import.meta.env.VITE_BASE_URL}/captains/profile`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
            .then(response => {
                if(response.status === 200){
                    setCaptain(response.data.captain)
                    setIsLoding(false)
                }   
            })
            .catch(error => {
                localStorage.removeItem('captainToken')
                navigate('/captain-login')
                console.error('Failed to fetch captain profile:', error.response?.data || error.message)
            })
        }, [token, navigate])

        if(isLoding){
            return <div>Loading...</div>
        }

  return (
    <>
      {children}
    </>
  )
}

export default CaptainProtectedWrapper