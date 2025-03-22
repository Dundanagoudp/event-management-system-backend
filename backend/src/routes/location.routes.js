const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth.middleware');
const locationController = require('../controllers/location.controller');

// Update live location
router.put('/update-location/:inviteId', authMiddleware, locationController.updateLiveLocation);

// Get nearby attendees
router.get('/nearby-attendees/:inviteId', authMiddleware, locationController.getNearbyAttendees);

// Pick up an attendee
router.post('/pickup-attendee', authMiddleware, locationController.pickUpAttendee);

module.exports = router;