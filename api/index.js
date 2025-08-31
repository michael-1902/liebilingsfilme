// Vercel Serverless API Handler - Robust version
const mongoose = require('mongoose');

// Import model
const Movie = require('../server/models/movie');

// MongoDB connection state
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

// Validate environment variables
function validateEnvironment() {
  const requiredVars = ['MONGO_URI'];
  const missing = requiredVars.filter(varName => !process.env[varName]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  console.log('Environment variables validated successfully');
}

// Database connection function
async function connectToDatabase() {
  if (cached.conn && mongoose.connection.readyState === 1) {
    console.log('Using cached MongoDB connection');
    return cached.conn;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('Creating new MongoDB connection...');
    
    // Ensure clean connection state
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
    }
    
    // Mongoose connection options for serverless environment
    const connectionOptions = {
      serverSelectionTimeoutMS: 10000, // Increased timeout
      socketTimeoutMS: 45000,
      connectTimeoutMS: 10000,
      family: 4, // Force IPv4
      bufferCommands: false, // Disable mongoose buffering
      maxPoolSize: 1, // Limit connection pool for serverless
      minPoolSize: 0,
      maxIdleTimeMS: 30000,
      waitQueueTimeoutMS: 10000,
    };

    const connection = await mongoose.connect(uri, connectionOptions);
    
    cached.conn = connection;
    console.log('MongoDB connection established successfully');
    console.log('Connection state:', mongoose.connection.readyState);
    
    return connection;
  } catch (error) {
    cached.conn = null;
    cached.promise = null;
    console.error('MongoDB connection error:', error);
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
    // Validate environment variables first
    validateEnvironment();
    
    // Ensure database connection
    console.log('Connecting to database...');
    await connectToDatabase();
    
    // Additional connection readiness check
    if (mongoose.connection.readyState !== 1) {
      console.log('Waiting for connection to be ready...');
      let retries = 3;
      while (mongoose.connection.readyState !== 1 && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        retries--;
      }
      
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database connection not ready after retries');
      }
    }
    
    console.log('Database connection ready, processing request...');
    
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
          // Ensure connection is ready before query
          if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
          }
          
          const movies = await Movie.find()
            .maxTimeMS(10000)
            .lean() // Return plain JavaScript objects instead of Mongoose documents
            .exec();
          
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
          // Ensure connection is ready before save
          if (mongoose.connection.readyState !== 1) {
            throw new Error('Database connection not ready');
          }
          
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
