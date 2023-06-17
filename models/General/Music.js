require("dotenv").config();
const { mongo } = require("../../db/mongo_config");
const consoleLoging = require('../../helpers/consoleLoging')
const { v4: uuid } = require('uuid');


const db = mongo.db(process.env.MONGO_DB_NAME);


exports.setSongToDb = async (songObj) => {
    try {
        const collection = db.collection('music')

        const songExists = await collection.findOne({ song_name: songObj.song_name })

        if (songExists && songExists.song_name === songObj.song_name && songExists.song_artist === songObj.song_artist) {
            return false
        }

        const newSong = {
            song_id: uuid(),
            song_name: songObj.song_name,
            song_artist: songObj.song_artist,
            song_url: songObj.song_url,
            song_cover: songObj.song_cover,
            genre: songObj.genre,
            status: 'pending',
            created_at: new Date(),
            user_agree: false,
        }

        await collection.insertOne(newSong)

        return true
        
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'SERVER',
            scirpt: 'models/Music.js (setSongToDb)',
            info: error
        })

        return false
    }
}

exports.getAllSongsFromDb = async () => {
    try {

        const collection = db.collection('music')

        const allSongs = await collection.find({}).toArray()

        return allSongs
        
    } catch (error) {
        consoleLoging({
            id: 'ERROR',
            user: 'SERVER',
            scirpt: 'models/Music.js (getAllSongsFromDb)',
            info: error
        })

        return false
    }
}
