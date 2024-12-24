const express = require('express');
const router = express.Router();
const authenticate = require('../../../middlewares/authentication');
const UserController = require("../controllers/user.controller")

router.use(authenticate)

router.put("/update", UserController.UpdateUser)
router.get("/my-profile", UserController.GetUserByPhone)
router.get("/user-profile", UserController.GetUserProfileByPhone)
router.get("/all", UserController.GetAllUsers)
router.put("/update-dp", UserController.UpdateUserDp)
router.post("/follow", UserController.FollowUser)

module.exports = router