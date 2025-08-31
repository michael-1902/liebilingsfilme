// Vercel Serverless API Handler - Direct approach
const mongoose = require('mongoose');

// Import model
const Movie = require('../server/models/movie');

// MongoDB connection state
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Database connection function
async function connectToDatabase() {
  if (cached.conn && cached.conn.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('Creating new MongoDB connection...');
    
    // Disconnect if there's an existing connection that's not ready
    if (cached.conn) {
      await mongoose.disconnect();
    }
    
    const connection = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      family: 4,
      bufferCommands: false,
      maxPoolSize: 1, // Limit connection pool size for serverless
    });

    cached.conn = connection;
    console.log('MongoDB-Verbindung erfolgreich hergestellt (Vercel)');
    console.log('Connection state:', mongoose.connection.readyState);
    return connection;
  } catch (error) {
    cached.conn = null;
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
    
    // Wait for connection to be ready
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for connection to be ready...');
      await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Database connection timeout'));
        }, 5000);
        
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
      });
    }
    
    console.log('Connection ready, processing request...');
    
    // Parse the URL to determine the action
    const url = req.url || '';
    const method = req.method;
    
    console.log('Processing request:', { method, url });
    
    // Handle different routes
    if (url === '/api/movies' || url === '/movies' || url === '/') {
      if (method === 'GET') {
        // Get all movies
        console.log('Fetching all movies...');
        try {
          const movies = await Movie.find().maxTimeMS(5000);
          console.log(`Found ${movies.length} movies`);
          return res.json(movies);
        } catch (dbError) {
          console.error('Database query error:', dbError);
          return res.status(500).json({ 
            error: 'Datenbankfehler beim Abrufen der Filme',
            details: dbError.message 
          });
        }
      }
      
      if (method === 'POST') {
        // Add new movie
        console.log('Adding new movie...', req.body);
        try {
          const { title, description, year } = req.body;
          
          if (!title || !description || !year) {
            return res.status(400).json({ 
              error: 'Fehlende Felder',
              required: ['title', 'description', 'year']
            });
          }
          
          const newMovie = new Movie({ title, description, year });
          const savedMovie = await newMovie.save();
          console.log('Movie saved:', savedMovie._id);
          return res.status(201).json(savedMovie);
        } catch (dbError) {
          console.error('Database save error:', dbError);
          return res.status(500).json({ 
            error: 'Datenbankfehler beim Speichern des Films',
            details: dbError.message 
          });
        }
      }
    }
    
    if (url.startsWith('/api/movies/') || url.startsWith('/movies/')) {
      const parts = url.split('/');
      const movieId = parts[parts.length - 1];
      
      if (method === 'GET') {
        // Get specific movie
        const movie = await Movie.findById(movieId);
        if (!movie) {
          return res.status(404).json({ error: 'Film nicht gefunden' });
        }
        return res.json(movie);
      }
      
      if (method === 'PUT') {
        // Update movie
        const { title, description, year } = req.body;
        const updatedMovie = await Movie.findByIdAndUpdate(
          movieId,
          { title, description, year },
          { new: true }
        );
        if (!updatedMovie) {
          return res.status(404).json({ error: 'Film nicht gefunden' });
        }
        return res.json(updatedMovie);
      }
      
      if (method === 'DELETE') {
        // Delete movie
        const deletedMovie = await Movie.findByIdAndDelete(movieId);
        if (!deletedMovie) {
          return res.status(404).json({ error: 'Film nicht gefunden' });
        }
        return res.json({ message: 'Film erfolgreich gelöscht' });
      }
    }
    
    // Default response
    return res.json({ 
      message: 'Lieblingsfilme API läuft auf Vercel!',
      availableEndpoints: [
        'GET /api/movies - Alle Filme abrufen',
        'POST /api/movies - Neuen Film hinzufügen',
        'GET /api/movies/:id - Einzelnen Film abrufen',
        'PUT /api/movies/:id - Film aktualisieren',
        'DELETE /api/movies/:id - Film löschen'
      ]
    });
    
  } catch (error) {
    console.error('API Handler Fehler:', error);
    return res.status(500).json({ 
      error: 'Interner Serverfehler',
      details: error.message
    });
  }
};
