const express = require('express');
const userModel = require('../../models/Twitch/User')
const twitchModel = require('../../models/Twitch/Twitch')
const authModel = require('../../models/Twitch/Auth')
const AiModel = require('../../models/Twitch/AI')
const { connectToBerry, runScheduledCommands, stopAllScheduledCommands, disconnect } = require('../../models/Twitch/Berry');
const { mongo } = require('../../db/mongo_config');
const consoleLoging = require('../../helpers/consoleLoging');
const router = express.Router();

//? GET ROUTES

//* VERIFY ACCESS TOKEN ROUTE */
router.get("/verify-accessToken", async (req, res) => {
    try {

        const twitch_id = req.headers.twitch_id;
        const accessToken = req.headers.access_token;

        const twitchValid = await authModel.verifyTwitchAccessToken(accessToken, twitch_id)

        if(!twitchValid) {
            res.status(401).json({message: "Access Token Invalid"})
            return
        }

        res.status(200).json({message: "Access Token Valid"})

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/authRoutes.js (POST /verify-accessToken)",
            info: error
        })
        res.status(500).json({message: error})
        return
    }
})

//? POST ROUTES

//* LOGIN ROUTE - TWITCH */
router.post('/login', async (req, res) => {
    try {
        const { code } = req.body;
    
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
    
            //* user is an Object {user, isNew}
        
            const {user, isNew} = await userModel.setUserToDb(userObject)

            
            const jwtToken = await authModel.createJWT(user.unx_id)
            
            const aiConfig = await AiModel.getUserAiConfig(user.unx_id)

            const payload = {
                userData: {
                    unx_id: user.unx_id,
                    twitch_id: user.twitch_id,
                    twitch_login: user.twitch_login,
                    twitch_display: user.twitch_display_name,
                    email: user.email,
                    twitch_image: user.twitch_image,
                    twitch_view_count: user.twitch_view_count,
                    twitch_streamer_status: user.twitch_streamer_status,
                    twitch_created_date: user.twitch_created_date,
                    twitch_description: user.twitch_description,
                    expiresIn: user.expiresIn,
                    scope: user.scope,
                    user_paid: user.user_paid,
                    application_type: user.application_type,
                    stripe_customer_id: user.stripe_customer_id,
                    account_type: user.account_type,
                    metaData: user.metaData,
                    aiConfig
                },
                authData: {
                    jwtToken,
                    accessToken,
                    refreshToken
                }
            }
            
            if(isNew || !user.user_paid){
                res.status(200).json(payload)
                return
            }
    
            await connectToBerry(display_name)
            await runScheduledCommands(display_name, user.unx_id)
            
            res.cookie('jwtToken', jwtToken, {
                httpOnly: true,
                sameSite: 'None',
                secure: true,
                domain: 'localhost',
                path: '/dashboard'
              });
              
              res.cookie('accessToken', accessToken, {
                sameSite: 'None',
                secure: true,
                domain: 'localhost',
                path: '/control-panel'
              });
              
              res.cookie('twitchId', payload.twitch_id, {
                sameSite: 'None',
                secure: true,
                domain: 'localhost',
                path: '/control-panel'
              });

            res.status(200).json(payload)

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

router.post('/logout', async (req, res) => {
    try {

        const channel = req.body.channel;

        await disconnect(channel)
        await stopAllScheduledCommands(channel)

        res.status(200).json({message: "Logged Out"})
        
    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: "Server",
            script: "routes/authRoutes.js (POST /logout)",
            info: error
        })

        res.status(500).json({message: error})
    }
})









module.exports = router;