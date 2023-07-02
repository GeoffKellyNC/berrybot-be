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
  
  const people = google.people({version: 'v1', auth: oauth2Client});
  const res = await people.people.get({
    resourceName: 'people/me',
    personFields: 'names,emailAddresses',
  });
  
  return res.data;
}

exports.getYouTubeData = async (accessToken) => {
  try{
    const youtube = google.youtube({
      version: 'v3',
      auth: accessToken
    });
    
    youtube.channels.list({
      part: 'snippet',
      mine: true
    }, (err, res) => {
      if (err) {
        console.error(err);
        return;
      }
      console.log('🔐 YOUTUBE DATA: ', res.data) //!ERMOVE
      return res.data
    });
  } catch(error){
    consoleLoging({
      id: null,
      name: 'Server',
      script: 'models/YouTube/Youtube.js (getYouTubeData)',
      info: error
    })

    console.log('🔐 YOUTUBE DATA: ', error) //!REMOVE
    return false
  }

}
