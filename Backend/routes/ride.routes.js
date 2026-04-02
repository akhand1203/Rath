const express = require("express");
const router = express.Router();
const {body,query} = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

// POST - Create a new ride
router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().withMessage('Invalid pickup location'),
    body('destination').isString().withMessage('Invalid destination location'),
    body('vehicleType').isIn(['bike', 'auto', 'car']).withMessage('Invalid vehicle type'),
    rideController.createRide
);

// GET - Get authenticated user's rides
router.get('/my-rides',
    authMiddleware.authUser,
    rideController.getRidesByUser
);

// GET - Get a specific ride by ID
router.get('/:rideId',
    authMiddleware.authUser,
    rideController.getRideById
);

// GET - Get all rides (with pagination)
router.get('/',
    authMiddleware.authUser,
    rideController.getAllRides
);

// PUT - Update ride status
router.put('/:rideId/status',
    authMiddleware.authCaptain,
    body('status').isIn(['pending', 'accepted', 'started', 'completed', 'cancelled']).withMessage('Invalid status'),
    rideController.updateRideStatus
);

// PUT - Cancel a ride
router.put('/:rideId/cancel',
    authMiddleware.authUser,
    rideController.cancelRide
);

router.get('/fare/:rideId',
    authMiddleware.authUser,
    query('pickupLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid pickup latitude'),
    query('pickupLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid pickup longitude'),
    query('destLat').isFloat({ min: -90, max: 90 }).withMessage('Invalid destination latitude'),
    query('destLng').isFloat({ min: -180, max: 180 }).withMessage('Invalid destination longitude'),
    rideController.calculateFare
);

module.exports = router;
