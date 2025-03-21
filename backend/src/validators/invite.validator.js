const { body } = require('express-validator');

const inviteValidator = [
  body('eventId').notEmpty().withMessage('Event ID is required'),
  body('attendeeEmail').optional().isEmail().withMessage('Invalid email'),
  body('attendeePhone').optional().isMobilePhone().withMessage('Invalid phone number'),
];

const respondValidator = [
  body('status').isIn(['pending', 'accepted', 'declined']).withMessage('Invalid status'),
  body('transportationMode').optional().isIn(['car', 'public transport', 'other']).withMessage('Invalid transportation mode'),
  body('location').optional().isString().withMessage('Invalid location'),
];

module.exports = { inviteValidator, respondValidator };