const authModel = require('../models/Twitch/Auth')

async function authMiddleware(req, res, next) {

    console.log('🔐 Auth Middleware!!!!!') //!DEBUG
    
    if(req.path.includes('login') || req.path.includes('payments') || req.path.includes('webhook')) {
        console.log('🔐 Auth Middleware: Login Route') //!DEBUG
        return next()
    }

    console.log('🔐 Auth Middleware: PROTECTED ROUTE.') //!DEBUG


    
    const jwtToken = req.headers.jwt_token;
    const accessToken = req.headers.access_token;
    const unx_id = req.headers.unx_id;
    const twitch_id = req.headers.twitch_id;


    if (!jwtToken || !accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const isValidated = await authModel.verifyUserJWT(jwtToken, unx_id)
        const accessValid = await authModel.verifyTwitchAccessToken(accessToken, twitch_id )

        console.log('🔐 Auth Middleware: JWT isValidated: ', isValidated) //!DEBUG
        console.log('🔐 Auth Middleware: Access Token isValidated: ', accessValid) //!DEBUG

    

        if (!isValidated || !accessValid) {
            console.log('🔐 Auth Middleware: JWT or Access Token Invalid') //!DEBUG
            return res.status(401).json({ message: 'Unauthorized' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;
