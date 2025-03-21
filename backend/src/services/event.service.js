const Event = require('../models/event.model');

const createEvent = async (eventData) => {
  const event = new Event(eventData);
  await event.save();
  return event;
};

const getAllEvents = async () => {
  return await Event.find();
};

const getEventById = async (eventId) => {
  return await Event.findById(eventId);
};

const updateEvent = async (eventId, updateData) => {
  return await Event.findByIdAndUpdate(eventId, updateData, { new: true });
};

const deleteEvent = async (eventId) => {
  return await Event.findByIdAndDelete(eventId);
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};