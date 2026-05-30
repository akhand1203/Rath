const Ride = require('../Models/ride.model');
const mapService = require('./map.service');
const crypto = require('crypto');

function generateOTPCode() {
    try {
        const randomBytes = crypto.randomBytes(3);
        const randomNumber = randomBytes.readUIntBE(0, 3);
        return String(randomNumber % 1000000).padStart(6, '0');
    } catch (error) {
        console.error('Error generating OTP:', error.message);
        throw error;
    }
}

async function calculateFare(pickup, destination, vehicleType = 'car') {
    try {
        const routeData = await mapService.getDistanceBetweenCoordinates(
            pickup.lat, pickup.lng,
            destination.lat, destination.lng
        );

        const distance = routeData.distance;
        const duration = routeData.duration;

        const pricingStructure = {
            motorcycle: { baseFare: 20, costPerKm: 8,  costPerMinute: 2 },
            auto:       { baseFare: 35, costPerKm: 12, costPerMinute: 4 },
            car:        { baseFare: 50, costPerKm: 15, costPerMinute: 5 },
        };

        const pricing = pricingStructure[vehicleType] || pricingStructure.car;

        const distanceCost = distance * pricing.costPerKm;
        const timeCost     = duration * pricing.costPerMinute;
        const totalFare    = pricing.baseFare + distanceCost + timeCost;

        return {
            vehicleType,
            baseFare:      pricing.baseFare,
            costPerKm:     pricing.costPerKm,
            costPerMinute: pricing.costPerMinute,
            distance:      Math.round(distance * 100) / 100,
            duration:      Math.round(duration),
            distanceCost:  Math.round(distanceCost * 100) / 100,
            timeCost:      Math.round(timeCost * 100) / 100,
            totalFare:     Math.round(totalFare),
        };
    } catch (error) {
        console.error('❌ Error calculating fare:', error.message);
        throw new Error(`Failed to calculate fare: ${error.message}`);
    }
}

module.exports.createRide = async ({ userId, pickup, destination, vehicleType }) => {
    try {
        if (!userId)      throw new Error('User ID is required');
        if (!pickup)      throw new Error('Pickup location is required');
        if (!destination) throw new Error('Destination is required');
        if (!vehicleType) throw new Error('Vehicle type is required');

        const vehicleTypeMap = { bike: 'motorcycle', auto: 'auto', car: 'car' };
        const mappedVehicleType = vehicleTypeMap[vehicleType] || vehicleType;

        const fareData = await calculateFare(pickup, destination, mappedVehicleType);

        const otpCode = generateOTPCode();

        const newRide = new Ride({
            userId,
            pickup: {
                lat:     pickup.lat,
                lng:     pickup.lng,
                address: pickup.displayName || 'Pickup Location',
            },
            destination: {
                lat:     destination.lat,
                lng:     destination.lng,
                address: destination.displayName || 'Destination',
            },
            vehicleType: mappedVehicleType,
            otp:         otpCode,
            fare:        fareData.totalFare,
            distance:    fareData.distance,
            duration:    fareData.duration,
        });

        const savedRide = await newRide.save();
        console.log('✅ Ride created:', savedRide._id, 'OTP:', otpCode);
        return savedRide;
    } catch (error) {
        console.error('❌ Error in createRide:', error.message);
        throw new Error(`Ride creation failed: ${error.message}`);
    }
};

module.exports.calculateFare = calculateFare;

module.exports.getRideById = async (rideId) => {
    const ride = await Ride.findById(rideId).populate('captainId', '-password');
    if (!ride) throw new Error('Ride not found');
    return ride;
};

module.exports.getRidesByUserId = async (userId) => {
    return Ride.find({ userId });
};

module.exports.getAllRides = async (page = 1, limit = 10) => {
    const skip  = (page - 1) * limit;
    const rides = await Ride.find().skip(skip).limit(limit).sort({ createdAt: -1 });
    const total = await Ride.countDocuments();
    return { rides, total, page, pages: Math.ceil(total / limit) };
};

module.exports.updateRideStatus = async (rideId, status, captainId) => {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');

    if (ride.status === 'accepted') {
        throw new Error('Ride already accepted');
    }

    ride.status    = status;
    ride.captainId = captainId;

    await ride.save();
    return ride;
};

module.exports.cancelRide = async (rideId) => {
    const ride = await Ride.findByIdAndUpdate(
        rideId,
        { status: 'cancelled' },
        { new: true, runValidators: true }
    );
    if (!ride) throw new Error('Ride not found');
    return ride;
};

module.exports.generateOTP = () => {
    const otp = generateOTPCode();
    return { otpCode: otp, otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000), expiresIn: 600 };
};

module.exports.verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
    if (new Date() > new Date(storedExpiry)) {
        return { success: false, message: 'OTP has expired' };
    }
    try {
        const isValid = crypto.timingSafeEqual(
            Buffer.from(storedOTP.toString()),
            Buffer.from(providedOTP.toString())
        );
        return { success: isValid, message: isValid ? 'OTP verified successfully' : 'Invalid OTP' };
    } catch {
        return { success: false, message: 'Error verifying OTP' };
    }
};

module.exports.startRide = async (rideId, providedOTP,captainId) => {
    const ride = await Ride.findById(rideId);
    if (!ride) throw new Error('Ride not found');

    if (ride.otp !== providedOTP) {
        throw new Error('Invalid OTP');
    }

    ride.status = 'started';
    ride.captainId = captainId;
    await ride.save();
    return ride;
};