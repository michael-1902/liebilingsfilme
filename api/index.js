// Vercel Serverless API Handler - Direct MongoDB approach
const mongoose = require('mongoose');

// Import model
const Movie = require('../server/models/movie');

// MongoDB connection state
let isConnected = false;

// Database connection function with aggressive anti-buffering
async function connectToDatabase() {
  // Skip if already connected and ready
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log('Using existing MongoDB connection');
    return;
  }

  try {
    const uri = process.env.MONGO_URI;
    if (!uri) {
      throw new Error('MONGO_URI environment variable is not set');
    }

    console.log('Creating fresh MongoDB connection...');
    
    // Completely clean slate - disconnect everything
    if (mongoose.connections.length > 0) {
      await mongoose.disconnect();
      // Wait for complete disconnect
      await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Disable buffering at the schema level for this model
    Movie.schema.set('bufferCommands', false);
    
    // Connect with aggressive timeout settings
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 3000,
      socketTimeoutMS: 5000,
      connectTimeoutMS: 3000,
      maxPoolSize: 1,
      minPoolSize: 1,
      maxIdleTimeMS: 5000,
      bufferCommands: false,
      family: 4,
      directConnection: false,
    });
    
    // Wait for the connection to be fully established
    await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Connection verification timeout'));
      }, 2000);
      
      if (mongoose.connection.readyState === 1) {
        clearTimeout(timeout);
        resolve();
      } else {
        mongoose.connection.once('connected', () => {
          clearTimeout(timeout);
          resolve();
        });
      }
    });
    
    isConnected = true;
    console.log('MongoDB connected and verified successfully');
    
    // Handle disconnection events
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      isConnected = false;
    });
    
    mongoose.connection.on('error', (err) => {
      console.error('MongoDB connection error:', err);
      isConnected = false;
    });
    
  } catch (error) {
    isConnected = false;
    console.error('MongoDB connection failed:', error);
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
    // Connect to database with aggressive timeout
    console.log('Establishing database connection...');
    
    const connectionPromise = connectToDatabase();
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Connection timeout after 5 seconds')), 5000)
    );
    
    await Promise.race([connectionPromise, timeoutPromise]);
    
    // Triple-check connection is ready
    if (!isConnected || mongoose.connection.readyState !== 1) {
      throw new Error(`Database connection not ready. State: ${mongoose.connection.readyState}, isConnected: ${isConnected}`);
    }
    
    console.log('Database verified ready, processing request...');
    
    // Parse the URL to determine the action
    const url = req.url || '';
    const method = req.method;
    
    console.log('Processing request:', { method, url });
    
    // Handle different routes
    if (url === '/api/movies' || url === '/movies' || url === '/') {
      if (method === 'GET') {
        // Get all movies with immediate execution and no buffering
        console.log('Fetching all movies with direct query...');
        try {
          // Force immediate execution with timeout
          const queryPromise = Movie.find({}).maxTimeMS(3000).lean().exec();
          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Query timeout')), 4000)
          );
          
          const movies = await Promise.race([queryPromise, timeoutPromise]);
          console.log(`Successfully found ${movies.length} movies`);
          return res.status(200).json(movies);
        } catch (dbError) {
          console.error('Database query failed:', dbError);
          
          // Reset connection on query failure
          isConnected = false;
          
          return res.status(500).json({ 
            error: 'Failed to fetch movies',
            details: dbError.message,
            type: dbError.name || 'DatabaseError'
          });
        }
      }
      
      if (method === 'POST') {
        // Add new movie with immediate save
        console.log('Adding new movie...', req.body);
        try {
          const { title, description, year } = req.body;
          
          if (!title || !description || !year) {
            return res.status(400).json({ 
              error: 'Missing required fields',
              required: ['title', 'description', 'year']
            });
          }
          
          // Create and save immediately
          const newMovie = new Movie({ title, description, year });
          const savedMovie = await newMovie.save();
          
          console.log('Movie saved successfully:', savedMovie._id);
          return res.status(201).json(savedMovie);
        } catch (dbError) {
          console.error('Database save failed:', dbError);
          return res.status(500).json({ 
            error: 'Failed to save movie',
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
        try {
          const movie = await Movie.findById(movieId).maxTimeMS(5000).exec();
          if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          return res.status(200).json(movie);
        } catch (dbError) {
          console.error('Database error finding movie:', dbError);
          return res.status(500).json({ error: 'Failed to find movie', details: dbError.message });
        }
      }
      
      if (method === 'PUT') {
        // Update movie
        try {
          const { title, description, year } = req.body;
          const updatedMovie = await Movie.findByIdAndUpdate(
            movieId,
            { title, description, year },
            { new: true }
          ).maxTimeMS(5000).exec();
          
          if (!updatedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          return res.status(200).json(updatedMovie);
        } catch (dbError) {
          console.error('Database error updating movie:', dbError);
          return res.status(500).json({ error: 'Failed to update movie', details: dbError.message });
        }
      }
      
      if (method === 'DELETE') {
        // Delete movie
        try {
          const deletedMovie = await Movie.findByIdAndDelete(movieId).maxTimeMS(5000).exec();
          if (!deletedMovie) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          return res.status(200).json({ message: 'Movie deleted successfully' });
        } catch (dbError) {
          console.error('Database error deleting movie:', dbError);
          return res.status(500).json({ error: 'Failed to delete movie', details: dbError.message });
        }
      }
    }
    
    // Default response
    return res.status(200).json({ 
      message: 'Lieblingsfilme API is running on Vercel!',
      status: 'healthy',
      connection: isConnected ? 'connected' : 'disconnected',
      endpoints: [
        'GET /api/movies - Get all movies',
        'POST /api/movies - Add new movie',
        'GET /api/movies/:id - Get specific movie',
        'PUT /api/movies/:id - Update movie',
        'DELETE /api/movies/:id - Delete movie'
      ]
    });
    
  } catch (error) {
    console.error('API Handler Error:', error);
    
    // Reset connection state on error
    isConnected = false;
    
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};
