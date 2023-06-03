const axios = require('axios')
const consoleLoging = require('../helpers/consoleLoging')


exports.getUserTwitchData = async (accessToken) => {
    try {
        const headers = {
            Authorization: `Bearer ${accessToken}`,
            "Client-ID": process.env.TWITCH_CLIENT_ID,
          };

          const res = await axios.get("https://api.twitch.tv/helix/users", {
            headers,
          });

          return res.data.data[0]
          
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: '/models/Twitch.sj (getUserTwitchData)',
            info: 'There was a user getting data from Twitch API ' + error
        })
    }
}