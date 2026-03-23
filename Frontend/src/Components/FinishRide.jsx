import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";


const FinishRide = (props) => {
  return (
   <div className='h-screen relative'>
          <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => {
          props.setRidePopUpPanel(false);
        }}
      >
      </h5>
      <h3 className="font-bold text-lg mb-5">Accept Payment</h3>
      <div className="flex items-center justify-between rounded-2xl p-4 border-2  border-amber-300">
        <div className="flex items-center gap-3">
            <img className='h-10 w-10 rounded-full object-cover' src="https://imgs.search.brave.com/BX9A8ZKa6qpSaWJJqWcvhnhBOhDtJrVaZ4BNvcM1bH0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjA0/MDM1NjU3NS9waG90/by9hLXlvdW5nLXdv/bWFuLWhvbGRzLWFu/LWVtcHR5LWJhbm5l/ci5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9dVp0WFk1ZU5z/NzN6ZHRxdVA1LTdF/a2N6dXFaMWJmV3pf/d0lrTUVjaWtJOD0" alt="" />
            <h2 className="font-semibold text-lg">Neha Singh</h2>
        </div>
        <h5 className="font-semibold text-lg">2.5km</h5>
      </div>

     <div>
         <div className="flex gap-2 justify-between items-center flex-col">
       
      </div>
      <div className="w-full mt-5">
        <div className="flex items-center gap-5 p-3 border-b-2 border-gray-200">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="font-semibold text-lg">562/11-A</h3>
            <p className="text-gray-500 text-sm -mt-1">Sector-32,Delhi</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 border-b-2 border-gray-200 ">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="font-semibold text-lg">867/19-D</h3>
            <p className="text-gray-500 text-sm -mt-1">Sector-54,Delhi</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 ">
          <div>
            <h3 className="font-semibold text-lg">₹120.30</h3>
            <p className="text-gray-500 text-sm -mt-1">Online Payment</p>
          </div>
        </div>
      </div>
      <div>
        <p className='text-gray-500 mt-6 text-sm'>Click on Complete Ride button if you complete the Payment</p>
        <form onSubmit={(e)=>{
          e.preventDefault();
        }}>

            <Link to='/captain-home'  className="text-white font-semibold mt-5 p-2 flex justify-center rounded-xl w-full bg-green-600">
        Complete Ride
      </Link>
       
        </form>
      </div>
     </div>
    </div>
    </div>
  )
}

export default FinishRide