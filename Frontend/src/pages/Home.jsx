import React from 'react'

const Home = () => {
  return (
    <div>
        <div className='bg-cover bg-top bg-[url(https://plus.unsplash.com/premium_photo-1731842686156-74895c29a87b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8dHJhZmZpYyUyMGxpZ2h0fGVufDB8fDB8fHww)] h-screen pt-8 flex justify-between flex-col w-full'>
            <img className='w-15 ml-8' src="https://imgs.search.brave.com/f9koJdeyfoOEVaO8Y12H2Hhx12j6MZ9OPrq21HTFzrk/rs:fit:0:180:1:0/g:ce/aHR0cHM6Ly93d3cu/ZWRpZ2l0YWxhZ2Vu/Y3kuY29tLmF1L3dw/LWNvbnRlbnQvdXBs/b2Fkcy9uZXctVWJl/ci1sb2dvLXdoaXRl/LXBuZy1zbWFsbC1z/aXplLnBuZw" alt="" />
            <div className='bg-white pb-7 px-4 py-4'>
                <h2 className='text-3xl font-bold'>Get Started with Rath</h2>
                <a href='/login' className=' flex justify-center items-center w-full bg-black text-white py-3 rounded mt-5'>Continue </a>
                

        </div>
    </div>
    </div>
  )
}
 
export default Home