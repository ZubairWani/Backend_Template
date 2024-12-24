const mongoose = require("mongoose");
const dotenv = require('dotenv');
dotenv.config();

let connection;

const url = `mongodb+srv://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@cluster-node.zxi0k.mongodb.net/preprod?retryWrites=true&w=majority&appName=Cluster-Node'`
const dbConnect = async () => {
    if (connection) return;
    try {
        connection = await mongoose.connect(url, {
            serverSelectionTimeoutMS: 5000,
            socketTimeoutMS: 45000,
        });
        console.log("connected to db");
    } catch (error) {
        console.error("Database connection failed", error);
        throw error;
    }
};

module.exports = dbConnect;
