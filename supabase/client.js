// Do not delete this code, we will use it to connect to the Supabase database later.

// supabase/client.js
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// If using Node < 18, include node-fetch:
const fetch = require('node-fetch');  // Only needed if Node.js version < 18

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, { fetch });

module.exports = { supabase };

// supabase/client.js
// const { createClient } = require('@supabase/supabase-js');
// const prompt = require('prompt-sync')({ sigint: true });
// require("dotenv").config();

// // Preset API options (you can also load from a config file)
// const apiOptions = {
//   1: {
//     name: 'AIT',
//     url: process.env.SUPABASE_URL,
//     key: process.env.SUPABASE_KEY
//   },
//   2: {
//     name: 'Pun',
//     url: process.env.SUPABASE_URL_PUN,
//     key: process.env.SUPABASE_KEY_PUN
//   }
// };

// // Prompt user to select API
// console.log('Choose Supabase API:');
// console.log('1: AIT Supabase');
// console.log('2: Pun Supabase');
// const choice = prompt('Enter 1 or 2: ');

// const selected = apiOptions[choice];

// if (!selected) {
//   console.error('Invalid selection. Exiting...');
//   process.exit(1);
// }

// // Optional: Show selected config (avoid showing key in real projects)
// console.log(`Selected: ${selected.name}`);

// const fetch = require('node-fetch'); // For Node.js < 18
// const supabase = createClient(selected.url, selected.key, { fetch });

// module.exports = { supabase };
