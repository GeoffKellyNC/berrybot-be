const express = require('express');
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();
const authModel = require('../../models/YouTube/AuthYT')



router.get('/login-youtube', async (req, res) => {
    try {
        const loginURL = await authModel.getYouTubeLoginURL()

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
        const { accessToken } = req.body

        const userData = await authModel.getGoogleUserData(accessToken)

        res.status(200).json(userData)
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/youtube/authRoutes.js (POST /get-login-data)",
            info: error
        })
    }
})

module.exports = router; 
