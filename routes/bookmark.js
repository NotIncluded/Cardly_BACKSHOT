const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Bookmark a flashcard
router.post('/bookmarks', async (req, res) => {
  const { user_id, flashcard_id } = req.body;

  if (!user_id || !flashcard_id) {
    return res.status(400).json({ error: 'user_id and flashcard_id are required' });
  }

  const { data, error } = await supabase
    .from('Bookmark')
    .insert([{ User_ID: user_id, Flashcard_ID: flashcard_id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Flashcard bookmarked', data });
});

// Get all bookmarks for a user
router.get('/bookmarks/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('Bookmark')
    .select('Bookmark_ID, Flashcard:Flashcard_ID(Flashcard_ID, Question, Answer, Hint, Record_ID)')
    .eq('User_ID', user_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ bookmarks: data });
});

module.exports = router;
