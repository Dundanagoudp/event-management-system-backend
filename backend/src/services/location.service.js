const Invite = require('../models/invite.model');

// Get nearby attendees for a driver
const fetchNearbyAttendees = async (inviteId) => {
  const driver = await Invite.findById(inviteId);
  if (!driver || driver.transportationMode !== 'car') {
    throw new Error('Invalid driver or transportation mode.');
  }

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

  return nearbyAttendees;
};

// Pick up an attendee
const fetchpickupAttendee = async (driverInviteId, attendeeInviteId) => {
  const driver = await Invite.findById(driverInviteId);
  const attendee = await Invite.findById(attendeeInviteId);

  if (!driver || !attendee || driver.transportationMode !== 'car') {
    throw new Error('Invalid driver or attendee.');
  }

  // Mark the attendee as picked up
  attendee.isPickedUp = true;
  await attendee.save();

  return attendee;
};

module.exports = {
      fetchNearbyAttendees,
      fetchpickupAttendee,
};