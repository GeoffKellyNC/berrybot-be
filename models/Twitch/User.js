require('dotenv').config();
const axios = require('axios');
const { mongo } = require('../../db/mongo_config');
const consoleLoging = require('../../helpers/consoleLoging')
const constructTwitchAccessUrl = require('../../helpers/constructAccessUrl')
const { v4: uuid } = require('uuid');

const db = mongo.db(process.env.MONGO_DB_NAME);



//* Setting User to Database. 
exports.setUserToDb = async (userData) => {
    try {
        const collection = db.collection('app_users')

        // Use user.email to check if user exists

        const userObject = await collection.findOne({ email: userData.email })

        const defaultUserObj = {
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
            applicatoin_type: 'Twitch',
            stripe_id: null,
            metaData: {}
        }


        if (userObject) {
            const updatedUserObj = { ...defaultUserObj, ...userObject }
            await collection.updateOne({ unx_id: userObject.unx_id }, { $set: updatedUserObj })
            return { user: updatedUserObj, isNew: false }
        }

        
        await collection.insertOne(defaultUserObj)

        return {user: defaultUserObj, isNew: true}
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error setting user to DB ' + error
        })
    }
}




