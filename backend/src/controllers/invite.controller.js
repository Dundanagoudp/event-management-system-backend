const Invite = require('../models/invite.model');
const Event = require('../models/event.model');
const { sendEmail } = require('../utils/emailSender');


const { sendSMS } = require('../utils/smsSender');

// Send Invitation
const sendInvitation = async (req, res) => {
  try {
    const { eventId, attendeeEmail, attendeePhone } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Create the invite
    const invite = new Invite({ event: eventId, attendeeEmail, attendeePhone });
    await invite.save();

    // Send email invitation
    if (attendeeEmail) {
      const emailSubject = `You're Invited to ${event.name}`;
      const emailBody = `
        <h1>You're Invited to ${event.name}!</h1>
        <img src="${event.invitationCardImage}" alt="Event Banner" style="max-width: 100%;">
        <p><strong>Description:</strong> ${event.description}</p>
        <p><strong>Type:</strong> ${event.type}</p>
        <p><strong>Category:</strong> ${event.category}</p>
        <p><strong>Organizer:</strong> ${event.organizerName} (${event.organizerContact})</p>
        <p><strong>Notes:</strong> ${event.notes}</p>
        <p>Click the link below to respond to the invitation:</p>
        <a href="http://yourapp.com/respond/${invite._id}">Respond to Invitation</a>
      `;
      await sendEmail(attendeeEmail, emailSubject, emailBody);
    }

    // Send SMS invitation
    if (attendeePhone) {
      const smsBody = `You're invited to ${event.name}. Respond here: http://yourapp.com/respond/${invite._id}`;
      await sendSMS(attendeePhone, smsBody);
    }

    res.status(201).json({ message: 'Invitation sent successfully', invite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Respond to Invitation (Consolidated Logic for /invites/:inviteId)
const respondAllToInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { status, transportationMode, location } = req.body;

    // Validate status
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "declined".' });
    }

    // Find the invite
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Update the invite
    invite.status = status;

    // If declined, save and respond
    if (status === 'declined') {
      await invite.save();
      return res.json({ message: 'Thank you for your response. We hope to see you next time!' });
    }

    // If accepted, validate transportation mode
    if (status === 'accepted') {
      if (!transportationMode) {
        return res.status(400).json({ error: 'Transportation mode is required.' });
      }

      // Update transportation mode
      invite.transportationMode = transportationMode;

      // If coming by car, validate and save location
      if (transportationMode === 'car') {
        if (!location) {
          return res.status(400).json({ error: 'Location is required for carpooling.' });
        }
        invite.location = location;
      }

      // Save the invite
      await invite.save();

      // Respond with confirmation
      return res.json({
        message: 'Thank you for confirming your attendance!',
        invite,
        nextStep: transportationMode === 'car' ? 'Location saved for carpooling.' : 'Transportation mode saved.',
      });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Respond to Invitation (Specific Logic for /invites/:inviteId/respond)
const respondToInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { status } = req.body;

    // Validate status
    if (!['accepted', 'declined'].includes(status)) {
      return res.status(400).json({ error: 'Invalid status. Must be "accepted" or "declined".' });
    }

    // Find the invite
    const invite = await Invite.findById(inviteId);
    if (!invite) {
      return res.status(404).json({ message: 'Invitation not found' });
    }

    // Update the invite
    invite.status = status;
    await invite.save();

    // Respond based on status
    if (status === 'declined') {
      return res.json({ message: 'Thank you for your response. We hope to see you next time!' });
    } else {
      return res.json({ message: 'Thank you for confirming your attendance!' });
    }
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Invitations for an Event
const getInvitationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const invites = await Invite.find({ event: eventId });
    res.json({ invites });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};



module.exports = {
  sendInvitation,
  respondAllToInvitation,
  respondToInvitation,
  getInvitationsForEvent,
};