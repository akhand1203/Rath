import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'



const CaptainSignup = () => {
  const [email, setEmail] = useState('')
const [password, setPassword] = useState('')
const [firstName, setFirstName] = useState('')
const [lastName, setLastName] = useState('')
const [userData, setUserData] = useState({})

  const submitHandler = (e) => {
    e.preventDefault()
    setUserData({
      fullName:{
      firstName:firstName,
      lastName:lastName,
      },
      email:email,
       password:password })
    setEmail('')
    setPassword('')
    setFirstName('')
    setLastName('')
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