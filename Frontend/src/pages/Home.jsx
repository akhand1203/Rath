import React, { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axios from "axios";
import axiosInstance from "../utils/axiosInstance";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../Components/LocationSearchPanel";
import VehiclePanel from "../Components/VehiclePanel";
import ConfirmedVehicle from "../Components/ConfirmedVehicle"; 
import LookingForDriver from "../Components/LookingForDriver";
import WaitForDriver from "../Components/WaitForDriver";
import { SocketDataContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";

const Home = () => {
  const [pickup, setPickup] = useState("");
  const [destination, setDestination] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);
  const [panelOpen, setPanelOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [activeField, setActiveField] = useState(null);
  const [loading, setLoading] = useState(false);
  const vehiclePanelRef = useRef(null);
  const confirmVehiclePanelRef = useRef(null);
  const vehiclefoundRef = useRef(null);
  const waitForDriverRef = useRef(null);
  const panelRef = useRef(null);
  const panelCloseRef = useRef(null);
  const debounceTimerRef = useRef(null);
  const [vehiclePanel, setVehiclePanel] = useState(false);
  const [confirmVehiclePanel, setConfirmVehiclePanel] = useState(false);
  const [vehiclefound, setVehiclefound] = useState(false);
  const [waitForDriver, setWaitForDriver] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState({ type: null, fare: 0 });
  const [currentRide, setCurrentRide] = useState(null);
  const [rideCreating, setRideCreating] = useState(false);
  const [rideError, setRideError] = useState(null);
  const [distance, setDistance] = useState(null);
  const [duration, setDuration] = useState(null);
  const [captainDetails, setCaptainDetails] = useState(null);
  const [rideAccepted, setRideAccepted] = useState(false);
  const [searching, setSearching] = useState(false);
  const [otp, setOTP] = useState(null);
  const { socket, isConnected, receiveMessage, joinRoom } = React.useContext(SocketDataContext);
  const { user } = React.useContext(UserDataContext);
  const currentUserIdRef = useRef(null);
  const rideIsAccepted = rideAccepted || currentRide?.status === 'accepted';

  console.log('\n📊 HOME CONTEXT VALUES:');
  console.log('   user:', user);
  console.log('   user?._id:', user?._id);
  console.log('   isConnected:', isConnected);
  console.log('   socket:', socket?.id);


  useEffect(() => {
    console.log('\n🔄 HOME MOUNTED:');
    console.log('   user:', user?._id || 'null');
    console.log('   isConnected:', isConnected);
    
    if (user?._id && isConnected && socket) {
      console.log("🔗 Re-joining User room on mount/connect:", user._id);
      socket.emit('join', { userId: user._id, userType: 'user' });
    }
  }, [user?._id, isConnected, socket]);

  useEffect(() => {
    if (!socket) return;

    const handleRideAccepted = (data) => {
      console.log('🔥 [REAL-TIME] RECEIVED EVENT "ride-accepted":', data);

      // 1. Immediately hide "looking for driver"
      setVehiclefound(false);
      
      // 2. Set all ride details from the event payload
      const rideData = data.ride || {};
      
      const newCaptainInfo = data.captain || rideData.captainId;
      console.log('👨‍✈️ Setting Captain Details:', newCaptainInfo);
      setCaptainDetails(newCaptainInfo);
      
      setOTP(data.otp || rideData.otp);
      
      // 3. Mark the ride as accepted
      setRideAccepted(true);
      setCurrentRide((prev) => ({
        ...(prev || {}),
        ...rideData,
        status: 'accepted'
      }));
      
      // 4. Open the "Waiting for driver" panel
      setWaitForDriver(true);
      console.log('✅ UI updated for Accepted Ride');
    };

    socket.on('ride-accepted', handleRideAccepted);
    
    return () => {
      socket.off('ride-accepted', handleRideAccepted);
    };
  }, [socket]);

  useEffect(() => {
    if (currentRide?.status === 'accepted') {
      setRideAccepted(true);
      setVehiclefound(false);
      setWaitForDriver(true);
    }
  }, [currentRide?.status]);

  useEffect(() => {
    if (!currentRide?._id || rideIsAccepted || currentRide?.status === 'cancelled') {
      return;
    }

    let isMounted = true;

    const syncRideStatus = async () => {
      if (rideAccepted) {
        return;
      }

      try {
        const response = await axiosInstance.get(`/rides/${currentRide._id}`);
        const latestRide = response.data;

        if (!isMounted || !latestRide) {
          return;
        }

        if (latestRide.status === 'accepted') {
          console.log('🔄 syncRideStatus detected ACCEPTED status. Updating UI...');
          setRideAccepted(true);
          setVehiclefound(false);
          
          if (latestRide.captainId) {
            console.log('🔄 Found populated captainId via polling:', latestRide.captainId);
            setCaptainDetails(latestRide.captainId);
          }
          
          if (latestRide.otp) setOTP(latestRide.otp);
          
          setWaitForDriver(true);
          setCurrentRide((prevRide) => {
            if (!prevRide) {
              return latestRide;
            }

            return {
              ...prevRide,
              ...latestRide,
              status: 'accepted',
            };
          });
          return;
        }

        if (latestRide.status && latestRide.status !== currentRide.status) {
          setCurrentRide((prevRide) => {
            if (!prevRide) {
              return latestRide;
            }

            return {
              ...prevRide,
              ...latestRide,
            };
          });
        }
      } catch (error) {
        console.error('⚠️ Failed to sync ride status:', error.message);
      }
    };

    syncRideStatus();
    const intervalId = setInterval(syncRideStatus, 2500);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentRide?._id, currentRide?.status, rideIsAccepted]);



  const submitHandler = (e) => {
    e.preventDefault();
  };

  // Create a ride by calling the backend
  const createRide = async () => {
    setRideCreating(true);
    setRideError(null);
    
    try {
      // Check if user has token
      const token = localStorage.getItem('userToken');
      if (!token) {
        setRideError('You must be logged in to create a ride. Please login first.');
        setRideCreating(false);
        // Redirect to login after showing error
        setTimeout(() => window.location.href = '/user-login', 1500);
        return;
      }
      
      // Validate coordinates exist
      if (!pickupCoords || !destinationCoords) {
        setRideError('Location coordinates not found. Please select locations again.');
        setRideCreating(false);
        return;
      }
      
      // Validate vehicle selection
      if (!selectedVehicle || !selectedVehicle.type) {
        setRideError('Please select a vehicle type.');
        setRideCreating(false);
        return;
      }
      
      // Map vehicle types to backend format
      const vehicleTypeMap = {
        'Car': 'car',
        'Moto': 'bike',
        'Auto': 'auto'
      };
      
      const rideData = {
        pickup: {
          displayName: pickup,
          lat: pickupCoords.lat,
          lng: pickupCoords.lng
        },
        destination: {
          displayName: destination,
          lat: destinationCoords.lat,
          lng: destinationCoords.lng
        },
        vehicleType: vehicleTypeMap[selectedVehicle.type]
      };
      
      // Use axiosInstance which automatically includes token in headers
      const response = await axiosInstance.post('/rides/create', rideData);
      
      if (!response.data) {
        setRideError('Ride creation returned empty response');
        setRideCreating(false);
        return;
      }
      
      setCurrentRide(response.data);
      setConfirmVehiclePanel(false);
      setVehiclefound(true);
    } catch (error) {
      let errorMsg = 'Failed to create ride';
      
      if (error.response?.status === 401) {
        const token = localStorage.getItem('userToken');
        
        // Try to clear and refresh if token exists
        if (token) {
          localStorage.removeItem('userToken');
          errorMsg = 'Session expired. Refreshing to re-authenticate...';
          
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          errorMsg = 'Not authenticated. Redirecting to login...';
          setTimeout(() => window.location.href = '/user-login', 2000);
        }
      } else if (error.response?.status === 400) {
        errorMsg = 'Bad request: ' + (error.response?.data?.message || 'Please check your inputs');
      } else if (error.response?.status === 500) {
        errorMsg = 'Server error: ' + (error.response?.data?.message || 'Please try again later');
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.response?.data) {
        errorMsg = JSON.stringify(error.response.data);
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setRideError(errorMsg);
      setRideCreating(false);
    } finally {
      setRideCreating(false);
    }
  };

  // Debounced fetch location suggestions
  const handleSuggestionInput = (input, field) => {
    // Clear previous timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    // Ensure panel is open
    setPanelOpen(true);
    setLoading(true);
    
    // Set new timer (800ms delay to allow for backend processing)
    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(input, field);
    }, 800);
  };

  // Fetch location suggestions from backend
  const fetchSuggestions = async (input, field) => {
    setLoading(true);
    setActiveField(field);
    
    try {
      const trimmedInput = input.trim();
      
      const response = await axiosInstance.get('/maps/get-suggestions', {
        params: { input: trimmedInput }
      });
      
      if (response.data && Array.isArray(response.data)) {
        setSuggestions(response.data);
      } else {
        setSuggestions([]);
      }
    } catch (error) {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle picking a location suggestion
  const handleSelectLocation = (location) => {
    if (activeField === "pickup") {
      setPickup(location.displayName);
      setPickupCoords({ lat: location.lat, lng: location.lng });
      setSuggestions([]);
      setActiveField("destination");
      // Panel stays open for destination input
    } else if (activeField === "destination") {
      setDestination(location.displayName);
      setDestinationCoords({ lat: location.lat, lng: location.lng });
      setSuggestions([]);
      setPanelOpen(false);
      // Panel closes after destination is selected
    }
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, {
        height: "70%",
        padding: "24px",
        opacity: 1,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 1,
      });
    } else {
      gsap.to(panelRef.current, {
        height: "0%",
        padding: "0px",
        opacity: 0,
      });
      gsap.to(panelCloseRef.current, {
        opacity: 0,
      });
    }
  }, [panelOpen]);

  useGSAP(() => {
    if (vehiclePanelRef.current) {
      if (vehiclePanel) {
        console.log('🚗 Opening VehiclePanel');
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(0)",
          duration: 0.3,
          ease: "power3.out"
        });
      } else {
        console.log('Closing VehiclePanel');
        gsap.to(vehiclePanelRef.current, {
          transform: "translateY(100%)",
          duration: 0.3,
          ease: "power3.in"
        });
      }
    }
  }, [vehiclePanel]);

    useGSAP(() => {
    if (confirmVehiclePanelRef.current) {
      if (confirmVehiclePanel) {
        console.log('🚗 Opening ConfirmedVehicle panel');
        gsap.to(confirmVehiclePanelRef.current, {
          transform: "translateY(0)",
          duration: 0.3,
          ease: "power3.out"
        });
      } else {
        console.log('Closing ConfirmedVehicle panel');
        gsap.to(confirmVehiclePanelRef.current, {
          transform: "translateY(100%)",
          duration: 0.3,
          ease: "power3.in"
        });
      }
    }
  }, [confirmVehiclePanel]);

  useGSAP(() => {
    if (vehiclefoundRef.current) {
      if (vehiclefound) {
        console.log('📤 Opening LookingForDriver panel');
        gsap.to(vehiclefoundRef.current, {
          transform: "translateY(0)",
          duration: 0.3,
          ease: "power3.out"
        });
      } else {
        console.log('📥 Closing LookingForDriver panel');
        gsap.to(vehiclefoundRef.current, {
          transform: "translateY(100%)",
          duration: 0.3,
          ease: "power3.in"
        });
      }
    }
  }, [vehiclefound]);

  useGSAP(() => {
    if (waitForDriverRef.current) {
      if (waitForDriver) {
        gsap.to(waitForDriverRef.current, {
          transform: "translateY(0)",
          duration: 0.3,
          ease: "power3.out"
        });
      } else {
        gsap.to(waitForDriverRef.current, {
          transform: "translateY(100%)",
          duration: 0.3,
          ease: "power3.in"
        });
      }
    }
  }, [waitForDriver]);

  return (
    <div className="h-screen relative overflow-hidden">
      <img
        className="h-15 w-15 absolute left-1 top-2"
        src="/Rath.png"
        alt=""
      />
      <div className="h-screen w-screen">
        {/* temp img */}
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>
      <div className=" h-screen flex flex-col justify-end absolute top-0 w-full ">
        <div className="h-auto max-h-[55%] p-5 pb-20 bg-white relative overflow-y-auto">
          <h5
            ref={panelCloseRef}
            onClick={() => {
              setPanelOpen(false);
            }}
            className="absolute opacity-0 right-3 top-2 text-2xl"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form
            onSubmit={(e) => {
              submitHandler(e);
            }}
          >
            <div className="line absolute h-16 w-1 top-[40%] left-10 bg-gray-900 rounded-full"></div>
            <input
              onClick={() => {
                setPanelOpen(true);
              }}
              value={pickup}
              onChange={(e) => {
                setPickup(e.target.value);
                handleSuggestionInput(e.target.value, "pickup");
              }}
              className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-4"
              type="text"
              placeholder="Add a pick-up location"
            />
            <input
              onClick={() => {
                setPanelOpen(true);
              }}
              value={destination}
              onChange={(e) => {
                setDestination(e.target.value);
                handleSuggestionInput(e.target.value, "destination");
              }}
              className="bg-[#eee] px-12 py-2 text-base rounded-lg w-full mt-2"
              type="text"
              placeholder="Enter your Destination"
            />
            <button
              onClick={() => {
                if (pickup && destination) {
                  setVehiclePanel(true);
                  setPanelOpen(false);
                }
              }}
              disabled={!pickup || !destination}
              className="w-full bg-black text-white py-3 rounded-lg mt-6 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
            >
              Find Trip
            </button>
          </form>
        </div>
        <div ref={panelRef} className=" bg-white h-0">
          <LocationSearchPanel
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            suggestions={suggestions}
            onSelectLocation={handleSelectLocation}
            loading={loading}
          />
        </div>
      </div>
      <div
        ref={vehiclePanelRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-10 pt-12"
      >
       <VehiclePanel 
         setVehiclePanel={setVehiclePanel} 
         setConfirmVehiclePanel={setConfirmVehiclePanel} 
         setVehicleFound={setVehiclefound}
         setSelectedVehicle={setSelectedVehicle}
         setDistance={setDistance}
         setDuration={setDuration}
         pickup={pickup}
         destination={destination}
         pickupCoords={pickupCoords}
         destinationCoords={destinationCoords}
       />
      </div>
      <div
        ref={confirmVehiclePanelRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12">
        <ConfirmedVehicle 
          setConfirmVehiclePanel={setConfirmVehiclePanel} 
          setVehicleFound={setVehiclefound}
          pickup={pickup}
          destination={destination}
          selectedVehicle={selectedVehicle}
          onConfirm={createRide}
          isCreating={rideCreating}
          error={rideError}
        />
      </div>
      <div
        ref={vehiclefoundRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12">
        {!rideIsAccepted && (
          <LookingForDriver 
            setVehiclePanel={setVehiclefound}
            ride={currentRide}
            selectedVehicle={selectedVehicle}
            pickup={pickup}
            destination={destination}
            distance={distance}
            duration={duration}
            setConfirmVehiclePanel={setConfirmVehiclePanel}
          />
        )}
      </div>
      <div
        ref={waitForDriverRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12">
          <WaitForDriver 
            captain={captainDetails}
            ride={currentRide}
            rideAccepted={rideIsAccepted}
            setWaitForDriver={setWaitForDriver} 
          />
      </div>
    </div>
  );
};

export default Home;
