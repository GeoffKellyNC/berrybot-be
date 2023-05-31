require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const os = require("os");
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
const DEBUG = process.env.DEBUG_MODE;
const server = http.createServer(app);
const port = process.env.PORT || 9001;



// Get local IP address

const interfaces = os.networkInterfaces();
const addresses = [];
for (const key in interfaces) {
  for (const address of interfaces[key]) {
    if (address.family === "IPv4" && !address.internal) {
      addresses.push(address.address);
    }
  }
}


// Connecting to MongoDB
connect();

// Initialize Berry Bot
initBerry()

// Starting Server
server.listen(port, () => {
  DEBUG ? console.log("DEBUGGING IS ON!!!") : null;
  console.log(`Server is running on port ${port}....`);
  console.log(`Server is also running on EXTERNAL ${addresses[0]}:${port}`);
});
