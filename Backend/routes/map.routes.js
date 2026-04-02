const express = require('express');
const router = express.Router();
const mapController = require('../controllers/map.controller');
const { authUser } = require('../middlewares/auth.middleware');

/**
 * Map Routes using OpenStreetMap (no API key required)
 */

/**
 * Get coordinates from address (Geocoding)
 * GET /maps/get-coordinates?address=<address>
 */
router.get('/get-coordinates', mapController.getCoordinates);

/**
 * Get address from coordinates (Reverse Geocoding)
 * GET /maps/get-address?lat=<latitude>&lng=<longitude>
 */
router.get('/get-address', mapController.getAddress);

/**
 * Get distance and duration between two coordinates
 * GET /maps/get-distance?lat1=<lat>&lng1=<lng>&lat2=<lat>&lng2=<lng>
 */
router.get('/get-distance', mapController.getDistance);

/**
 * Get location suggestions from partial address
 * GET /maps/get-suggestions?input=<partial_address>
 * Returns up to 10 location suggestions with coordinates
 */
router.get('/get-suggestions', mapController.getSuggestions);

module.exports = router;
