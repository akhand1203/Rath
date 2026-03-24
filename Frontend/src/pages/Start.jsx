import React from 'react'
import { Link } from 'react-router-dom';

const Start = () => {
  return (
    <div>
        <div className='bg-cover bg-top h-screen pt-8 flex justify-between flex-col w-full' style={{ backgroundImage: "url('/Rath-coverpic.png')" }}>
            <Link to="/">
              <img className='h-15 w-15' src="/Rath.png" alt="" />
            </Link>
            <div className='bg-white pb-7 px-4 py-4'>
                <h2 className='text-3xl font-bold'>Get Started with Rath</h2>
                <a href='/login' className=' flex justify-center items-center w-full bg-black text-white py-3 rounded mt-5'>Continue </a>
                

        </div>
    </div>
    </div>
  )
}
 
export default Start