const User = require("../models/User");

const CreateNewUser = async (data) => {
    try {
        const { phone, name, dp, dob, city, gender, language, location } = data;
        const newUser = new User({ 
            phone, 
            name, 
            dob,
            dp,
            city, 
            gender, 
            language, 
            location
        });

        const savedUser = await newUser.save();

        return { status: 201, message: "User created successfully", User: savedUser };
    } catch (error) {
        console.error(error);
        return { status: 500, message: "Internal Server Error", error: error.message };
    }
};


const FetchUserByPhone = async (phone, projection = '') => {
    try {
        const existingUser = await User.findOne({ phone }).select(projection);

        if (!existingUser) return { status: 404, message: "User not found" };

        return { status: 200, message: "Success", User: existingUser };
    } catch (error) {
        console.error(error);
        return { status: 500, message: error.message };
    }
};


const FetchAllUsers = async ({ skip, limit }) => {
    try {
        const existingUsers = await User.find().skip(skip).limit(limit).lean().select('-followers -following -stats -profileVisitors')
        if (!existingUsers) return { "status": 404, "message": "Users not found" }
        const totalUsers = await User.countDocuments()
        return { "status": 200, "message": "success", "Users": existingUsers, totalUsers  }
    } catch (error) {
        console.log(error)
        return { "status": 500, "message": "Internal server error" }
    }
}


module.exports = {
    FetchUserByPhone,
    CreateNewUser,
    FetchAllUsers
};
