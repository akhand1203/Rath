import React from 'react'

const WaitForDriver = (props) => {
  return (
    <div>
      <h5
        className="p-1 text-center w-[93%] absolute top-0"
        onClick={() => {
          props.waitForDriver(false);
        }}
      >
        <i className="text-3xl text-gray-200 ri-arrow-down-wide-line"></i>
      </h5>
      <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
        <div className="flex items-center gap-3">
          <img
            className="h-16 w-16 rounded-full object-cover"
            src="https://ui-avatars.com/api/?name=Ashok+Kumar&background=random"
            alt="driver"
          />
          <div>
            <h4 className="font-semibold text-lg">Ashok Kumar</h4>
            <p className="text-xs text-gray-600">White Suzuki S-Presso LXI</p>
          </div>
        </div>
        <div className="text-right">
          <h3 className="font-bold text-lg">KA 15 AK 00</h3>
          <p className="text-sm text-yellow-500">⭐ 4.9</p>
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
        <div className="flex items-start gap-3">
          <i className="text-lg ri-map-pin-fill text-green-600 mt-1"></i>
          <div>
            <h3 className="font-bold text-lg">562/11-A</h3>
            <p className="text-sm text-gray-600">Kaikondrahalli, Bengaluru, Karnataka</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default WaitForDriver