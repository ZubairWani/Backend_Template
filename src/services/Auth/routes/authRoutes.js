const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authentication');
const AuthController = require("../controllers/auth.controller")

router.use((req, res, next) => {
    if (
        req.path === '/access-token' || req.path === '/refresh-token' || req.path === '/check-user' || req.path === '/register'
    ) {
        return next(); // Skip authentication for these routes
    }
    authenticate(req, res, next); // Apply authentication for other routes
});

router.post("/access-token", AuthController.GetPlayerAccessToken)
router.post("/refresh-token", AuthController.refreshToken)
router.post("/check-user", AuthController.CheckUserAlreadyExists)
router.put("/register", AuthController.SaveUser)

module.exports = router