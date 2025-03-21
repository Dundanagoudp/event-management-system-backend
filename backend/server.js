const http = require('http');
const app = require('./app');
const port = process.env.PORT || 7000;

const server = http.createServer(app);

// initializeSocket(server);

server.listen(port, () => {
      console.log(`Server listening on port ${port}`);
});

