import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";


const FinishRide = (props) => {
  const ride = props.ride || {};

  const capitalizeWord = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const getUserName = () => {
    const userDetails = ride.userDetails || {};
    if (userDetails.fullname?.firstname && userDetails.fullname?.lastname) {
        return `${capitalizeWord(userDetails.fullname.firstname)} ${capitalizeWord(userDetails.fullname.lastname)}`;
    }
    if (userDetails.firstname && userDetails.lastname) {
        return `${capitalizeWord(userDetails.firstname)} ${capitalizeWord(userDetails.lastname)}`;
    }
    if (userDetails.firstname) {
        return capitalizeWord(userDetails.firstname);
    }
    return capitalizeWord(userDetails.email?.split('@')[0]) || 'User';
  };

  return (
   <div className='h-screen relative'>
          <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0 cursor-pointer"
        onClick={() => {
          props.setFinishRidePanel(false);
        }}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
      </h5>
      <h3 className="font-bold text-lg mb-5 mt-6">Accept Payment</h3>
      <div className="flex items-center justify-between rounded-2xl p-4 border-2  border-amber-300 bg-amber-50">
        <div className="flex items-center gap-3">
            <div className='h-12 w-12 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center shrink-0'>
              <i className='ri-user-fill text-white text-xl'></i>
            </div>
            <h2 className="font-semibold text-lg">{getUserName()}</h2>
        </div>
        <h5 className="font-semibold text-lg">{ride.distance ? `${ride.distance.toFixed(1)}km` : '0km'}</h5>
      </div>

     <div>
         <div className="flex gap-2 justify-between items-center flex-col">
       
      </div>
      <div className="w-full mt-5">
        <div className="flex items-center gap-5 p-3 border-b-2 border-gray-200">
          <i className="text-lg ri-map-pin-2-fill text-green-600"></i>
          <div>
            <h3 className="font-semibold text-lg">{ride.pickup?.address?.substring(0, 30) || 'Pickup Location'}</h3>
            <p className="text-gray-500 text-sm -mt-1">Pickup</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 border-b-2 border-gray-200 ">
          <i className="text-lg ri-map-pin-2-fill text-red-600"></i>
          <div>
            <h3 className="font-semibold text-lg">{ride.destination?.address?.substring(0, 30) || 'Destination Location'}</h3>
            <p className="text-gray-500 text-sm -mt-1">Destination</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 ">
          <i className="ri-wallet-3-fill text-yellow-500 text-xl"></i>
          <div>
            <h3 className="font-semibold text-lg font-bold text-green-600">₹{ride.fare?.toFixed(2) || '0.00'}</h3>
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