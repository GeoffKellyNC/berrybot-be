const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const constructTwitchAccessUrl = require('../../helpers/constructAccessUrl')
const { StaticAuthProvider } = require("@twurple/auth");
const { ApiClient } = require("@twurple/api");
const { mongo } = require('../../db/mongo_config')


const db = mongo.db(process.env.MONGO_DB_NAME);

//* Getting User Twitch Access Token
exports.getUserTwitchAccessToken = async (code) => {
    try {
        const twitchAccessUrl = constructTwitchAccessUrl(code)
        const twitchRes = await axios.post(twitchAccessUrl)


        const  { access_token, expires_in, refresh_token, scope } = twitchRes.data;

        return { 
            accessToken: access_token, 
            expiresIn: expires_in, 
            refreshToken: refresh_token, 
            scope 
        } 

    } catch (error) {
        consoleLoging({
            id: "⛔️ ERROR ⛔️",
            user: 'Server',
            script: 'models/Twitch (getUserTwitchAccessToken())',
            info: 'Error Getting Twitch Access Token ' + error
        })
    }
}


exports.getUserTwitchData = async (accessToken) => {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
          };


        const res = await axios.get("https://api.twitch.tv/helix/users", {
            headers,
        });


        const twitchData = res.data.data[0]
        return twitchData
          
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (getUserTwitchData)',
            info: 'There was a user getting data from Twitch API ' + error
        })
        return error
    }
}


exports.getUserTwitchStreamData = async ( accessToken, twitchId ) => {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        }

        const twitchRes = await axios.get(`https://api.twitch.tv/helix/streams?user_id=${twitchId}`, { headers: headers})

        return twitchRes.data
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (getUserTwitchStreamData)',
            info: 'There was a user getting data from Twitch API ' + error
        })
        return error
    }
}

exports.runTwitchAd = async (accessToken, twitchId, duration) => {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        }

        const body = {
            broadcaster_id: twitchId,
            length: parseInt(duration),
          };

          const res = await axios.post(
            "https://api.twitch.tv/helix/channels/commercial",
            body,
            { headers }
          );

          return res.data
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (runTwitchAd)',
            info: 'There was an ERROR getting data from Twitch API ' + error.response.data
        })
        return error.response.data
    }
}

exports.startTwitchPoll = async (accessToken, twitchId, pollOptions, pollTitle, duration) => {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
        }

        let formattedPollOptions = []

        pollOptions.forEach(option => {
            formattedPollOptions.push({title: option})
        })


        const body = {
            broadcaster_id: twitchId,
            title: pollTitle,
            choices: formattedPollOptions,
            duration: parseInt(duration)
        }

        console.log('⛔️ STARTING POLL BODY ⛔️', body) //!DEBUG
        const res = await axios.post('https://api.twitch.tv/helix/polls', body, { headers })

        console.log('⛔️ STARTING POLL RES ⛔️', res.data) //!DEBUG

    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (StartTwitchPoll)',
            info: 'There was an ERROR getting data from Twitch API ' + error.response.data
        })
        console.log('⛔️ POLL ERROR: ', error.response.data) //!DEBUG
        return error.response.data
    }
}


exports.processCustomCommand = async (channel,  message, chatClient) => {


    const collection = db.collection('user_custom_commands')
      
    const query = { twitch_name: channel.slice(1) }
  
    const commands = await collection.find(query).toArray()


    for (let key in commands){

        if(message === commands[key].prompt){
            await chatClient.say(channel, commands[key].action)
            return
        }
    }

    return
    
}

exports.banUserApi = async (clientId, accessToken, twitch_id, banId, reason) => {
    try {
         await axios.post(
             `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${twitch_id}&moderator_id=${twitch_id}`, 
             {
             data: 
             { 
                 user_id: banId, 
                 reason: reason
             }
             },
         
             { 
             headers: 
                 { 
                 Authorization: `Bearer ${accessToken}`, 
                 "Client-Id": `${process.env.TWITCH_CLIENT_ID}`
                 }
             });
         console.log('BANNED USER SUCCESS: ', banId) //!REMOVE

         return true
 
    } catch (error) {
         consoleLoging({
                id: null,
                user: 'Server',
                script: '/models/Twitch.sj (banUserApi)',
                info: 'There was an ERROR getting data from Twitch API ' + error.response.data
         })
         return false
    }
   }

exports.timeoutUserApi = async (clientId, accessToken, twitch_id, userId, reason, time) => {
    try {
        await axios.post(
            `https://api.twitch.tv/helix/moderation/bans?broadcaster_id=${twitch_id}&moderator_id=${twitch_id}`, 
            {
            data: 
            { 
                user_id: userId, 
                duration: time,
                reason: reason
            }
            },
        
            { 
            headers: 
                { 
                Authorization: `Bearer ${accessToken}`, 
                "Client-Id": `${clientId}`
                }
            });


        return true

   } catch (error) {
       consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (timeoutUserApi)',
            info: 'There was an ERROR getting data from Twitch API ' + error.response.data
       })
       return false
   }
}


exports.getUserIdByName =  async (userName, clientId, accessToken) => {
    try {
      const headers = {
        Authorization: `Bearer ${accessToken}`,
        "Client-ID": clientId,
        "Content-Type": "application/json"
      }
      const res = await axios.get(`https://api.twitch.tv/helix/users?login=${userName}`, { headers })

      console.log('⛔️ GET USER ID RES ⛔️', res.data.data) //!DEBUG

      return res.data.data[0]

    } catch (error) {
        console.log('⛔️ GET USER ID ERROR: ', error.response.data) //!DEBUG
      consoleLoging({
        id: null,
        user: 'Server',
        script: '/models/Twitch.js (getUserIdByName)',
        info: 'There was an ERROR getting data from Twitch API ' + error.response.data
      })
        return error.response.data
      
    }
  }

  exports.createClip = async (accessToken, twitchId) => {
    try {
        const clientId = process.env.TWITCH_CLIENT_ID
        const authProvider = new StaticAuthProvider(clientId, accessToken)
        const api = new ApiClient({ authProvider })
        const clip = await api.clips.createClip({ channelId: twitchId });
  
        return clip
  
      } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (createClip)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })
        return error
        
      }
}

exports.getTwitchChatSettings = async (twitch_id, accessToken) => {
    try {
        const modId = 794561481;
  
        const headers = {
          Authorization: `Bearer ${accessToken}`,
          "Client-ID": process.env.TWITCH_CLIENT_ID,
        };
        const res = await axios.get(
          `https://api.twitch.tv/helix/chat/settings?broadcaster_id=${twitch_id}&moderator_id=${modId}`,
          { headers }
        );
  
        return res.data;
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (getTwitchChatSettings)',
            info: 'There was an ERROR getting data from Twitch API ' + error 
        })
    }
}

exports.updateTwitchChatSettings = async (twitch_id, accessToken, setting, value) => {
    try {

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Content-Type": "application/json"
        };

        const body = {
            [setting]: value
        }

        const res = await axios.patch(`https://api.twitch.tv/helix/chat/settings?broadcaster_id=${twitch_id}&moderator_id=${twitch_id}`, body, { headers })


        return res.data
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (updateTwitchSettings)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false
    }
}
  


