const express = require('express');
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();
const AuthModel = require('../../models/YouTube/AuthYT')
const YouTubeModel = require('../../models/YouTube/Youtube')
const checkYTLive = require('../../util/checkYTLive');



router.get('/login-youtube', async (req, res) => {
    try {
        const loginURL = await AuthModel.getYouTubeLoginURL()

        res.status(200).json(loginURL)

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/youtube/authRoutes.js (GET /login-youtube)",
            info: error
        })
    }
})


router.post('/login-youtube', async (req, res) => {
    try {

        const  code  = req.body.code

        const tokens = await AuthModel.getGoogleAuthToken(code)
        const userData = await YouTubeModel.getGoogleUserData(tokens.access_token)
        const youtubeData = await YouTubeModel.getYouTubeData(tokens.access_token)

        checkYTLive(tokens.access_token)

        const payload = {
            authData: tokens,
            userData: userData,
            youtubeData: youtubeData
        }

        res.status(200).json(payload)

        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/youtube/authRoutes.js (POST /login-youtube)",
            info: error
        })

        res.status(500).json(error)

    }
})



module.exports = router; 
