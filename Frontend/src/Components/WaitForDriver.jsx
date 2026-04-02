import React, { useState } from 'react'
import axiosInstance from '../utils/axiosInstance'

const WaitForDriver = (props) => {
  const { captain = null, setWaitForDriver, ride, rideAccepted = false } = props;
  const isRideAccepted = rideAccepted || ride?.status === 'accepted';
  const displayCaptain = captain || ride?.captain || null;
  const rideOtp = ride?.otp || props.otp || '------';
  
  // Log props to debug
  React.useEffect(() => {
    if (!captain) {
      console.error('❌ WaitForDriver component has no captain data');
    }
  }, [captain]);
  
  // Ensure setWaitForDriver is a function
  const handleSetWaitForDriver = (value) => {
    if (typeof setWaitForDriver === 'function') {
      setWaitForDriver(value);
    }
  };
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Show loading state until captain data is available, unless the ride is already accepted
  if (!displayCaptain && !isRideAccepted) {
    return (
      <div className="relative">
        <h5
          className="p-1 text-center w-full absolute top-0 left-0 right-0 cursor-pointer z-20"
          onClick={() => handleSetWaitForDriver(false)}
        >
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
        </h5>
        <div className="pt-8 flex flex-col items-center justify-center p-8">
          <div className='h-16 w-16 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center shrink-0 mb-4 animate-pulse'>
            <i className='ri-user-fill text-gray-500 text-2xl'></i>
          </div>
          <p className="text-gray-600 font-semibold">Waiting for captain details...</p>
        </div>
      </div>
    );
  }
  
  const getCaptainName = () => {
    if (displayCaptain?.fullname?.firstname && displayCaptain?.fullname?.lastname) {
      return `${displayCaptain.fullname.firstname} ${displayCaptain.fullname.lastname}`;
    }
    if (displayCaptain?.firstname && displayCaptain?.lastname) {
      return `${displayCaptain.firstname} ${displayCaptain.lastname}`;
    }
    return displayCaptain?.name || 'Captain';
  };
  
  const getVehicleInfo = () => {
    if (displayCaptain?.vehicle) {
      const vehicleType = displayCaptain.vehicle.vehicleType ? `${displayCaptain.vehicle.vehicleType.toUpperCase()} • ` : '';
      const color = displayCaptain.vehicle.color || '';
      const plate = displayCaptain.vehicle.plate || '';
      return `${vehicleType}${color} ${plate}`.trim();
    }
    return 'Vehicle Info';
  };
  
  const getPlateNumber = () => {
    if (displayCaptain?.vehicle && displayCaptain.vehicle.plate) {
      return displayCaptain.vehicle.plate;
    }
    return 'N/A';
  };
  
  const getRating = () => {
    return displayCaptain?.rating || '5.0';
  };

  const getCaptainPhone = () => {
    return displayCaptain?.phone || displayCaptain?.mobile || displayCaptain?.contactNumber || 'N/A';
  };

  const handleCancelRide = async () => {
    try {
      setIsCancelling(true);
      console.log('❌ Cancelling ride');
      
      if (!ride || !ride._id) {
        console.error('Ride ID not available');
        alert('Ride information not available');
        return;
      }

      const response = await axiosInstance.put(
        `/rides/${ride._id}/cancel`
      );

      console.log('✅ Ride cancelled successfully:', response.data);
      handleSetWaitForDriver(false);
    } catch (error) {
      console.error('❌ Error cancelling ride:', error);
      alert('Failed to cancel ride. Please try again.');
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="relative">
      <h5
        className="p-1 text-center w-full absolute top-0 left-0 right-0 cursor-pointer z-20"
        onClick={() => handleSetWaitForDriver(false)}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
      </h5>
      <div className="pt-8">
      <div className="mb-4 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-green-700">Ride status</p>
        <h3 className="text-lg font-bold text-green-900">
          {isRideAccepted ? 'Accepted by captain' : 'Captain assigned'}
        </h3>
        <p className="text-sm text-green-700">
          {isRideAccepted
            ? 'Your captain is on the way and the ride is now live.'
            : 'Waiting for the ride to be confirmed.'}
        </p>
      </div>
      {!displayCaptain && isRideAccepted && (
        <div className="mb-4 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-3">
          <p className="text-sm font-semibold text-blue-900">Ride accepted</p>
          <p className="text-sm text-blue-700">Your captain details will appear as soon as they are available.</p>
        </div>
      )}
      {!displayCaptain && !isRideAccepted && (
        <div className="pt-8 flex flex-col items-center justify-center p-8">
          <div className='h-16 w-16 rounded-full bg-gray-300 border-2 border-gray-400 flex items-center justify-center shrink-0 mb-4 animate-pulse'>
            <i className='ri-user-fill text-gray-500 text-2xl'></i>
          </div>
          <p className="text-gray-600 font-semibold">Waiting for captain details...</p>
        </div>
      )}
      {displayCaptain && (
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <div className='h-16 w-16 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center shrink-0'>
            <i className='ri-user-fill text-white text-2xl'></i>
          </div>
          <div>
            <h4 className="font-semibold text-lg">{getCaptainName()}</h4>
            <p className="text-xs text-gray-600">{getVehicleInfo()}</p>
            <p className="text-xs text-gray-500">Phone: {getCaptainPhone()}</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-lg">{getPlateNumber()}</h3>
          <p className="text-sm text-yellow-500">⭐ {getRating()}</p>
        </div>
      </div>
      )}
      {isRideAccepted && (
        <div className="p-4 border-b-2 border-gray-200">
          <div className="rounded-2xl border border-purple-200 bg-purple-50 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-700">OTP</p>
            <h3 className="text-2xl font-bold text-purple-900">{rideOtp}</h3>
            <p className="text-sm text-purple-700">Share this OTP with your captain to start the ride.</p>
          </div>
        </div>
      )}
      <div className="p-4 border-b-2 border-gray-200">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <i className="text-lg ri-map-pin-fill text-green-600 mt-1"></i>
            <div>
              <h3 className="font-bold text-lg">{ride?.pickup?.address || 'Pickup Location'}</h3>
              <p className="text-sm text-gray-600">Pickup</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold text-gray-700">{ride?.distance ? `${Number(ride.distance).toFixed(2)} km` : 'Distance N/A'}</p>
            <p className="text-xs text-gray-500">{ride?.duration ? `${Math.round(ride.duration)} min` : ''}</p>
          </div>
        </div>
      </div>
      <div className="p-4 border-b-2 border-gray-200">
        <div className="flex items-start gap-3">
          <i className="text-lg ri-map-pin-fill text-red-600 mt-1"></i>
          <div>
            <h3 className="font-bold text-lg">{ride?.destination?.address || 'Destination'}</h3>
            <p className="text-sm text-gray-600">Destination</p>
          </div>
        </div>
      </div>
      <div className="p-4 border-b-2 border-gray-200">
        <button className="w-full bg-gray-200 text-gray-700 py-2 rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-gray-300">
          <span>Send a message...</span>
          <i className="ri-arrow-right-line"></i>
        </button>
      </div>
      <div className="flex justify-around py-4 border-b-2 border-gray-200">
        <button className="flex flex-col items-center gap-2 hover:opacity-80">
          <div className="bg-gray-100 p-4 rounded-full">
            <i className="ri-shield-check-line text-blue-500 text-2xl"></i>
          </div>
          <p className="text-sm font-semibold">Safety</p>
        </button>
        <button className="flex flex-col items-center gap-2 hover:opacity-80">
          <div className="bg-gray-100 p-4 rounded-full">
            <i className="ri-share-location-line text-blue-500 text-2xl"></i>
          </div>
          <p className="text-sm font-semibold">Share my trip</p>
        </button>
        <button className="flex flex-col items-center gap-2 hover:opacity-80">
          <div className="bg-gray-100 p-4 rounded-full">
            <i className="ri-phone-line text-blue-500 text-2xl"></i>
          </div>
          <p className="text-sm font-semibold">Call driver</p>
        </button>
      </div>
      <div className="p-4">
        <button 
          onClick={handleCancelRide}
          disabled={isCancelling}
          className="w-full p-3 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isCancelling ? 'Cancelling...' : '❌ Cancel Ride'}
        </button>
      </div>
      </div>
    </div>
  )
}

export default WaitForDriver