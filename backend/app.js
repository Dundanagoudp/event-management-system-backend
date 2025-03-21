const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const connectDB = require("./src/config/db");
const app = express();
const cors = require("cors");
const usersRoutes = require("./src/routes/user.routes");
const eventRoutes = require("./src/routes/event.routes");
const inviteRoutes = require("./src/routes/invite.routes");
connectDB();

// middlewares
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

// routes
app.use("/users", usersRoutes);
app.use("/events", eventRoutes);
app.use("/invites", inviteRoutes);

//  routes
app.get("/", (req, res) => {
      res.send("serever is running");
});

module.exports = app;