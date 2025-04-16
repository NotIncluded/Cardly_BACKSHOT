const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Upsert a rating based on record_id (insert if new, update if exists)
router.post('/ratings', async (req, res) => {
  const { user_id, record_id, value } = req.body;

  if (!user_id || !record_id || !value) {
    return res.status(400).json({ error: 'user_id, record_id, and value are required' });
  }

  if (value < 1 || value > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  // Check if rating already exists for this record_id and user_id
  const { data: existing, error: lookupError } = await supabase
    .from('Rating')
    .select('*')
    .eq('User_ID', user_id)
    .eq('Record_ID', record_id)
    .single();

  if (lookupError && lookupError.code !== 'PGRST116') {
    return res.status(500).json({ error: 'Database lookup failed' });
  }

  let result;

  if (existing) {
    // Update existing rating for this record_id
    const { data, error } = await supabase
      .from('Rating')
      .update({ Value: value })
      .eq('User_ID', user_id)
      .eq('Record_ID', record_id)
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    result = { message: 'Rating updated successfully', data };
  } else {
    // Insert new rating for this record_id
    const { data, error } = await supabase
      .from('Rating')
      .insert([{ User_ID: user_id, Record_ID: record_id, Value: value }])
      .select()
      .single();

    if (error) return res.status(500).json({ error: error.message });

    result = { message: 'Rating submitted successfully', data };
  }

  res.status(200).json(result);
});

router.delete('/ratings', async (req, res) => {
  const { user_id, record_id } = req.body;

  if (!user_id || !record_id) {
    return res.status(400).json({ error: 'user_id and record_id are required' });
  }

  const { error } = await supabase
    .from('Rating')
    .delete()
    .match({ User_ID: user_id, Record_ID: record_id });

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Rating deleted successfully' });
});

// Get average rating of a record_id
router.get('/ratings/average/:record_id', async (req, res) => {
  const { record_id } = req.params;

  const { data, error } = await supabase
    .from('Rating')
    .select('Value')
    .eq('Record_ID', record_id);

  if (error) return res.status(500).json({ error: error.message });

  const values = data.map(r => r.Value);
  const average = values.length > 0
    ? values.reduce((a, b) => a + b) / values.length
    : null;

  res.status(200).json({
    record_id,
    average_rating: average ? average.toFixed(2) : 'No ratings yet',
    count: values.length
  });
});

module.exports = router;