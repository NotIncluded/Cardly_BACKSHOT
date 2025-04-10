const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Create a new record
router.post('/records', async (req, res) => {
  const { user_id, title } = req.body;

  if (!user_id || !title) {
    return res.status(400).json({ error: 'user_id and title are required' });
  }

  const { data, error } = await supabase
    .from('Record')
    .insert([{ User_ID: user_id, Title: title }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Record created successfully', data });
});

// Get all records for a user
router.get('/records/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('Record')
    .select('*')
    .eq('User_ID', user_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ records: data });
});

// Delete a record
router.delete('/records/:record_id', async (req, res) => {
  const { record_id } = req.params;

  const { error } = await supabase
    .from('Record')
    .delete()
    .eq('Record_ID', record_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Record deleted successfully' });
});

module.exports = router;
