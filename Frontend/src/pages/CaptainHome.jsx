import React from "react";
import { Link } from "react-router-dom";
import CaptainDetails from "../Components/CaptainDetails";
import RidePopUp from "../Components/RidePopUp";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../Components/ConfirmRidePopUp";

const CaptainHome = () => {
  const [ridePopUpPanel, setRidePopUpPanel] = useState(false)
  const ridePopUpRef = useRef(null);
  const confirmRidePopUpRef = useRef(null);
  const [confirmRidePopUpPanel, setConfirmRidePopUpPanel] = useState(false)
  
  useGSAP(() => {
    if (ridePopUpPanel) {
      gsap.to(ridePopUpRef.current, {
        transform: "translateY(0)",
      });
    } else {
      gsap.to(ridePopUpRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [ridePopUpPanel]);

useGSAP(() => {
    if (confirmRidePopUpPanel) {
      gsap.to(confirmRidePopUpRef.current, {
        transform: "translateY(0)",
      });
    } else {
      gsap.to(confirmRidePopUpRef.current, {
        transform: "translateY(100%)",
      });
    }
  }, [confirmRidePopUpPanel]);



  return (
    <div className="h-screen relative">
      <div className="flex items-center justify-between p-2 bg-white">
        <img
          className="w-16"
          src="https://imgs.search.brave.com/Qytw_NXKyFxwwc0vzLr3hbi8hrXtzDbeh_Ziku74uSI/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9sb2dv/cy13b3JsZC5uZXQv/d3AtY29udGVudC91/cGxvYWRzLzIwMjAv/MDUvVWJlci1Mb2dv/LTcwMHgzOTQucG5n"
          alt=""
        />
        <Link
          to="/home"
          className="bg-white rounded-full  shadow-lg hover:bg-gray-100 transition flex items-center justify-center"
        >
          <i className="ri-logout-box-r-line text-lg text-black "></i>
        </Link>
      </div>
      <div className="h-3/5">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>
      <div className="h-2/5 p-4 ">
       <CaptainDetails />
       <button 
         onClick={() => setRidePopUpPanel(true)}
         className="text-white font-semibold mt-5 p-2 rounded-xl w-full bg-black hover:bg-gray-800"
       >
         Show Ride Request
       </button>
      </div>
      <div
        className="fixed w-full z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
        ref={ridePopUpRef}
      >
          <RidePopUp setRidePopUpPanel={setRidePopUpPanel} setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} />
      </div>
      <div
        className="fixed w-full h-screen z-10 bottom-0 translate-y-full bg-white px-3 py-10 pt-12"
        ref={confirmRidePopUpRef}>
          <ConfirmRidePopUp setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} />
      </div>
    </div>
  );
};

export default CaptainHome;
