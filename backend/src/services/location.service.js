const Invite = require('../models/invite.model');
const { getDistanceTime } = require('./maps.service');

module.exports = {
  // Update user's live location
  async updateLiveLocation(inviteId, longitude, latitude) {
    return await Invite.findByIdAndUpdate(
      inviteId,
      {
        location: {
          type: 'Point',
          coordinates: [longitude, latitude]
        },
        isSharingLocation: true
      },
      { new: true }
    );
  },

  // Find nearby attendees for carpooling
  async getNearbyAttendees(driverInviteId, maxDistance = 5000) {
    const driver = await Invite.findById(driverInviteId);
    if (!driver || driver.transportation.mode !== 'driver') {
      throw new Error('Invalid driver invite');
    }

    const attendees = await Invite.find({
      event: driver.event,
      'transportation.mode': 'passenger',
      isSharingLocation: true,
      isPickedUp: false,
      location: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: driver.location.coordinates
          },
          $maxDistance: maxDistance
        }
      }
    }).populate('user', 'name phone');

    // Add distance and time calculations
    const attendeesWithDetails = await Promise.all(
      attendees.map(async attendee => {
        const origin = `${driver.location.coordinates[1]},${driver.location.coordinates[0]}`;
        const destination = `${attendee.location.coordinates[1]},${attendee.location.coordinates[0]}`;
        const distanceTime = await getDistanceTime(origin, destination);

        return {
          ...attendee.toObject(),
          distance: distanceTime.distance,
          duration: distanceTime.duration
        };
      })
    );

    return attendeesWithDetails;
  },

  // Mark an attendee as picked up
  async pickupAttendee(driverInviteId, attendeeInviteId) {
    const [driver, attendee] = await Promise.all([
      Invite.findById(driverInviteId),
      Invite.findById(attendeeInviteId)
    ]);

    if (!driver || driver.transportation.mode !== 'driver') {
      throw new Error('Invalid driver');
    }
    if (!attendee || attendee.transportation.mode !== 'passenger') {
      throw new Error('Invalid attendee');
    }

    attendee.isPickedUp = true;
    attendee.pickupDetails = {
      time: new Date(),
      location: attendee.location
    };
    await attendee.save();

    return attendee;
  }
};