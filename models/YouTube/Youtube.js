require("dotenv").config()
const { mongo } = require('../../db/mongo_config')
const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const { google } = require('googleapis');
const { oauth2 } = require("googleapis/build/src/apis/oauth2");


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
    const oauth2Client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET,
      process.env.LOCAL_MODE ? process.env.YT_LOCAL_REDIRECT_URI : null
    );

    oauth2Client.setCredentials({
      access_token: accessToken,
    });

    const youtube = google.youtube({version: 'v3', auth: oauth2Client});
    const res = youtube.channels.list({
      part: 'snippet,contentDetails,statistics',
      mine: true,
    });


    return res;

  } catch(error){
    consoleLoging({
      id: null,
      name: 'Server',
      script: 'models/YouTube/Youtube.js (getYouTubeData)',
      info: error
    })

    return false
  }

}

exports.getLiveChatId = async (accessToken) => {
  try {

    const oauth2Client = new google.auth.OAuth2(
      process.env.YT_CLIENT_ID,
      process.env.YT_CLIENT_SECRET,
      process.env.LOCAL_MODE ?  process.env.LOCAL_MODE : null
    )

    oauth2Client.setCredentials({
      access_token: accessToken
    })

    const youtube = google.youtube({version: 'v3', auth: oauth2Client})

    const res = await youtube.liveBroadcasts.list({
      part: 'snippet, status, contentDetails',
      mine: true,
      broadcastType: 'all'

    })
    
    const liveStream = res.data.items.find(stream => stream.status.lifeCycleStatus === 'live');

    if (!liveStream) {
      return false;
    }
  

    return liveStream

    
  } catch (error) {
    consoleLoging({
      id: 'ERROR',
      user: 'Server',
      script: 'models/YouTube/YouTube.js',
      info: error
    })

    return false
  }
}

exports.getLiveChatMessages = async (accessToken, liveChatId) => {
  try {

      const oauth2Client = new google.auth.OAuth2(
        process.env.YT_CLIENT_ID,
        process.env.YT_CLIENT_SECRET,
        process.env.LOCAL_MODE ?  process.env.LOCAL_MODE : null
      )

      oauth2Client.setCredentials({
        access_token: accessToken
      })

      const youtube = google.youtube({version: 'v3', auth: oauth2Client})

      const res =  await youtube.liveChatMessages.list({
        liveChatId: liveChatId,
        part: 'snippet, authorDetails',
      })


      return res.data

  } catch (error) {
    consoleLoging({
      id: 'ERROR',
      user: 'Server',
      script: 'models/YouTube/YouTube.js (getLiveChatMessages())',
      info: error
    })

    return false
  }
}


