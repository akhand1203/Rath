import React, { useState } from 'react'
import axiosInstance from '../utils/axiosInstance'

const LookingForDriver = (props) => {
  const [isCancelling, setIsCancelling] = useState(false);

  const getVehicleImage = () => {
    switch(props.selectedVehicle?.type) {
      case 'Car':
        return '/car.png';
      case 'Moto':
        return '/bike.png';
      case 'Auto':
        return '/auto.png';
      default:
        return '/car.png';
    }
  };

  const handleCancelRequest = async () => {
    try {
      setIsCancelling(true);
      console.log('❌ Cancelling ride request');
      
      if (!props.ride || !props.ride._id) {
        console.error('Ride ID not available');
        alert('Ride information not available');
        return;
      }

      const response = await axiosInstance.put(
        `/rides/${props.ride._id}/cancel`
      );

      console.log('✅ Ride cancelled successfully:', response.data);
      props.setVehiclefound(false);
      if (props.setConfirmVehiclePanel) {
        props.setConfirmVehiclePanel(true);
      }
    } catch (error) {
      console.error('❌ Error cancelling ride:', error);
      alert('Failed to cancel request. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
     <div className="relative">
      <h5
        className="p-1 text-center w-full absolute top-0 left-0 right-0 cursor-pointer z-20"
        onClick={() => {
          props.setVehiclePanel(false);
        }}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
      </h5>
      <div className="pt-8 px-4">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-xl">🚗 Looking for a driver</h3>
          <div className="animate-spin">
            <i className="text-2xl text-blue-600 ri-close-circle-fill"></i>
          </div>
        </div>

        <div>
          {/* Vehicle Image */}
          <div className="flex justify-center gap-2 items-center mb-6">
            <img
              className="h-20 drop-shadow-lg"
              src={getVehicleImage()}
              alt={props.selectedVehicle?.type || 'Vehicle'}
            />
          </div>

          {/* Ride Details - Always visible */}
          <div className="w-full mb-4 space-y-3">
            <div className="flex items-center gap-4 p-4 border-l-4 border-green-600 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-green-600 rounded-full shrink-0">
                <i className="text-lg ri-map-pin-2-fill text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase">Pickup Point</p>
                <h3 className="font-semibold text-sm line-clamp-2">{props.pickup || 'Pickup Location'}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border-l-4 border-red-600 bg-red-50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-red-600 rounded-full shrink-0">
                <i className="text-lg ri-map-pin-2-fill text-white"></i>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase">Destination</p>
                <h3 className="font-semibold text-sm line-clamp-2">{props.destination || 'Destination'}</h3>
              </div>
            </div>

            <div className="flex items-center gap-4 p-4 border-l-4 border-yellow-600 bg-yellow-50 rounded-lg">
              <div className="flex items-center justify-center w-10 h-10 bg-yellow-500 rounded-full shrink-0">
                <i className="ri-wallet-3-fill text-white font-bold"></i>
              </div>
              <div className="flex-1">
                <p className="text-xs text-gray-500 font-bold uppercase">Estimated Fare</p>
                <h3 className="font-bold text-lg text-green-600">₹{props.selectedVehicle?.fare?.toFixed(2) || '0.00'}</h3>
                <p className="text-xs text-gray-500 mt-1">
                  {props.distance && props.duration ? 
                    `${props.distance.toFixed(2)} km • ${props.duration} min` :
                    `${props.selectedVehicle?.type || 'Vehicle'} • Online Payment`
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Status Box */}
          <div className="mt-4 p-4 bg-linear-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
            <div className="flex items-center gap-3 mb-2">
              <div className="flex gap-1">
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce"></span>
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></span>
                <span className="inline-block w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{animationDelay: '0.4s'}}></span>
              </div>
              <p className="text-sm font-semibold text-blue-800">Searching for drivers nearby...</p>
            </div>
            <p className="text-xs text-blue-700">💡 Drivers will see your request shortly. Stay tuned!</p>
          </div>

          {/* Cancel Button */}
          <button 
            onClick={handleCancelRequest}
            disabled={isCancelling}
            className="w-full mt-4 p-3 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isCancelling ? 'Cancelling...' : '❌ Cancel Request'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default LookingForDriver