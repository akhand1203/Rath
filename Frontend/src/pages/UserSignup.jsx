import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useState, useContext } from 'react'
import axios from 'axios'
import { UserDataContext } from '../context/UserContext'

const UserSignup = () => {

const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
const navigate = useNavigate()
const { setUser } = useContext(UserDataContext)


const submitHandler = async (e) => {
    try {
    e.preventDefault()
    const newUser = {
      fullname: {
        firstname: firstName,
        lastname: lastName
      },
      email: email,
      password: password
    }

    const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/users/register`, newUser)

    if (response.status === 201) {
      const data = response.data
      setUser(data.user)
      localStorage.setItem('token', data.token)
      navigate('/home')
    }


    setEmail('')
    setFirstName('')
    setLastName('')
    setPassword('')
    } catch (error) {
      console.error('Signup failed:', error.response?.data || error.message)
      alert(error.response?.data?.message || 'Signup failed. Please check your input.')
    }
}

  return (
     <div className='p-7 flex flex-col justify-between h-screen'>
         <div>
          <img className='w-15 mb-3' src="https://imgs.search.brave.com/Qytw_NXKyFxwwc0vzLr3hbi8hrXtzDbeh_Ziku74uSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDUvVWJlci1Mb2dv/LTcwMHgzOTQucG5n" alt="" />
        <form onSubmit={(e)=>submitHandler(e)} >
           <h3 className='text-base font-medium mb-2'>What's your Name?</h3>
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
             <h3 className='text-base font-medium mb-2'>What's your email?</h3>
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
             <button
              className='bg-[#111] text-white  font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             >Create Account
             </button>
            <p className='text-center'>Already have an account?<Link to="/login" className='text-blue-600 '>Login Here</Link></p>
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

export default UserSignup