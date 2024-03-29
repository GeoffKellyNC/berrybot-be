require('dotenv').config();
const axios = require('axios');
const { mongo } = require('../../db/mongo_config');
const consoleLoging = require('../../helpers/consoleLoging')
const constructTwitchAccessUrl = require('../../helpers/constructAccessUrl')
const { v4: uuid } = require('uuid');

const db = mongo.db(process.env.MONGO_DB_NAME);

exports.updateUserAccessInfo = async (access_token, refresh_token, unx_id) => {
    try {
        const collection = db.collection('app_users')

        collection.updateOne({ unx_id }, { $set: { access_token, refresh_token } })

        return true
        
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error updating user access info to DB ' + error,
        })
        return false
    }
  }

//* Setting User to Database. 
exports.setUserToDb = async (userData) => {
    try {
      const collection = db.collection('app_users');
  
      const userObject = await collection.findOne({ email: userData.email });
  
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
        account_type: 'user',
        stripe_session: '',
        metaData: {},
      };
  
        if (userObject) {
               await exports.updateUserAccessInfo(userData.access_token, userData.refresh_token, userObject.unx_id)
                const updatedUser = await collection.findOne({ email: userData.email });
                return { user: updatedUser, isNew: false };
        }

        await collection.insertOne(defaultUserObj);
  
        return { user: defaultUserObj, isNew: true };
    } catch (error) {
      consoleLoging({
        id: 'ERROR',
        user: 'Server',
        script: 'models/Twitch/User.js',
        info: 'Error setting user to DB ' + error,
      });
    }
  };


exports.setStripeCustomerId = async (customerId, unx_id) => {
    try {
        const collection = db.collection('app_users')

        console.log('⛔️ SETTING STRIPE ID ⛔️')//!DEBUG
        console.log(customerId)//!DEBUG
        console.log('SET STRIPE ID FOR: ',unx_id)//!DEBUG

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

exports.getStripeSessionId = async (unx_id) => {
    try {
        const collection = db.collection('app_users')

        console.log('⛔️ GET STRIPE SESSION ID FOR: ⛔️',unx_id)//!DEBUG

        const user = await collection.findOne({ unx_id })

        return user.stripe_session

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error getting stripe session id from DB ' + error
        })

        return false
    }
}

exports.setStripeSessionId = async (sessionId, unx_id) => {
    try {
        const collection = db.collection('app_users')

        console.log('⛔️ SET STRIPE SESSION ID FOR: ⛔️',unx_id)//!DEBUG

        console.log('⛔️ SETTING STRIPE SESSION ID ⛔️', sessionId)//!DEBUG

        const user = await collection.findOne({ unx_id })

        const newUserData = {
            ...user,
            stripe_session: sessionId
        }

        await collection.updateOne({ unx_id }, { $set: newUserData })

        return true

    } catch (error) {

        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error setting stripe session id to DB ' + error
        })

        return false
    }
}

exports.updatePaidStatus = async (customerId, action) => {
    try {
        console.log('⛔️ UPDATING PAID STATUS ⛔️', customerId) //!DEBUG

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
            unx_id,
            twitch_id,
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
            unx_id: unx_id,
            twitch_id: twitch_id,
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

  exports.getUserChatLogsUnx = async (unx_id) => {
    try {
        const collection = db.collection('chat_logs')

        const chatLogs = await collection.find({unx_id: unx_id}).toArray()

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
        const collection = db.collection('user_custom_commands')

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


    exports.deleteCustomCommand = async (cid) => {
        try{
            const collection = db.collection('user_custom_commands')

            const query = {cid: cid}

            await collection.deleteOne(query)

            return true

        } catch (error) {
            consoleLoging({
                id: "ERROR",
                user: 'Server',
                script: 'models/Twitch/User.js',
                info: 'Error deleting user custom command from DB ' + error
            })
            return false
        }
    }

    exports.updateCustomCommand = async (commandObj) => {
        try{
            const collection = db.collection('user_custom_commands')

            const query = {cid: commandObj.cid}

            await collection.updateOne(query, {$set: commandObj})

            return true


        } catch (error) {
            consoleLoging({
                id: "ERROR",
                user: 'Server',
                script: 'models/Twitch/User.js',
                info: 'Error updating user custom command from DB ' + error
            })
            return false
        }
    }

exports.setFeatureRequest = async (requestObj) => {
    try {
        const collection = db.collection('user_requests')

        
        let date= new Date()
    
        let timestamp = date.getFullYear() + '-' +
            ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
            ('0' + date.getDate()).slice(-2) + '-' +
            ('0' + date.getHours()).slice(-2) + ':' +
            ('0' + date.getMinutes()).slice(-2) + ':' +
            ('0' + date.getSeconds()).slice(-2);
    
        const newRequest = {
            reqId: uuid(),
            twitch_name: requestObj.twitchName,
            twitch_email: requestObj.twitchEmail,
            user_id: requestObj.unx_id,
            request_text: requestObj.requestText,
            viewed: false,
            implemented: false,
            timestamp: timestamp
        }
    
        await collection.insertOne(newRequest)
    
        return
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error setting user feature request to DB ' + error
        })
        return false
    }
  }

exports.getFeatureRequests = async () => {
    try {
        const collection = db.collection('user_requests')

        const requests = await collection.find({}).toArray()
    
        return requests

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error getting user feature requests from DB ' + error
        })
        return false
    }
}

exports.addBarkCount = async (barkCount) => {
    try{
        const collection = db.collection('barks')

        const barksExist = await collection.find({}).toArray()

        const dateTime = new Date()

        const timestamp = dateTime.getFullYear() + '-' +
            ('0' + (dateTime.getMonth() + 1)).slice(-2) + '-' +
            ('0' + dateTime.getDate()).slice(-2) + '-' +
            ('0' + dateTime.getHours()).slice(-2) + ':' +
            ('0' + dateTime.getMinutes()).slice(-2) + ':' +
            ('0' + dateTime.getSeconds()).slice(-2);
            
        if(barksExist.length > 0){
            console.log('⛔️ barks exist') //!DEBUG  
            const barkData = {
                time: timestamp,
                count: barkCount
              }
      
              await collection.updateOne({ _id: barksExist[0]._id }, { $set: barkData })

              console.log('⛔️ barks updated', barkData) //!DEBUG
      
              return barkData
        }
      

        console.log(' ⛔️ barks dont exist') //!DEBUG

        const newBarkCount = {
            count: barkCount,
            time: timestamp
        }

        await collection.insertOne(newBarkCount)

        console.log('⛔️ barks added', newBarkCount) //!DEBUG

        return newBarkCount

        

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error adding bark count to DB ' + error
        })
        return false
    }
}

exports.getBarkCount = async () => {
    try {
        const collection = db.collection('barks')

        const barkCount = await collection.find({}).toArray()

        return barkCount

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            user: 'Server',
            script: 'models/Twitch/User.js',
            info: 'Error getting bark count from DB ' + error
        })
    } 
}








