const socketIo = require('socket.io');
const Invite = require('../models/invite.model');

let io;

function initializeSocket(server) {
  io = socketIo(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Join event
    socket.on('join', async (data) => {
      const { inviteId } = data;
      await Invite.findByIdAndUpdate(inviteId, { socketId: socket.id });
    });

    // Update live location
    socket.on('update-location', async (data) => {
      const { inviteId, coordinates } = data;
      await Invite.findByIdAndUpdate(inviteId, {
        location: {
          type: 'Point',
          coordinates,
        },
        isSharingLocation: true,
      });

      // Broadcast the updated location to all users
      io.emit('location-updated', { inviteId, coordinates });
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`Client disconnected: ${socket.id}`);
    });
  });
}

module.exports = { initializeSocket };