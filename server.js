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
const authRoutes = require('./routes/authRoutes')
const cookieParser = require('cookie-parser')
const requestLogger = require('./middleware/requestLogger')
const json = require('express').json


//* Middleware Functions */
server.use(cors({
    origin: 'http://localhost:3000',
    credentials: true
}));

server.use(cookieParser())
server.use(authMiddleware)
server.use(json())
server.use(criticalError);
// server.use(requestLogger);

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