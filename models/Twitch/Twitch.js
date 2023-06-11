const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const constructTwitchAccessUrl = require('../../helpers/constructAccessUrl')

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
        console.log('⛔️ RUNNING TWITCH AD ⛔️') //!DEBUG
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

            console.log('⛔️ AD RES: RES: ', res) //!DEBUG

          return res.data
        
    } catch (error) {
        console.log('⛔️ ERROR RUNNING AD: ', error.response.data) //!DEBUG
        return error.resonse.data
    }
}

