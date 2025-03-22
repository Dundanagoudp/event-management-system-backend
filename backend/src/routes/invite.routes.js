const express = require('express');
const inviteController = require('../controllers/invite.controller');
const authMiddleware = require('../middleware/auth.middleware');
const router = express.Router();

router.post('/invites', authMiddleware, inviteController.sendInvitation);
router.put('/invites/:inviteId', authMiddleware, inviteController.respondAllToInvitation);
router.put('/invites/:inviteId/respond', authMiddleware, inviteController.respondToInvitation);
router.get('/events/:eventId/invites', authMiddleware, inviteController.getInvitationsForEvent);

module.exports = router;