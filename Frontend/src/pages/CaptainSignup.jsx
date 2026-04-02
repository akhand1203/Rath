import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
import { CaptainDataContext } from '../context/CaptainContext'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'



const CaptainSignup = () => {

  const navigate = useNavigate()

  const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')

const [vehicleColor, setVehicleColor] = useState('')
const [vehiclePlate, setVehiclePlate] = useState('')
const [vehicleCapacity, setVehicleCapacity] = useState('')
const [vehicleType, setVehicleType] = useState('')
const [errorMessage, setErrorMessage] = useState('')

  const{ setCaptain} = React.useContext(CaptainDataContext)

  const submitHandler = async (e) => {
    e.preventDefault()
    setErrorMessage('')

    const captainData =  {
      fullname: {
      firstname:firstName,
      lastname: lastName,
      },
      email:email,
       password:password,
        vehicle: {
          color: vehicleColor,
          plate: vehiclePlate,
          capacity: vehicleCapacity,
          vehicleType: vehicleType
        }
    }

    try {
      const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/register`, captainData)
      
      if(response.status === 201){
        const data = response.data
        setCaptain(data.captain)
          localStorage.setItem('captainToken', data.token) 
          navigate('/captain-home')
      }

      setCaptain(captainData)
      setEmail('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setVehicleColor('')
      setVehiclePlate('')
      setVehicleCapacity('')
      setVehicleType('')
    } catch (error) {
      const backendError = error?.response?.data
      const validationMessage = backendError?.errors?.[0]?.msg
      const message = validationMessage || backendError?.message || 'Signup failed. Please check your details and try again.'
      setErrorMessage(message)
    }
  }
   return (
      <div className='p-7 flex flex-col justify-between h-screen'>
         <div>
          <img className='w-15 mb-3' src="https://imgs.search.brave.com/Qytw_NXKyFxwwc0vzLr3hbi8hrXtzDbeh_Ziku74uSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDUvVWJlci1Mb2dv/LTcwMHgzOTQucG5n" alt="" />
        <form onSubmit={(e)=>submitHandler(e)} >
           <h3 className='text-base font-medium mb-2'>What's our captain's Name?</h3>
          <div className='flex gap-4 mb-5'>
             <input 
             value={firstName}
             onChange={(e) => setFirstName(e.target.value)}
             className='bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-lg placeholder:text-base'
             required 
             type="name" placeholder='Firstname'
              />
               <input 
             value={lastName}
             onChange={(e) => setLastName(e.target.value)}
             className='bg-[#eeeeee]  rounded px-4 py-2  w-1/2 text-lg placeholder:text-base'
             required 
             type="name" placeholder='Lastname'
              />
          </div>
             <h3 className='text-base font-medium mb-2'>What's our captain's email?</h3>
             <input 
              value={email}   
              onChange={(e)=>{
              setEmail(e.target.value)
             }}
             className='bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             required 
             type="email" placeholder='email@example.com'
              />
             <h3 className='text-base font-medium mb-2'>Enter Password</h3>
             <input 
              value={password}    
              onChange={(e)=>{
              setPassword(e.target.value)
             }}
             className='bg-[#eeeeee] mb-5 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             required 
             type="password" placeholder='password' 
             />
            <h3 className='text-base font-medium mb-2'>Vehicle Information</h3>
            <div className='flex gap-4 mb-5'>
              <input 
                value={vehicleColor}
                onChange={(e) => setVehicleColor(e.target.value)}
                className='bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-lg placeholder:text-base'
                required 
                type="text" placeholder='Vehicle Color'
              />
              <input 
                value={vehiclePlate}
                onChange={(e) => setVehiclePlate(e.target.value)}
                className='bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-lg placeholder:text-base'
                required 
                type="text" placeholder='Vehicle Plate'
              />
            </div>
            <div className='flex gap-4 mb-5'>
              <input 
                value={vehicleCapacity}
                onChange={(e) => setVehicleCapacity(e.target.value)}
                className='bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-lg placeholder:text-base'
                required 
                type="number" placeholder='Vehicle Capacity'
              />
              <select 
                value={vehicleType}
                onChange={(e) => setVehicleType(e.target.value)}
                className='bg-[#eeeeee] rounded px-4 py-2 w-1/2 text-lg'
                required
              >
                <option value="">Select Vehicle Type</option>
                <option value="car">Car</option>
                <option value="auto">Auto</option>
                <option value="motorcycle">Moto</option>
              </select>
            </div>
            {errorMessage && <p className='text-red-600 text-sm mb-3'>{errorMessage}</p>}
             <button
              className='bg-[#111] text-white  font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             >Login
             </button>
            <p className='text-center'>Already have an account?<Link to="/captain-login" className='text-blue-600 '>Login Here</Link></p>
        </form>
         </div>
         <div>
          <p className='text-[10px] leading-tight'>
This site is protected by reCAPTCHA and the <span className='underline font-semibold'>Google Privacy Policy</span> and <span className='underline font-semibold'>Terms of Service</span> apply.
Privacy          </p>
         </div>
    </div>
  )
}

export default CaptainSignup