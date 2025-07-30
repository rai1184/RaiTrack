const express = require('express');
const path = require('path'); // <-- make sure to require 'path' too
const app = express();
const PORT = 3000;
const User = require('./models/user'); // Imports the User model from models/user.js
const bcrypt = require('bcrypt'); // Import bcrypt library for hashing password securely
const session = require('express-session'); //imports the express-session middleware, which lets my server remember a user after they log in.
require('dotenv').config();
const Streak  = require('./models/streak');


// Allows the server to read data sent from HTML forms
app.use(express.urlencoded({extended: true})); // Middleware to parse form data (from POST requests like login or register forms)

// saving user's history
app.use(session({
secret: process.env.SESSION_SECRET, //  encrypts session info (stored on your server)
resave: false,
saveUninitialized: false,
cookie: { maxAge: 3600000 }  // stores a small ID in the user’s browser, The server uses this ID to identify the user and load their data
}));

const mongoose = require('mongoose');

mongoose.connect('mongodb+srv://arjun5438902:Anusatryusam0987@cluster0.fetugbq.mongodb.net/loginApp?retryWrites=true&w=majority&appName=Cluster0')
.then(() => console.log("Connected to MongoDB Atlas "))
.catch(err => console.error("MongoDB connection error :", err));


// 1️ Serve static files (JS, CSS, images)
app.use(express.static(path.join(__dirname, '..')));
 
// Serve login.html when visiting "/"
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'login.html'));
});

//  Serve register.html when visiting "/register"
app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'register.html'));
});


// register part;
app.post('/register', async (req, res) => {
  const { email, password } = req.body;
  console.log("Received registration request for:", email);

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    console.log("Email already registered:", email);
    return res.status(400).send('Email already registered.');
  }

  try {
    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the salt rounds 
    const newUser = new User({
      email,
      password : hashedPassword,
      isVerified: true // automatically verified
    });

    await newUser.save();

    res.send('Registration successful!');
  } catch (err) {
    console.error("Registration error:", err);
    res.status(500).send('Registration failed.');
  }
});

app.post('/login', async (req, res) =>{ 
  const {email, password} = req.body;
  try{
    const user = await User.findOne({email}); // look for user in the database
    if(!user) { // if no user found
        return res.status(400).send('Email not found. Please register your account.');
    }
    
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
      return res.status(400).send('Incorrect password.');
    }

    if(!user.isVerified){
      return res.status(403).send('Please verify your email first.');
    }

    req.session.userId = user._id; // save to session
    console.log("Session started for user:", req.session.userId);

    res.redirect('/dashboard');
  }
  catch(err) {
    console.error("Login error:", err);
    res.status(500).send("Login Failed.");
  }
});

app.get('/dashboard', (req, res) => {
  if(!req.session.userId) {
    return res.redirect('/');
  }
  res.sendFile(path.join(__dirname, '..', 'dashboard.html'));
});

//This defines a POST route that will be triggered when the user tries to mark a streak
app.post('/mark', async (req, res) => {
  // Checks if the user is logged in using express-session.
  if(!req.session.userId) {
    return res.status(401).send('You must be logged in.');
  }

  const userId = req.session.userId; // Gets the currently logged-in user's ID from the session.
  const category = req.body.customCategory || req.body.category;  // rabs the streak category the user wants to mark.Could be a predefined category or a custom one.
  
  // normalized today's date
  const today = new date();
  today.setHours(0,0,0,0);

  // now the logic
  try {
    let streak = await Streak.findOne({userId, category}); //Tries to find if a streak already exists for this user and this category
    
    if(!streak) { // if no streak found
      streak = new Streak({
      userId,
      category,
      streakCount: 1,
      lastMarkedDate: today,
      }); }
      else {  // if there is a previous streak
          
        // Normalize the saved date from the last time the streak was marked.
        const lastDate = new Date(streak.lastMarkedDate);
        lastDate.setHours(0, 0, 0, 0);
        // calculate how many days have passed since the last mark
        const diffTime = today.getTime() - lastDate.getTime();
        const diffDays = diffTime / (1000 * 60 * 60 * 24);

        if (diffDays === 1) {
        // Marked yesterday → increment streak
        streak.streakCount += 1;
        streak.lastMarkedDate = today;
      } else if (diffDays > 1) {
        // Missed a day → reset
        streak.streakCount = 1;
        streak.lastMarkedDate = today;
      } else {
        // Already marked today → no change
        return res.send('Already marked for today!');
      }
    }

    await streak.save();
    res.send('Marked successfully!');
  } catch (err) {
    console.error('Error marking streak:', err);
    res.status(500).send('Something went wrong.');
  }
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});

