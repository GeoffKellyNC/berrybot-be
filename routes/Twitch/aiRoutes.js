const express = require("express");
const runChatFromWebModel = require("../../ai/berryWebChat")
const consoleLoging = require('../../helpers/consoleLoging')

const router = express.Router();


router.post('/chat-from-web', async (req, res) => {
    try {

        const { channel, message } = req.body

        const aiRes = await runChatFromWebModel(channel, message)

        res.status(200).json(aiRes)

        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/Twitch/aiRoutes.js (POST /chat-from-web)',
            info: 'Error running chat from web ' + error
        })
        res.status(500).json({error: 'Error running chat from web'})
    }
})



module.exports = router;