const { body } = require('express-validator');

const eventValidator = [
  body('name').notEmpty().withMessage('Name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('type').notEmpty().withMessage('Type is required'),
  body('category').notEmpty().withMessage('Category is required'),
  body('startDateTime').isISO8601().withMessage('Invalid start date/time'),
  body('endDateTime').isISO8601().withMessage('Invalid end date/time'),
  body('venueName').notEmpty().withMessage('Venue name is required'),
  body('address').notEmpty().withMessage('Address is required'),
  body('latitude').isNumeric().withMessage('Latitude must be a number'),
  body('longitude').isNumeric().withMessage('Longitude must be a number'),
  body('organizerName').notEmpty().withMessage('Organizer name is required'),
  body('organizerContact').notEmpty().withMessage('Organizer contact is required'),
];

module.exports = eventValidator;