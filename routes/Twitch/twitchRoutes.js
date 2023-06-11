const express = require('express');
const TwitchModel = require('../../models/Twitch/Twitch')
const authModel = require('../../models/Twitch/Auth')
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();



//? GET ROUTES

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

module.exports = router;


