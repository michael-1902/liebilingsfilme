// Vercel Serverless API Handler
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// Import routes
const moviesRouter = require('../server/routes/movies');

// Import model to ensure it's registered
require('../server/models/movie');

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
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Database connection function
async function connectToDatabase() {
  if (cached.conn) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  if (!cached.promise) {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('Creating new MongoDB connection...');
    cached.promise = mongoose.connect(uri, {
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4,
      bufferCommands: false,
    });
  }

  try {
    cached.conn = await cached.promise;
    console.log('MongoDB-Verbindung erfolgreich hergestellt (Vercel)');
    return cached.conn;
  } catch (error) {
    cached.promise = null;
    console.error('MongoDB-Verbindungsfehler (Vercel):', error);
    throw error;
  }
}

// Main handler function
module.exports = async (req, res) => {
  // Set CORS headers for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Ensure database connection
    console.log('Connecting to database...');
    await connectToDatabase();
    console.log('Database connected successfully');
    
    // Parse the URL to handle routing correctly
    const url = req.url || '';
    
    // Debug logging
    console.log('Incoming request:', {
      method: req.method,
      url: url,
      headers: req.headers,
      body: req.method === 'POST' ? 'Has body' : 'No body'
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
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
