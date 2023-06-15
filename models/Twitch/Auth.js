require("dotenv").config()
const { mongo } = require('../../db/mongo_config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const { google } = require('googleapis');

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

exports.getYouTubeLoginURL = async () => {
    try {

        const oauth2Client = new google.auth.OAuth2(
            process.env.YT_CLIENT_ID,
            process.env.YT_CLIENT_SECRET,
            process.env.LOCAL_MODE ? process.env.YT_LOCAL_REDIRECT_URI : null
          );
          
          // generate a url that asks permissions for Blogger and Google Calendar scopes
          const scopes = [
            'https://www.googleapis.com/auth/youtube',
            'https://www.googleapis.com/auth/youtube.channel-memberships.creator',
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.readonly',
            'https://www.googleapis.com/auth/youtube.upload',
            'https://www.googleapis.com/auth/youtubepartner',
            'https://www.googleapis.com/auth/youtubepartner-channel-audit'
          ];
          
          const url = oauth2Client.generateAuthUrl({
            // 'online' (default) or 'offline' (gets refresh_token)
          
            // If you only need one scope you can pass it as a string
            scope: scopes
          });

          return url

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: 'Server',
            script: 'models/Auth.js (greateGoogleOAuthLink())',
            info: 'Error Creating Google OAuth Link ' + error
        })
    }
}

