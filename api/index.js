// Vercel Serverless API Handler
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const moviesRouter = require('../server/routes/movies');

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes - handle both /api/movies and /movies patterns
app.use('/movies', moviesRouter);  // For requests that come as /api/movies -> /movies
app.use('/api/movies', moviesRouter); // For direct /api/movies requests

// Root route
app.get('/', (req, res) => {
  res.json({ message: 'Lieblingsfilme API läuft auf Vercel!' });
});

app.get('/api', (req, res) => {
  res.json({ message: 'Lieblingsfilme API läuft auf Vercel!' });
});

// MongoDB connection state
let isConnected = false;

// Database connection function
async function connectToDatabase() {
  if (isConnected) {
    return;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      family: 4
    });

    isConnected = true;
    console.log('MongoDB-Verbindung erfolgreich hergestellt (Vercel)');
  } catch (error) {
    console.error('MongoDB-Verbindungsfehler (Vercel):', error);
    throw error;
  }
}

// Main handler function
module.exports = async (req, res) => {
  try {
    // Ensure database connection
    await connectToDatabase();
    
    // Parse the URL to handle routing correctly
    const url = req.url || '';
    
    // Debug logging
    console.log('Incoming request:', {
      method: req.method,
      url: url,
      path: req.url
    });
    
    // If it's an API movies request, modify the URL to match our Express routes
    if (url.startsWith('/api/movies')) {
      // Remove /api prefix so it matches our Express routes
      req.url = url.replace('/api', '');
    } else if (url === '/api' || url === '/') {
      // Handle root API requests
      req.url = '/api';
    } else {
      // For any other path, assume it's meant for movies
      req.url = '/movies' + (url.startsWith('/') ? url : '/' + url);
    }
    
    console.log('Modified URL for Express:', req.url);
    
    // Handle the request with Express app
    return app(req, res);
  } catch (error) {
    console.error('API Handler Fehler:', error);
    return res.status(500).json({ 
      error: 'Interner Serverfehler',
      details: error.message 
    });
  }
};
