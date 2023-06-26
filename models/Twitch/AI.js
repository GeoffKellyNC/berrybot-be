const axios = require('axios')
const { mongo } = require('../../db/mongo_config');
const consoleLoging = require('../../helpers/consoleLoging')
const { ai_base_config } = require('../../ai/ai-configs')

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

        const baseConfigKeys = Object.keys(ai_base_config)
        const userConfigKeys = Object.keys(exists)

        const missingKeys = baseConfigKeys.filter(key => !userConfigKeys.includes(key))

        if (missingKeys.length > 0) {
            const newConfig = {
                ...exists
            }

            for(let key of missingKeys) {
                newConfig[key] = ai_base_config[key];
            }

            await collection.updateOne({ unx_id }, { $set: newConfig })
            return newConfig
        }

        return exists

    } catch (error) {
        consoleLoging({
            id: null,
            user: "Server",
            script: '/models/AI.js (getUserAiConfig)',
            info: 'There was an error getting data from the database: ' + error
        })
    }
}


exports.updateUserAiConfig = async (unx_id, config) => {
    try {
        const collection = db.collection('user_ai_config')

        delete config._id

        const query = { unx_id: unx_id }

        const updatedConfig = await collection.updateOne(query, { $set: config })

        return updatedConfig

    } catch (error) {
        consoleLoging({
            id: null,
            user: "Server",
            script: '/models/AI.js (updatedUserAiConfig)',
            info: 'There was a user getting data from Twitch API ' + error
        })
        return false
    }
}