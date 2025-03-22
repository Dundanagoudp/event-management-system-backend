const axios = require('axios');

module.exports.getAddressCoordinate = async (address) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const location = response.data.results[0].geometry.location;
      return {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      throw new Error(response.data.error_message || 'Unable to fetch coordinates');
    }
  } catch (error) {
    throw new Error(`Geocoding API failed: ${error.message}`);
  }
};

module.exports.getDistanceTime = async (origin, destination) => {
  const apiKey = process.env.GOOGLE_MAPS_API;
  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === 'OK') {
      const element = response.data.rows[0].elements[0];
      if (element.status === 'ZERO_RESULTS' || element.status === 'NOT_FOUND') {
        throw new Error(`No route found between "${origin}" and "${destination}".`);
      }
      return element; // Return distance and duration
    } else {
      throw new Error(`Distance Matrix API Error: ${response.data.error_message || 'Unknown error'}`);
    }
  } catch (error) {
    throw new Error('Unable to calculate distance and time');
  }
};