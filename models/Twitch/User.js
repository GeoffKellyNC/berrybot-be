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

exports.setStripeCustomerId = async (customerId, unx_id) => {
    try {
        const collection = db.collection('app_users')

        await collection.updateOne({ unx_id }, { $set: { stripe_id: customerId } })

        return true
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error setting stripe customer id to DB ' + error
        })

        return false
    }
}

exports.updatePaidStatus = async (customerId, action) => {
    try {
        console.log('⛔️ UPDATING PAID STATUS ⛔️')

        const collection = db.collection('app_users')

        switch (action) {
            case 'paid':
                await collection.updateOne({ stripe_id: customerId }, { $set: { user_paid: true } })
                return true
            case 'unpaid':
                await collection.updateOne({ stripe_id: customerId }, { $set: { user_paid: false } })
                return true
            default:
                return false
        }
                
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error updating paid status to DB ' + error
        })

        return false
    }
}

//* MessageObj: {twitch_name, chatter_name, message, flagged, reason, confidence_fixed, confidence_raw, ai_scores}

exports.logChatMessage = async (messageObj) => {
    try {
        const {
            twitch_name, 
            chatter_name, 
            message, 
            flagged, 
            reason, 
            confidence_fixed, 
            confidence_raw,
            ai_scores } = messageObj

        const collection = db.collection('chat_logs')

        let date= new Date()

        let timestamp = date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + '-' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2);

        const newLog = {
            twitch_name: twitch_name,
            chatter_name: chatter_name,
            message: message,
            timestamp: timestamp,
            flagged: flagged ? true : false,
            reason: reason ? reason : false,
            confidence_fixed: confidence_fixed ? confidence_fixed : false,
            confidence_raw: confidence_raw ? confidence_raw : false,
            ai_scores: ai_scores ? ai_scores : false
        }


        await collection.insertOne(newLog)
        return
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error logging chat message to DB ' + error
        })
    }
}

exports.getUserItem = async (channel, item) => {
    try {
        const collection = db.collection('app_users')

        let userName;

        if (channel.startsWith('#')) {
            userName = channel.slice(1);
        } else {
            userName = channel;
        }

        const user = await collection.findOne({ twitch_login: userName })

        if (user) {
            return user[item]
        }

        return false
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error getting user ux id from DB ' + error
        })
        return false
    }
}

exports.addModerationPoints = async (streamerId, offender, newPoints) => {
    const collection = db.collection('moderation_points')

    const user = await collection.findOne({streamerId: streamerId, offender: offender})

    const date= new Date()

    let timestamp = date.getFullYear() + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getDate()).slice(-2) + '-' +
    ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2);

    if(user){
        console.log('User Points Found!: ', user)
        const updatedPoints = user.points + newPoints
        const updatedUser = {
            streamerId: streamerId,
            offender: offender,
            points: updatedPoints,
            lastUpdated: timestamp
        }
        const query = {streamerId: streamerId, offender: offender}
        await collection.updateOne(query, {$set: updatedUser})
        
        return
    }

    const userObj = {
        streamerId: streamerId,
        offender: offender,
        points: newPoints,
        lastUpdated: timestamp
    }
    console.log(`Added ${offender} to database.`)
    await collection.insertOne(userObj)
    return
  }


  exports.getUserChatLogs = async (channel) => {
    try {
        const collection = db.collection('chat_logs')

        const chatLogs = await collection.find({twitch_name: channel}).toArray()
    
        return chatLogs
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error getting user chat logs from DB ' + error
        })   
        return false
    }
  }

exports.setCustomUserCommand = async (commandObj, twitch_id) => {
    try {
        const collection =  db.collection('user_custom_commands')

        const newCommand = {
            cid: uuid(),
            twitch_id: twitch_id,
            name: commandObj.name,
            prompt: commandObj.prompt,
            action: commandObj.action
        }
    
        await collection.insertOne(newCommand)
    
        return newCommand

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error setting user custom command to DB ' + error
        })
        return false
    }
}

  exports.getUserCustomCommands = async (twitchId) => {
    try {
        const collection = db.collection('custom_commands')

        const commands = await collection.find({twitch_id: twitchId}).toArray()

        return commands
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error getting user custom commands from DB ' + error
        })

        return false
    }
  }





