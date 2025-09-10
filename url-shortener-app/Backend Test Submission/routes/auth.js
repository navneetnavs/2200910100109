const express = require('express');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');

const router = express.Router();

// In-memory storage for registered users
const registeredUsers = new Map();

// Register route
router.post('/register', async (req, res) => {
  try {
    const { email, name, mobileNo, githubUsername, rollNo, accessCode } = req.body;

    // Validation
    if (!email || !name || !mobileNo || !githubUsername || !rollNo || !accessCode) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: email, name, mobileNo, githubUsername, rollNo, accessCode' 
      });
    }

    // Check if user already exists
    const existingUser = Array.from(registeredUsers.values()).find(user => 
      user.email === email || user.rollNo === rollNo || user.githubUsername === githubUsername
    );
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'User already exists with this email, roll number, or GitHub username' 
      });
    }

    // Create new user
    const clientID = uuidv4();
    const clientSecret = uuidv4();
    
    const user = {
      email, 
      name, 
      mobileNo, 
      githubUsername, 
      rollNo, 
      accessCode,
      clientID,
      clientSecret,
      createdAt: new Date()
    };
    
    registeredUsers.set(clientID, user);

    res.status(201).json({
      email: user.email,
      name: user.name,
      mobileNo: user.mobileNo,
      githubUsername: user.githubUsername,
      rollNo: user.rollNo,
      accessCode: user.accessCode,
      clientID: user.clientID,
      clientSecret: user.clientSecret
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ message: 'Server error during registration' });
  }
});

// Authentication route (Login)
router.post('/auth', async (req, res) => {
  try {
    const { email, name, rollNo, accessCode, clientID, clientSecret } = req.body;

    // Validation
    if (!email || !name || !rollNo || !accessCode || !clientID || !clientSecret) {
      return res.status(400).json({ 
        message: 'Please provide all required fields: email, name, rollNo, accessCode, clientID, clientSecret' 
      });
    }

    // Find user by matching credentials
    const user = registeredUsers.get(clientID);

    if (!user || 
        user.email !== email ||
        user.name !== name ||
        user.rollNo !== rollNo ||
        user.accessCode !== accessCode ||
        user.clientSecret !== clientSecret) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate JWT token
    const access_token = jwt.sign(
      { 
        clientID: user.clientID,
        email: user.email,
        rollNo: user.rollNo
      },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({
      token_type: "Bearer",
      access_token,
      expires_in: 604800 // 7 days in seconds
    });
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(500).json({ message: 'Server error during authentication' });
  }
});

// Export the registeredUsers map for other modules to access
router.registeredUsers = registeredUsers;

module.exports = router;
