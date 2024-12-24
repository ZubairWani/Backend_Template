const FcmToken = require("../models/FcmToken");
const Notification = require("../models/Notification");

const CreatePlayerNotification = async (data) => {
    try {
        const newNoti = {
            ...data,
            timestamp: new Date()
        };

        // Find or create the user's notification record
        const userNotification = await Notification.findOneAndUpdate(
            { userId: data?.data?.phone }, // Search for user by phone
            { $push: { notifications: newNoti } }, // Add new notification
            { new: true, upsert: true } // Create if it doesn't exist
        );

        return {
            status: 200,
            message: "Notification created successfully",
            notification: userNotification
        };
    } catch (error) {
        console.error('Error creating notification:', error);
        return {
            status: 500,
            message: "Internal Server Error",
            error: error.message
        };
    }
};


const PushNotification = async (data) => {
    try {
        const newNoti = {
            ...data,
            timestamp: new Date()
        };
        const playerNotification = await Notification.findOneAndUpdate(
            { userId: data?.data?.phone },
            { $push: { notifications: newNoti } },
            { new: true }
        )
        return {
            status: 200,
            message: "Notification added successfully"
        };
    } catch (error) {
        console.error(error);
        return { status: 500, message: error.message };
    }
}

const FetchPlayerNotification = async ({ phone }) => {
    try {
        const playerNotification = await Notification.findOne({ userId: phone })
        if (!playerNotification) return { status: 404, message: "Player Notifications not found" };

        return { status: 200, message: "Success", notification: playerNotification };
    } catch (error) {
        console.error(error);
        return { status: 500, message: error.message };
    }
}

const FetchFcmToken = async (phone) => {
    try {
        const existingFcmToken = await FcmToken.findOne({ phone });
        if (!existingFcmToken) return { status: 404, message: "FcmToken not found" };

        return { status: 200, message: "Success", token: existingFcmToken.token };
    } catch (error) {
        console.error(error);
        return { status: 500, message: error.message };
    }
}

module.exports = {
    FetchFcmToken,
    FetchPlayerNotification,
    CreatePlayerNotification,
    PushNotification
}