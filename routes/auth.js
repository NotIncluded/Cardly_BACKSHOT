// routes/auth.js
const express = require('express');
const bcrypt = require('bcrypt');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Check for all required fields
  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required' });
  }

// Check if the email already exists
const { data: existingUser, error: lookupError } = await supabase
  .from('User')
  .select('*')
  .eq('Email', email)
  .single();

// If user is found or query worked but returned a user
if (existingUser) {
  return res.status(400).json({ error: 'Email already registered' });
}

// Optional: Handle DB lookup errors
if (lookupError && lookupError.code !== 'PGRST116') {
  return res.status(500).json({ error: 'Database error when checking email' });
}


  // Hash the password with bcrypt
  const hashedPassword = await bcrypt.hash(password, 10);

  // Insert the new user into the database
  const { data, error } = await supabase
    .from('User')
    .insert([{ Name: name, Email: email, Password: hashedPassword }])
    .select()
    .single();

  if (error) {
    console.error('Insert Error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(201).json({ message: 'User registered successfully', data });
});

router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  // Check if all fields are present
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  // 1. Look up user by email
  const { data: user, error } = await supabase
    .from('User')
    .select('*')
    .eq('Email', email)
    .single();

  // If user not found or query failed
  if (!user || error) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // 2. Compare password using bcrypt
  const validPassword = await bcrypt.compare(password, user.Password);
  if (!validPassword) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // 3. Send back user info (without password)
  const { Password, ...userWithoutPassword } = user;

  res.status(200).json({
    message: 'Login successful',
    user: userWithoutPassword
  });
});

module.exports = router;
