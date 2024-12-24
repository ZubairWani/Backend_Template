const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const crypto = require('crypto');
const { FetchPlayerNotification, CreatePlayerNotification, PushNotification } = require('../services/Notification/controllers/notification.db.requests');
const { admin } = require('../services/Notification/controllers/notification.controller');
dotenv.config();

const CreateEpocId = (phone) => {
    const currentTime = new Date().getTime();
    return (`${phone}-${currentTime}`)
}

const generateJwToken = (player) => {
    const payload = {
        id: player._id,
        phone: player.phone,
        name: player.name
    };
    const accessToken = jwt.sign(payload, process.env.JWT_SEC, { expiresIn: '7d' });
    const refreshToken = jwt.sign(payload, process.env.JWT_REFRESH_SEC, { expiresIn: '30d' });

    return { accessToken, refreshToken };
};


const SendNotification = async (messageData) => {
    try {
        // Send notification via Firebase
        await admin.messaging().send(messageData);

        const notiRes = await FetchPlayerNotification(messageData?.data?.phone)
        if (notiRes.status === 404) await CreatePlayerNotification(messageData)
        else await PushNotification(messageData)

        return {
            status: 200,
            message: "Notification sent successfully"
        };
    } catch (error) {
        return { status: 500, message: error.message }
    }
}



const algorithm = process.env.ALOGRITHM;
const secretKey = Buffer.from(process.env.AUTH_SECRET_KEY, 'hex');

// Function to encrypt data
const encrypt = (text) => {
    
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, secretKey, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return {
        iv: iv.toString('hex'),
        encryptedData: encrypted 
    };
}


// Function to decrypt data
const decrypt = (encryptedData, ivHex) => {
    const decipher = crypto.createDecipheriv(algorithm, secretKey, Buffer.from(ivHex, 'hex'));
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}

const SendWhatsappMessage = async ({ phoneNumber, message }) => {
    try {
        const response = await axios.post("https://marketing.otpless.app/v1/api/send",
            {
                sendTo: `+${phoneNumber}`,
                channel: "WHATSAPP",
                message: message,
            },
            {
                headers: {
                    clientId: process.env.OTPLESS_CLIENT_ID,
                    clientSecret: process.env.OTPLESS_CLIENT_SECRET,
                    'Content-Type': 'application/json',
                },
            }
        );
        console.log(response.data);
        return response.data;
    } catch (error) {
        console.error("Error sending WhatsApp message:", error.response?.data || error.message);
    }
};

module.exports = {
    CreateEpocId,
    generateJwToken,
    SendNotification,
    encrypt,
    decrypt,
    SendWhatsappMessage
}