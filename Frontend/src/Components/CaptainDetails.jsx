import React from 'react'

const CaptainDetails = () => {
  return (
    <div>
         <div className="flex items-center justify-between p-4 border-b-2 border-gray-200">
          <div className="flex items-center gap-3">
            <img className='h-10 w-10 rounder-full object-cover' src="https://imgs.search.brave.com/oY6tGweDH8qHdXRDReqazVzDsHjbxPEq4y5OINcwNpA/rs:fit:500:0:1:0/g:ce/aHR0cHM6Ly9tZWRp/YS5nZXR0eWltYWdl/cy5jb20vaWQvOTAy/NDY5MTA2L3Bob3Rv/L2ZsZXhpYmlsaXR5/LWluLWJ1c2luZXNz/LW1lYW5zLXN1Y2Nl/c3MuanBnP3M9NjEy/eDYxMiZ3PTAmaz0y/MCZjPTRaTXFveVdI/WDNxNEJiS0VRUXdK/VGViLVNubmc4VDZ4/cnR3My11X2w2cFk9" alt="" />
            <h4 className="font-bold text-lg">Ashok Kumar</h4>
          </div>
          <div>
            <h4 className="font-bold text-lg">₹426.30</h4>
            <p className="text-gray-500">Earned</p>
          </div>
        </div >
        <div className="flex items-center justify-around mt-5">
          <div className="text-center font-bold">
            <i className="ri-time-line text-2xl"></i>
            <h5>10.2 hrs</h5>
          </div>
          <div className="text-center font-bold">
            <i className="ri-speed-up-line text-2xl"></i>
            <h5>42 km</h5>
          </div>
          <div className="text-center font-bold">
            <i className="ri-booklet-line text-2xl"></i>
            <h5>12 trips</h5>
          </div>
        </div>
    </div>
  )
}

export default CaptainDetails