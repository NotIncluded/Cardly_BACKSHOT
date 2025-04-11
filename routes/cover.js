const express = require('express');
const { supabase } = require('../supabase/client');
const router = express.Router();

// Create a new cover
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

// Get a cover by record ID
router.get('/cover/:record_id', async (req, res) => {
  const { record_id } = req.params;

  const { data, error } = await supabase
    .from('Cover')
    .select('*')
    .eq('Record_ID', record_id)
    .single();

  if (error) return res.status(500).json({ error: error.message });

  res.status(200).json({ data });
});

// Update a cover by record ID
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

// Optional: Delete a cover by record ID
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
