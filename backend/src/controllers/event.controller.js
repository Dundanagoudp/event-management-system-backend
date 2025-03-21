const {
      createEvent,
      getAllEvents,
      getEventById,
      updateEvent,
      deleteEvent,
    } = require('../services/event.service');
    const { validationResult } = require('express-validator');
    
    exports.createEvent = async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
    
      const eventData = req.body;
      eventData.creator = req.user._id; // Attach the authenticated user's ID
    
      try {
        const event = await createEvent(eventData);
        res.status(201).json({ message: 'Event created successfully', event });
      } catch (error) {
        res.status(500).json({ message: 'Error creating event', error: error.message });
      }
    };
    
    exports.getAllEvents = async (req, res) => {
      try {
        const events = await getAllEvents();
        res.status(200).json({ events });
      } catch (error) {
        res.status(500).json({ message: 'Error fetching events', error: error.message });
      }
    };
    
    exports.getEventById = async (req, res) => {
      const { eventId } = req.params;
    
      try {
        const event = await getEventById(eventId);
        if (!event) {
          return res.status(404).json({ message: 'Event not found' });
        }
        res.status(200).json({ event });
      } catch (error) {
        res.status(500).json({ message: 'Error fetching event', error: error.message });
      }
    };
    
    exports.updateEvent = async (req, res) => {
      const { eventId } = req.params;
      const updateData = req.body;
    
      try {
        const event = await updateEvent(eventId, updateData);
        res.status(200).json({ message: 'Event updated successfully', event });
      } catch (error) {
        res.status(500).json({ message: 'Error updating event', error: error.message });
      }
    };
    
    exports.deleteEvent = async (req, res) => {
      const { eventId } = req.params;
    
      try {
        const event = await deleteEvent(eventId);
        res.status(200).json({ message: 'Event deleted successfully', event });
      } catch (error) {
        res.status(500).json({ message: 'Error deleting event', error: error.message });
      }
    };