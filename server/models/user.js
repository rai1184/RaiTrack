// Import mongoose to interact with MongoDB
const mongoose = require('mongoose');

// Define a sub schema for streak tracking
const streakSchema = new mongoose.Schema ({  
    category: {type: String, required: true}, //e.g, gym, study
    count: {type: Number, default: 0}, // how many days in a row
    lastMarkedDate: {type: Date, default: null}, // when was it last marked
});

// Define a schema (structure) for the User collection
const userSchema = new mongoose.Schema({
    email: {    // User's email is required and must be unique
        type: String,
        required: true,
        unique: true,
    },

    password: {   // User's password is required
        type: String,
        required: true,
    },

    isVerified: {
        type: Boolean,
        default: false,  // user starts off as unverified

    },

    verificationToken: {
        type: String,
    },
     streaks: [streakSchema]
});

// Create a User model from the schema
const User = mongoose.model('User', userSchema);

// Export the model so it can be used in other files
module.exports = User;