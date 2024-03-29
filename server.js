require("dotenv").config();
const express = require("express");
const server = express();
const cors = require("cors");
// const excludeWebhookJsonMiddleware = require('./middleware/exludeWebhook') //! ADDED
const { connectMongoDB } = require("./db/mongo_config");
const { initBerry } = require('./twitch_config/berry')


//* Middleware */
const authMiddleware = require('./middleware/authMiddleware')
const criticalError = require('./middleware/criticalError')
const cookieParser = require('cookie-parser')
const requestLogger = require('./middleware/requestLogger')
const json = require('express').json


//* Middleware Functions */

server.use(cors({
    origin: '*',
    credentials: true
}));

const excludeWebhookJsonMiddleware = (req, res, next) => {
    if (req.path.includes("webhook")) {
      next();
    } else {
      express.json()(req, res, next);
    }
  };


server.use(cookieParser())
server.use(authMiddleware)
server.use(excludeWebhookJsonMiddleware);
server.use(criticalError);
// server.use(requestLogger);


//* General Routes */
server.use('/music', require('./routes/General/musicRoutes'))
server.use('/general', require('./routes/General/generalRoutes'))

//* Twitch Routes */
server.use('/auth', require('./routes/Twitch/authRoutes'))
server.use('/twitch', require('./routes/Twitch/twitchRoutes'))

//* YouTube Routes */
server.use('/youtube/auth', require('./routes/YouTube/authRouteYT'))

//* Payment Routes */
server.use('/payments', require('./routes/stripeRoutes'))

//* AI Routes */
server.use('/ai', require('./routes/Twitch/aiRoutes'))


//* Server */s
// Global Variables

// Connecting to MongoDB
connectMongoDB();
// Initialize Berry Bot
initBerry()


module.exports = server;