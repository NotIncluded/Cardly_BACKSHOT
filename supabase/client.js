// supabase/client.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// If using Node < 18, include node-fetch:
const fetch = require('node-fetch');  // Only needed if Node.js version < 18

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, { fetch });

module.exports = { supabase };
