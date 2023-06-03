require('dotenv').config()


const constructTwitchAccessUrl = ( code ) => {
    const LOCAL_MODE = process.env.LOCAL_MODE
    const REDIRECT_URI = process.env.TWITCH_REDIRECT_URI;
    const REDIRECT_URI_LOCAL = process.env.TWITCH_REDIRECT_URI_LOCAL;
    const clientId = process.env.TWITCH_CLIENT_ID;
    const clientSecret = process.env.TWITCH_CLIENT_SECRET;

    const url_string = `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&code=${code}&grant_type=authorization_code&redirect_uri=${LOCAL_MODE ? REDIRECT_URI_LOCAL: REDIRECT_URI }`

    return url_string

}

module.exports = constructTwitchAccessUrl