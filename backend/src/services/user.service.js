const User = require('../models/user.model');

const findUserByEmail = async (email) => {
  return await User.findOne({ email });
};

const createUser = async (username, email, password) => {
  const hashedPassword = await User.hashPassword(password);
  const user = new User({ username, email, password: hashedPassword });
  await user.save();
  return user;
};

const authenticateUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');
  const isMatch = await user.comparePassword(password);
  if (!isMatch) throw new Error('Invalid credentials');
  return user;
};

module.exports = { findUserByEmail, createUser, authenticateUser };