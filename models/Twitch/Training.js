require('dotenv').config();
const { mongo } = require('../../db/mongo_config')

const db = mongo.db(process.env.MONGO_DB_NAME)

exports.logTrainingChat = async(channel, message) => {
    const date = new Date()

    const collection = db.collection('training_chat_data')

    let timestamp = date.getFullYear() + '-' +
    ('0' + (date.getMonth() + 1)).slice(-2) + '-' +
    ('0' + date.getDate()).slice(-2) + '-' +
    ('0' + date.getHours()).slice(-2) + ':' +
    ('0' + date.getMinutes()).slice(-2) + ':' +
    ('0' + date.getSeconds()).slice(-2);

    const newEntry = {
        tid: uuid(),
        channel,
        message,
        timestamp
    }

    await collection.insertOne(newEntry)
    console.log('Training Logged..')
    return
}


