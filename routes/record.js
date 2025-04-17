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