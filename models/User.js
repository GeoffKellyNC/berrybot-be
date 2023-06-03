require('dotenv').config();
const axios = require('axios');
const { mongo } = require('../db/mongo_config');
const consoleLoging = require('../helpers/consoleLoging')
const constructTwitchAccessUrl = require('../helpers/constructAccessUrl')
const { v4: uuid } = require('uuid');

const db = mongo.db(process.env.MONGO_DB_NAME);

//* Getting User Twitch Access Token
exports.getUserTwitchAccessToken = async (code) => {
    try {
        const twitchAccessUrl = constructTwitchAccessUrl(code)
        const twitchRes = await axios.post(twitchAccessUrl)

        const { access_token, expires_in, refresh_token, scope } = twitchRes.data;

        return { access_token, expires_in, refresh_token, scope}

    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'models/User (getUserTwitchAccessToken())',
            info: 'Error Getting Twitch Access Token ' + error
        })
    }
}

//* Setting User to Database. 
exports.setUserToDb = async (userData) => {
    try {
        const collection = db.collection('app_users')

        // Use user.email to check if user exists

        const user_exists = collection.findOne({ email: userData.email })

        if (user_exists) {
            return {user: user_exists, isNew: false}
        }

        const newUser = {
            unx_id: uuid(),
            email: userData.email,
            twitch_id: userData.twitch_id,
            twitch_login: userData.twitch_login,
            twitch_display_name: userData.twitch_display_name,
            twitch_image: userData.twitch_image,
            twitch_view_count: userData.twitch_view_count,
            twitch_streamer_status: userData.twitch_streamer_status,
            twitch_created_date: userData.twitch_created_date,
            twitch_description: userData.twitch_description,
            access_token: userData.access_token,
            refresh_token: userData.refresh_token,
            client_id: userData.client_id,
            client_secret: userData.client_secret,
            created_at: new Date(),
            user_paid: false,
        }

        await collection.insertOne(newUser)

        return {user: newUser, isNew: true}
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'models/User (getUserTwitchAccessToken())',
            info: 'Error Getting Twitch Access Token ' + error
        })
    }
}

exports.checkIsPaid()



