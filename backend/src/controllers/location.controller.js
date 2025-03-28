const locationService = require('../services/location.service');

exports.updateLiveLocation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { address } = req.body;

    // Geocode the address to get coordinates
    const { lat, lng } = await mapsService.getAddressCoordinate(address);

    const updatedInvite = await locationService.updateLiveLocation(
      inviteId,
      lng, // longitude
      lat  // latitude
    );

    res.json({
      message: 'Location updated successfully',
      address,
      coordinates: updatedInvite.location.coordinates,
      invite: updatedInvite
    });
  } catch (error) {
    res.status(400).json({ 
      error: error.message,
      details: 'Failed to geocode address'
    });
  }
};

exports.getNearbyAttendees = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { maxDistance } = req.query;

    const attendees = await locationService.getNearbyAttendees(
      inviteId,
      maxDistance || 5000
    );

    res.json({
      count: attendees.length,
      attendees
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.pickUpAttendee = async (req, res) => {
  try {
    const { driverInviteId, attendeeInviteId } = req.body;

    const attendee = await locationService.pickupAttendee(
      driverInviteId,
      attendeeInviteId
    );

    res.json({
      message: 'Attendee picked up successfully',
      attendee
    });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};