const mongoose = require('mongoose');

// Sub-schema for the notification object
const notificationDetailSchema = new mongoose.Schema({
    title: { type: String, required: true },
    body: { type: String, required: true },
});



// Main notifications schema for the array
const notificationSchema = new mongoose.Schema({
    token: { type: String, required: true },
    notification: notificationDetailSchema, // Embedded notification object
    data: {}, // Embedded data object
    timestamp: { type: Date, default: Date.now }, // Timestamp for each notification
});

const NotificationsSchema = new mongoose.Schema(
    {
        userId: { type: String, default: "" },
        notifications: [notificationSchema], // Array of notifications
    },
    { timestamps: true } // Timestamps for the document
);


module.exports = mongoose.model('Notifications', NotificationsSchema);

