const express = require('express');
const router = express.Router();
const MediaController = require("../controllers/media.controller");
const authenticate = require('../../../middlewares/authentication');



// router.post("/upload", uploadFileToAzure, MediaController.GlobalUploadImage)

module.exports = router