const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Get flashcards with search and filter options
router.get('/flashcards', async (req, res) => {
    const { record_id, query } = req.query;
    let supabaseQuery = supabase.from('Flashcard').select('*');

    // Filter by Record_ID if provided
    if (record_id) {
        supabaseQuery = supabaseQuery.eq('Record_ID', record_id);
    }

    // Search across Question, Answer, and Hint if a query is provided
    if (query) {
        supabaseQuery = supabaseQuery.or(`Question.ilike.%${query}%,Answer.ilike.%${query}%,Hint.ilike.%${query}%`);
    }

    const { data, error } = await supabaseQuery;

    if (error) {
        console.error('Search/Filter error:', error);
        return res.status(500).json({ error: error.message });
    }

    res.status(200).json({ flashcards: data });
});

// Create a flashcard with sequential Flashcard_Num per Record_ID
router.post('/flashcards', async (req, res) => {
    const { record_id, question, answer, hint } = req.body;
  
    if (!record_id || !question || !answer) {
      return res.status(400).json({ error: 'record_id, question, and answer are required' });
    }
  
    try {
      // 1. Get the count of existing flashcards for this Record_ID
      const { data: existingFlashcards, error: countError } = await supabase
        .from('Flashcard')
        .select('Flashcard_Num')
        .eq('Record_ID', record_id);
  
      if (countError) {
        return res.status(500).json({ error: 'Failed to fetch existing flashcard count' });
      }
  
      // 2. Determine the next Flashcard_Num
      const nextFlashcardNum = existingFlashcards.length > 0
        ? Math.max(...existingFlashcards.map(fc => fc.Flashcard_Num)) + 1
        : 1;
  
      // 3. Insert the new flashcard with the calculated Flashcard_Num
      const { data, error: insertError } = await supabase
        .from('Flashcard')
        .insert([{
          Record_ID: record_id,
          Flashcard_Num: nextFlashcardNum,
          Question: question,
          Answer: answer,
          Hint: hint,
        }])
        .select()
        .single();
  
      if (insertError) {
        return res.status(500).json({ error: insertError.message });
      }
  
      res.status(201).json({ message: 'Flashcard created successfully', data });
  
    } catch (error) {
      console.error('Error creating flashcard:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });


// Get all flashcards for a record (you might not need this separate route anymore)
// router.get('/flashcards/:record_id', async (req, res) => { ... });

router.patch('/flashcards/:flashcard_num/:record_id', async (req, res) => {
    const { flashcard_num, record_id } = req.params;
    const { question, answer, hint } = req.body;
  
    // Ensure at least one field to update is provided
    if (!question && !answer && !hint) {
      return res.status(400).json({ error: 'At least one field to update is required' });
    }
  
    const updates = {};
    if (question !== undefined) updates.Question = question;
    if (answer !== undefined) updates.Answer = answer;
    if (hint !== undefined) updates.Hint = hint;
  
    const { data, error } = await supabase
      .from('Flashcard')
      .update(updates)
      .eq('Flashcard_Num', flashcard_num)
      .eq('Record_ID', record_id)
      .select()
      .single();
  
    if (error) return res.status(500).json({ error: error.message });
  
    res.status(200).json({ message: 'Flashcard updated', data });
  });  

// Get flashcards by record_id
router.get('/flashcards/:record_id', async (req, res) => {
    const { record_id } = req.params;
  
    const { data, error } = await supabase
      .from('Flashcard')
      .select('*')
      .eq('Record_ID', record_id);
  
    if (error) return res.status(500).json({ error: error.message });
  
    res.status(200).json({ data });
  });
  

// Delete a flashcard (remains the same)
router.delete('/flashcards/:flashcard_num', async (req, res) => {
    const { flashcard_num } = req.params;

    const { error } = await supabase
        .from('Flashcard')
        .delete()
        .eq('Flashcard_Num', flashcard_num);

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Flashcard deleted' });
});

module.exports = router;