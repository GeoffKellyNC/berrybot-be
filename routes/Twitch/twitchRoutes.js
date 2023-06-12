const express = require('express');
const TwitchModel = require('../../models/Twitch/Twitch')
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();



//? GET ROUTES




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

        const { pollOptoins, title, duration } = req.body;

        console.log('⛔️ pollOptoins', pollOptoins) //!DEBUG
        console.log('⛔️ title', title) //!DEBUG
        console.log('⛔️ duration', duration) //!DEBUG

        if(!pollOptoins || !title || !duration) {
            res.status(400).json({error: 'Missing required fields'})
            return
        }

        const startPoll = await TwitchModel.startTwitchPoll(accessToken, twitch_id, pollOptoins, title, duration)

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

module.exports = router;


