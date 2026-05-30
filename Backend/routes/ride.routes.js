const express = require("express");
const router = express.Router();
const {body,query} = require('express-validator');
const rideController = require('../controllers/ride.controller');
const authMiddleware = require('../middlewares/auth.middleware');

router.post('/create',
    authMiddleware.authUser,
    body('pickup').isString().withMessage('Invalid pickup location'),
    body('destination').isString().withMessage('Invalid destination location'),
    body('vehicleType').isIn(['bike', 'auto', 'car']).withMessage('Invalid vehicle type'),
    rideController.createRide
);

router.get('/my-rides',
    authMiddleware.authUser,
    rideController.getRidesByUser
);

router.get('/:rideId',
    authMiddleware.authUser,
    rideController.getRideById
);

router.get('/',
    authMiddleware.authUser,
    rideController.getAllRides
);

router.put('/:rideId/status',
    authMiddleware.authCaptain,
    body('status').isIn(['pending', 'accepted', 'started', 'completed', 'cancelled']).withMessage('Invalid status'),
    rideController.updateRideStatus
);

router.put('/:rideId/cancel',
    authMiddleware.authUser,
    rideController.cancelRide
);

router.put('/:rideId/start',
    authMiddleware.authCaptain,
    body('otp').isLength({ min: 6, max: 6 }).withMessage('OTP must be 6 digits'),
    rideController.startRide
);

router.put('/:rideId/end',
    authMiddleware.authCaptain,
    rideController.endRide
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
