import React from 'react'

const LookingForDriver = (props) => {
  return (
     <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => {
          props.setVehiclePanel(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>
      <h3 className="font-bold text-lg mb-5">Looking for a driver</h3>

     <div>
         <div className="flex gap-2 justify-between items-center flex-col">
        <img
          className="h-20"
          src="https://swyft.pl/wp-content/uploads/2023/05/how-many-people-can-a-uberx-take.jpg"
          alt=""
        />
      </div>
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
     
     </div>
    </div>
  )
}

export default LookingForDriver