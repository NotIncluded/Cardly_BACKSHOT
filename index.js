// index.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Optional root route for testing
app.get('/', (req, res) => {
  res.send('🚀 API is working!');
});

// Mount each route group under its own path
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes); // /auth/login, /auth/register

const recordRoutes = require('./routes/record');
app.use('/records', recordRoutes); // /records

const flashcardRoutes = require('./routes/flashcard');
app.use('/flashcards', flashcardRoutes); // /flashcards

const bookmarkRoutes = require('./routes/bookmark');
app.use('/bookmarks', bookmarkRoutes); // /bookmarks

const reviewRoutes = require('./routes/review');
app.use('/review', reviewRoutes); // /review/:record_id

const ratingRoutes = require('./routes/rating');
app.use('/ratings', ratingRoutes); // /ratings, /ratings/average/:id, /flashcards/top-rated

const coverRoutes = require('./routes/cover');
app.use('/cover', coverRoutes);
// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
