const axios = require('axios')
const { mongo } = require('../../db/mongo_config');
const consoleLoging = require('../../helpers/consoleLoging')
const { ai_base_config } = require('../../ai/ai-configs')

const db = mongo.db(process.env.MONGO_DB_NAME);

exports.getUserAiConfig = async (unx_id) => {
    try {
        console.log('⛔️ GETTING AI CONFIG');
        const collection = db.collection('user_ai_config');
        const exists = await collection.findOne({ unx_id });

        if (!exists) {
            const newConfig = {
                unx_id: unx_id,
                ...ai_base_config
            };
            await collection.insertOne(newConfig);
            
            return newConfig;
        }

        const updateNestedKeys = (baseConfig, userConfig) => {
            const baseKeys = Object.keys(baseConfig);
            const userKeys = Object.keys(userConfig);
            const missingKeys = baseKeys.filter(key => !userKeys.includes(key));
            
            for(let key of missingKeys) {
                console.log('⛔️ ADDING key: ', key); //!DEBUG
                userConfig[key] = baseConfig[key];
            }
        };

        // Handle top level keys
        updateNestedKeys(ai_base_config, exists);

        // Handle nested keys under "thresholds"
        if (exists.thresholds) {
            updateNestedKeys(ai_base_config.thresholds, exists.thresholds);
        }

        // Handle nested keys under "punishments"
        if (exists.punishments) {
            updateNestedKeys(ai_base_config.punishments, exists.punishments);
        }

        await collection.updateOne({ unx_id }, { $set: exists });
        console.log('✅ newConfig: ', exists); //!DEBUG
        return exists;
    } catch (error) {
        consoleLoging({
            id: null,
            user: "Server",
            script: '/models/AI.js (getUserAiConfig)',
            info: 'There was an error getting data from the database: ' + error
        });
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