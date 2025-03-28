const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
  event: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  attendeeEmail: {
    type: String,
    required: function() {
      return !this.attendeePhone; // Email or phone must be provided
    },
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address']
  },
  attendeePhone: {
    type: String,
    required: function() {
      return !this.attendeeEmail; // Email or phone must be provided
    },
    trim: true,
    match: [/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/, 'Please fill a valid phone number']
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'declined'],
    default: 'pending'
  },
  transportationMode: {
    type: String,
    enum: ['car', 'public transport', 'other'],
    required: function() {
      return this.status === 'accepted';
    }
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      required: function() {
        return this.transportationMode === 'car';
      }
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: function() {
        return this.transportationMode === 'car';
      },
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates'
      }
    }
  },
  isSharingLocation: {
    type: Boolean,
    default: false
  },
  isPickedUp: {
    type: Boolean,
    default: false
  },
  responseDate: Date
}, {
  timestamps: true,
  toJSON: {
    virtuals: true,
    transform: function(doc, ret) {
      delete ret.__v;
      return ret;
    }
  }
});

// Indexes
inviteSchema.index({ event: 1 });
inviteSchema.index({ location: '2dsphere' });
inviteSchema.index({ attendeeEmail: 1, event: 1 }, { unique: true, partialFilterExpression: { attendeeEmail: { $exists: true } } });
inviteSchema.index({ attendeePhone: 1, event: 1 }, { unique: true, partialFilterExpression: { attendeePhone: { $exists: true } } });

module.exports = mongoose.model('Invite', inviteSchema);