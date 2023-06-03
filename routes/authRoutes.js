const express = require('express');
const userModel = require('../models/User')
const twitchModel = require('../models/Twitch')
const authModel = require('../models/Auth')
const AiModel = require('../models/AI')
const { connectToBerry, runScheduledCommands } = require('../models/Berry');
const { mongo } = require('../db/mongo_config');
const consoleLoging = require('../helpers/consoleLoging');
const router = express.Router();

//* LOGIN ROUTE */
router.post('/login', async (req, res) => {
    try {
        const { code } = req.body.data

        consoleLoging({
            id: "🚧 DEBUGGING",
            user: "Server",
            script: "routes/authRoutes.js (POST /login)",
            info: "code: " + code
        }) //! DEBUG
    
        const {
            accessToken,
            expiresIn,
            refreshToken,
            scope
        } = await twitchModel.getUserTwitchAccessToken(code)
    
        const { 
            id, 
            login, 
            display_name,
            email, 
            profile_image_url,
            view_count,
            broadcaster_type,
            created_at,
            description } = await twitchModel.getUserTwitchData(accessToken)
    
            const userObject = {
                twitch_id: id,
                twitch_login: login,
                twitch_display_name: display_name,
                email,
                twitch_image: profile_image_url,
                twitch_view_count: view_count,
                twitch_streamer_status: broadcaster_type,
                twitch_created_date: created_at,
                twitch_description: description,
                access_token: accessToken,
                refresh_token: refreshToken,
                client_id: process.env.TWITCH_CLIENT_ID,
                client_secret: process.env.TWITCH_CLIENT_SECRET,
                expiresIn,
                scope
            }
    
            //* user is on Object {user, isNew}
    
            console.log(' ⛔️ Setting User to Database') //! DEBUG
    
            const {user, isNew} = await userModel.setUserToDb(userObject)
    
            if(isNew || !user.user_paid){
                res.status(200).json({messge: 'not_paid', user})
            }
    
            const jwtToken = await authModel.createJWT(user.unx_id)
    
            await connectToBerry(display_name)
    
            await runScheduledCommands(display_name, user.unx_id)
    
            const aiConfig = await AiModel.getUserAiConfig(user.unx_id)
    
            const payload = {
                jwtToken,
                userData : {
                    twitch_id: user.twitch_id,
                    twitch_login: user.twitch_login,
                    twitch_display: user.twitch_display_name,
                    email: user.email,
                    twitch_image: user.twitch_image,
                    twitch_view_count: user.twitch_view_count,
                    twitch_streamer_status: user.twitch_streamer_status,
                    twitch_created_date: user.twitch_created_date,
                    twitch_description: user.twitch_description,
                    access_token: user.access_token,
                    expiresIn: user.expiresIn,
                    scope: user.scope,
                    aiConfig
                },
                access_token: accessToken,
            }
    
            console.log(payload) //! DEBUG
    
            res.cookie({
                "jwtToken": jwtToken,
                httpOnly: true,
                // secure: true,
            })
    
            res.cookie({
                "access_token": accessToken,
                httpOnly: true,
                // secure: true,
            })
    
            res.status(200).json({message: payload})
    
    } catch (error) {
        res.status(500).json({message: error})
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/authRoutes.js (POST /login)",
            info: error
        })
    }
});




module.exports = router;