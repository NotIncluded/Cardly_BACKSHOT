const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Flashcards
 *   description: Flashcard management
 */

/**
 * @swagger
 * /flashcards/flashcards:
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
 * /flashcards/flashcards:
 *   post:
 *     summary: Create a new flashcard
 *     tags: [Flashcards]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [record_id, question, answer]
 *             properties:
 *               record_id:
 *                 type: string
 *                 description: ID of the related record
 *               question:
 *                 type: string
 *               answer:
 *                 type: string
 *               hint:
 *                 type: string
 *                 nullable: true
 *     responses:
 *       201:
 *         description: Flashcard created successfully
 *       400:
 *         description: Missing required fields
 *       500:
 *         description: Server error
 */


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

/**
 * @swagger
 * /flashcards/flashcards/{flashcard_num}/{record_id}:
 *   patch:
 *     summary: Update a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: flashcard_num
 *         schema:
 *           type: integer
 *         required: true
 *         description: Flashcard number to update
 *       - in: path
 *         name: record_id
 *         schema:
 *           type: string
 *         required: true
 *         description: ID of the associated record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               question:
 *                 type: string
 *                 description: Updated question text
 *               answer:
 *                 type: string
 *                 description: Updated answer text
 *               hint:
 *                 type: string
 *                 description: Updated hint text
 *             example:
 *               question: What is 2 + 2?
 *               answer: 4
 *               hint: Think of pairs
 *     responses:
 *       200:
 *         description: Flashcard updated
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 data:
 *                   type: object
 *       400:
 *         description: At least one field to update is required
 *       500:
 *         description: Internal server error
 */

// Update a flashcard (remains the same)
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

/**
 * @swagger
 * /flashcards/flashcards/{record_id}:
 *  get:
 *    summary: Get flashcards by record ID
 *    tags: [Flashcards]
 *    parameters:
 *      - in: path
 *        name: record_id
 *        required: true
 *        schema:
 *          type: string
 *    responses:
 *      200:
 *        description: List of flashcards for the specified record ID
 *      500:
 *        description: Server error
 */

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

/**
 * @swagger
 * /flashcards/flashcards/{flashcard_num}:
 *   delete:
 *     summary: Delete a flashcard
 *     tags: [Flashcards]
 *     parameters:
 *       - in: path
 *         name: flashcard_num
 *         schema:
 *           type: string
 *         required: true
 *         description: Flashcard ID
 *     responses:
 *       204:
 *         description: Flashcard deleted
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