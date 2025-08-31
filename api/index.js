// ULTRA SIMPLE - NO BUFFERING API
const mongoose = require('mongoose');

// Disable ALL buffering globally
mongoose.set('bufferCommands', false);

const Movie = require('../server/models/movie');

// Disable buffering on the model schema
Movie.schema.set('bufferCommands', false);

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // FORCE connection if not connected
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        bufferCommands: false
      });
    }

    const { method, url } = req;
    
    // GET movies
    if (method === 'GET' && url === '/api/movies') {
      const movies = await Movie.find().exec();
      return res.json(movies);
    }
    
    // POST movie
    if (method === 'POST' && url === '/api/movies') {
      const { title, description, year } = req.body;
      const movie = await Movie.create({ title, description, year });
      return res.status(201).json(movie);
    }
    
    res.json({ message: 'API Working' });
    
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: error.message });
  }
};
