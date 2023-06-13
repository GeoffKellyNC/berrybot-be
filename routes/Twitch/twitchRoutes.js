const express = require('express');
const TwitchModel = require('../../models/Twitch/Twitch')
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

        console.log('⛔️ Twitch Chat Settings', setting, value)


        if(!setting || !value) {
            res.status(404).json({error: 'Missing required fields'})
            return
        }

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



module.exports = router;


