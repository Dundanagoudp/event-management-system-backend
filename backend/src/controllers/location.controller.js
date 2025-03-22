const Invite = require('../models/invite.model');
const { getNearbyAttendees: fetchNearbyAttendees, fetchpickupAttendee } = require('../services/location.service');

// Get nearby attendees for a driver
const getNearbyAttendees = async (req, res) => {
      try {
        const { inviteId } = req.params;
    
        // Validate inviteId
        if (!inviteId) {
          return res.status(400).json({ error: 'Invite ID is required.' });
        }
    
        // Find the driver's invite
        const driver = await Invite.findById(inviteId);
        if (!driver || driver.transportationMode !== 'car') {
          return res.status(400).json({ error: 'Invalid driver or transportation mode.' });
        }
    
        // Fetch nearby attendees (within 10 km)
        const nearbyAttendees = await Invite.find({
          event: driver.event,
          transportationMode: { $ne: 'car' }, // Exclude other drivers
          location: {
            $near: {
              $geometry: {
                type: 'Point',
                coordinates: driver.location.coordinates,
              },
              $maxDistance: 10000, // 10 km
            },
          },
        });
    
        // Return the list of nearby attendees
        res.json({ nearbyAttendees });
      } catch (err) {
        res.status(400).json({ error: err.message });
      }
    };

// Pick up an attendee
const pickUpAttendee = async (req, res) => {
  try {
    const { driverInviteId, attendeeInviteId } = req.body;

    // Validate driverInviteId and attendeeInviteId
    if (!driverInviteId || !attendeeInviteId) {
      return res.status(400).json({ error: 'Driver and Attendee Invite IDs are required.' });
    }

    // Pick up the attendee
    const attendee = await fetchpickupAttendee(driverInviteId, attendeeInviteId);

    // Return success response
    res.json({ message: 'Attendee picked up successfully.', attendee });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update live location
const updateLiveLocation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { coordinates } = req.body;

    // Validate inviteId and coordinates
    if (!inviteId || !coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Invalid invite ID or coordinates.' });
    }

    // Update the invite with the new location
    const invite = await Invite.findByIdAndUpdate(
      inviteId,
      {
        location: {
          type: 'Point',
          coordinates,
        },
        isSharingLocation: true,
      },
      { new: true }
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found.' });
    }

    // Return success response
    res.json({ message: 'Live location updated successfully.', invite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  getNearbyAttendees,
  pickUpAttendee,
  updateLiveLocation,
};