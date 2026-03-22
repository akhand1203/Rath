import React from 'react'

const LocationSearchPanel = (props) => {

  // sample array of location data
  const locations = [
    { name: '3rd Floor ,Vishu Tower , ghaziabad , Uttar Pradesh' },
    { name: 'House 1 ,Sakiya Bakiya ,Mehnajpur, Azmagarh' },
    { name: 'House 1 ,Chakiya ,Alipur Bhangda, Chandauli' },
    { name: 'House 1 ,Bihar ,Siwan , Bihar' },
  ]

  return (
    <div className='flex flex-col '>
      {locations.map(function (elem, index) {
        return (
          <div key={index} onClick={() => {
            props.setVehiclePanel(true);
            props.setPanelOpen(false);
          }}
           className='text-base border-2 border-gray-200 p-2 rounded-xl active:border-black my-1 font-medium flex items-center gap-3'>
            <h2 className='bg-[#eee] p-2 rounded-full'><i className="ri-map-pin-2-fill"></i></h2>
            <h4>{elem.name}</h4>
          </div>
        )
      })}
    </div>
  )
}
export default LocationSearchPanel