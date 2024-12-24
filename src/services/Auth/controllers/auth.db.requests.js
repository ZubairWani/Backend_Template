const AccessToken = require("../models/AccessToken");

const FetchAccessToken = async (phone, projection = '') => {
    try {
        const existingAccessToken = await AccessToken.findOne({ phone }).select(projection);
        if (!existingAccessToken) return { status: 404, message: "Access Token not found" };
        return { status: 200, message: "Success", accessToken: existingAccessToken.accessToken };
    } catch (error) {
        console.error(error);
        return { status: 500, message: error.message };
    }
};

module.exports = {
    FetchAccessToken
}