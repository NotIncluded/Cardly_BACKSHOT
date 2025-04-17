const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Cover
 *   description: Cover resource management
 */

/**
 * @swagger
 * /cover/cover:
 *   get:
 *     summary: Get all covers
 *     tags: [Cover]
 *     responses:
 *       200:
 *         description: List of covers
 */

// Get covers with optional filter by record_id and search by title
router.get('/cover', async (req, res) => {
  const { record_id, query } = req.query;
  let supabaseQuery = supabase.from('Cover').select('*');

  // Filter by Record_ID if provided
  if (record_id) {
    supabaseQuery = supabaseQuery.eq('Record_ID', record_id);
  }

  // Search by Title if a query is provided (case-insensitive)
  if (query) {
    supabaseQuery = supabaseQuery.ilike('Title', `%${query}%`);
  }

  const { data, error } = await supabaseQuery;

  if (error) {
    console.error('Search/Filter error:', error);
    return res.status(500).json({ error: error.message });
  }

  res.status(200).json({ data });
});

/**
 * @swagger
 * /cover/cover:
 *   post:
 *     summary: Create a new cover
 *     tags: [Cover]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [record_id, title]
 *             properties:
 *               record_id:
 *                 type: string
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       201:
 *         description: Cover created successfully
 */

// Create a new cover (remains the same)
router.post('/cover', async (req, res) => {
  const { record_id, title, description } = req.body;

  if (!record_id || !title) {
    return res.status(400).json({ error: 'record_id and title are required' });
  }

  const { data, error } = await supabase
    .from('Cover')
    .insert([{ Record_ID: record_id, Title: title, Description: description || null }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Cover created successfully', data });
});

// Get a cover by record ID (you might not need this separate route anymore)
// router.get('/cover/:record_id', async (req, res) => { ... });

/**
 * @swagger
 * /cover/cover/{record_id}:
 *   put:
 *     summary: Update a cover
 *     tags: [Cover]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Cover ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Cover updated successfully
 */

// Update a cover by record ID (remains the same)
router.put('/cover/:record_id', async (req, res) => {
  const { record_id } = req.params;
  const { title, description } = req.body;

  const { data, error } = await supabase
    .from('Cover')
    .update({ Title: title, Description: description })
    .eq('Record_ID', record_id)
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Cover updated successfully', data });
});

/**
 * @swagger
 * /cover/cover/{record_id}:
 *   delete:
 *     summary: Delete a cover
 *     tags: [Cover]
 *     parameters:
 *       - in: path
 *         name: record_id
 *         schema:
 *           type: string
 *         required: true
 *         description: Cover ID
 *     responses:
 *       200:
 *         description: Cover deleted successfully
 */

// Optional: Delete a cover by record ID (remains the same)
router.delete('/cover/:record_id', async (req, res) => {
  const { record_id } = req.params;

  const { error } = await supabase
    .from('Cover')
    .delete()
    .eq('Record_ID', record_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ message: 'Cover deleted successfully' });
});

module.exports = router;