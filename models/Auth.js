require("dotenv").config()
const { mongo } = require('../db/mongo_config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const consoleLoging = require('../helpers/consoleLoging')

const db = mongo.db(process.env.MONGO_DB_NAME);
const JWT_SIG = process.env.JWT_SECRET


//* Creting A JWT Token.
exports.createJWT = async () => {
    try{
        const token = jwt.sign({unx_id}, JWT_SIG, {expiresIn: '24h'});

        await db.execute(`UPDATE app_users SET session_token = '${token}' WHERE unx_id = '${unx_id}'`)

        return token
    } catch(error){
        await consoleLoging({
            id: null,
            user: 'Server',
            script: 'models/Auth.js (createJWT)',
            info: 'Error Creating JWT' + error
        })
        return
    }
}

//* Verifiying a user JWT token matches DB.
exports.verifyUserJWT = async (userJWT, unx_id) => {
    try {
        const collection = db.collection('twitch_user_config')

       const storedJWT =  collection.findOne({ unx_id }, { jwtToken: 1 })

       const isValidated = jwt.verify(userJWT, JWT_SIG, (err, decoded) => {
           if (err) {
               return false;
           }
           return true;
       })

         if(!isValidated || userJWT != storedJWT) {
            await consoleLoging({
                id: unx_id,
                user: unx_id,
                script: 'models/Auth.js (verifyJWT)',
                info: `USER NOT VERIFIED!`
            })
            return false
         }

         return true

    } catch (error) {
        await consoleLoging({
            id: null,
            user: 'Server',
            script: 'models/Auth.js (verifyJWT)',
            info: 'Error Verifing JWT' + error
        })
        return
    }
}

