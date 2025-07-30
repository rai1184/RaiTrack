const mongoose = require('mongoose');

// Define the schema for a habit streak
const streakSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',   // Reference to the User model
        required: true,
    },

    category: {
        type: String,   // e.g., "Gym", "Study", or any custom input
        required: true,
    },

    streakCount: {
        type: Number,
        default: 1, // starts at 1 when user first marks a day
    },

    lastMarkedDate: {
    type: Date,
    required: true,
  }

});

// creat the model from schema
const Streak = mongoose.model('Streak', streakSchema);

// Export so that it can be use in app.js
module.exports = Streak;