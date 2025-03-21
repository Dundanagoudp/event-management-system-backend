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

const respondToInvitation = async (req, res) => {
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

module.exports = { sendInvitation, respondToInvitation, getInvitationsForEvent };