import React from 'react'
import { Link } from 'react-router-dom';
import { useState, useRef } from 'react';
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import FinishRide from '../Components/FinishRide';


const CaptainRiding = (props) => {

    const [finishRidePanel, setFinishRidePanel] = useState(false)
    const finishRideRef = useRef(null);


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
      <div className="h-1/5 p-4 flex items-center justify-between bg-yellow-400 ">
          <h4 className="font-semibold text-lg">4Km away</h4>
          <button onClick={() => setFinishRidePanel(true)} className='bg-green-600 text-white font-semibold p-3 px-10 rounded-lg'>Finish Ride</button>
      </div>
     <div
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
        ref={finishRideRef}>
          <FinishRide setFinishRidePanel={setFinishRidePanel} />
      </div>
    </div>
  )
}

export default CaptainRiding