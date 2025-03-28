const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const locationController = require('../controllers/location.controller');
const { check } = require('express-validator');

// Update live location
router.put(
      '/:inviteId/location',
      [
        authMiddleware,
        check('address').isString().notEmpty() // Now accepts address string
      ],
      locationController.updateLiveLocation
    );

// Get nearby attendees
router.get(
  '/:inviteId/nearby',
  authMiddleware,
  locationController.getNearbyAttendees
);

// Pick up an attendee
router.post(
  '/pickup',
  [
    authMiddleware,
    check('driverInviteId').isMongoId(),
    check('attendeeInviteId').isMongoId()
  ],
  locationController.pickUpAttendee
);

module.exports = router;