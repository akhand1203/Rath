import React from 'react'
import { Link, useNavigate } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import captainAxiosInstance from '../utils/captainAxiosInstance';


const FinishRide = (props) => {
  const ride = props.ride || {};
  const navigate = useNavigate();
  const [isCompleting, setIsCompleting] = useState(false);
  const [error, setError] = useState(null);

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

  const handleCompleteRide = async (e) => {
    e.preventDefault();
    try {
      setIsCompleting(true);
      setError(null);

      console.log('Completing ride:', ride._id);

      const response = await captainAxiosInstance.put(
        `/rides/${ride._id}/end`
      );

      console.log('Ride completed successfully:', response.data);

      props.setFinishRidePanel(false);
      
      setTimeout(() => {
        navigate('/captain-home');
      }, 500);
    } catch (error) {
      console.error('Error completing ride:', error);
      setError(error.response?.data?.message || 'Failed to complete ride');
      setIsCompleting(false);
    }
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
        {error && <div className="bg-red-100 text-red-700 p-2 rounded mt-3 text-sm">{error}</div>}
        <p className='text-gray-500 mt-6 text-sm'>Click on Complete Ride button if you complete the Payment</p>
        <form onSubmit={handleCompleteRide}>
          <button
            type="submit"
            disabled={isCompleting}
            className="text-white font-semibold mt-5 p-2 flex justify-center rounded-xl w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCompleting ? 'Completing...' : 'Complete Ride'}
          </button>
        </form>
      </div>
     </div>
    </div>
    </div>
  )
}

export default FinishRide