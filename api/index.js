// Simple and Reliable Vercel API Handler
const mongoose = require('mongoose');
const Movie = require('../server/models/movie');

// Simple connection function
async function ensureConnection() {
  if (mongoose.connection.readyState === 1) {
    return; // Already connected
  }
  
  if (mongoose.connection.readyState === 2) {
    // Currently connecting, wait for it
    await new Promise(resolve => {
      mongoose.connection.once('connected', resolve);
    });
    return;
  }
  
  // Connect fresh
  await mongoose.connect(process.env.MONGO_URI, {
    bufferCommands: false
  });
}

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Simple connection
    await ensureConnection();
    
    const { method, url } = req;
    
    // GET /api/movies - Get all movies
    if (method === 'GET' && (url === '/api/movies' || url === '/')) {
      const movies = await Movie.find();
      return res.json(movies);
    }
    
    // POST /api/movies - Add movie
    if (method === 'POST' && url === '/api/movies') {
      const { title, description, year } = req.body;
      const movie = new Movie({ title, description, year });
      const saved = await movie.save();
      return res.status(201).json(saved);
    }
    
    // Default response
    res.json({ 
      message: 'API Working',
      endpoints: ['GET /api/movies', 'POST /api/movies']
    });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Server Error',
      message: error.message 
    });
  }
};
