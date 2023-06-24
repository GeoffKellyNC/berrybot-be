const express = require("express");
const consoleLoging = require('../../helpers/consoleLoging')
const UserModel = require('../../models/Twitch/User')


const router = express.Router();



//? GET ROUTES
router.get('/pepper', async (req, res) => {
    try {
        const barkData = await UserModel.getBarkCount()

        res.status(200).json(barkData)
        
    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/General/generalRoutes.js (GET /pepper)',
            info: 'Error getting pepper ' + error
        })
        res.status(500).json({error: 'Error getting pepper'})
    }
})

router.post('/pepper', async (req, res) => {
    try {
        const code = req.headers.authorization

        const barkCount = req.body.bark_count

        console.log('⛔️ RECEIVED BARK COUNT: ', barkCount) //!DEGUB

        if (code == '503cameronwoodsdrive'){
            console.log('⛔️ PEPPER AUTHORIZED!') //!DEGUB
            const newData = await UserModel.addBarkCount(barkCount)

            res.status(200).json(newData)
            return
        }

        res.status(401).json('Not Authorized')
        return


    } catch (error) {
        consoleLoging({
            id: null,
            user: 'Server',
            script: 'routes/General/generalRoutes.js (POST /pepper)',
            info: 'Error posting pepper ' + error
        })
        res.status(500).json({error: 'Error posting pepper'})
    }
})


module.exports = router;

