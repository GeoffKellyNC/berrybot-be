const authModel = require('../models/Auth')




const authMiddleware = async (req, res, next) => {
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