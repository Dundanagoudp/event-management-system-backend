const User = require('../models/user.model');

const signup = async (req, res) => {
  try {
    const { firstname, lastname, email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({
      fullname: { firstname, lastname },
      email,
      password,
    });

    await user.save();
    const token = user.generateAuthToken();

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        fullname: user.fullname,
        email: user.email,
        profilePicture: user.profilePicture,
        _id: user._id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = user.generateAuthToken();

    res.json({
      message: 'Login successful',
      user: {
        fullname: user.fullname,
        email: user.email,
        profilePicture: user.profilePicture,
        _id: user._id,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
      token,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { signup, login };