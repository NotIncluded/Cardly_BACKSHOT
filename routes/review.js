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

// GET flashcards for review from a specific record
router.get('/review/:record_id', async (req, res) => {
  const { record_id } = req.params;

  const { data, error } = await supabase
    .from('Flashcard')
    .select('Flashcard_ID, Question, Answer, Hint')
    .eq('Record_ID', record_id);

  if (error) {
    console.error('Review error:', error);
    return res.status(500).json({ error: error.message });
  }

  const values = data.map(r => r.Value);
  const average = values.length > 0
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : null;

  res.status(200).json({
    flashcard_id,
    average_rating: average ? average.toFixed(2) : 'No ratings yet',
    count: values.length
  });
});
module.exports = router;
