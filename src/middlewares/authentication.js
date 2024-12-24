const jwt = require('jsonwebtoken');
const AccessToken = require('../services/Auth/models/AccessToken');
const User = require('../services/User/models/User');

const authenticate = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        if (!authHeader?.startsWith('Bearer ')) {
            return res.status(401).json({ success: false, message: 'Not authorized, no token found' });
        }

        const token = authHeader.split(' ')[1];
        const decoded = jwt.verify(token, process.env.JWT_SEC);

        const userAccessToken = await AccessToken.findOne({ accessToken: token }).populate('phone');
        if (!userAccessToken) {
            return res.status(401).json({ success: false, message: 'Token not found or revoked' });
        }

        const user = userAccessToken.phone ? await User.findOne({ phone: userAccessToken.phone }) : null;
        if (!user) {
            return res.status(401).json({ success: false, message: 'User not authorized' });
        }

        req.user = user;
        next();
    } catch (error) {
        console.error(error);

        const statusCode = error.name === 'TokenExpiredError' ? 401 : 500;
        const message = error.name === 'TokenExpiredError'
            ? 'Token expired, please refresh your token'
            : 'Authentication failed';

        return res.status(statusCode).json({ success: false, message });
    }
};

module.exports = authenticate;
