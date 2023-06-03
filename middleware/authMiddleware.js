const authModel = require('../models/Auth')

async function authMiddleware(req, res, next) {
    
    if(req.path.includes('login')) {
        return next()
    }
    
    const jwtToken = req.cookies.jwtToken;
    const accessToken = req.cookies.accessToken;
    const unx_id = req.headers.unx_id;

    if (!jwtToken || !accessToken) {
        return res.status(401).json({ message: 'Unauthorized' });
    }

    try {

        const isValidated = await authModel.verifyUserJWT(jwtToken, unx_id)
    

        if (!isValidated) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        next();
    } catch (error) {
        console.error(error);
        res.status(403).json({ message: 'Invalid token' });
    }
}

module.exports = authMiddleware;
