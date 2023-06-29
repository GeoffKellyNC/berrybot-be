require("dotenv").config()
const { mongo } = require('../../db/mongo_config')
const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const { google } = require('googleapis');


exports.getGoogleUserData = async (accessToken) => {
    const oauth2Client = new google.auth.OAuth2(
        process.env.YT_CLIENT_ID,
        process.env.YT_CLIENT_SECRET,
        process.env.LOCAL_MODE ? process.env.YT_LOCAL_REDIRECT_URI : null
      );
      
      oauth2Client.setCredentials({
        access_token: accessToken,
      });
      
      const plus = google.plus({version: 'v1', auth: oauth2Client});
      plus.people.get({userId: 'me'}, (err, res) => {
        if (err) {
          console.error(err);
          return;
        }
        console.log(res.data);
        return res.data
      });
}