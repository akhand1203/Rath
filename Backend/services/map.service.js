const axios = require('axios');

const suggestionCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

const commonCities = {
  'delhi': [
    { id: 1, displayName: 'Delhi, India', lat: 28.6139, lng: 77.2090, type: 'city', importance: 0.8 },
    { id: 2, displayName: 'New Delhi, India', lat: 28.6355, lng: 77.2250, type: 'city', importance: 0.8 }
  ],
  'mumbai': [
    { id: 3, displayName: 'Mumbai, India', lat: 19.0760, lng: 72.8777, type: 'city', importance: 0.8 },
    { id: 4, displayName: 'Greater Mumbai, India', lat: 19.0176, lng: 72.8479, type: 'city', importance: 0.7 }
  ],
  'bangalore': [
    { id: 5, displayName: 'Bangalore, India', lat: 12.9716, lng: 77.5946, type: 'city', importance: 0.8 },
    { id: 6, displayName: 'Bengaluru, Karnataka, India', lat: 12.9716, lng: 77.5946, type: 'city', importance: 0.8 }
  ],
  'london': [
    { id: 7, displayName: 'London, United Kingdom', lat: 51.5074, lng: -0.1278, type: 'city', importance: 0.9 }
  ],
  'new york': [
    { id: 8, displayName: 'New York, United States', lat: 40.7128, lng: -74.0060, type: 'city', importance: 0.9 }
  ],
  'paris': [
    { id: 9, displayName: 'Paris, France', lat: 48.8566, lng: 2.3522, type: 'city', importance: 0.9 }
  ],
  'tokyo': [
    { id: 10, displayName: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503, type: 'city', importance: 0.9 }
  ]

Object.entries(commonCities).forEach(([key, cities]) => {
  suggestionCache.set(key, {
    data: cities,
    timestamp: Date.now(),
    isDefault: true
  });
});

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

const getDistanceBetweenCoordinates = async (lat1, lng1, lat2, lng2) => {
  try {
    if (!lat1 || !lng1 || !lat2 || !lng2) {
      throw new Error('All coordinates are required');
    }

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
        distance: route.distance / 1000,
        duration: route.duration / 60,
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

const getLocationSuggestions = async (input) => {
  try {
    if (!input || input.trim() === '') {
      return [];
    }

    const cacheKey = input.toLowerCase().trim();


    if (suggestionCache.has(cacheKey)) {
      const cached = suggestionCache.get(cacheKey);
      if (Date.now() - cached.timestamp < CACHE_DURATION) {
        console.log(`✅ Returning cached suggestions for "${input}"`);
        return cached.data;
      } else {
        // Cache expired, remove it
        suggestionCache.delete(cacheKey);
      }
    }


      params: {
        q: input,
        format: 'json',
        limit: 10
      },
      headers: {
        'User-Agent': 'Rath-Application'
      },
      timeout: 10000
    });

    console.log(`🔍 OpenStreetMap search for "${input}":`, response.data.length, 'results');

    if (response.data && Array.isArray(response.data) && response.data.length > 0) {
      const suggestions = response.data.map(result => ({
        id: result.place_id,
        displayName: result.display_name,
        lat: parseFloat(result.lat),
        lng: parseFloat(result.lon),
        type: result.type,
        importance: result.importance
      }));

      // Cache the results
      suggestionCache.set(cacheKey, {
        data: suggestions,
        timestamp: Date.now()
      });

      return suggestions;
    } else {
      console.log(`⚠️ No suggestions found for "${input}"`);
      return [];
    }
  } catch (error) {
    console.error('❌ Error getting suggestions:', error.message);
    if (error.response?.status === 429) {
      console.error('⚠️ Rate limited by OpenStreetMap. Try again in a few seconds.');
    }
    return [];
  }
};

module.exports = {
  getCoordinatesFromAddress,
  getAddressFromCoordinates,
  getDistanceBetweenCoordinates,
  getLocationSuggestions
};
