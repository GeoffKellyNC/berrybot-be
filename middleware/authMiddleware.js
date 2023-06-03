const authModel = require('../models/Auth')

/**
 * This middleware is used to verify a user's JWT token. It is set to run on all routes except for the login route.ß
 */

const authMiddleware = async (req, res, next) => {

    if(req.path.includes('login')) {
        return next()
    }

    const userJWT = req.headers.authorization
    const unx_id = req.headers.unx_id

    if(!userJWT || !unx_id) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }

    const isVerified = await authModel.verifyUserJWT(userJWT, unx_id)

    if(!isVerified) {
        return res.status(401).json({
            message: 'Unauthorized'
        })
    }

    next()
}

module.exports = authMiddleware;