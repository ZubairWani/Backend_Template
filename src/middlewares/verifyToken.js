const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json("Access Denied");

    jwt.verify(token, process.env.JWT_SEC, (err, user) => {
        if (err) return res.status(403).json("Invalid Token");
        req.user = user;
        next();
    });
};

const verifyTokenAndAuth = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.id === req.params.id || req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("You are not allowed to do that!");
        }
    });
};

const verifyTokenAndAdmin = (req, res, next) => {
    verifyToken(req, res, () => {
        if (req.user.isAdmin) {
            next();
        } else {
            res.status(403).json("Admin access only");
        }
    });
};

module.exports = { verifyToken, verifyTokenAndAuth, verifyTokenAndAdmin };
