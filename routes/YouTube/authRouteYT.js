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

module.exports = router;
