import React from "react";

const ConfirmedVehicle = (props) => {
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

  return (
    <div className="relative">
      <h5
        className="p-1 text-center w-full absolute top-0 left-0 right-0 cursor-pointer z-20"
        onClick={() => {
          props.setConfirmVehiclePanel(false);
        }}
      >
        <i className="text-3xl text-gray-400 ri-arrow-down-wide-line hover:text-gray-600 transition-colors"></i>
      </h5>
      <div className="pt-8">
        <h3 className="font-bold text-lg mb-5">Confirm your Ride</h3>

     <div>
         <div className="flex gap-2 justify-between items-center flex-col">
        <img
          className="h-20"
          src={getVehicleImage()}
          alt={props.selectedVehicle?.type || 'Vehicle'}
        />
      </div>
      <div className="w-full mt-5">
        <div className="flex items-center gap-5 p-3 border-b-2 border-gray-200">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="font-semibold text-lg">{props.pickup || 'Pickup Location'}</h3>
            <p className="text-gray-500 text-sm -mt-1">Pickup Point</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 border-b-2 border-gray-200 ">
          <i className="text-lg ri-map-pin-2-fill"></i>
          <div>
            <h3 className="font-semibold text-lg">{props.destination || 'Destination'}</h3>
            <p className="text-gray-500 text-sm -mt-1">Destination</p>
          </div>
        </div>
        <div className="flex items-center gap-3 p-3 ">
          <i className="ri-wallet-3-fill"></i>
          <div>
            <h3 className="font-semibold text-lg">₹{props.selectedVehicle?.fare?.toFixed(2) || '0.00'}</h3>
            <p className="text-gray-500 text-sm -mt-1">Online Payment</p>
          </div>
        </div>
      </div>
      {props.error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mt-4">
          {props.error}
        </div>
      )}
      <button 
        onClick={props.onConfirm}
        disabled={props.isCreating}
        className="text-white font-semibold mt-5 p-2 rounded-xl w-full bg-black disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        {props.isCreating ? 'Creating Ride...' : 'Confirm'}
      </button>
      </div>
     </div>
    </div>
  );
};

export default ConfirmedVehicle;
