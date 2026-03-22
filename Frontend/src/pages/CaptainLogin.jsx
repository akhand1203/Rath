import React from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { CaptainDataContext } from '../context/CaptainContext'

const CaptainLogin = () => {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const { setCaptain } = React.useContext(CaptainDataContext)
    const navigate = useNavigate()

  
    const submitHandler = async (e) => {
      e.preventDefault()
  const captain ={
        email:email,
         password:password
        }
      
        const response = await axios.post(`${import.meta.env.VITE_BASE_URL}/captains/login`, captain)
        
        if(response.status === 200){
          const data = response.data
          setCaptain(data.captain)
          localStorage.setItem('token', data.token)
          navigate('/captain-home')
        }

      setEmail('')
      setPassword('')
      }


  return (
      <div className='p-7 flex flex-col justify-between h-screen'>
         <div>
          <img className='w-15 mb-3' src="https://imgs.search.brave.com/Qytw_NXKyFxwwc0vzLr3hbi8hrXtzDbeh_Ziku74uSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDUvVWJlci1Mb2dv/LTcwMHgzOTQucG5n" alt="" />
        <form onSubmit={(e)=>submitHandler(e)} >
             <h3 className='text-lg font-medium mb-2'>What's our captain's Email?</h3>
             <input 
             value={email}
             onChange={(e)=>{
              setEmail(e.target.value)
             }}
             className='bg-[#eeeeee] mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             required 
             type="email" placeholder='email@example.com'
              />
             <h3 className='text-lg font-medium mb-2'>Enter Password</h3>
             <input 
             value={password}
             onChange={(e)=>{
             setPassword(e.target.value)
             }}
             className='bg-[#eeeeee] mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             required 
             type="password" placeholder='password' 
             />
             <button
              className='bg-[#111] text-white  font-semibold mb-3 rounded px-4 py-2  w-full text-lg placeholder:text-base'
             >Login
             </button>
            <p className='text-center'>Join a fleet?<Link to="/captain-signup" className='text-blue-600 '> Register as a Captain</Link></p>

        </form>
         </div>
         <div>
          <Link to="/login" className='bg-[#d5622d] text-white flex items-center justify-center font-semibold mb-7 rounded px-4 py-2  w-full text-lg placeholder:text-base'>
            Sign in as User
          </Link>
         </div>
    </div>
  )
}

export default CaptainLogin