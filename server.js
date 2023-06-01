require("dotenv").config();
const express = require("express");
const server = express();
const cors = require("cors");
const excludeWebhookJsonMiddleware = require('./middleware/exludeWebhook') //! ADDED
const { connectMongoDB } = require("./db/mongo_config");
const { initBerry } = require('./twitch_config/berry')
const authMiddleware = require('./middleware/authMiddleware')
const criticalError = require('./middleware/criticalError')


//* Middleware Functions */
server.use(cors());
server.use(criticalError);
server.use(excludeWebhookJsonMiddleware);
server.use(authMiddleware)

//* Routes */



//* Server */s
// Global Variables

// Connecting to MongoDB
connectMongoDB();
// Initialize Berry Bot
initBerry()


module.exports = server;