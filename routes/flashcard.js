const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User registered successfully
 *       400:
 *         description: Invalid input
 */

// Mock data store (replace with DB logic in real case)
let flashcards = [];
let idCounter = 1;

/**
 * @swagger
 * tags:
 *   name: Flashcards
 *   description: Flashcard management
 */

/**
 * @swagger
 * /flashcards:
 *   get:
 *     summary: Get all flashcards
 *     tags: [Flashcards]
 *     responses:
 *       200:
 *         description: A list of flashcards
 */

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

/**
 * @swagger
 * /flashcards:
 *   post:
 *     summary: Create a new flashcard
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [question, answer]
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       201:
 *         description: Flashcard created
 */

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

/**
 * @swagger
 * /flashcards/{id}:
 *   put:
 *     summary: Update a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Flashcard ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *     responses:
 *       200:
 *         description: Flashcard updated
 *       404:
 *         description: Flashcard not found
 */

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


/**
 * @swagger
 * /flashcards/{id}:
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: id
 *         schema:
 *           type: integer
 *         required: true
 *         description: Flashcard ID
 *     responses:
 *       204:
 *         description: Flashcard deleted
 *       404:
 *         description: Flashcard not found
 */

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