import React, { useContext, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CaptainDataContext } from "../context/CaptainContext";
import { SocketDataContext } from "../context/SocketContext";
import captainAxiosInstance from "../utils/captainAxiosInstance";
import CaptainDetails from "../Components/CaptainDetails";
import RidePopUp from "../Components/RidePopUp";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import ConfirmRidePopUp from "../Components/ConfirmRidePopUp";

const CaptainHome = () => {
  const { captain, setCaptain } = useContext(CaptainDataContext);
  const { registerCaptain, receiveMessage, sendMessage, isConnected, socket } = useContext(SocketDataContext);
  const [ridePopUpPanel, setRidePopUpPanel] = useState(false)
  const [currentRide, setCurrentRide] = useState(null);
  const [rideDistance, setRideDistance] = useState(0);
  const ridePopUpRef = useRef(null);
  const confirmRidePopUpRef = useRef(null);
  const [confirmRidePopUpPanel, setConfirmRidePopUpPanel] = useState(false)
  const [captainLocation, setCaptainLocation] = useState(null);
  const rideListenerRef = useRef(null);
  const captainFetchedRef = useRef(false);
  const captainRegisteredSocketRef = useRef(null);
  
  useEffect(() => {
    if (!captain && !captainFetchedRef.current) {
      captainFetchedRef.current = true;
      
      const fetchCaptainProfile = async () => {
        try {
          const response = await captainAxiosInstance.get('/captains/profile');
          
          if (!response.data?.captain) {
            setTimeout(() => {
              window.localStorage.removeItem('captainToken');
              window.location.href = '/captain-login';
            }, 3000);
            return;
          }
          
          setCaptain(response.data.captain);
        } catch (error) {
          if (error.response?.status === 401) {
            window.localStorage.removeItem('captainToken');
            setTimeout(() => window.location.href = '/captain-login', 2000);
            return;
          }
          
          setTimeout(() => {
            captainFetchedRef.current = false;
          }, 2000);
        }
      };
      
      fetchCaptainProfile();
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleRideStarted = (data) => {
      console.log('🚀 ride-started EVENT RECEIVED (Captain):', data);
    };

    const handleRideCompleted = (data) => {
      console.log('✅ ride-completed EVENT RECEIVED (Captain):', data);
      setRidePopUpPanel(false);
      setConfirmRidePopUpPanel(false);
      setCurrentRide(null);
    };

    socket.on('ride-started', handleRideStarted);
    socket.on('ride-completed', handleRideCompleted);

    return () => {
      socket.off('ride-started', handleRideStarted);
      socket.off('ride-completed', handleRideCompleted);
    };
  }, [socket]);

  // Listen for new rides
  useEffect(() => {
    if (!isConnected) {
      console.log('⚠️ Socket not connected, cannot listen for rides');
      return;
    }

    if (!captainLocation) {
      console.log('⚠️ Captain location not set yet, cannot listen for rides');
      return;
    }

    // If listener already registered, remove it before creating a new one
    if (rideListenerRef.current) {
      console.log('🔄 Cleaning up existing listener');
      rideListenerRef.current();
      rideListenerRef.current = null;
    }

    console.log('👂 Setting up listener for new-ride events');
    console.log('   Captain ID:', captain?._id);
    console.log('   Captain Location:', captainLocation);
    console.log('   Socket ID:', socket?.id);

    // Register the listener and get cleanup function
    const unsubscribe = receiveMessage('new-ride', (rideData) => {
      console.log('\n\n🚨🚨🚨 ===== NEW RIDE RECEIVED ===== 🚨🚨🚨');
      console.log('rideData received:', !!rideData);
      
      if (!rideData || Object.keys(rideData).length === 0) {
        console.error('❌ Empty ride data!');
        return;
      }

      console.log('✅ Valid ride data received');
      console.log('Setting currentRide and opening popup...');
      setCurrentRide(rideData);
      setRidePopUpPanel(true);
      
      // Calculate distance from captain to pickup location
      if (captainLocation && rideData.pickup) {
        const distance = calculateDistance(
          captainLocation.lat,
          captainLocation.lng,
          rideData.pickup.lat,
          rideData.pickup.lng
        );
        console.log('📍 Distance: ', distance.toFixed(2), 'km');
        setRideDistance(distance);
      }
      
      console.log('✅ Ride popup opened');
    });

    // Store the cleanup function in ref
    rideListenerRef.current = unsubscribe;

    // Return cleanup function
    return () => {
      console.log('🧹 Component cleaning up listener for new-ride');
      if (rideListenerRef.current) {
        rideListenerRef.current();
        rideListenerRef.current = null;
      }
    };
  }, [isConnected, captainLocation, receiveMessage, socket?.id]);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = 
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;
    return distance;
  };

  // Update captain location periodically
  useEffect(() => {
    const locationInterval = setInterval(() => {
      if (navigator.geolocation && captain && isConnected) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const newLocation = {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            };
            setCaptainLocation(newLocation);
            
            // Send location update to server
            sendMessage('update-captain-location', {
              captainId: captain._id,
              location: newLocation
            });
          },
          (error) => console.error('Location error:', error)
        );
      }
    }, 10000); // Update every 10 seconds

    return () => clearInterval(locationInterval);
  }, [captain, isConnected, sendMessage]);
  
  useGSAP(() => {
    gsap.set(ridePopUpRef.current, {
      transform: "translateY(100%)",
    });
  }, []);

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
    gsap.set(confirmRidePopUpRef.current, {
      transform: "translateY(100%)",
    });
  }, []);

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
      <div className="flex items-center justify-between p-4 absolute top-0 left-0 right-0 z-10">
        <img
          className="h-15 w-15"
          src="/Rath.png"
          alt=""
        />
        <Link
          to="/captain-login"
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
       <CaptainDetails captain={captain} />
       {!ridePopUpPanel && (
         <div className="text-center mt-5">
           <p className="text-sm text-gray-600">🟢 Online • Waiting for rides...</p>
           <button 
             onClick={() => setRidePopUpPanel(true)}
             className="text-white font-semibold mt-5 p-2 rounded-xl w-full bg-green-600 hover:bg-green-700 transition"
           >
             Show Ride Request
           </button>
         </div>
       )}
      </div>
      <div
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-12"
        ref={ridePopUpRef}
      >
          <RidePopUp 
            ride={currentRide} 
            distance={rideDistance}
            setRidePopUpPanel={setRidePopUpPanel} 
            setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} 
          />
      </div>
      <div
        className="fixed w-full h-screen z-10 bottom-0 bg-white px-3 py-10 pt-12"
        ref={confirmRidePopUpRef}>
          <ConfirmRidePopUp 
            ride={currentRide}
            setConfirmRidePopUpPanel={setConfirmRidePopUpPanel} 
          />
      </div>
    </div>
  );
}

export default CaptainHome;
