import React from "react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import captainAxiosInstance from "../utils/captainAxiosInstance";
import { useNavigate } from "react-router-dom";

const ConfirmRidePopUp = (props) => {
    const [otp, setOtp] = useState("");
    const [isAccepting, setIsAccepting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const capitalizeWord = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };

    const getUserName = () => {
        const userDetails = props.ride?.userDetails || {};
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

    const submitHandler = (e) => {
        e.preventDefault();
    };

    const handleAcceptRide = async () => {
        try {
            console.log('✅ handleAcceptRide CALLED');
            setIsAccepting(true);
            setError(null);

            if (!props.ride || !props.ride._id) {
                console.error('❌ Ride information not available');
                setError('Ride information not available');
                return;
            }

            console.log('🚀 Sending Accept request to backend');
            console.log('   Ride ID:', props.ride._id);
            console.log('   Endpoint: PUT /rides/' + props.ride._id + '/status');
            
            const response = await captainAxiosInstance.put(
                `/rides/${props.ride._id}/status`,
                { status: 'accepted' }
            );

            console.log('✅ Accept response received from backend');
            console.log('   Status:', response.status);
            console.log('   Data:', JSON.stringify(response.data, null, 2));
            
            // Close the popup 
            props.setConfirmRidePopUpPanel(false);
            
            // Redirect after a short delay
            setTimeout(() => {
                console.log('🔄 Redirecting to /captain-riding');
                navigate('/captain-riding', { state: { ride: props.ride } });
            }, 500);
        } catch (error) {
            console.error('❌ ERROR in handleAcceptRide');
            console.error('   Message:', error.message);
            console.error('   Status:', error.response?.status);
            console.error('   Response:', error.response?.data);
            
            setError(error.response?.data?.message || 'Failed to accept ride');
            setIsAccepting(false);
        }
    };

    const handleCancelRide = async () => {
        try {
            setIsCancelling(true);
            console.log('❌ Cancelling ride:', props.ride?._id);
            
            if (!props.ride || !props.ride._id) {
                console.error('Ride ID not available');
                setError('Ride information not available');
                return;
            }

            const response = await captainAxiosInstance.put(
                `/rides/${props.ride._id}/cancel`
            );

            console.log('✅ Ride cancelled successfully:', response.data);
            props.setConfirmRidePopUpPanel(false);
        } catch (error) {
            console.error('❌ Error cancelling ride:', error);
            setError(error.response?.data?.message || 'Failed to cancel ride');
        } finally {
            setIsCancelling(false);
        }
    };
  return (
    <div className="h-screen relative">
      <div className="relative">
        <h5
          className="p-1 text-center w-full absolute top-0 left-0 right-0 cursor-pointer z-20"
          onClick={() => {
            props.setRidePopUpPanel(false);
          }}
        >
          <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
        </h5>
        <div className="pt-8">
        <h3 className="font-bold text-lg mb-5">Confirm this ride to Start</h3>
        <div className="flex items-center justify-between rounded-2xl p-4 border-b-2 border-gray-200 bg-amber-300">
          <div className="flex items-center gap-3">
            <div className='h-10 w-10 rounded-full bg-blue-500 border-2 border-blue-600 flex items-center justify-center shrink-0'>
              <i className='ri-user-fill text-white'></i>
            </div>
            <h2 className="font-semibold text-lg">{getUserName()}</h2>
          </div>
          <h5 className="font-semibold text-lg">{props.ride?.distance ? `${props.ride.distance.toFixed(1)}km` : '0km'}</h5>
        </div>

        <div>
          <div className="flex gap-2 justify-between items-center flex-col"></div>
          <div className="w-full mt-5">
            <div className="flex items-center gap-5 p-3 border-b-2 border-gray-200">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="font-semibold text-lg">{props.ride?.pickup?.address?.substring(0, 30) || 'Pickup'}</h3>
                <p className="text-gray-500 text-sm -mt-1">Pickup Location</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 border-b-2 border-gray-200 ">
              <i className="text-lg ri-map-pin-2-fill"></i>
              <div>
                <h3 className="font-semibold text-lg">{props.ride?.destination?.address?.substring(0, 30) || 'Destination'}</h3>
                <p className="text-gray-500 text-sm -mt-1">Destination</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 ">
              <i className="ri-wallet-3-fill"></i>
              <div>
                <h3 className="font-semibold text-lg">₹{props.ride?.fare?.toFixed(2) || '0.00'}</h3>
                <p className="text-gray-500 text-sm -mt-1">Online Payment</p>
              </div>
            </div>
          </div>
          <div>
            {error && <div className="mt-3 p-3 bg-red-100 text-red-700 rounded-lg text-sm">{error}</div>}
            <form
              onSubmit={submitHandler}
            >
              <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
                className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-4"
                type="number"
                placeholder="Enter OTP"
              />
              <button
                type="button"
                onClick={handleAcceptRide}
                disabled={isAccepting}
                className="text-white font-semibold mt-5 p-2 flex justify-center rounded-xl w-full bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAccepting ? 'Accepting...' : 'Accept'}
              </button>
              <button
                type="button"
                onClick={handleCancelRide}
                disabled={isCancelling}
                className="text-white font-semibold mt-2 p-2 rounded-xl w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCancelling ? 'Cancelling...' : 'Cancel'}
              </button>
            </form>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRidePopUp;
