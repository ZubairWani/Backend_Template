const { SendNotification } = require("../../../utils/utlis");
const { FetchFcmToken } = require("../../Notification/controllers/notification.db.requests");
const User = require("../models/User");
const { FetchUserByPhone, FetchAllUsers } = require("./user.db.requests");



const UpdateUser = async (req, res) => {
    // #swagger.tags = ['Users']
    try {
        const { phone, ...updateData } = req.body;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone is required" });
        }

        const fieldsToExclude = '-followers -following -stats';
        const result = await FetchUserByPhone(phone, fieldsToExclude);

        if (result.status !== 200) {
            return res.status(result.status || 500).json({
                success: false,
                message: result.status === 404
                    ? `User not found with phone: ${phone}`
                    : result.message
            });
        }

        await User.updateOne({ phone }, { $set: updateData });
        return res.status(200).json({
            success: true,
            message: "Success"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const GetUserByPhone = async (req, res) => {
    // #swagger.tags = ['Users']
    try {
        const { phone } = req.query;
        if (!phone) {
            return res.status(400).json({ success: false, message: "Phone number is required" });
        }

        const fieldsToExclude = '-followers -following -stats';
        const result = await FetchUserByPhone(phone, fieldsToExclude);

        if (result.status !== 200) {
            return res.status(result.status || 500).json({
                success: false,
                message: result.status === 404
                    ? `User not found with phone: ${phone}`
                    : result.message
            });
        }

        const { User } = result;
        User.profileViews = User.profileVisitors.length;
        await User.save();

        return res.status(200).json({
            success: true,
            message: "Success",
            data: { User }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



const GetUserProfileByPhone = async (req, res) => {
    // #swagger.tags = ['Users']
    const { phone, toFind } = req.query;
    try {
        if (!phone || !toFind) {
            return res.status(400).json({ success: false, message: "Phone and toFind are required" });
        }

        const fieldsToExclude = '-followers -following -stats';
        const result = await FetchUserByPhone(toFind, fieldsToExclude);

        if (result.status === 404) {
            return res.status(404).json({ success: false, message: `User not found with phone: ${toFind}` });
        }

        const { User } = result;

        if (!User.profileVisitors.includes(phone)) {
            User.profileVisitors.push(phone);
            await User.save();
        }

        return res.status(200).json({
            success: true,
            message: "Success",
            data: { User }
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const UpdateUserDp = async (req, res) => {
    // #swagger.tags = ['Users']
    console.log("req.body", req.body);
    const { phone, url } = req.body;
    try {
        if (!phone || !url) {
            return res.status(400).json({ success: false, message: "Phone number and URL are required." });
        }

        const fieldsToExclude = '-followers -following -stats -profileVisitors';
        const result = await FetchUserByPhone(phone, fieldsToExclude);

        if (result.status !== 200) {
            return res.status(result.status || 500).json({
                success: false,
                message: result.status === 404
                    ? `User not found with phone: ${phone}`
                    : result.message
            });
        }

        const { User } = result;
        User.dp = url;
        await User.save();

        return res.status(200).json({
            success: true,
            message: "Success"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};



const GetAllUsers = async (req, res) => {
    // #swagger.tags = ['Users']
    const { page = 1, limit = 10 } = req.query;

    try {
        const skip = (page - 1) * limit;

        const result = await FetchAllUsers({ skip, limit: parseInt(limit) });

        if (!result || result.status !== 200) {
            return res.status(result?.status || 500).json({
                success: false,
                message: result?.status === 404
                    ? 'Users not found'
                    : result?.message || 'Error fetching Users',
            });
        }

        return res.status(200).json({
            success: true,
            message: "Success",
            data: { Users: result.Users },
            currentPage: parseInt(page),
            totalUsers: result.totalUsers || result.Users.length,
            totalPages: Math.ceil(result.totalUsers / limit)
        });
    } catch (error) {
        console.error('Error fetching Users:', error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message
        });
    }
};


const GetUsers = async (req, res) => {
    // #swagger.tags = ['Users']
    try {
        const result = await FetchAllUsers({ skip: 0, limit: 0 })
        if (result.status !== 200) {
            return res.status(result.status || 500).json({
                message: result.status === 404
                    ? "Users not found"
                    : result.message
            });
        }
        return res.status(200).json(result.Users)
    } catch (error) {
        return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
}

const FollowUser = async (req, res) => {
    // #swagger.tags = ['Users']
    const { phone, follower } = req.body;

    try {
        if (!phone || !follower) {
            return res.status(400).json({ success: false, message: "Phone and follower required" });
        }

        // Retrieve both Users in a single query
        const fieldsToExclude = '-stats -profileVisitors';
        const [ToFollow, followerUser] = await Promise.all([
            (await FetchUserByPhone(phone, fieldsToExclude)).User,
            (await FetchUserByPhone(follower, fieldsToExclude)).User
        ]);

        if (!ToFollow || !followerUser) {
            return res.status(404).json({ success: false, message: "User or Follower not found" });
        }

        // Check if already following
        const alreadyFollowing = ToFollow.followers.some(f => f._id.toString() === followerUser._id.toString());

        const followerData = {
            _id: followerUser._id,
            phone: followerUser.phone,
            name: followerUser.name,
            dp: followerUser.dp
        };

        const updateToFollow = alreadyFollowing
            ? { $pull: { followers: { _id: followerUser._id } } }
            : { $addToSet: { followers: followerData } };

        const updateFollower = alreadyFollowing
            ? { $pull: { following: { _id: ToFollow._id } } }
            : { $addToSet: { following: { _id: ToFollow._id, phone: ToFollow.phone, name: ToFollow.name, dp: ToFollow.dp } } };

        // Execute updates for both users atomically
        await Promise.all([
            User.findOneAndUpdate({ phone }, updateToFollow, { new: true }),
            User.findOneAndUpdate({ phone: follower }, updateFollower, { new: true })
        ]);

        if (!alreadyFollowing) {
            // Send notification only if a new follower is added
            const fcmTokenRes = await FetchFcmToken(ToFollow.phone);
            if (fcmTokenRes.status !== 200) {
                console.log("User fcm token not found");
            } else {
                const messageData = {
                    token: fcmTokenRes.token,  // FCM token of the device
                    notification: {
                        title: "New Follower",
                        body: `${followerData.name} started following you.`,
                    },
                    data: {
                        screen: "followersPage",
                        UserId: ToFollow._id.toString(),  // Assuming 'id' is the ObjectId
                        phone: phone
                    }
                };
                const result = await SendNotification(messageData);
                if (result.status !== 200) {
                    console.log(`Notification not sent, error: ${result.message}`);
                }
            }
            return res.status(201).json({ success: true, message: "Follower added successfully", data: { user: ToFollow } });
        } else {
            return res.status(200).json({ success: true, message: "Follower removed successfully", data: { user: ToFollow } });
        }
    } catch (error) {
        console.error('Error handling follow/unfollow:', error);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

module.exports = {
    GetUserByPhone,
    GetUserProfileByPhone,
    UpdateUserDp,
    GetAllUsers,
    GetUsers,
    FollowUser,
    UpdateUser
};
