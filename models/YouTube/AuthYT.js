require("dotenv").config()
const { mongo } = require('../../db/mongo_config')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios')
const consoleLoging = require('../../helpers/consoleLoging')
const { google } = require('googleapis');

const db = mongo.db(process.env.MONGO_DB_NAME_YT);
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
            'https://www.googleapis.com/auth/youtube.force-ssl',
            'https://www.googleapis.com/auth/youtube.readonly'
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

exports.getGoogleAuthToken = async (code) => {
    try {

        let accessToken = null
        let refreshToken = null

        const oauth2Client = new google.auth.OAuth2(
            process.env.YT_CLIENT_ID,
            process.env.YT_CLIENT_SECRET,
            process.env.LOCAL_MODE ? process.env.YT_LOCAL_REDIRECT_URI : null
          );
          
         oauth2Client.getToken(code, (err, tokens) => {
            if (err) {
              console.error('Error getting access token', err);
              return;
            }
             accessToken = tokens.access_token;
            refreshToken = tokens.refresh_token;
            console.log(`Access Token: ${accessToken}`);
            console.log(`Refresh Token: ${refreshToken}`);
          });

            return { accessToken, refreshToken }

    } catch (error) {
        consoleLoging({
            id: "ERROR",
            name: 'Server',
            script: 'models/Auth.js (getGoogleAuthToke())',
            info: 'Error Getting Google Auth Token ' + error
        })
    }
}