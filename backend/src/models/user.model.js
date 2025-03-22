const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({
  fullname: {
    firstname: { 
      type: String,
      required: true, 
      trim: true 
    },
    lastname: { 
      type: String, 
      required: true, 
      trim: true 
    },
  },
  email: {
    type: String,
    required: true,
    unique: true, 
    trim: true,
    lowercase: true
  },
  password: { 
    type: String,
    required: true
  },
  profilePicture: { 
    type: String,
    default: 'default-profile.jpg'
  },
  createdAt: { 
    type: Date,
    default: Date.now
  },
  updatedAt: { 
    type: Date, 
    default: Date.now 
  },
});

userSchema.pre('save', async function (next) {
  if (this.isModified('password')) {
    this.password = await bcrypt.hash(this.password, 10);
  }
  next();
});

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAuthToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

module.exports = mongoose.model('User', userSchema);