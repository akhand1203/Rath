import React from "react";
import { Link } from "react-router-dom";
import { useState, useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const ConfirmRidePopUp = (props) => {
    const [otp, setOtp] = useState("");

    const submitHandler = (e) => {
        e.preventDefault();
    };
  return (
    <div className="h-screen relative">
      <div>
        <h5
          className="p-1 text-center w-[93%] absolute top-0"
          onClick={() => {
            props.setRidePopUpPanel(false);
          }}
        >
          <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
        </h5>
        <h3 className="font-bold text-lg mb-5">Confirm this ride to Start</h3>
        <div className="flex items-center justify-between rounded-2xl p-4 border-b-2 border-gray-200 bg-amber-300">
          <div className="flex items-center gap-3">
            <img
              className="h-10 w-10 rounded-full object-cover"
              src="https://imgs.search.brave.com/BX9A8ZKa6qpSaWJJqWcvhnhBOhDtJrVaZ4BNvcM1bH0/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvMjA0/MDM1NjU3NS9waG90/by9hLXlvdW5nLXdv/bWFuLWhvbGRzLWFu/LWVtcHR5LWJhbm5l/ci5qcGc_cz02MTJ4/NjEyJnc9MCZrPTIw/JmM9dVp0WFk1ZU5z/NzN6ZHRxdVA1LTdF/a2N6dXFaMWJmV3pf/d0lrTUVjaWtJOD0"
              alt=""
            />
            <h2 className="font-semibold text-lg">Neha Singh</h2>
          </div>
          <h5 className="font-semibold text-lg">2.5km</h5>
        </div>

        <div>
          <div className="flex gap-2 justify-between items-center flex-col"></div>
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
              <i className="ri-wallet-3-fill"></i>
              <div>
                <h3 className="font-semibold text-lg">₹120.30</h3>
                <p className="text-gray-500 text-sm -mt-1">Online Payment</p>
              </div>
            </div>
          </div>
          <div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
              }}
            >
              <input
              onChange={(e) => setOtp(e.target.value)}
              value={otp}
                className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-4"
                type="number"
                placeholder="Enter OTP"
              />
              <Link
                to="/captain-riding"
                className="text-white font-semibold mt-5 p-2 flex justify-center rounded-xl w-full bg-green-600"
              >
                Accept
              </Link>
              <button
                onClick={() => {
                  props.setConfirmRidePopUpPanel(false);
                }}
                className="text-white font-semibold mt-2 p-2 rounded-xl w-full bg-red-600"
              >
                Cancel
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmRidePopUp;
