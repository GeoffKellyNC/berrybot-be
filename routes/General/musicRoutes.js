const express = require("express");
const MusicModel = require('../../models/General/Music')
const consoleLoging = require('../../helpers/consoleLoging')

const router = express.Router()



//? GET ROUTES 

router.get('/all-music', async (req, res) => {
    try {
        const allMusicList = await MusicModel.getAllSongsFromDb()

        if(!allMusicList){
            res.status(500).json('Error Getting Songs!')
            return
        }

        res.status(200).json(allMusicList)
        return
        
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: 'routes/musicRoutes.js (getAllSongs (GET))',
            info: error
        })
        res.status(500).json(error)
    }

})


//? POST ROUTES

router.post('/add-song', async (req, res) => {
    try {
        const songObj = req.body.songObj

        const songSet = await MusicModel.setSongToDb(songObj)

        if(!songSet){
            res.status(500).json('Error Setting Song')
            return
        }

        res.status(200).json('Song Set Successfully')

    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'Server',
            script: 'routes/musicRoutes.js (set-song (POST))',
            info: error
        })
        res.status(500).json(error)
    }
})

module.exports = router