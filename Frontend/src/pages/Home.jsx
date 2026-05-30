import React, { useState, useRef, useEffect } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import axiosInstance from "../utils/axiosInstance";
import "remixicon/fonts/remixicon.css";
import LocationSearchPanel from "../Components/LocationSearchPanel";
import VehiclePanel from "../Components/VehiclePanel";
import ConfirmedVehicle from "../Components/ConfirmedVehicle";
import LookingForDriver from "../Components/LookingForDriver";
import WaitForDriver from "../Components/WaitForDriver";
import { SocketDataContext } from "../context/SocketContext";
import { UserDataContext } from "../context/UserContext";
import {useNavigate} from 'react-router-dom';

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
  const [otp, setOTP] = useState(null);
  const navigate = useNavigate();

  const rideAcceptedRef = useRef(false);

  const { socket, isConnected } = React.useContext(SocketDataContext);
  const { user } = React.useContext(UserDataContext);

  const rideIsAccepted = rideAccepted || currentRide?.status === "accepted";

  useEffect(() => {
    if (!socket) return;

    const handleRideAccepted = (data) => {
      console.log("🔥 ride-accepted EVENT RECEIVED:", data);

      if (rideAcceptedRef.current) {
        console.log("⏭️  Already accepted — skipping duplicate event");
        return;
      }

      if (!data || !data.ride) {
        console.error("❌ ride-accepted: empty or invalid data");
        return;
      }

      rideAcceptedRef.current = true;

      const captainFromEvent = data.captain || data.ride?.captainId || null;
      let finalCaptain = null;
      if (captainFromEvent) {
        finalCaptain = {
          _id: captainFromEvent._id,
          fullname: captainFromEvent.fullname || {},
          firstname:
            captainFromEvent.fullname?.firstname || captainFromEvent.firstname,
          lastname:
            captainFromEvent.fullname?.lastname || captainFromEvent.lastname,
          email: captainFromEvent.email,
          phone: captainFromEvent.phone || captainFromEvent.email,
          vehicle: captainFromEvent.vehicle || {},
          rating: captainFromEvent.rating || 5.0,
        };
      }

      setCaptainDetails(finalCaptain);
      setOTP(data.otp || data.ride?.otp || null);
      setCurrentRide((prev) => ({
        ...(prev || {}),
        ...data.ride,
        status: "accepted",
      }));
      setRideAccepted(true);

      setVehiclefound(false);
      setTimeout(() => setWaitForDriver(true), 350);
    };

    const handleRideStarted = (data) => {
      console.log("🚀 ride-started EVENT RECEIVED:", data);

      if (!data || !data.ride) {
        console.error("❌ ride-started: empty or invalid data");
        return;
      }

      setWaitForDriver(false);
      setCurrentRide((prev) => ({
        ...(prev || {}),
        ...data.ride,
        status: "started",
      }));

      navigate("/riding", { state: { ride: data.ride } });
    };

    const handleRideCompleted = (data) => {
      console.log("✅ ride-completed EVENT RECEIVED:", data);

      if (!data || !data.ride) {
        console.error("❌ ride-completed: empty or invalid data");
        return;
      }

      setCurrentRide((prev) => ({
        ...(prev || {}),
        ...data.ride,
        status: "completed",
      }));

      navigate("/user-logout");
    };

    const handleConnectionConfirmed = (data) => {
      console.log("✅ connection-confirmed from server:", data);
    };

    socket.on("connection-confirmed", handleConnectionConfirmed);
    socket.on("ride-accepted", handleRideAccepted);
    socket.on("ride-started", handleRideStarted);
    socket.on("ride-completed", handleRideCompleted);

    return () => {
      socket.off("connection-confirmed", handleConnectionConfirmed);
      socket.off("ride-accepted", handleRideAccepted);
      socket.off("ride-started", handleRideStarted);
      socket.off("ride-completed", handleRideCompleted);
    };
  }, [socket, navigate]);

  useEffect(() => {
    if (!user?._id || !socket) return;

    const emitJoin = () => {
      if (socket.connected) {
        const userId = user._id.toString();
        console.log("📡 Emitting join as user:", userId);
        socket.emit("join", { userId, userType: "user" });
      }
    };

    emitJoin();

    socket.on("connect", emitJoin);
    return () => socket.off("connect", emitJoin);
  }, [user?._id, socket]);

  useEffect(() => {
    if (!currentRide?._id || rideIsAccepted || currentRide?.status === "cancelled") {
      return;
    }

    let isMounted = true;

    const syncRideStatus = async () => {
      if (rideAcceptedRef.current) return;

      try {
        const response = await axiosInstance.get(`/rides/${currentRide._id}`);
        const latestRide = response.data;
        if (!isMounted || !latestRide) return;

        if (latestRide.status === "accepted") {
          console.log("🔄 Polling detected accepted ride (fallback)");
          rideAcceptedRef.current = true;

          const captainFromDb = latestRide.captainId;
          if (captainFromDb && typeof captainFromDb === "object") {
            setCaptainDetails({
              _id: captainFromDb._id,
              fullname: captainFromDb.fullname || {},
              firstname:
                captainFromDb.fullname?.firstname || captainFromDb.firstname,
              lastname:
                captainFromDb.fullname?.lastname || captainFromDb.lastname,
              email: captainFromDb.email,
              phone: captainFromDb.phone,
              vehicle: captainFromDb.vehicle,
              rating: captainFromDb.rating || 5.0,
            });
          }

          if (latestRide.otp) setOTP(latestRide.otp);

          setCurrentRide((prev) => ({
            ...(prev || {}),
            ...latestRide,
            status: "accepted",
          }));
          setRideAccepted(true);
          setVehiclefound(false);
          setTimeout(() => setWaitForDriver(true), 350);
        }
      } catch (error) {
        console.error("⚠️ Polling error:", error.message);
      }
    };

    syncRideStatus();
    const intervalId = setInterval(syncRideStatus, 3000);
    return () => {
      isMounted = false;
      clearInterval(intervalId);
    };
  }, [currentRide?._id, currentRide?.status, rideIsAccepted]);

  // ─────────────────────────────────────────────────────────────────────────
  // Ride creation
  // ─────────────────────────────────────────────────────────────────────────
  const createRide = async () => {
    setRideCreating(true);
    setRideError(null);

    try {
      if (!pickupCoords || !destinationCoords) {
        setRideError("Location coordinates not found. Please select locations again.");
        return;
      }

      if (!selectedVehicle?.type) {
        setRideError("Please select a vehicle type.");
        return;
      }

      const vehicleTypeMap = {
        Car: "car",
        Moto: "bike",
        Auto: "auto",
      };

      const rideData = {
        pickup: {
          displayName: pickup,
          lat: pickupCoords.lat,
          lng: pickupCoords.lng,
        },
        destination: {
          displayName: destination,
          lat: destinationCoords.lat,
          lng: destinationCoords.lng,
        },
        vehicleType: vehicleTypeMap[selectedVehicle.type],
      };

      const response = await axiosInstance.post("/rides/create", rideData);

      if (!response.data) {
        setRideError("Ride creation returned empty response");
        return;
      }

      // Reset ride-accepted state for this new ride
      rideAcceptedRef.current = false;
      setRideAccepted(false);
      setCaptainDetails(null);
      setOTP(null);

      setCurrentRide(response.data);
      setConfirmVehiclePanel(false);
      setVehiclefound(true);
    } catch (error) {
      let errorMsg = "Failed to create ride";

      if (error.response?.status === 401) {
        errorMsg = "Session expired. Please log in again";
      } else if (error.response?.status === 400) {
        errorMsg =
          "Bad request: " +
          (error.response?.data?.message || "Please check your inputs");
      } else if (error.response?.status === 500) {
        errorMsg =
          "Server error: " +
          (error.response?.data?.message || "Please try again later");
      } else if (error.response?.data?.message) {
        errorMsg = error.response.data.message;
      } else if (error.message) {
        errorMsg = error.message;
      }

      setRideError(errorMsg);
    } finally {
      setRideCreating(false);
    }
  };

  const handleSuggestionInput = (input, field) => {
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

    if (!input || input.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setPanelOpen(true);
    setLoading(true);

    debounceTimerRef.current = setTimeout(() => {
      fetchSuggestions(input, field);
    }, 800);
  };

  const fetchSuggestions = async (input, field) => {
    setLoading(true);
    setActiveField(field);

    try {
      const response = await axiosInstance.get("/maps/get-suggestions", {
        params: { input: input.trim() },
      });

      setSuggestions(Array.isArray(response.data) ? response.data : []);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (location) => {
    if (activeField === "pickup") {
      setPickup(location.displayName);
      setPickupCoords({ lat: location.lat, lng: location.lng });
      setSuggestions([]);
      setActiveField("destination");
    } else if (activeField === "destination") {
      setDestination(location.displayName);
      setDestinationCoords({ lat: location.lat, lng: location.lng });
      setSuggestions([]);
      setPanelOpen(false);
    }
  };

  useGSAP(() => {
    if (panelOpen) {
      gsap.to(panelRef.current, { height: "70%", padding: "24px", opacity: 1 });
      gsap.to(panelCloseRef.current, { opacity: 1 });
    } else {
      gsap.to(panelRef.current, { height: "0%", padding: "0px", opacity: 0 });
      gsap.to(panelCloseRef.current, { opacity: 0 });
    }
  }, [panelOpen]);

  useGSAP(() => {
    if (!vehiclePanelRef.current) return;
    gsap.to(vehiclePanelRef.current, {
      transform: vehiclePanel ? "translateY(0)" : "translateY(100%)",
      duration: 0.3,
      ease: vehiclePanel ? "power3.out" : "power3.in",
    });
  }, [vehiclePanel]);

  useGSAP(() => {
    if (!confirmVehiclePanelRef.current) return;
    gsap.to(confirmVehiclePanelRef.current, {
      transform: confirmVehiclePanel ? "translateY(0)" : "translateY(100%)",
      duration: 0.3,
      ease: confirmVehiclePanel ? "power3.out" : "power3.in",
    });
  }, [confirmVehiclePanel]);

  useGSAP(() => {
    if (!vehiclefoundRef.current) return;
    gsap.to(vehiclefoundRef.current, {
      transform: vehiclefound ? "translateY(0)" : "translateY(100%)",
      duration: 0.3,
      ease: vehiclefound ? "power3.out" : "power3.in",
    });
  }, [vehiclefound]);

  useGSAP(() => {
    if (!waitForDriverRef.current) return;
    gsap.to(waitForDriverRef.current, {
      transform: waitForDriver ? "translateY(0)" : "translateY(100%)",
      duration: 0.3,
      ease: waitForDriver ? "power3.out" : "power3.in",
    });
  }, [waitForDriver]);

  return (
    <div className="h-screen relative overflow-hidden">
      <img
        className="h-15 w-15 absolute left-1 top-2"
        src="/Rath.png"
        alt=""
      />
      <div className="h-screen w-screen">
        <img
          className="h-full w-full object-cover"
          src="https://miro.medium.com/v2/resize:fit:1400/0*gwMx05pqII5hbfmX.gif"
          alt=""
        />
      </div>

      <div className="h-screen flex flex-col justify-end absolute top-0 w-full">
        <div className="h-auto max-h-[55%] p-5 pb-20 bg-white relative overflow-y-auto">
          <h5
            ref={panelCloseRef}
            onClick={() => setPanelOpen(false)}
            className="absolute opacity-0 right-3 top-2 text-2xl"
          >
            <i className="ri-arrow-down-wide-line"></i>
          </h5>
          <h4 className="text-2xl font-semibold">Find a trip</h4>
          <form onSubmit={(e) => e.preventDefault()}>
            <div className="line absolute h-16 w-1 top-[40%] left-10 bg-gray-900 rounded-full"></div>
            <input
              onClick={() => setPanelOpen(true)}
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
              onClick={() => setPanelOpen(true)}
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

        <div ref={panelRef} className="bg-white h-0">
          <LocationSearchPanel
            setPanelOpen={setPanelOpen}
            setVehiclePanel={setVehiclePanel}
            suggestions={suggestions}
            onSelectLocation={handleSelectLocation}
            loading={loading}
          />
        </div>
      </div>

      {/* Vehicle Selection */}
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

      {/* Confirm Vehicle */}
      <div
        ref={confirmVehiclePanelRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
      >
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

      {/* Looking for Driver */}
      <div
        ref={vehiclefoundRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
      >
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

      {/* Wait For Driver (shown after captain accepts) */}
      <div
        ref={waitForDriverRef}
        style={{ transform: "translateY(100%)" }}
        className="fixed w-full z-10 bottom-0 bg-white px-3 py-6 pt-12"
      >
        <WaitForDriver
          captain={captainDetails}
          ride={currentRide}
          rideAccepted={rideIsAccepted}
          otp={otp}
          setWaitForDriver={setWaitForDriver}
        />
      </div>
    </div>
  );
};

export default Home;