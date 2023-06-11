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
            script: 'routes/Twitch/twitchRoutes.js',
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

        console.log('⛔️ DURATION: ', duration) //!DEBUG
        
        if(!duration) {
            res.status(400).json({error: 'Duration not provided'})
            return
        }

        const runAd = await TwitchModel.runTwitchAd(accessToken, twitch_id, duration)

        if(runAd.error || runAd.status === 400) {
            res.status(400).json(runAd)
            return
        }

        console.logg('⛔️ RUN AD: ', runAd) //!DEBUG

        res.status(200).json(runAd)

        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/twitchRoutes.js',
            info: 'Error running Twitch Ad ' + error
        })
    }
})

module.exports = router;


