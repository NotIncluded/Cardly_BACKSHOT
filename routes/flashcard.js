const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Create a flashcard
router.post('/flashcards', async (req, res) => {
  const { record_id, question, answer, hint } = req.body;

  if (!record_id || !question || !answer) {
    return res.status(400).json({ error: 'record_id, question, and answer are required' });
  }

  const { data, error } = await supabase
    .from('Flashcard')
    .insert([{ Record_ID: record_id, Question: question, Answer: answer, Hint: hint }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Flashcard created successfully', data });
});

// Get all flashcards for a record
router.get('/flashcards/:record_id', async (req, res) => {
  const { record_id } = req.params;

  const { data, error } = await supabase
    .from('Flashcard')
    .select('*')
    .eq('Record_ID', record_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ flashcards: data });
});

// Update a flashcard
router.put('/flashcards/:flashcard_id', async (req, res) => {
  const { flashcard_id } = req.params;
  const { question, answer, hint } = req.body;

  const { data, error } = await supabase
    .from('Flashcard')
    .update({ Question: question, Answer: answer, Hint: hint })
    .eq('Flashcard_ID', flashcard_id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Flashcard updated', data });
});

// Delete a flashcard
router.delete('/flashcards/:flashcard_id', async (req, res) => {
  const { flashcard_id } = req.params;

  const { error } = await supabase
    .from('Flashcard')
    .delete()
    .eq('Flashcard_ID', flashcard_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Flashcard deleted' });
});

module.exports = router;
