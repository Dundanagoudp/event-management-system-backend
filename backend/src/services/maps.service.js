const axios = require('axios');

module.exports = {
  // Get coordinates from address
  async getAddressCoordinate(address) {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;

    const response = await axios.get(url);
    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Unable to fetch coordinates');
    }

    const location = response.data.results[0].geometry.location;
    return {
      lat: location.lat,
      lng: location.lng
    };
  },

  // Get distance and time between two points
  async getDistanceTime(origin, destination) {
    const apiKey = process.env.GOOGLE_MAPS_API;
    const url = `https://maps.gomaps.pro/maps/api/distancematrix/json?origins=${encodeURIComponent(origin)}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

    const response = await axios.get(url);
    if (response.data.status !== 'OK') {
      throw new Error(response.data.error_message || 'Unable to calculate distance');
    }

    const element = response.data.rows[0].elements[0];
    if (element.status === 'ZERO_RESULTS') {
      throw new Error('No route found between locations');
    }

    return {
      distance: element.distance,
      duration: element.duration
    };
  }
};