const rideService = require('../services/ride.service');
const { validationResult } = require('express-validator');
const socketModule = require('../socket');
const { broadcastRideToNearbyCaptains, getUserSocketId } = socketModule;
const Ride = require('../Models/ride.model');

module.exports.createRide = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const { pickup, destination, vehicleType } = req.body;

        if (!pickup || !destination || !vehicleType) {
            return res.status(400).json({ message: 'Pickup, destination, and vehicle type are required' });
        }

        if (!pickup.lat || !pickup.lng || !destination.lat || !destination.lng) {
            return res.status(400).json({ message: 'Pickup and destination coordinates are required' });
        }

        const newRide = await rideService.createRide({
            userId: req.user._id,
            pickup,
            destination,
            vehicleType,
        });

        // Broadcast to nearby captains
        try {
            broadcastRideToNearbyCaptains(
                {
                    _id:         newRide._id,
                    userId:      newRide.userId,
                    pickup:      newRide.pickup,
                    destination: newRide.destination,
                    vehicleType: newRide.vehicleType,
                    fare:        newRide.fare,
                    distance:    newRide.distance,
                    duration:    newRide.duration,
                    otp:         newRide.otp,
                    userDetails: req.user,
                },
                50
            );
        } catch (socketError) {
            console.error('⚠️ Error broadcasting ride:', socketError.message);
        }

        res.status(201).json(newRide);
    } catch (error) {
        console.error('❌ Error in createRide:', error);
        res.status(500).json({ message: `Ride creation failed: ${error.message}` });
    }
};

module.exports.getRideById = async (req, res) => {
    try {
        const ride = await rideService.getRideById(req.params.rideId);
        res.status(200).json(ride);
    } catch (error) {
        res.status(404).json({ message: 'Ride not found' });
    }
};

module.exports.getRidesByUser = async (req, res) => {
    try {
        const rides = await rideService.getRidesByUserId(req.user._id);
        res.status(200).json(rides);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.getAllRides = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;
        const result = await rideService.getAllRides(parseInt(page), parseInt(limit));
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports.updateRideStatus = async (req, res) => {
    try {
        const { rideId }  = req.params;
        const { status }  = req.body;
        const captainId   = req.captain?._id || req.user?._id;

        if (!captainId) return res.status(401).json({ message: 'Captain not authenticated' });
        if (!status)    return res.status(400).json({ message: 'Status is required' });

        const updatedRide = await rideService.updateRideStatus(rideId, status, captainId);

                // ── Emit real-time event when captain accepts ──
        if (status === 'accepted') {
            try {
                const populatedRide = await Ride.findById(updatedRide._id)
                    .populate('userId',    '-password')
                    .populate('captainId', '-password');

                if (!populatedRide) {
                    console.error('❌ Ride not found after update');
                    return res.status(404).json({ message: 'Ride not found after update' });
                }

                // Extract user's ID for room targeting
                const rideUserId = populatedRide.userId?._id
                    ? populatedRide.userId._id.toString()
                    : populatedRide.userId.toString();

                const captainDoc = populatedRide.captainId;

                const captainPayload = captainDoc ? {
                    _id:      captainDoc._id,
                    fullname: captainDoc.fullname || {},
                    firstname: captainDoc.fullname?.firstname || captainDoc.firstname,
                    lastname:  captainDoc.fullname?.lastname  || captainDoc.lastname,
                    email:     captainDoc.email,
                    phone:     captainDoc.phone || captainDoc.email,
                    vehicle:   captainDoc.vehicle || {},
                    rating:    captainDoc.rating || 5.0,
                } : null;

                const acceptanceData = {
                    ride:    populatedRide.toObject(),
                    captain: captainPayload,
                    otp:     populatedRide.otp,
                    status:  'accepted',
                };

                const io = socketModule.getIO();

                // Emit to user's room (user joined with their _id as room name)
                io.to(rideUserId).emit('ride-accepted', acceptanceData);
                console.log(`✅ ride-accepted emitted to room: ${rideUserId}`);

                // Fallback: also emit to socket ID if we have it
                const userSocketId = getUserSocketId(rideUserId);
                if (userSocketId && userSocketId !== rideUserId) {
                    io.to(userSocketId).emit('ride-accepted', acceptanceData);
                    console.log(`✅ ride-accepted also emitted to socket: ${userSocketId}`);
                }
            } catch (socketError) {
                console.error('⚠️ Socket emit error:', socketError.message);
                // Don't fail the HTTP response — ride is saved; socket is best-effort
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

module.exports.calculateFare = async (req, res) => {
    try {
        const { distance, vehicleType } = req.body;
        if (distance === undefined || !vehicleType) {
            return res.status(400).json({ message: 'Distance and vehicle type are required' });
        }
        const fare = rideService.calculateFare(distance, vehicleType);
        res.status(200).json({ fare });
    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
};

// ─────────────────────────────────────────────────────────────────────────────
// Cancel Ride
// ─────────────────────────────────────────────────────────────────────────────
module.exports.cancelRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        if (!rideId) return res.status(400).json({ message: 'Ride ID is required' });

        const cancelledRide = await rideService.cancelRide(rideId);
        res.status(200).json({ message: 'Ride cancelled successfully', ride: cancelledRide });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports.startRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const { otp } = req.body;
        const captainId = req.captain?._id;

        if (!rideId || !otp) {
            return res.status(400).json({ message: 'Ride ID and OTP are required' });
        }

        if (!captainId) {
            return res.status(401).json({ message: 'Captain not authenticated' });
        }

        const startedRide = await rideService.startRide(rideId, otp, captainId);

        const populatedRide = await Ride.findById(startedRide._id)
            .populate('userId', '-password')
            .populate('captainId', '-password');

        if (populatedRide.status === 'started') {
            try {
                const io = socketModule.getIO();
                const userId = String(populatedRide.userId._id);
                
                const rideData = {
                    ride: populatedRide.toObject(),
                    status: 'started',
                    timestamp: new Date().toISOString()
                };

                io.to(userId).emit('ride-started', rideData);
                console.log('START EVENT SENT to user:', userId);

                const captainSocketId = socketModule.getCaptainSocketId(captainId);
                if (captainSocketId) {
                    io.to(captainSocketId).emit('ride-started', rideData);
                    console.log('START EVENT SENT to captain:', captainSocketId);
                }
            } catch (socketError) {
                console.error('Socket emit error:', socketError.message);
            }
        }

        res.status(200).json({ message: 'Ride started successfully', ride: startedRide });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports.endRide = async (req, res) => {
    try {
        const { rideId } = req.params;
        const captainId = req.captain?._id;

        if (!rideId) {
            return res.status(400).json({ message: 'Ride ID is required' });
        }

        if (!captainId) {
            return res.status(401).json({ message: 'Captain not authenticated' });
        }

        const ride = await Ride.findById(rideId);
        if (!ride) {
            return res.status(404).json({ message: 'Ride not found' });
        }

        ride.status = 'completed';
        const completedRide = await ride.save();

        const populatedRide = await Ride.findById(completedRide._id)
            .populate('userId', '-password')
            .populate('captainId', '-password');

        if (populatedRide.status === 'completed') {
            try {
                const io = socketModule.getIO();
                const userId = String(populatedRide.userId._id);
                
                const rideData = {
                    ride: populatedRide.toObject(),
                    status: 'completed',
                    timestamp: new Date().toISOString()
                };

                io.to(userId).emit('ride-completed', rideData);
                console.log('END EVENT SENT to user:', userId);

                const captainSocketId = socketModule.getCaptainSocketId(captainId);
                if (captainSocketId) {
                    io.to(captainSocketId).emit('ride-completed', rideData);
                    console.log('END EVENT SENT to captain:', captainSocketId);
                }
            } catch (socketError) {
                console.error('Socket emit error:', socketError.message);
            }
        }

        res.status(200).json({ message: 'Ride completed successfully', ride: completedRide });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};