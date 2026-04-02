import React, { useState, useRef } from 'react'
import { Link, useLocation } from 'react-router-dom';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from '../Components/FinishRide';

const CaptainRiding = (props) => {
    const location = useLocation();
    const ride = location.state?.ride || {};
    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRideRef = useRef(null);

    const capitalizeWord = (word) => {
        if (!word) return '';
        return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    };

    const getUserName = () => {
        const userDetails = ride?.userDetails || {};
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


    useGSAP(() => {
    if (finishRidePanel) {
      gsap.to(finishRideRef.current, {
        transform: "translateY(0)",
      });
    } else {
      gsap.to(finishRideRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [ finishRidePanel]);

  return (
     <div className="h-screen relative">
      <div className="flex items-center justify-between p-2 absolute top-0 left-0 right-0 z-10">
        <Link to="/">
          <img
            className="h-15 w-15 cursor-pointer"
            src="/Rath.png"
            alt="Rath Logo"
          />
        </Link>
        <Link
          to="/captain-login"
          className="bg-white rounded-full  shadow-lg hover:bg-gray-100 transition flex items-center justify-center"
        >
          <i className="ri-logout-box-r-line text-lg text-black "></i>
        </Link>
      </div>
      <div className="h-4/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>
      <div className="h-1/5 p-4 flex flex-col justify-center bg-yellow-400 ">
          <div className="flex items-center justify-between mb-3 border-b border-yellow-500 pb-2">
            <div>
              <h4 className="font-bold text-xl">{getUserName()}</h4>
              <p className="font-semibold text-sm truncate max-w-[200px]">{ride?.destination?.address || 'Destination'}</p>
            </div>
            <h4 className="font-bold text-xl">{ride?.distance ? `${ride.distance.toFixed(1)}km` : '0km'}</h4>
          </div>
          <button onClick={() => setFinishRidePanel(true)} className='bg-green-600 text-white font-bold p-3 w-full rounded-lg shadow-lg'>Finish Ride</button>
      </div>
     <div
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
        ref={finishRideRef}>
          <FinishRide setFinishRidePanel={setFinishRidePanel} ride={ride} />
      </div>
    </div>
  )
}

export default CaptainRiding