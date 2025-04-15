const express = require('express');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { supabase } = require('../supabase/client');
const { Resend } = require('resend');
const router = express.Router();

const resend = new Resend(process.env.RESEND_API_KEY);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Log in a user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */

// Register user with email verification
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

  // Check if email already exists
  const { data: existingUser, error: lookupError } = await supabase
    .from('User')
    .select('*')
    .eq('Email', email)
    .single();

  if (existingUser) {
    return res.status(400).json({ error: 'Email already registered' });
  }

  if (lookupError && lookupError.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Database error during lookup' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const verificationToken = uuidv4();

  const { data, error } = await supabase
    .from('User')
    .insert([{
      Name: name,
      Email: email,
      Password: hashedPassword,
      is_verified: false,
      verification_token: verificationToken
    }])
    .select()
    .single();

  if (error) {
    return res.status(500).json({ error: error.message });
  }

  // Build the verification link using your backend URL
  const backendURL = process.env.BACKEND_URL || 'http://localhost:3000';
  const verificationLink = `${backendURL}/auth/verify-email?token=${verificationToken}`;

  // Send the verification email using Resend
  const { error: emailError } = await resend.emails.send({
    from: 'Reggin Team <onboarding@resend.dev>',
    to: email,
    subject: 'Verify Your Email Address',
    html: `
      <h2>Welcome, ${name}!</h2>
      <p>Please verify your email by clicking this link:</p>
      <a href="${verificationLink}">${verificationLink}</a>
      <p>This link will only work once.</p>
    `
  });

  if (emailError) {
    console.error('Failed to send email:', emailError);
  }

  res.status(201).json({
    message: 'User registered. Please check your email to verify your account.'
  });
});

// Login route
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

  if (!user.is_verified) {
    return res.status(401).json({ error: 'Please verify your email before logging in.' });
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

// Email verification route
router.get('/verify-email', async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ error: 'Missing verification token.' });
  }

  // 1. Fetch user by token
  const { data: user, error: lookupError } = await supabase
    .from('User')
    .select('*')
    .eq('verification_token', token)
    .single();

  console.log('User from DB:', user);

  if (lookupError || !user) {
    return res.status(400).json({ error: 'Invalid or expired verification token.' });
  }

  // 2. Update row - verifying the exact column name is 'User_ID'
  const { error: updateError } = await supabase
    .from('User')
    .update({
      is_verified: true,
      verification_token: null
    })
    .eq('User_ID', user.User_ID);

  if (updateError) {
    return res.status(500).json({ error: 'Failed to verify email.' });
  }

  return res.status(200).json({ message: 'Email verified successfully! You can now log in.' });
});


module.exports = router;
