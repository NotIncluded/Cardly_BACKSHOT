const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Post a rating
router.post('/ratings', async (req, res) => {
  const { user_id, flashcard_id, value } = req.body;

  if (!user_id || !flashcard_id || !value) {
    return res.status(400).json({ error: 'user_id, flashcard_id, and value are required' });
  }

  if (value < 1 || value > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  const { data, error } = await supabase
    .from('Rating')
    .insert([{ User_ID: user_id, Flashcard_ID: flashcard_id, Value: value }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Rating submitted', data });
});

// Get average rating of a flashcard
router.get('/ratings/average/:flashcard_id', async (req, res) => {
  const { flashcard_id } = req.params;

  const { data, error } = await supabase
    .from('Rating')
    .select('Value')
    .eq('Flashcard_ID', flashcard_id);

  if (error) return res.status(500).json({ error: error.message });

  const values = data.map(r => r.Value);
  const average = values.length > 0
    ? values.reduce((a, b) => a + b) / values.length
    : null;

  res.status(200).json({
    flashcard_id,
    average_rating: average ? average.toFixed(2) : 'No ratings yet',
    count: values.length
  });
});

module.exports = router;
