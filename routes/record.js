const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Record
 *   description: Record management
 */

/**
 * @swagger
 * /records/records:
 *   post:
 *     summary: Create a new record
 *     tags: [Record]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [user_id, category, status]
 *             properties:
 *               user_id:
 *                 type: string
 *               category:
 *                 type: string
 *               status:
 *                 type: string
 *     responses:
 *       201:
 *         description: Record created successfully
 */

// Create a new record
router.post('/records', async (req, res) => {
  const { user_id, category, status } = req.body;

  if (!user_id || !category || !status) {
    return res.status(400).json({ error: 'user_id, category, and status are required' });
  }

  const allowedStatuses = ['Private', 'Public'];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be either "Private" or "Public"' });
  }

  const { data, error } = await supabase
    .from('Record')
    .insert([{ User_ID: user_id, Category: category, Status: status }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Record created successfully', data });
});

/**
 * @swagger
 * /records/records/{user_id}:
 *   get:
 *     summary: Get all records
 *     tags: [Record]
 *     parameters:
 *      - in: path
 *        name: user_id
 *        schema:
 *          type: string
 *        required: true
 *        description: User ID
 *     responses:
 *       200:
 *         description: List of records
 *       500:
 *         description: Server error
 */

// Get all records for a user
router.get('/records/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('Record')
    .select('*')
    .eq('User_ID', user_id);

  if (error) return res.status(500).json({ records: data });

  res.status(200).json({ records: data });
});

/**
 * @swagger
 * /records/records/full/{user_id}:
 *   post:
 *     summary: Create a new Record with Cover and Flashcards
 *     tags: [Record]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         schema:
 *           type: string
 *         required: true
 *         description: The ID of the user creating the record
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *               - category
 *               - title
 *               - description
 *               - questions
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Private, Public]
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *                 description: Title for the cover
 *               description:
 *                 type: string
 *                 description: Description for the cover
 *               questions:
 *                 type: array
 *                 description: Array of flashcard objects
 *                 items:
 *                   type: object
 *                   required: [question, answer]
 *                   properties:
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     hint:
 *                       type: string
 *           example:
 *             status: Public
 *             category: Math
 *             title: Basic Addition
 *             description: A set of flashcards to practice simple addition
 *             questions:
 *               - question: What is 1 + 1?
 *                 answer: 2
 *                 hint: It's the first even number
 *               - question: What is 2 + 3?
 *                 answer: 5
 *                 hint: Think of counting fingers
 *     responses:
 *       201:
 *         description: Record, Cover, and Flashcards created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Record, Cover, and Flashcards created successfully
 *                 record:
 *                   type: object
 *                 cover:
 *                   type: object
 *                 flashcards:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: Missing or invalid request body fields
 *       500:
 *         description: Server error while creating record, cover, or flashcards
 */

// Create a Record, Cover, and Flashcards
router.post('/records/full/:user_id', async (req, res) => {
  const { status, category, title, description, questions } = req.body;
  const { user_id } = req.params;

  // Ensure required fields are provided
  if (!status || !category || !title || !description || !questions || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Status, category, title, description, and questions array are required' });
  }

  // Start a transaction to ensure both the Record, Cover, and Flashcards are created together
  const { data: recordData, error: recordError } = await supabase
    .from('Record')
    .insert([{ Status: status, Category: category, User_ID: user_id }])
    .select()
    .single();

  if (recordError) {
    console.error('Error creating record:', recordError);
    return res.status(500).json({ error: recordError.message });
  }

  // Create the Cover associated with the Record
  const { data: coverData, error: coverError } = await supabase
    .from('Cover')
    .insert([{ Record_ID: recordData.Record_ID, Title: title, Description: description }])
    .select()
    .single();

  if (coverError) {
    console.error('Error creating cover:', coverError);
    return res.status(500).json({ error: coverError.message });
  }

  // Create flashcards for each question, all linked to the same Record_ID
  const flashcardsData = questions.map((question) => ({
    Record_ID: recordData.Record_ID,
    Question: question.question,
    Answer: question.answer,
    Hint: question.hint,
  }));
 //fassfsaf

  // Insert all flashcards at once
  const { data: flashcardData, error: flashcardError } = await supabase
    .from('Flashcard')
    .insert(flashcardsData) // Insert an array of flashcards
    .select();

  if (flashcardError) {
    console.error('Error creating flashcards:', flashcardError);
    return res.status(500).json({ error: flashcardError.message });
  }

  // Respond with the created record, cover, and flashcards
  res.status(201).json({
    message: 'Record, Cover, and Flashcards created successfully',
    record: recordData,
    cover: coverData,
    flashcards: flashcardData,
  });
});

/**
 * @swagger
 * /records/records/full/{record_id}:
 *   patch:
 *     summary: Update record, cover, and individual flashcards
 *     tags: [Record]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the record to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [Private, Public]
 *               category:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               questions:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     flashcard_num:
 *                       type: integer
 *                       description: Flashcard number to update
 *                     question:
 *                       type: string
 *                     answer:
 *                       type: string
 *                     hint:
 *                       type: string
 *     responses:
 *       200:
 *         description: Record, Cover, and Flashcards updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 updatedFlashcards:
 *                   type: array
 *                   items:
 *                     type: object
 *       400:
 *         description: No updatable fields provided
 *       500:
 *         description: Server or database error
 */

// PATCH route to update Record, Cover, and individual Flashcards
router.patch('/records/full/:record_id', async (req, res) => {
  const { record_id } = req.params;
  const { status, category, title, description, questions } = req.body;

  // Validate: at least one field must be provided
  if (!status && !category && !title && !description && !questions) {
    return res.status(400).json({ error: 'At least one field is required for update' });
  }

  // Validate status if present
  const allowedStatuses = ['Private', 'Public'];
  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({ error: 'Status must be either "Private" or "Public"' });
  }

  // ---- Update Record Table ----
  const recordUpdates = {};
  if (status !== undefined) recordUpdates.Status = status;
  if (category !== undefined) recordUpdates.Category = category;

  if (Object.keys(recordUpdates).length > 0) {
    const { error: recordError } = await supabase
      .from('Record')
      .update(recordUpdates)
      .eq('Record_ID', record_id);

    if (recordError) {
      return res.status(500).json({ error: 'Failed to update record: ' + recordError.message });
    }
  }

  // ---- Update Cover Table ----
  const coverUpdates = {};
  if (title !== undefined) coverUpdates.Title = title;
  if (description !== undefined) coverUpdates.Description = description;

  if (Object.keys(coverUpdates).length > 0) {
    const { error: coverError } = await supabase
      .from('Cover')
      .update(coverUpdates)
      .eq('Record_ID', record_id);

    if (coverError) {
      return res.status(500).json({ error: 'Failed to update cover: ' + coverError.message });
    }
  }

  // ---- Update Flashcards Individually ----
  let updatedFlashcards = [];
  if (Array.isArray(questions)) {
    for (const q of questions) {
      if (!q.flashcard_num) continue; // Must provide flashcard_num to update

      const flashcardUpdates = {};
      if (q.question !== undefined) flashcardUpdates.Question = q.question;
      if (q.answer !== undefined) flashcardUpdates.Answer = q.answer;
      if (q.hint !== undefined) flashcardUpdates.Hint = q.hint;

      if (Object.keys(flashcardUpdates).length > 0) {
        const { data, error } = await supabase
          .from('Flashcard')
          .update(flashcardUpdates)
          .eq('Record_ID', record_id)
          .eq('Flashcard_Num', q.flashcard_num)
          .select()
          .single();

        if (error) {
          return res.status(500).json({ error: `Failed to update flashcard ${q.flashcard_num}: ${error.message}` });
        }

        updatedFlashcards.push(data);
      }
    }
  }

  // Response
  return res.status(200).json({
    message: 'Record, Cover, and Flashcards updated successfully',
    updatedFlashcards
  });
});

/**
 * @swagger
 * /records/records/{record_id}:
 *   delete:
 *     summary: Delete a record
 *     tags: [Record]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Record ID
 *     responses:
 *       200:
 *         description: Record deleted
 *       500:
 *         description: Server error
 */

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