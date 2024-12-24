const { FetchPlayerByPhone, CreateNewPlayer } = require("../../User/controllers/user.db.requests");
const AccessToken = require("../models/AccessToken");
const jwt = require('jsonwebtoken');
const { FetchAccessToken } = require("./auth.db.requests");
const { decrypt, generateJwToken } = require("../../../utils/utlis");

const GetPlayerAccessToken = async (req, res) => {
    // #swagger.tags = ['Auth']
    const { phone } = req.body;
    const { passkey } = req.headers

    try {
        if (!passkey) return res.status(401).json({ success: false, message: "Unauthorized, passKey required" });
        const iv = process.env.IV;
        const serverSidePasskey = process.env.PASS_KEY;
        try {
            const decryptedPassKey = decrypt(passkey, iv);
            if (serverSidePasskey !== decryptedPassKey) {
                return res.status(409).json({ success: false, message: "Unauthorized, PassKey did not match" });
            }
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized, Wrong passKey", success: false })
        }
        if (!phone) return res.status(400).json({ success: false, message: "Phone number is required" });

        const fieldsToExclude = '-followers -following -stats -profileVisitors';
        const result = await FetchPlayerByPhone(phone, fieldsToExclude);

        if (result.status !== 200) {
            return res.status(result.status || 500).json({
                success: false,
                message: result.status === 404
                    ? `Player not found with phone: ${phone}`
                    : result.message
            });
        }



        const accessResult = await FetchAccessToken(phone);

        if (accessResult.status !== 200) {
            return res.status(accessResult.status || 500).json({
                success: false,
                message: accessResult.status === 404
                    ? `AccessToken does not exist with phone: ${phone}`
                    : accessResult.message
            });
        }

        return res.status(200).json({
            success: true,
            message: "Success",
            // accessToken: accessResult.accessToken
            data: {
                accessToken: accessResult.accessToken
            }
        });
    } catch (error) {
        console.error('Error fetching player access token:', error); // Log the error for debugging
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



const refreshToken = async (req, res) => {
    // #swagger.tags = ['Auth']
    try {
        const { token } = req.body;
        const { passkey } = req.headers
        if (!passkey) return res.status(401).json({ success: false, message: "Unauthorized, passKey required" });
        const iv = process.env.IV;
        const serverSidePasskey = process.env.PASS_KEY;
        try {
            const decryptedPassKey = decrypt(passkey, iv);
            if (serverSidePasskey !== decryptedPassKey) {
                return res.status(409).json({ success: false, message: "Unauthorized, PassKey did not match" });
            }
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized, Wrong passKey", success: false })
        }
        if (!token) return res.status(401).json({ success: false, message: 'Refresh token is required' });



        const decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);

        const userAccessToken = await AccessToken.findOne({ refreshToken: token });
        if (!userAccessToken) {
            return res.status(401).json({ success: false, message: 'Invalid or revoked refresh token' });
        }

        const payload = { id: decoded.id, phone: decoded.phone, name: decoded.name };
        const newAccessToken = jwt.sign(payload, process.env.JWT_SEC, { expiresIn: '7d' });

        return res.status(201).json({ message: "success", success: true, data: { accessToken: newAccessToken } });
    } catch (error) {
        console.error(error);
        res.status(403).json({ success: false, message: 'Invalid refresh token' });
    }
};

const CheckUserAlreadyExists = async (req, res) => {
    // #swagger.tags = ['Auth']
    try {
        const { phone } = req.body;
        const { passkey } = req.headers

        if (!passkey) return res.status(401).json({ success: false, message: "Unauthorized, passKey required" });
        const iv = process.env.IV;
        const serverSidePasskey = process.env.PASS_KEY;
        try {
            const decryptedPassKey = decrypt(passkey, iv);
            if (serverSidePasskey !== decryptedPassKey) {
                return res.status(409).json({ success: false, message: "Unauthorized, PassKey did not match" });
            }
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized, Wrong passKey", success: false })
        }
        if (!phone) return res.status(400).json({ success: false, message: "phone number is required" });

        const fieldsToExclude = '-followers -following -stats -profileVisitors';
        const result = await FetchPlayerByPhone(phone, fieldsToExclude);

        if (result.status !== 200) {
            return res.status(200).json({
                success: true,
                status_code: 404,
                message: result.status === 404
                    ? `Player not found with phone: ${phone}`
                    : result.message
            });
        }
        // if status code 200 then user can register
        // if status code 409 then user already exists just do login

        return res.status(200).json({ success: false, status_code: 409, message: `Player already exists with phone: ${phone}` });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};


const SaveUser = async (req, res) => {
    // #swagger.tags = ['Players']
    try {
        const { phone, name, location, dp, dob, city, gender, language } = req.body;
        const { passkey } = req.headers

        if (!passkey) return res.status(401).json({ success: false, message: "Unauthorized, passKey required" });
        const iv = process.env.IV;
        const serverSidePasskey = process.env.PASS_KEY;
        try {
            const decryptedPassKey = decrypt(passkey, iv);
            if (serverSidePasskey !== decryptedPassKey) {
                return res.status(409).json({ success: false, message: "Unauthorized, PassKey did not match" });
            }
        } catch (error) {
            return res.status(401).json({ message: "Unauthorized, Wrong passKey", success: false })
        }

        if (!phone || !name) {
            return res.status(400).json({ success: false, message: "Phone and name are required" });
        }

        const fieldsToExclude = '-followers -following -stats -profileVisitors';
        const player = (await FetchPlayerByPhone(phone, fieldsToExclude)).player;

        if (player) {
            return res.status(400).json({ success: false, message: "Player already exists" });
        }

        if (!location || !location.coordinates || location.coordinates.length !== 2) {
            return res.status(400).json({
                success: false,
                message: "Valid location with coordinates [longitude, latitude] is required"
            });
        }

        const formattedLocation = {
            type: "Point",
            coordinates: location.coordinates,
            address: location.address || "" // Use address if provided
        };
        const newPlayerData = {
            phone,
            name,
            dp,
            dob,
            city,
            gender,
            language,
            location: formattedLocation
        };

        const newPlayer = (await CreateNewPlayer(newPlayerData)).player;

        // Run CreatePlayerStats and generateJwToken in parallel for better performance
        const [tokens] = await Promise.all([
            generateJwToken(newPlayer)
        ]);

        await AccessToken.create({ phone, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });

        return res.status(201).json({
            success: true,
            message: 'User created successfully',
            data: {
                user: newPlayer,
                accessToken: tokens.accessToken
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: process.env.NODE_ENV === 'production' ? 'An error occurred' : error.message
        });
    }
};


module.exports = {
    refreshToken,
    GetPlayerAccessToken,
    CheckUserAlreadyExists,
    SaveUser
}