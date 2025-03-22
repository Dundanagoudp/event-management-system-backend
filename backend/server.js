const http = require('http');
const app = require('./app');
const { initializeSocket } = require('./src/sockets/liveLocation');
const port = process.env.PORT || 7000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
});

