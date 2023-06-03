const axios = require('axios')
const { mongo } = require('../db/mongo_config');
const consoleLoging = require('../helpers/consoleLoging')
const { ai_base_config } = require('../ai/ai-configs')

const db = mongo.db(process.env.MONGO_DB_NAME);

exports.getUserAiConfig = async (unx_id) => {
    try {
        const collection = db.collection('user_ai_config')

        const exists = await collection.findOne({ unx_id })

        if (!exists) {
            const newConfig = {
                unx_id: unx_id,
                ...ai_base_config
            }
            await collection.insertOne(newConfig)
            
            return newConfig
        }

        const config = await collection.findOne({ unx_id })

        return config

    } catch (error) {
        consoleLoging({
            id: null,
            user: "Server",
            script: '/models/AI.js (getUserAiConfig)',
            info: 'There was a user getting data from Twitch API ' + error
        })
    }
}