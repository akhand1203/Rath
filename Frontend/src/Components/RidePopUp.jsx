import React, { useEffect, useState } from 'react'
import captainAxiosInstance from '../utils/captainAxiosInstance'

const RidePopUp = (props) => {
  const ride = props.ride || {};
  const userDetails = ride.userDetails || {};
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);
  const [error, setError] = useState(null);

  // Debug logging
  useEffect(() => {
    if (ride && ride._id) {
      console.log('✅ Valid ride object with ID:', ride._id);
      console.log('   Pickup address:', ride.pickup?.address);
      console.log('   Destination address:', ride.destination?.address);
      console.log('   Fare:', ride.fare);
      console.log('   Distance:', ride.distance, 'km');
      console.log('   Duration:', ride.duration, 'min');
      console.log('   Vehicle Type:', ride.vehicleType);
      console.log('   User Details:', userDetails);
    }
  }, [ride, userDetails]);

  const capitalizeWord = (word) => {
    if (!word) return '';
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  };

  const getUserName = () => {
    if (userDetails.fullname?.firstname && userDetails.fullname?.lastname) {
      return `${capitalizeWord(userDetails.fullname.firstname)} ${capitalizeWord(userDetails.fullname.lastname)}`;
    }
    if (userDetails.firstname && userDetails.lastname) {
      return `${capitalizeWord(userDetails.firstname)} ${capitalizeWord(userDetails.lastname)}`;
    }
    if (userDetails.firstname) return capitalizeWord(userDetails.firstname);
    return capitalizeWord(userDetails.email?.split('@')[0]) || 'User';
  };

  const getPickupAddress = () => {
    if (ride.pickup?.address && ride.pickup.address !== 'undefined') return ride.pickup.address;
    if (ride.pickup?.displayName && ride.pickup.displayName !== 'undefined') return ride.pickup.displayName;
    return 'Pickup Location';
  };

  const getDestinationAddress = () => {
    if (ride.destination?.address && ride.destination.address !== 'undefined') return ride.destination.address;
    if (ride.destination?.displayName && ride.destination.displayName !== 'undefined') return ride.destination.displayName;
    return 'Destination';
  };

  // ── Accept ride ──────────────────────────────────────────────────────────
  const handleAcceptRide = async () => {
    try {
      setIsAccepting(true);
      setError(null);
      console.log('🚀 Accept clicked — ride ID:', ride._id);

      if (!ride || !ride._id) {
        console.error('❌ Ride ID missing');
        setError('Ride information not available');
        return;
      }

      // Using captainAxiosInstance so the Authorization header carries captainToken
      const response = await captainAxiosInstance.put(
        `/rides/${ride._id}/status`,
        { status: 'accepted' }
      );

      console.log('✅ Ride accepted:', response.data);
      props.setRidePopUpPanel(false);
      props.setConfirmRidePopUpPanel(true);
    } catch (err) {
      console.error('❌ Error accepting ride:', err);
      setError(err.response?.data?.message || 'Failed to accept ride. Please try again.');
    } finally {
      setIsAccepting(false);
    }
  };

  // ── Ignore / reject ride ─────────────────────────────────────────────────
  const handleIgnoreRide = async () => {
    try {
      setIsRejecting(true);
      setError(null);
      console.log('❌ Rejecting ride:', ride._id);

      if (!ride || !ride._id) {
        console.error('Ride ID not available');
        setError('Ride information not available');
        return;
      }

      // NOTE: /rides/:id/cancel is protected by authUser in ride.routes.js.
      // Captains cannot cancel a ride they haven't accepted — they should just
      // dismiss the popup. If you later add a captain-cancel route, switch to
      // captainAxiosInstance here too.
      props.setRidePopUpPanel(false);
    } catch (err) {
      console.error('❌ Error ignoring ride:', err);
      setError('Failed to ignore ride. Please try again.');
    } finally {
      setIsRejecting(false);
    }
  };

  return (
    <div className="relative">
      <div>
        <h5
          className="p-1 text-center w-full absolute top-0 left-0 right-0 cursor-pointer z-20"
          onClick={() => props.setRidePopUpPanel(false)}
        >
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
        </h5>

        <div className="pt-8">
          <h3 className="font-bold text-lg mb-5">🚨 New Ride Request</h3>

          {/* Error banner */}
          {error && (
            <div className="mb-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm font-medium">
              {error}
            </div>
          )}

          <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center shrink-0">
                <i className="ri-user-fill text-white text-xl"></i>
              </div>
              <div>
                <h2 className="font-bold text-lg">{getUserName()}</h2>
                <p className="text-xs text-gray-500">{userDetails.email}</p>
              </div>
            </div>
            <div className="text-right">
              <h5 className="font-bold text-2xl text-blue-600">
                {ride.distance ? `${ride.distance.toFixed(2)}` : '0'} km
              </h5>
              <p className="text-xs text-gray-500">
                {ride.duration ? `${ride.duration} min` : 'N/A'}
              </p>
            </div>
          </div>

          <div>
            <div className="w-full mt-5">
              {/* Pickup */}
              <div className="flex items-center gap-5 p-4 border-b-2 border-gray-200 bg-green-50 rounded-lg mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-green-600 rounded-full shrink-0">
                  <i className="text-lg ri-map-pin-2-fill text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">PICKUP LOCATION</p>
                  <h3 className="font-bold text-base line-clamp-2">{getPickupAddress()}</h3>
                </div>
              </div>

              {/* Destination */}
              <div className="flex items-center gap-5 p-4 border-b-2 border-gray-200 bg-red-50 rounded-lg mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-red-600 rounded-full shrink-0">
                  <i className="text-lg ri-map-pin-2-fill text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">DESTINATION</p>
                  <h3 className="font-bold text-base line-clamp-2">{getDestinationAddress()}</h3>
                </div>
              </div>

              {/* Fare */}
              <div className="flex items-center gap-5 p-4 bg-yellow-50 rounded-lg mb-3">
                <div className="flex items-center justify-center w-8 h-8 bg-yellow-500 rounded-full shrink-0">
                  <i className="ri-wallet-3-fill text-white"></i>
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500 font-semibold">FARE ESTIMATE</p>
                  <h3 className="font-bold text-xl text-green-600">
                    ₹{ride.fare?.toFixed(2) || '0.00'}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {ride.vehicleType
                      ? ride.vehicleType.charAt(0).toUpperCase() + ride.vehicleType.slice(1)
                      : 'Vehicle'}{' '}
                    • Online Payment
                  </p>
                </div>
              </div>
            </div>

            {/* Accept */}
            <button
              onClick={handleAcceptRide}
              disabled={isAccepting}
              className="text-white font-bold mt-5 p-3 rounded-xl w-full bg-green-600 hover:bg-green-700 transition text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAccepting ? 'Accepting...' : '✓ Accept Ride'}
            </button>

            {/* Ignore */}
            <button
              onClick={handleIgnoreRide}
              disabled={isRejecting || isAccepting}
              className="text-gray-700 font-semibold mt-2 p-3 rounded-xl w-full bg-gray-300 hover:bg-gray-400 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isRejecting ? 'Ignoring...' : '✕ Ignore'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RidePopUp;