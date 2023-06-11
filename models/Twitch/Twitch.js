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

        const twitchRes = axios.get(`https://api.twitch.tv/helix/streams?user_id=${twitchId}`, { headers: headers})

        console.log('STREAM RES', twitchRes) //!DEBUG

        return twitchRes
        
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