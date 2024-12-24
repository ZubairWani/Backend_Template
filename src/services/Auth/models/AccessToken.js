const mongoose = require('mongoose');


const AccessTokenSchema = new mongoose.Schema({
    phone: { type: String, default: "" },
    accessToken: { type: String, default: "" },
    refreshToken: { type: String, default: "" }
}, { timestamps: true })

module.exports = mongoose.model("AccessToken", AccessTokenSchema)