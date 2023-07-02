const express = require('express');
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();
const AuthModel = require('../../models/YouTube/AuthYT')
const YouTubeModel = require('../../models/YouTube/Youtube')



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

        const code = req.body

        console.log('⛔️ code: ', code) //!DEBUG
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/youtube/authRoutes.js (POST /login-youtube)",
            info: error
        })

    }
})

router.post('/get-login-data', async (req, res) => {
    try {
        const  code  = req.body.code

        const tokens = await AuthModel.getGoogleAuthToken(code)
        // const userData = await YouTubeModel.getGoogleUserData(tokens.access_token)
        const youtubeData = await YouTubeModel.getYouTubeData(tokens.access_token)

        // console.log('🔐 USER DATA: ', userData) //!DEBUG

        // console.log('🔐 YOUTUBE DATA: ', youtubeData) //!DEBUG

        const payload = {
            authData: tokens,
            userData: userData,
            youtubeData: youtubeData
        }
        console.log('🔐 PAYLOAD: ', payload) //!DEBUG

        res.status(200).json(payload)
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/youtube/authRoutes.js (POST /get-login-data)",
            info: error
        })

        res.status(500).json(error)
    }
})

module.exports = router; 
