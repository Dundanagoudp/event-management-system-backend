const Invite = require('../models/invite.model');
const Event = require('../models/event.model');
const { sendEmail } = require('../utils/emailSender');
const { sendSMS } = require('../utils/smsSender');
const { validationResult } = require('express-validator');

// Send invitation with enhanced error handling
const sendInvitation = async (req, res) => {
  try {
    const { eventId, attendeeEmail } = req.body;

    // Validate email format in controller
    if (!attendeeEmail || !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(attendeeEmail)) {
      return res.status(400).json({ error: 'Valid email address is required' });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check for existing invite
    const existingInvite = await Invite.findOne({ event: eventId, attendeeEmail });
    if (existingInvite) {
      return res.status(409).json({ message: 'Invite already exists for this email' });
    }

    const invite = await Invite.create({ event: eventId, attendeeEmail });

    // Prepare email content
    const emailSubject = `Invitation: ${event.name}`;
    const emailHtml = `
      <h1>You're Invited!</h1>
      <h2>${event.name}</h2>
      <p><strong>When:</strong> ${event.startDateTime.toLocaleString()}</p>
      <p><strong>Where:</strong> ${event.venueName}, ${event.address}</p>
      <p>Please respond to this invitation by clicking below:</p>
      <a href="${process.env.FRONTEND_URL}/invites/${invite._id}" 
         style="padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">
        Respond to Invitation
      </a>
    `;

    // Send email with error handling
    try {
      await sendEmail(attendeeEmail, emailSubject, emailHtml);
      return res.status(201).json({ 
        message: 'Invitation sent successfully',
        invite 
      });
    } catch (emailError) {
      // Delete the invite if email fails
      await Invite.findByIdAndDelete(invite._id);
      return res.status(500).json({ 
        message: 'Invitation created but email failed to send',
        error: emailError.message,
        invite // Return invite anyway since it was created
      });
    }

  } catch (error) {
    console.error('Invitation error:', error);
    return res.status(500).json({ 
      message: 'Error processing invitation',
      error: error.message 
    });
  }
};

// Complete response handler
const respondAllToInvitation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { inviteId } = req.params;
    const { status, transportationMode, location } = req.body;

    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Update invite
    invite.status = status;
    invite.responseDate = new Date();

    if (status === 'accepted') {
      invite.transportationMode = transportationMode;
      
      if (transportationMode === 'car' && location) {
        invite.location = {
          type: 'Point',
          coordinates: location.coordinates
        };
        invite.isSharingLocation = true;
      }
    }

    await invite.save();

    res.json({
      message: `Invitation ${status}`,
      invite,
      nextSteps: status === 'accepted' ? 
        (transportationMode === 'car' ? 
          'Location saved for carpooling' : 
          'Transportation details saved') : 
        'No further action needed'
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing response',
      error: error.message 
    });
  }
};

// Simple response handler
const respondToInvitation = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { inviteId } = req.params;
    const { status } = req.body;

    const invite = await Invite.findByIdAndUpdate(
      inviteId,
      { 
        status,
        responseDate: new Date() 
      },
      { new: true }
    );

    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    res.json({
      message: `Invitation ${status}`,
      invite
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error processing response',
      error: error.message 
    });
  }
};

// Get event invitations with filtering
const getInvitationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status, transportationMode } = req.query;

    const filter = { event: eventId };
    if (status) filter.status = status;
    if (transportationMode) filter.transportationMode = transportationMode;

    const invites = await Invite.find(filter)
      .populate('event', 'name startDateTime venueName')
      .sort({ createdAt: -1 });

    res.json({
      count: invites.length,
      invites
    });

  } catch (error) {
    res.status(500).json({ 
      message: 'Error fetching invitations',
      error: error.message 
    });
  }
};

module.exports = {
  sendInvitation,
  respondAllToInvitation,
  respondToInvitation,
  getInvitationsForEvent
};