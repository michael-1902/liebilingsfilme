// NATIVE MONGODB - NO MONGOOSE BUFFERING
const { MongoClient, ObjectId } = require('mongodb');

let client = null;
let db = null;

async function connectDB() {
  if (db) return db;
  
  client = new MongoClient(process.env.MONGO_URI);
  await client.connect();
  db = client.db();
  return db;
}

module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

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
          const updatedMovie = await movies.findOneAndUpdate(
            { _id: new ObjectId(movieId) },
            { 
              title, 
              year: parseInt(year),
              updatedAt: new Date()
            },
            { returnDocument: 'after' }
          );
          
          console.log('Update result:', updatedMovie);
          
          if (!updatedMovie.value) {
            return res.status(404).json({ error: 'Movie not found' });
          }
          
          console.log('Movie updated successfully:', updatedMovie.value);
          return res.status(200).json(updatedMovie.value);
        } catch (error) {
          console.error('Update error:', error);
          return res.status(500).json({ error: 'Failed to update movie: ' + error.message });
        }
      }
      
      if (method === 'DELETE') {
        // Delete movie
        try {
          console.log('Attempting to delete movie with ID:', movieId);
          
          const deletedMovie = await movies.findOneAndDelete(
            { _id: new ObjectId(movieId) }
          );
          
          console.log('Delete result:', deletedMovie);
          
          if (!deletedMovie.value) {
            // Let's also try to find the movie to see if it exists
            const existingMovie = await movies.findOne({ _id: new ObjectId(movieId) });
            console.log('Movie exists check:', existingMovie);
            return res.status(404).json({ error: 'Movie not found' });
          }
          
          console.log('Movie deleted successfully:', deletedMovie.value);
          return res.status(200).json({ 
            message: 'Movie deleted successfully',
            deletedMovie: deletedMovie.value
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
    console.error('API Error:', error);
    res.status(500).json({ 
      error: 'Database error',
      message: error.message 
    });
  }
};
