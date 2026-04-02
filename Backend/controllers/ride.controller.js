const rideService = require('../services/ride.service');
const {validationResult} = require('express-validator');
const socketModule = require('../socket');
const { broadcastRideToNearbyCaptains, getIO, getUserSocketId } = socketModule;
const Ride = require('../Models/ride.model');
const Captain = require('../Models/captain.model');


module.exports.createRide = async (req, res, next) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const userId = req.user._id;
        const { pickup, destination, vehicleType } = req.body;

        // Validate input
        if (!pickup || !destination || !vehicleType) {
            return res.status(400).json({ 
                message: 'Pickup, destination, and vehicle type are required' 
            });
        }

        if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
            return res.status(400).json({ 
                message: 'Pickup and destination coordinates are required' 
            });
        }

        const newRide = await rideService.createRide({
            userId,
            pickup,
            destination,
            vehicleType
        });

        // Broadcast ride to nearby captains (within 50km radius for testing, reduce to 2-5km in production)
        try {
            const rideDataToBroadcast = {
                _id: newRide._id,
                userId: newRide.userId,
                pickup: newRide.pickup,
                destination: newRide.destination,
                vehicleType: newRide.vehicleType,
                fare: newRide.fare,
                distance: newRide.distance,
                duration: newRide.duration,
                otp: newRide.otp,
                userDetails: req.user
            };
            
            broadcastRideToNearbyCaptains(rideDataToBroadcast, 50); // 50km radius for testing
        } catch (socketError) {
            console.error('⚠️ Error broadcasting ride to captains:', socketError.message);
            // Don't fail the request if socket broadcast fails
        }

        res.status(201).json(newRide);
    } catch (error) {
        console.error('❌ Error in createRide:', error);
        
        const message = error.message || 'Internal server error';
        res.status(500).json({ message: `Ride creation failed: ${message}` });
    }
};

module.exports.getRideById = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        const ride = await rideService.getRideById(rideId);

        res.status(200).json(ride);
    } catch (error) {
        console.error('Error in getRideById:', error.message);
        res.status(404).json({ message: 'Ride not found' });
    }
};

module.exports.getRidesByUser = async (req, res, next) => {
    try {
        const userId = req.user._id; // Get userId from authenticated user

        const rides = await rideService.getRidesByUserId(userId);

        res.status(200).json(rides);
    } catch (error) {
        console.error('Error in getRidesByUser:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getAllRides = async (req, res, next) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await rideService.getAllRides(parseInt(page), parseInt(limit));

        res.status(200).json(result);
    } catch (error) {
        console.error('Error in getAllRides:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateRideStatus = async (req, res, next) => {
    console.log('\n🔄 UPDATE RIDE STATUS CALLED');
    console.log('   Route: PUT /rides/:rideId/status');
    console.log('   rideId:', req.params.rideId);
    console.log('   status:', req.body.status);
    console.log('   captainId (from auth):', req.captain?._id || req.user?._id);
    
    try {
        const { rideId } = req.params;
        const { status } = req.body;
        const captainId = req.captain?._id || req.user?._id;

        if (!captainId) {
            return res.status(401).json({ message: 'Captain not authenticated' });
        }

        if (!status) {
            return res.status(400).json({ message: 'Status is required' });
        }

        console.log('✅ Status validation passed');
        const updatedRide = await rideService.updateRideStatus(rideId, status, captainId);
        console.log('✅ Ride service returned:', updatedRide._id);

        const populatedRide = await Ride.findById(updatedRide._id)
            .populate('userId')
            .populate('captainId');

        if (!populatedRide) {
            return res.status(404).json({ message: 'Ride not found after update' });
        }

        if (status === 'accepted' && captainId && updatedRide) {
            try {
                // 1. Ensure we have the most up-to-date ride data with populated user/captain
                const populatedRide = await Ride.findById(updatedRide._id)
                    .populate('userId')
                    .populate('captainId');

                if (!populatedRide) {
                    console.error('❌ Ride not found after update');
                    return res.status(404).json({ message: 'Ride not found after update' });
                }

                // 2. Identify the user ID (target for the event)
                // If populate failed (due to ref mismatch), it will be the ID itself
                const rideUserId = populatedRide.userId?._id 
                    ? populatedRide.userId._id.toString() 
                    : populatedRide.userId.toString();
                
                console.log(`🚀 Emitting ride-accepted to User: ${rideUserId}`);

                // 3. Prepare the data payload
                const captainDoc = populatedRide.captainId;
                const captainPayload = {
                    _id: captainDoc?._id,
                    fullname: captainDoc?.fullname,
                    vehicle: captainDoc?.vehicle,
                    phone: captainDoc?.phone || captainDoc?.email,
                    rating: 5.0 // Default or fetched from doc
                };

                const acceptanceData = {
                    ride: populatedRide,
                    captain: captainPayload,
                    otp: populatedRide.otp,
                    status: 'accepted'
                };

                // 4. Emit through Socket.IO
                const io = socketModule.getIO();
                
                // Method A: Emit to the room named after the userId (Joined via 'join' event)
                io.to(rideUserId).emit("ride-accepted", acceptanceData);
                console.log(`✅ Event emitted to room: ${rideUserId}`);

                // Method B: Emit to specific socketId if available in our map
                const userSocketId = socketModule.getUserSocketId(rideUserId);
                if (userSocketId) {
                    io.to(userSocketId).emit("ride-accepted", acceptanceData);
                    console.log(`✅ Event emitted to socket: ${userSocketId}`);
                }

            } catch (socketError) {
                console.error('❌ Error sending socket event:', socketError.message);
            }
        }

        res.status(200).json(updatedRide);
    } catch (error) {
        console.error('Error in updateRideStatus:', error.message);
        if (error.message.includes('already accepted')) {
            return res.status(409).json({ message: error.message });
        }

        res.status(400).json({ message: error.message });
    }
};  

module.exports.calculateFare = async (req, res, next) => {
    try {
        const { distance, vehicleType } = req.body;

        if (distance === undefined || !vehicleType) {
            return res.status(400).json({ message: 'Distance and vehicle type are required' });
        }

        const fare = rideService.calculateFare(distance, vehicleType);

        res.status(200).json({ fare });
    } catch (error) {
        console.error('Error in calculateFare:', error.message);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.cancelRide = async (req, res, next) => {
    try {
        const { rideId } = req.params;

        if (!rideId) {
            return res.status(400).json({ message: 'Ride ID is required' });
        }

        console.log('❌ Cancel request for ride:', rideId);

        const cancelledRide = await rideService.cancelRide(rideId);

        res.status(200).json({ 
            message: 'Ride cancelled successfully',
            ride: cancelledRide 
        });
    } catch (error) {
        console.error('Error cancelling ride:', error.message);
        res.status(400).json({ message: error.message });
    }
};