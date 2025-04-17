const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

/**
 * @swagger
 * /bookmarks/bookmarks:
 *   post:
 *     summary: Add a new bookmark
 *     tags: [Bookmark]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cover_id, user_id]
 *             properties:
 *               cover_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Bookmark added
 */

// Bookmark a cover
router.post('/bookmarks', async (req, res) => {
  const { user_id, cover_id } = req.body;

  if (!user_id || !cover_id) {
    return res.status(400).json({ error: 'user_id and cover_id are required' });
  }

  const { data, error } = await supabase
    .from('Bookmark')
    .insert([{ User_ID: user_id, Cover_ID: cover_id }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(201).json({ message: 'Cover bookmarked', data });
});

/**
 * @swagger
 * /bookmarks/bookmarks:
 *   delete:
 *     summary: Remove a bookmark
 *     tags: [Bookmark]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [cover_id, user_id]
 *             properties:
 *               cover_id:
 *                 type: string
 *               user_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Bookmark deleted successfully
 */

// Remove a bookmark
router.delete('/bookmarks', async (req, res) => {
  const { user_id, cover_id } = req.body;

  if (!user_id || !cover_id) {
    return res.status(400).json({ error: 'user_id and cover_id are required' });
  }

  const { data, error } = await supabase
    .from('Bookmark')
    .delete()
    .match({ User_ID: user_id, Cover_ID: cover_id })
    .select(); // Required to check if anything was deleted

  if (error) return res.status(500).json({ error: error.message });

  if (!data || data.length === 0) {
    return res.status(404).json({ error: 'Bookmark not found' });
  }

  res.status(200).json({ message: 'Bookmark deleted successfully' });
});

/**
 * @swagger
 * /bookmarks/bookmarks/{user_id}:
 *   get:
 *     summary: Get all bookmarks for a user
 *     tags: [Bookmark]
 *     parameters:
 *       - in: path
 *         name: user_id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of bookmarks
 */

// Get all bookmarks for a user
router.get('/bookmarks/:user_id', async (req, res) => {
  const { user_id } = req.params;

  const { data, error } = await supabase
    .from('Bookmark')
    .select(`
      Bookmark_ID,
      Cover:Cover_ID (
        Record_ID,
        Title,
        Description
      )
    `)
    .eq('User_ID', user_id);

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ bookmarks: data });
});

module.exports = router;
