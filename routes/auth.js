// routes/auth.js

const express = require('express');
const bcrypt = require('bcrypt');
const { supabase } = require('../supabase/client');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: 'smtp.office365.com',
  port: 587, // Use port 587 for STARTTLS
  secure: false, // Use TLS
  auth: {
    user: 'ait98763@gmail.com', // Your Microsoft 365 email address
    pass: 'qsfsplrfdqbryobd',     // The App password you created
  },
  tls: {
    ciphers: 'SSLv3', // Some older systems might require this
    rejectUnauthorized: false, // Only for development/testing, remove in production
  },
});

// Register route with email verification
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check if the email already exists
  const { data: existingUser, error: lookupError } = await supabase
    .from('User')
    .select('*')
    .eq('Email', email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (lookupError && lookupError.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Database error when checking email' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4(); // Generate a unique verification token

  // Insert the new user into the database with is_verified as false and the verification token
  const { data, error } = await supabase
    .from('User')
    .insert([{
      Name: name,
      Email: email,
      Password: hashedPassword,
      is_verified: false,
      verification_token: verificationToken,
    }])
    .select()
    .single();

  if (error) {
    console.error('Insert Error:', error);
    return res.status(500).json({ error: error.message });
  }

  // Send verification email
  const verificationLink = `${req.headers.origin}/verify-email?token=${verificationToken}`; // Adjust the URL as needed
  const mailOptions = {
    from: 'your_email@example.com', // Use your configured email
    to: email,
    subject: 'Verify Your Email Address',
    html: `<p>Thank you for registering! Please click the following link to verify your email address:</p><p><a href="${verificationLink}">${verificationLink}</a></p>`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error('Error sending verification email:', error);
      // Consider how you want to handle email sending failures (e.g., log, inform user).
    } else {
      console.log('Verification email sent:', info.response);
    }
  });

  res.status(201).json({ message: 'User registered successfully. Please check your email to verify your account.' });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .eq('Email', email)
    .single();

  if (!user || error) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Check if the user's email is verified
  if (!user.is_verified) {
    return res.status(401).json({ error: 'Please verify your email address before logging in.' });
  }

  const validPassword = await bcrypt.compare(password, user.Password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  const { Password, ...userWithoutPassword } = user;

  res.status(200).json({
    message: 'Login successful',
    user: userWithoutPassword
  });
});

// New route for verifying email
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Verification token is missing.' });
  }

  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .eq('verification_token', token)
    .single();

  if (error) {
    console.error('Error looking up user by token:', error);
    return res.status(500).json({ error: 'Internal server error.' });
  }

  if (!user) {
    return res.status(400).json({ error: 'Invalid verification token.' });
  }

  // Update user to set is_verified to true and clear the verification token
  const { error: updateError } = await supabase
    .from('User')
    .update({ is_verified: true, verification_token: null })
    .eq('id', user.id); // Assuming your User table has an 'id' primary key

  if (updateError) {
    console.error('Error updating user verification status:', updateError);
    return res.status(500).json({ error: 'Failed to verify email.' });
  }

  res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
  // You might want to redirect the user to a login page on your frontend here: res.redirect('/login');
});

module.exports = router;
