const mapService = require('../services/map.service');

/**
 * Get coordinates from address
 * GET /api/maps/get-coordinates?address=<address>
 * Uses OpenStreetMap Nominatim API
 */
module.exports.getCoordinates = async (req, res, next) => {
  try {
    const { address } = req.query;

    if (!address) {
      return res.status(400).json({ message: 'Address is required' });
    }

    const coordinates = await mapService.getCoordinatesFromAddress(address);

    res.status(200).json(coordinates);
  } catch (error) {
    console.error('Error in getCoordinates:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get address from coordinates (Reverse Geocoding)
 * GET /api/maps/get-address?lat=<latitude>&lng=<longitude>
 * Uses OpenStreetMap Nominatim API
 */
module.exports.getAddress = async (req, res, next) => {
  try {
    const { lat, lng } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: 'Latitude and longitude are required' });
    }

    const address = await mapService.getAddressFromCoordinates(parseFloat(lat), parseFloat(lng));

    res.status(200).json(address);
  } catch (error) {
    console.error('Error in getAddress:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get distance and duration between two coordinates
 * GET /api/maps/get-distance?lat1=<lat>&lng1=<lng>&lat2=<lat>&lng2=<lng>
 * Uses OSRM (Open Source Routing Machine) API
 */
module.exports.getDistance = async (req, res, next) => {
  try {
    const { lat1, lng1, lat2, lng2 } = req.query;

    if (!lat1 || !lng1 || !lat2 || !lng2) {
      return res.status(400).json({ message: 'All coordinates (lat1, lng1, lat2, lng2) are required' });
    }

    const distance = await mapService.getDistanceBetweenCoordinates(
      parseFloat(lat1),
      parseFloat(lng1),
      parseFloat(lat2),
      parseFloat(lng2)
    );

    res.status(200).json(distance);
  } catch (error) {
    console.error('Error in getDistance:', error.message);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get location suggestions from partial address
 * GET /api/maps/get-suggestions?input=<partial_address>
 * Uses OpenStreetMap Nominatim API
 */
module.exports.getSuggestions = async (req, res, next) => {
  try {
    const { input } = req.query;

    if (!input || input.trim() === '') {
      return res.status(400).json({ message: 'Search input is required' });
    }

    const suggestions = await mapService.getLocationSuggestions(input);

    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Error in getSuggestions:', error.message);
    console.error('Full error:', error);
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};
