const express = require('express');
const TwitchModel = require('../../models/Twitch/Twitch')
const UserModel = require('../../models/Twitch/User')
const AiModel = require('../../models/Twitch/AI')
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();



//? GET ROUTES

router.get('/get-twitch-chat-settings', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;

        const twitchChatSettings = await TwitchModel.getTwitchChatSettings(twitch_id, accessToken)

        if(twitchChatSettings.data[0].length < 1){
            res.status(500).json({ message: 'Error getting chat settings'})
            return
        }

        res.status(200).json(twitchChatSettings.data[0])
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (GET /get-twitch-chat-settings)',
            info: 'Error getting Twitch chat settings ' + error
        })
        res.status(500).json({error: 'Error getting Twitch chat settings'})
    }
})

router.get('/get-twitch-chat-commands', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;

        const twitchChatCommands = await UserModel.getUserCustomCommands(twitch_id)

        if(twitchChatCommands.data[0].length < 1){
            res.status(500).json({ message: 'Error getting chat commands'})
            return
        }

        res.status(200).json(twitchChatCommands)
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (GET /get-twitch-chat-commands)',
            info: 'Error getting Twitch chat commands ' + error
        })

        res.status(500).json({error: 'Error getting Twitch chat commands'})
    }
})



//? POST ROUTES

router.post('/get-current-stream-data', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;

        const currentStreamData = await TwitchModel.getUserTwitchStreamData(accessToken, twitch_id)

        res.status(200).json(currentStreamData)
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /get-current-stream-data)',
            info: 'Error getting current stream data ' + error
        })

        res.status(500).json({error: 'Error getting current stream data'})
    }
})

router.post('/run-twitch-ad', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;

        const duration = req.body.duration;

        
        if(!duration) {
            res.status(400).json({error: 'Duration not provided'})
            return
        }

        const runAd = await TwitchModel.runTwitchAd(accessToken, twitch_id, duration)


        if(runAd.error || runAd.status === 400) {
            res.status(400).json(runAd)
            return
        }

        res.status(200).json(runAd)

        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /run-twitch-ad)',
            info: 'Error running Twitch Ad ' + error
        })
    }
})

router.post('/start-twitch-poll', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;

        const { pollOptions, title, duration } = req.body;


        if(!pollOptions || !title || !duration) {
            res.status(400).json({error: 'Missing required fields'})
            return
        }

        const startPoll = await TwitchModel.startTwitchPoll(accessToken, twitch_id, pollOptions, title, duration)

        res.status(200).json(startPoll)
        
    } catch (error) {
        consoleLoging({
            id: null,
            name: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /start-twitch-poll)',
            info: 'Error starting Twitch Poll ' + error
        })
        res.status(500).json({error: 'Error starting Twitch Poll'})
    }
})

router.post('/create-twitch-clip', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;

        const clip = TwitchModel.createClip(accessToken, twitch_id)

        res.status(200).json(clip)
        
    } catch (error) {
        consoleLoging({
            id: null,
            name: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /create-twitch-clip)',
            info: 'Error creating Twitch Clip ' + error
        })
        res.status(500).json({error: 'Error creating Twitch Clip'})
    }
})

router.post('/update-twitch-chat-settings', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;
        const { setting, value } = req.body;


        const update = await TwitchModel.updateTwitchChatSettings(twitch_id, accessToken, setting, value)

        res.status(200).json(update.data)
        
    } catch (error) {
        consoleLoging({
            id: null,
            name: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /update-twitch-chat-settings)',
            info: 'Error updating Twitch Chat Settings ' + error
        })
        res.status(500).json({error: 'Error updating Twitch Chat Settings'})
    }
})

router.post('/update-user-ai-settings', async (req, res) => {
    try {
        const unx_id = req.headers.unx_id;

        const { aiConfig } = req.body;

        const updatedConfig = await AiModel.updateUserAiConfig(unx_id, aiConfig)

        res.status(200).json(updatedConfig)


    } catch (error) {
        consoleLoging({
            id: null,
            name: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /update-user-ai-settings)',
            info: 'Error updating user AI settings ' + error
        })
        res.status(500).json({error: 'Error updating user AI settings'})
    }
})


router.post('/get-stripe-id', async (req, res) => {
    try {
        const twitch_login = req.body.twitch_login;

        console.log('⛔️ twitch_login: ', twitch_login) //!DEBUG

        const stripeId = await UserModel.getUserItem(twitch_login, 'stripe_id')

        if(!stripeId) {
            res.status(500).json({ message: 'Error getting Stripe ID'})
            return
        }

        res.status(200).json(stripeId)


    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (GET /get-stripe-id)',
            info: 'Error getting Stripe ID ' + error
        })

        res.status(500).json({error: 'Error getting Stripe ID'})
    }
})

router.post('/set-custom-command', async (req, res) => {
    try {
        const twitch_id = req.headers.twitch_id;
        const commandObj = req.body

        const newCommand = await UserModel.setCustomUserCommand(commandObj, twitch_id)

        res.status(200).json(newCommand)

        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js (POST /set-custom-command)',
            info: 'Error setting custom command ' + error
        })

        res.status(500).json({error: 'Error setting custom command'})
    }
})



module.exports = router;


