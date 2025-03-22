const Invite = require('../models/invite.model');
const Event = require('../models/event.model');
const { sendEmail } = require('../utils/emailSender');

const sendInvitation = async (req, res) => {
  try {
    const { eventId, attendeeEmail } = req.body;

    // Find the event
    const event = await Event.findById(eventId);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // Create the invite
    const invite = new Invite({ event: eventId, attendeeEmail });
    await invite.save();

    // Send email invitation
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

    res.status(201).json({ message: 'Invitation sent successfully', invite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const respondAllToInvitation = async (req, res) => {
  try {
    const { inviteId } = req.params;
    const { status, transportationMode, location } = req.body;

    // Update the invite
    const invite = await Invite.findByIdAndUpdate(
      inviteId,
      { status, transportationMode, location },
      { new: true }
    );

    if (!invite) return res.status(404).json({ message: 'Invitation not found' });
    res.json({ message: 'Invitation response updated successfully', invite });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getInvitationsForEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const invites = await Invite.find({ event: eventId });
    res.json({ invites });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const respondToInvitation = async (req, res) => {
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

module.exports = { sendInvitation, respondAllToInvitation,respondToInvitation, getInvitationsForEvent };