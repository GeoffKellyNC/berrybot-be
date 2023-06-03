require("dotenv").config();
const express = require("express");
const server = express();
const cors = require("cors");
// const excludeWebhookJsonMiddleware = require('./middleware/exludeWebhook') //! ADDED
const { connectMongoDB } = require("./db/mongo_config");
const { initBerry } = require('./twitch_config/berry')
const authMiddleware = require('./middleware/authMiddleware')
const criticalError = require('./middleware/criticalError')
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')


//* Middleware Functions */
server.use(cors({
    origin: '*',
    credentials: true
}));

server.use(authMiddleware)
server.use(cookieParser())
server.use(criticalError);

const excludeWebhookJsonMiddleware = (req, res, next) => {
    if (req.path.includes("webhook")) {
      next();
    } else {
      express.json()(req, res, next);
    }
  };

server.use(excludeWebhookJsonMiddleware);

//* Routes */
server.use('/auth', authRoutes)


//* Server */s
// Global Variables

// Connecting to MongoDB
connectMongoDB();
// Initialize Berry Bot
initBerry()


module.exports = server;