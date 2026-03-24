const axios = require('axios');

/**
 * Get coordinates (latitude and longitude) from an address using OpenStreetMap Nominatim API
 * @param {string} address - The address to geocode
 * @returns {Promise<{lat: number, lng: number}>} Object containing latitude and longitude
 */
const getCoordinatesFromAddress = async (address) => {
  try {
    if (!address || address.trim() === '') {
      throw new Error('Address cannot be empty');
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: {
        q: address,
        format: 'json',
        limit: 1
      },
      headers: {
        'User-Agent': 'Rath-Application'
      }
    });

    if (response.data && response.data.length > 0) {
      const result = response.data[0];
      return {
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon)
      };
    } else {
      throw new Error(`No coordinates found for address: ${address}`);
    }
  } catch (error) {
    console.error('Error getting coordinates:', error.message);
    throw error;
  }
};

/**
 * Get address details from coordinates using OpenStreetMap Nominatim API (Reverse Geocoding)
 * @param {number} lat - Latitude
 * @param {number} lng - Longitude
 * @returns {Promise<Object>} Object containing address details
 */
const getAddressFromCoordinates = async (lat, lng) => {
  try {
    if (!lat || !lng) {
      throw new Error('Latitude and longitude are required');
    }

    const response = await axios.get('https://nominatim.openstreetmap.org/reverse', {
      params: {
        lat: lat,
        lon: lng,
        format: 'json'
      },
      headers: {
        'User-Agent': 'Rath-Application'
      }
    });

    if (response.data) {
      return {
        address: response.data.address,
        displayName: response.data.display_name,
        lat: parseFloat(response.data.lat),
        lng: parseFloat(response.data.lon)
      };
    } else {
      throw new Error('No address found for the given coordinates');
    }
  } catch (error) {
    console.error('Error getting address:', error.message);
    throw error;
  }
};

/**
 * Get distance and route between two coordinates
 * @param {number} lat1 - Starting latitude
 * @param {number} lng1 - Starting longitude
 * @param {number} lat2 - Ending latitude
 * @param {number} lng2 - Ending longitude
 * @returns {Promise<Object>} Object containing distance and route information
 */
const getDistanceBetweenCoordinates = async (lat1, lng1, lat2, lng2) => {
  try {
    if (!lat1 || !lng1 || !lat2 || !lng2) {
      throw new Error('All coordinates are required');
    }

    // Using OSRM (Open Source Routing Machine) for distance calculation
    const response = await axios.get(
      `https://router.project-osrm.org/route/v1/driving/${lng1},${lat1};${lng2},${lat2}`,
      {
        params: {
          overview: false
        }
      }
    );

    if (response.data && response.data.routes && response.data.routes.length > 0) {
      const route = response.data.routes[0];
      return {
        distance: route.distance / 1000, // Convert to km
        duration: route.duration / 60, // Convert to minutes
        lat1,
        lng1,
        lat2,
        lng2
      };
    } else {
      throw new Error('No route found between these coordinates');
    }
  } catch (error) {
    console.error('Error calculating distance:', error.message);
    throw error;
  }
};

module.exports = {
  getCoordinatesFromAddress,
  getAddressFromCoordinates,
  getDistanceBetweenCoordinates
};
