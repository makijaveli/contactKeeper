const jwt = require('jsonwebtoken');
const config = require('config');


/**
 * Check token from request for private API's
 * @param req
 * @param res
 * @param next
 */
module.exports = function (req, res, next) {
    // Get token from header
    const token = req.header('x-auth-token');
    // Check token
    if (!token) {
        return res.status(401).json({msg: 'No token, auth denied!'})
    }
    try {
        const decodeToken = jwt.verify(token, config.get('jwtSecret'));

        req.user = decodeToken.user;
        next();
    } catch (err) {
        res.status(401).json({msg: 'Token is not valid!'})
    }
}