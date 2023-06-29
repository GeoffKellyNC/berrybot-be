const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const constructTwitchAccessUrl = require('../../helpers/constructAccessUrl')
const AuthModel = require('../../models/Twitch/Auth')
const UserModel = require('../Twitch/User')
const { StaticAuthProvider } = require("@twurple/auth");
const { ApiClient } = require("@twurple/api");
const { mongo } = require('../../db/mongo_config')
const { v4: uuid } = require('uuid');



const db = mongo.db(process.env.MONGO_DB_NAME);

//* Getting User Twitch Access Token
exports.getUserTwitchAccessToken = async (code) => {
    try {

        console.log('⛔️ GETTING USER TWITCH ACCESS TOKEN ⛔️') //! DEBUG
        const twitchAccessUrl = constructTwitchAccessUrl(code)
        const twitchRes = await axios.post(twitchAccessUrl)


        const  { access_token, expires_in, refresh_token, scope } = twitchRes.data;

        console.log('⛔️ GOT ACCESS TOKEN ⛔️') //! DEBUG
        console.log('⛔️ GETTING USER TWITCH DATA ⛔️', access_token) //! DEBUG
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


exports.processCustomCommand = async (channel,  message, chatClient, twitch_id) => {



   const commands = await UserModel.getUserCustomCommands(twitch_id)



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
        const moderationId = await AuthModel.verifyTwitchAccessToken(accessToken, twitch_id) 

        console.log('⛔️ TIMEOUT USER API: ', userId, reason, time)
       const timeoutRes =  await axios.post(
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
            info: error.response.data
       })
       console.log('⛔️ TIMEOUT USER ERROR: ', error.response.data) //!REMOVE
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
       
        console.log('⛔️ CLIP: ',clip) //! DEBUG

        const clipData = await api.clips.getClipById(clip)
  
        return clipData
  
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

exports.getScheduledCommands = async (unx_id) => {
    try {

        const collection = db.collection('user_scheduled_messages')
        const query = ({user_id: unx_id})
        const tasks = await collection.find(query).toArray()

        return tasks
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (getScheduledCommands)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false
    }
}

exports.setSchduledCommand = async (commandObj) => {
    try{
        const collection = db.collection('user_scheduled_messages')

        const newCommand = {
            sid: uuid(),
            user_id: commandObj.unx_id,
            scheduleName: commandObj.scheduleName,
            scheduleMessage: commandObj.scheduleMessage,
            timer: commandObj.timer,
            active: commandObj.active
        }

        const result = await collection.insertOne(newCommand)

        return result

    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (setSchduledCommand)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false
    }
}

exports.deleteScheduledCommand = async (sid) => {
    try {
        const collection = db.collection('user_scheduled_messages')

        await collection.deleteOne({sid: sid})

        return true
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: '/models/Twitch.sj (deleteScheduledCommand)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false
    }
}

exports.updateScheduledCommand = async (sid, updateObj) => {
    try {

        const collection = db.collection('user_scheduled_messages')

        const result = await collection.updateOne({sid: sid}, {$set: updateObj})

        return result
        
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: '/models/Twitch.sj (updateScheduledCommand)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false
    }
}

exports.getTwitchMods = async (twitch_id, accessToken) => {
    try {

        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Content-Type": "application/json"
        };

        const res = await axios.get(`https://api.twitch.tv/helix/moderation/moderators?broadcaster_id=${twitch_id}`, { headers })

        return res.data.data
        
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: '/models/Twitch.sj (getTwitchMods)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false
    }
}

exports.getTwitchChatters = async (twitch_id, accessToken) => {
    try {
        const headers = {
            "Client-ID": process.env.TWITCH_CLIENT_ID,
            "Authorization": `Bearer ${accessToken}`,
            "Content-Type": "application/json"
        };

        
        const res = await axios.get(`https://api.twitch.tv/helix/chat/chatters?broadcaster_id=${twitch_id}&moderator_id=${twitch_id}&first=1000`, { headers })

        return res.data

    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: '/models/Twitch.sj (getTwitchChatters)',
            info: 'There was an ERROR getting data from Twitch API ' + error
        })

        return false

    }
}
  


