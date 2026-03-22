import React from 'react'
import { Link } from 'react-router-dom'

const Riding = () => {
  return (
    <div className='h-screen relative'>
        <Link
          to="/home"
          className='absolute top-5 right-5 z-50 bg-white rounded-full p-2 shadow-lg hover:bg-gray-100 transition flex items-center justify-center'
        >
          <i className="ri-home-line text-lg text-black"></i>
        </Link>
        <div className='h-1/2'>
            <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
        </div>
        <div className='h-1/2 p-4 '>
        <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src="https://i.pinimg.com/736x/0d/64/98/0d64989794918e8c4b87490db1fcdc39.jpg"
            alt="driver"
          />
          <div>
            <h4 className="font-semibold text-lg">Ashok Kumar</h4>
            <p className="text-xs text-gray-600">White Suzuki S-Presso LXI</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-sm whitespace-nowrap">KA 15 AK 00</h3>
          <p className="text-sm text-yellow-500">⭐ 4.9</p>
        </div>
      </div>
    
      
      <div className="p-4 border-b-2 border-gray-200">
        <div className="flex items-start gap-3">
          <i className="text-lg ri-map-pin-fill text-green-600 mt-1"></i>
          <div>
            <h3 className="font-bold text-lg">562/11-A</h3>
            <p className="text-sm text-gray-600">Kaikondrahalli, Bengaluru, Karnataka</p>
          </div>
        </div>
      </div>
       <div className="w-full ml-5">
            <h3 className="font-semibold text-lg">₹120.30</h3>
            <p className="text-gray-500 text-sm -mt-1">Online Payment</p>
          </div>
            <button className="text-white font-semibold mt-5 p-2 rounded-xl w-full bg-black">Make a Payment</button>
        </div>
         
    </div>
  )
}

export default Riding