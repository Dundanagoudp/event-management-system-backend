const express = require('express');
const inviteController = require('../controllers/invite.controller');
const authMiddleware = require('../middleware/auth.middleware');
const { inviteValidator, respondValidator } = require('../validators/invite.validator');
const router = express.Router();

// Send invitation
router.post('/invites', 
  authMiddleware, 
  inviteValidator, 
  inviteController.sendInvitation
);

// Full response to invitation (status + transportation)
router.put('/invites/:inviteId', 
  authMiddleware, 
  respondValidator, 
  inviteController.respondAllToInvitation
);

// Simple response (status only)
router.put('/invites/:inviteId/respond', 
  authMiddleware, 
  respondValidator.slice(0, 1), // Only status validation
  inviteController.respondToInvitation
);

// Get event invitations
router.get('/events/:eventId/invites', 
  authMiddleware, 
  inviteController.getInvitationsForEvent
);

module.exports = router;