import React, { useState, useEffect } from 'react'
import axiosInstance from '../utils/axiosInstance'

const VehiclePanel = (props) => {
  const [distance, setDistance] = useState(null)
  const [duration, setDuration] = useState(null)
  const [fares, setFares] = useState({ car: 0, moto: 0, auto: 0 })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (props.pickupCoords && props.destinationCoords) {
      fetchDistance()
    }
  }, [props.pickupCoords, props.destinationCoords])

  const fetchDistance = async () => {
    try {
      setLoading(true)
      console.log('🚗 Fetching distance with coords:', {
        lat1: props.pickupCoords.lat,
        lng1: props.pickupCoords.lng,
        lat2: props.destinationCoords.lat,
        lng2: props.destinationCoords.lng
      })
      
      const response = await axiosInstance.get('/maps/get-distance', {
        params: {
          lat1: props.pickupCoords.lat,
          lng1: props.pickupCoords.lng,
          lat2: props.destinationCoords.lat,
          lng2: props.destinationCoords.lng
        }
      })
      
      console.log('✅ Distance API Response:', response.data)
      
      const { distance: distanceKm, duration: durationMin } = response.data
      setDistance(distanceKm)
      setDuration(durationMin)
      
      console.log('📏 Distance:', distanceKm, 'km, Duration:', durationMin, 'min')
      
      // Calculate fares - MUST MATCH backend pricing in ride.service.js
      const carFare = 50 + (distanceKm * 15) + (durationMin * 5)
      const autoFare = 35 + (distanceKm * 12) + (durationMin * 4)
      const motoFare = 20 + (distanceKm * 8) + (durationMin * 2)
      
      console.log('💰 Calculated Fares:')
      console.log('   Car: ₹' + carFare.toFixed(2))
      console.log('   Auto: ₹' + autoFare.toFixed(2))
      console.log('   Moto: ₹' + motoFare.toFixed(2))
      
      setFares({
        car: carFare,
        moto: motoFare,
        auto: autoFare
      })
    } catch (error) {
      console.error('❌ Error fetching distance:', error.message)
      if (error.response) {
        console.error('API Error:', error.response.status, error.response.data)
      }
    } finally {
      setLoading(false)
    }
  }

  const distanceInfo = distance !== null && distance !== undefined
    ? `📍 Distance: ${distance.toFixed(2)} km | Duration: ${duration?.toFixed(0) || 0} min | ${props.pickup?.substring(0, 15)} → ${props.destination?.substring(0, 15)}`
    : 'Calculating distance...'

  return (
    <div> 
        <h5
          onClick={() => {
            props.setVehiclePanel(false)
          }}
          className="p-1 text-center w-[90%] absolute top-0"
        >
          <i className="text-2xl text-gray-200 ri-arrow-down-wide-fill"></i>
        </h5>
        <h3 className="font-bold text-lg mb-5">Choose a Ride</h3>
        {loading && <p className="text-center text-gray-500 mb-3">Calculating fare...</p>}
        {distanceInfo && <p className="text-xs text-gray-600 mb-3">{distanceInfo}</p>}
        <div onClick={() => {
          props.setSelectedVehicle({ type: 'Car', fare: fares.car });
          props.setDistance(distance);
          props.setDuration(duration);
          props.setConfirmVehiclePanel(true);
        }} className="flex border-2 border-gray-300 active:border-black mb-3 rounded-xl items-center w-full p-3 justify-between ">
          <img
            className="h-15"
            src="/car.png"
            alt="Car"
          />
          <div className="ml-2 w-1/2">
            <h4 className="font-medium text-lg">
              Car{" "}
              <span>
                <i className="ri-user-fill"></i>4
              </span>{" "}
            </h4>
            <h5 className="font-medium text-sm">2 mins away</h5>
            <p className="font-normal text-xs text-gray-600">
              Affordable, car Rides
            </p>
          </div>
          <h2 className="text-lg font-semibold">₹{fares.car.toFixed(2)}</h2>
        </div>
        <div onClick={() => {
          props.setSelectedVehicle({ type: 'Moto', fare: fares.moto });
          props.setDistance(distance);
          props.setDuration(duration);
          props.setConfirmVehiclePanel(true);
        }} className="flex border-2 border-gray-300 active:border-black  mb-3 rounded-xl items-center w-full p-3 justify-between ">
          <img
            className="h-10"
            src="/bike.png"
            alt="Bike"
          />
          <div className="ml-7 w-1/2">
            <h4 className="font-medium text-lg">
              Moto{" "}
              <span>
                <i className="ri-user-fill"></i>1
              </span>{" "}
            </h4>
            <h5 className="font-medium text-sm">4 mins away</h5>
            <p className="font-normal text-xs text-gray-600">
              Affordable, moto Rides
            </p>
          </div>
          <h2 className="text-lg font-semibold">₹{fares.moto.toFixed(2)}</h2>
        </div>
        <div onClick={() => {
          props.setSelectedVehicle({ type: 'Auto', fare: fares.auto });
          props.setDistance(distance);
          props.setDuration(duration);
          props.setConfirmVehiclePanel(true);
        }} className="flex border-2 border-gray-300 active:border-black  mb-3 rounded-xl items-center w-full p-3 justify-between ">
          <img
            className="h-10"
            src="/auto.png"
            alt="Auto"
          />
          <div className="ml-2 w-1/2">
            <h4 className="font-medium text-lg">
              Auto{" "}
              <span>
                <i className="ri-user-fill"></i>3
              </span>{" "}
            </h4>
            <h5 className="font-medium text-sm">3 mins away</h5>
            <p className="font-normal text-xs text-gray-600">
              Affordable, auto Rides
            </p>
          </div>
          <h2 className="text-lg font-semibold">₹{fares.auto.toFixed(2)}</h2>
        </div>
        </div>
  )
}

export default VehiclePanel
