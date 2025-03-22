const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true,
  },
  attendeeEmail: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
  },
  attendeePhone: {
    type: String,
    trim: true,
  }, // Optional
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending',
  },
  transportationMode: {
    type: String,
    enum: ['car', 'public transport', 'other'],
  }, // Optional
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      default: [0, 0],
    },
  }, // For carpooling (live location)
  isSharingLocation: {
    type: Boolean,
    default: false,
  }, // Whether the user is sharing live location
  isPickedUp: {
    type: Boolean,
    default: false,
  }, // Whether the user has been picked up
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for geospatial queries
inviteSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('Invite', inviteSchema);