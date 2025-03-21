const express = require('express');
const eventController = require('../controllers/event.controller');
const authMiddleware = require('../middleware/auth.middleware');
const eventValidator = require('../validators/event.validator');
const router = express.Router();

router.post('/eventscreate', authMiddleware, eventValidator, eventController.createEvent);
router.get('/eventsgetall', authMiddleware, eventController.getAllEvents);
router.get('/eventsdetail/:eventId', authMiddleware, eventController.getEventById);
router.put('/eventsupdate/:eventId', authMiddleware, eventValidator, eventController.updateEvent);
router.delete('/eventsdelete/:eventId', authMiddleware, eventController.deleteEvent);

module.exports = router;