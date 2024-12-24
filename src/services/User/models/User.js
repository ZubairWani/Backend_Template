const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        default: ""
    },
    age: {
        type: Number
    },
    phone: {
        type: String,
        required: true,
        unique: true,
        index: true // Indexing the phone for faster lookups
    },
    dp: {
        type: String,
        default: ""
    },
    dob: {
        type: String,
        default: ""
    },
    city: {
        type: String,
        default: "",
        index: true // Index for querying by city
    },
    gender: {
        type: String,
        default: ""
    },
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true,
            default: 'Point' // Default value set to 'Point'
        },
        coordinates: {
            type: [Number],
            required: true
        },
        address: { type: String, default: "" }
    },
    language: {
        type: String,
        default: "",
        index: true // Index for querying by language
    },
    token: {
        type: String,
        default: ""
    },
    role: {
        type: [String], // Array of strings
        default: ["user"],
        enum: ["user", "admin"] // Valid roles
    },
    country: {
        type: String,
        default: "",
        index: true // Index for querying by country
    },
    isAdmin: {
        type: Boolean,
        default: false,
        index: true // Index for filtering by admin status
    },
    Password: {type: String, default: ""}
},
    { timestamps: true }
);

// Compound index for frequently queried combinations
UserSchema.index({ phone: 1, isAdmin: 1 });

module.exports = mongoose.model("User", UserSchema);
