require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const http = require("http");
const excludeWebhookJsonMiddleware = require('./middleware/exludeWebhook') //! ADDED
const { connect } = require("./db/mongo_config");
const { initBerry } = require('./twitch_config/berry')


//* Middleware Functions */
app.use(cors());
app.use(excludeWebhookJsonMiddleware);

//* Routes */



//* Server */s

// Global Variables
const server = http.createServer(app);




// Connecting to MongoDB
connect();

// Initialize Berry Bot
initBerry()


module.exports = server;