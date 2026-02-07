require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

const dramaRoutes = require('./routes/drama.routes');
const { errorHandler } = require('./utils/error-handler');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/api', dramaRoutes);

// Serve HTML files
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/drama/:id', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'drama-detail.html'));
});

// Fallback untuk preview URL dinamis (non-API)
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api')) {
    return next();
  }

  return res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint tidak ditemukan'
  });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🎬 FlickReels Drama Server berjalan di http://localhost:${PORT}`);
});

module.exports = app;
