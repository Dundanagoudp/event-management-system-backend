const { body, param } = require('express-validator');

const inviteValidator = [
  body('eventId')
    .notEmpty().withMessage('Event ID is required')
    .isMongoId().withMessage('Invalid Event ID format'),
  
  body('attendeeEmail')
    .optional()
    .isEmail().withMessage('Invalid email format')
    .normalizeEmail(),
    
  body('attendeePhone')
    .optional()
    .isMobilePhone().withMessage('Invalid phone number')
    .custom((value, { req }) => {
      if (!req.body.attendeeEmail && !value) {
        throw new Error('Either email or phone must be provided');
      }
      return true;
    })
];

const respondValidator = [
  param('inviteId')
    .isMongoId().withMessage('Invalid Invite ID format'),
    
  body('status')
    .notEmpty().withMessage('Status is required')
    .isIn(['pending', 'accepted', 'declined']).withMessage('Invalid status value'),
    
  body('transportationMode')
    .optional()
    .isIn(['car', 'public transport', 'other']).withMessage('Invalid transportation mode')
    .custom((value, { req }) => {
      if (req.body.status === 'accepted' && !value) {
        throw new Error('Transportation mode is required when accepting');
      }
      return true;
    }),
    
  body('location')
    .optional()
    .custom((value, { req }) => {
      if (req.body.transportationMode === 'car' && !value) {
        throw new Error('Location is required when coming by car');
      }
      if (value && (!value.coordinates || !Array.isArray(value.coordinates))) {
        throw new Error('Invalid location format. Expected GeoJSON coordinates');
      }
      return true;
    })
];

module.exports = { inviteValidator, respondValidator };