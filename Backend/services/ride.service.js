const Ride = require('../Models/ride.model');
const mapService = require('./map.service');
const crypto = require('crypto');

// Helper function to generate OTP
function generateOTPCode() {
    try {
        // Generate 3 random bytes and convert to 6-digit number
        const randomBytes = crypto.randomBytes(3);
        const randomNumber = randomBytes.readUIntBE(0, 3); // Read 3 bytes as unsigned int
        const otp = String(randomNumber % 1000000).padStart(6, '0'); // Get 6-digit OTP (000000-999999)
        
        return otp;
    } catch (error) {
        console.error('Error generating OTP:', error.message);
        throw error;
    }
}

async function calculateFare(pickup, destination, vehicleType = 'car') {
    try {
        console.log('📍 Calculating fare with:', { pickup, destination, vehicleType });
        
        // Get distance and duration from map service
        // pickup and destination should have lat, lng properties
        const routeData = await mapService.getDistanceBetweenCoordinates(
            pickup.lat,
            pickup.lng,
            destination.lat,
            destination.lng
        );

        console.log('✅ Route data received:', routeData);

        const distance = routeData.distance; // in km
        const duration = routeData.duration; // in minutes

        // Define pricing for different vehicle types
        const pricingStructure = {
            motorcycle: {
                baseFare: 20,        // Base fare in rupees
                costPerKm: 8,        // Cost per kilometer in rupees
                costPerMinute: 2     // Cost per minute in rupees
            },
            auto: {
                baseFare: 35,        // Base fare in rupees
                costPerKm: 12,       // Cost per kilometer in rupees
                costPerMinute: 4     // Cost per minute in rupees
            },
            car: {
                baseFare: 50,        // Base fare in rupees
                costPerKm: 15,       // Cost per kilometer in rupees
                costPerMinute: 5     // Cost per minute in rupees
            }
        };

        // Get pricing for the vehicle type (default to car if not found)
        const pricing = pricingStructure[vehicleType] || pricingStructure.car;
        console.log('💰 Pricing structure:', pricing);

        const distanceCost = distance * pricing.costPerKm;
        const timeCost = duration * pricing.costPerMinute;
        const totalFare = pricing.baseFare + distanceCost + timeCost;

        console.log('📊 Fare calculation complete:', { distance, duration, distanceCost, timeCost, totalFare });

        return {
            vehicleType,
            baseFare: pricing.baseFare,
            costPerKm: pricing.costPerKm,
            costPerMinute: pricing.costPerMinute,
            distance: Math.round(distance * 100) / 100, // Round to 2 decimal places
            duration: Math.round(duration),
            distanceCost: Math.round(distanceCost * 100) / 100,
            timeCost: Math.round(timeCost * 100) / 100,
            totalFare: Math.round(totalFare) // Round to nearest rupee
        };
    } catch (error) {
        console.error('❌ Error calculating fare:', error.message);
        console.error('Stack:', error.stack);
        throw new Error(`Failed to calculate fare: ${error.message}`);
    }
}
module.exports.createRide = async ({
    userId,pickup,destination,vehicleType   
})=>{
    try {
        console.log('🚀 Starting ride creation process...');
        console.log('User ID:', userId);
        console.log('Vehicle Type:', vehicleType);
        
        // Validate inputs
        if (!userId) throw new Error('User ID is required');
        if (!pickup) throw new Error('Pickup location is required');
        if (!destination) throw new Error('Destination is required');
        if (!vehicleType) throw new Error('Vehicle type is required');
        
        // Map vehicle types to match pricing structure
        const vehicleTypeMap = {
            'bike': 'motorcycle',
            'auto': 'auto',
            'car': 'car'
        };
        
        const mappedVehicleType = vehicleTypeMap[vehicleType] || vehicleType;
        console.log('Mapped vehicle type:', mappedVehicleType);
        
        // Calculate fare
        console.log('📈 Calculating fare...');
        const fareData = await calculateFare(pickup, destination, mappedVehicleType);
        console.log('💵 Fare calculated:', fareData);

        // Generate OTP
        const otpCode = generateOTPCode();
        console.log('🔐 OTP generated');

        // Create new ride with location display names
        const newRide = new Ride({
            userId,
            pickup: {
                lat: pickup.lat,
                lng: pickup.lng,
                address: pickup.displayName || 'Pickup Location'
            },
            destination: {
                lat: destination.lat,
                lng: destination.lng,
                address: destination.displayName || 'Destination'
            },
            vehicleType: mappedVehicleType,
            otp: otpCode,
            fare: fareData.totalFare,
            distance: fareData.distance,
            duration: fareData.duration
        });

        console.log('💾 Saving ride to database...');
        const savedRide = await newRide.save();
        console.log('✅ Ride saved successfully:', savedRide);
        
        return savedRide;
    } catch (error) {
        console.error('❌ Error in createRide:', error.message);
        console.error('Full error:', error);
        throw new Error(`Ride creation failed: ${error.message}`);
    }
}


module.exports.calculateFare = calculateFare;

module.exports.getRideById = async (rideId) => {
    try {
        const ride = await Ride.findById(rideId).populate('captainId', '-password');
        if (!ride) {
            throw new Error('Ride not found');
        }
        return ride;
    } catch (error) {
        console.error('Error fetching ride:', error.message);
        throw error;
    }
};

module.exports.getRidesByUserId = async (userId) => {
    try {
        const rides = await Ride.find({ userId });
        return rides;
    } catch (error) {
        console.error('Error fetching user rides:', error.message);
        throw error;
    }
};

module.exports.getAllRides = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        const rides = await Ride.find()
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        
        const total = await Ride.countDocuments();
        
        return {
            rides,
            total,
            page,
            pages: Math.ceil(total / limit)
        };
    } catch (error) {
        console.error('Error fetching all rides:', error.message);
        throw error;
    }
};

module.exports.updateRideStatus = async (rideId, status, captainId = null) => {
    try {
        const validStatuses = ['pending', 'accepted', 'started', 'completed', 'cancelled'];
        
        if (!validStatuses.includes(status)) {
            throw new Error('Invalid ride status');
        }
        
        const updateData = { status };
        const query = { _id: rideId };

        if (status === 'accepted') {
            if (!captainId) {
                throw new Error('Captain ID is required to accept a ride');
            }

            query.status = 'pending';
            updateData.captainId = captainId;
            updateData.otp = generateOTPCode();
            console.log(`   Setting captainId on ride: ${captainId}`);
            console.log('   Generated fresh OTP for accepted ride');
        }

        const ride = await Ride.findOneAndUpdate(
            query,
            updateData,
            { new: true, runValidators: true }
        );
        
        if (!ride) {
            if (status === 'accepted') {
                throw new Error('Ride already accepted or no longer available');
            }

            throw new Error('Ride not found');
        }
        
        return ride;
    } catch (error) {
        console.error('Error updating ride status:', error.message);
        throw error;
    }
};

module.exports.generateOTP = () => {
    try {
        const otp = generateOTPCode();
        
        // Set OTP expiration to 10 minutes from now
        const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
        
        return {
            otpCode: otp,
            otpExpiresAt: otpExpiresAt,
            expiresIn: 6000 // seconds
        };
    } catch (error) {
        console.error('Error generating OTP:', error.message);
        throw error;
    }
}

module.exports.verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
    try {
        // Check if OTP has expired
        if (new Date() > new Date(storedExpiry)) {
            return {
                success: false,
                message: 'OTP has expired'
            };
        }
        
        // Compare OTP using timing-safe comparison to prevent timing attacks
        const isValid = crypto.timingSafeEqual(
            Buffer.from(storedOTP),
            Buffer.from(providedOTP)
        );
        
        return {
            success: isValid,
            message: isValid ? 'OTP verified successfully' : 'Invalid OTP'
        };
    } catch (error) {
        console.error('Error verifying OTP:', error.message);
        return {
            success: false,
            message: 'Error verifying OTP'
        };
    }
}

module.exports.cancelRide = async (rideId) => {
    try {
        console.log('❌ Cancelling ride:', rideId);
        
        const ride = await Ride.findByIdAndUpdate(
            rideId,
            { status: 'cancelled' },
            { new: true, runValidators: true }
        );
        
        if (!ride) {
            throw new Error('Ride not found');
        }
        
        console.log('✅ Ride cancelled successfully:', ride._id);
        return ride;
    } catch (error) {
        console.error('❌ Error cancelling ride:', error.message);
        throw error;
    }
};

