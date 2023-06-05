require("dotenv").config()
const { mongo } = require('../db/mongo_config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const consoleLoging = require('../helpers/consoleLoging')

const db = mongo.db(process.env.MONGO_DB_NAME);
const JWT_SIG = process.env.JWT_SECRET


//* Creting A JWT Token.
exports.createJWT = async (unx_id) => {
    try{

        const token = jwt.sign({unx_id}, JWT_SIG, {expiresIn: '24h'});

        const collection = db.collection('app_users')

        // update user with new JWT token

        await collection.updateOne({ unx_id }, { $set: { jwtToken: token } })


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
        const collection = db.collection('app_users')

       const { jwtToken } =  await collection.findOne({ unx_id })

       const storedJWT = jwtToken

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
            console.log('🔐 userJWT = storedJWT: ', userJWT === storedJWT) //!DEBUG
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

exports.verifyTwitchAccessToken = async (accessToken, twitchId) => {
    try {
        const headers = {
          'Authorization': `OAuth ${accessToken}`,
        }
        const verifiedData = await axios.get('https://id.twitch.tv/oauth2/validate', { headers })

        console.log('🔐 Twitch Access Token Verified!') //!DEBUG

        if (verifiedData.data.user_id === twitchId){
            return true
        }

        return false
        
      } catch (error) {
        await consoleLoging({
            id: "ERROR",
            name: 'Server',
            script: 'models/Auth.js (verifyTwitchAccessToken())',
            info: 'Error Verifing Twitch Access Token ' + error
        })
        return
      }
}

