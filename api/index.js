// NATIVE MONGODB - NO MONGOOSE BUFFERING
const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  
  console.log('Connecting to MongoDB...');
  
  const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
  console.log('MongoDB URI exists:', !!mongoUri);
  console.log('MongoDB URI preview:', mongoUri ? mongoUri.substring(0, 20) + '...' : 'NOT FOUND');
  
  if (!mongoUri) {
    throw new Error('MONGO_URI environment variable is not set');
  }
  
  try {
    client = new MongoClient(mongoUri, {
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    
    await client.connect();
    console.log('MongoDB connected successfully');
    
    db = client.db();
    return db;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error;
  }
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('=== API CALL START ===');
  console.log('Environment check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);

  try {
    const database = await connectDB();
    const movies = database.collection('movies');
    
    const { method, url } = req;
    
    console.log('API Request:', { method, url, body: req.body });
    
    // GET movies - handle multiple URL patterns
    if (method === 'GET' && (url === '/api/movies' || url === '/' || url.startsWith('/api/movies'))) {
      const movieList = await movies.find({}).toArray();
      console.log('Found movies:', movieList.length);
      // Log movie IDs for debugging
      movieList.forEach(movie => {
        console.log('Movie ID:', movie._id, 'Type:', typeof movie._id, 'Title:', movie.title);
      });
      return res.json(movieList);
    }
    
    // POST movie - handle multiple URL patterns  
    if (method === 'POST' && (url === '/api/movies' || url === '/api/movies/add' || url.startsWith('/api/movies'))) {
      const { title, year } = req.body;
      
      console.log('Adding movie:', { title, year });
      
      if (!title || !year) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, year' 
        });
      }
      
      const newMovie = {
        title,
        year: parseInt(year),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await movies.insertOne(newMovie);
      const savedMovie = await movies.findOne({ _id: result.insertedId });
      
      console.log('Movie saved successfully:', savedMovie);
      return res.status(201).json(savedMovie);
    }
    
    // Handle movie ID-based operations (GET, PUT, DELETE by ID)
    if (url.includes('/api/movies/') && url !== '/api/movies/add') {
      const urlParts = url.split('/');
      const movieId = urlParts[urlParts.length - 1];
      
      console.log('Movie ID operation:', { method, movieId, url, urlParts });
      
      // Validate ObjectId format
      if (!ObjectId.isValid(movieId)) {
        console.log('Invalid ObjectId:', movieId);
        return res.status(400).json({ error: 'Invalid movie ID format' });
      }
      
      if (method === 'PUT') {
        // Update movie
        const { title, year } = req.body;
        
        console.log('Update request:', { movieId, title, year });
        
        if (!title || !year) {
          return res.status(400).json({ 
            error: 'Missing required fields: title, year' 
          });
        }
        
        try {
          const result = await movies.updateOne(
            { _id: new ObjectId(movieId) },
            { 
              $set: {
                title, 
                year: parseInt(year),
                updatedAt: new Date()
              }
            }
          );
          
          console.log('Update result:', result);
          
          if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          
          console.log('Movie updated successfully');
          return res.status(200).json({ message: 'Movie updated successfully' });
        } catch (error) {
          console.error('Update error:', error);
          return res.status(500).json({ error: 'Failed to update movie: ' + error.message });
        }
      }
      
      if (method === 'DELETE') {
        // Delete movie
        try {
          console.log('Attempting to delete movie with ID:', movieId);
          
          const result = await movies.deleteOne(
            { _id: new ObjectId(movieId) }
          );
          
          console.log('Delete result:', result);
          
          if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          
          console.log('Movie deleted successfully');
          return res.status(200).json({ 
            message: 'Movie deleted successfully'
          });
        } catch (error) {
          console.error('Delete error:', error);
          return res.status(500).json({ error: 'Failed to delete movie: ' + error.message });
        }
      }
      
      if (method === 'GET') {
        // Get single movie
        try {
          const movie = await movies.findOne({ _id: new ObjectId(movieId) });
          
          if (!movie) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          
          return res.status(200).json(movie);
        } catch (error) {
          console.error('Get movie error:', error);
          return res.status(500).json({ error: 'Failed to get movie: ' + error.message });
        }
      }
    }
    
    res.json({ 
      message: 'API Working - Native MongoDB',
      status: 'success'
    });
    
  } catch (error) {
    console.error('=== API ERROR ===');
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    console.error('Environment variables check:');
    console.error('MONGO_URI exists:', !!process.env.MONGO_URI);
    console.error('MONGODB_URI exists:', !!process.env.MONGODB_URI);
    
    res.status(500).json({ 
      error: 'Database error',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};
