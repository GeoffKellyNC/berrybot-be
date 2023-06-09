require('dotenv').config();
const axios = require('axios');
const { mongo } = require('../../db/mongo_config');
const consoleLoging = require('../../helpers/consoleLoging')

//* GLOBAL VARIABLES*/

const db = mongo.db(process.env.MONGO_DB_NAME);

//* Getting Bot Config from MongoDB */
exports.getBotConfig = async () => {
    try{
        const collection = db.collection('twitch_bot_config');


        // check to see if bot config exists
         const botConfig = await collection.findOne({user: 'bot'});

     
         if(!botConfig) {
             const botConfig = {
                 user: 'bot',
                 twitch_client_id: process.env.TWITCH_CLIENT_ID,
                 twitch_client_secret: process.env.TWITCH_CLIENT_SECRET,
                 twitch_refresh_token: process.env.TWITCH_REFRESH_TOKEN,
                 twitch_access_token: process.env.TWITCH_ACCESS_TOKEN,
                 expires_in: 1,
                 scope: [],
             }
     
             await collection.insertOne(botConfig)
             return botConfig
         }
     
         return botConfig
    } catch(error){
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'models/Bot.js (getBotConfig)',
            info: 'Failed Getting Bot Config.' + error.message
        })
    }
};


//* Update Bot Config After Refresh
//* Accepts an Object {}
exports.updateBotConfig = async (newConfigData) => {
    try{
        const collection = db.collection('twitch_bot_config')

        await collection.findOneAndUpdate(
            {user: 'bot'},
            {$set: newConfigData},
            {returnOriginal: false}
        )
    
        return
    } catch(error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'models/Bot.js (updateBotConfig)',
            info: 'Failed to update Bot Config! ' + error
        })
    }
}

