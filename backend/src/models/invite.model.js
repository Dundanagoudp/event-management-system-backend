const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendeeEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true
  },
  attendeePhone: {
    type: String,
    trim: true
  }, // Optional
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  transportationMode: {
    type: String,
    enum: ['car', 'public transport', 'other']
  }, // Optional
  location: {
    type: String
  }, // Optional (for carpooling)
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Invite', inviteSchema);
