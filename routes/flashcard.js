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

// Create a flashcard (remains the same)
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

// Get all flashcards for a record (you might not need this separate route anymore)
// router.get('/flashcards/:record_id', async (req, res) => { ... });

// Update a flashcard (remains the same)
router.put('/flashcards/:flashcard_num', async (req, res) => {
    const { flashcard_num } = req.params;
    const { question, answer, hint } = req.body;

    const { data, error } = await supabase
        .from('Flashcard')
        .update({ Question: question, Answer: answer, Hint: hint })
        .eq('Flashcard_Num', flashcard_num)
        .select()
        .single();

    if (error) return res.status(500).json({ error: error.message });

    res.status(200).json({ message: 'Flashcard updated', data });
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