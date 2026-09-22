/**
 * LessonCraft AI - Express Backend Server
 */

const path = require('path');
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const lessonRoutes = require('./routes/lessonRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Serve static frontend assets from public/ directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api', lessonRoutes);

// Fallback to index.html for SPA page routing
app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ success: false, error: 'API route not found' });
  }
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Start Express Server
app.listen(PORT, () => {
  console.log(`===================================================`);
  console.log(`🚀 LessonCraft AI Server is running!`);
  console.log(`🌐 Application URL: http://localhost:${PORT}`);
  console.log(`⚡ Gemini API Status: ${process.env.GEMINI_API_KEY ? 'Configured' : 'Demo/Fallback Mode (Add GEMINI_API_KEY in .env)'}`);
  console.log(`===================================================`);
});
