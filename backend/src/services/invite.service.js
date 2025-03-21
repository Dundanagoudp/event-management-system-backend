const Invite = require('../models/invite.model');
const Event = require('../models/event.model');
const { sendEmail } = require('../utils/emailSender');
const { sendSMS } = require('../utils/smsSender');

const createInvite = async (eventId, attendeeEmail, attendeePhone) => {
  const invite = new Invite({ event: eventId, attendeeEmail, attendeePhone });
  await invite.save();
  return invite;
};

const sendInvitation = async (eventId, attendeeEmail, attendeePhone) => {
  const event = await Event.findById(eventId);
  if (!event) throw new Error('Event not found');

  const invite = await createInvite(eventId, attendeeEmail, attendeePhone);

  // Send email invitation
  if (attendeeEmail) {
    const emailSubject = `You're Invited to ${event.name}`;
    const emailBody = `You have been invited to ${event.name}. Click here to respond: <link>`;
    await sendEmail(attendeeEmail, emailSubject, emailBody);
  }

  // Send SMS invitation
  if (attendeePhone) {
    const smsBody = `You have been invited to ${event.name}. Click here to respond: <link>`;
    await sendSMS(attendeePhone, smsBody);
  }

  return invite;
};

const respondToInvitation = async (inviteId, status, transportationMode, location) => {
  const invite = await Invite.findByIdAndUpdate(
    inviteId,
    { status, transportationMode, location },
    { new: true }
  );
  if (!invite) throw new Error('Invitation not found');
  return invite;
};

const getInvitationsForEvent = async (eventId) => {
  const invites = await Invite.find({ event: eventId });
  return invites;
};

module.exports = {
  createInvite,
  sendInvitation,
  respondToInvitation,
  getInvitationsForEvent,
};