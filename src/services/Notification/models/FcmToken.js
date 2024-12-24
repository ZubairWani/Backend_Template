const mongoose = require('mongoose');


const FcmTokenSchema = new mongoose.Schema({
    phone: { type: String, default: "" },
    token: { type: String, default: "" }
}, { timestamps: true })

module.exports = mongoose.model("FcmToken", FcmTokenSchema)