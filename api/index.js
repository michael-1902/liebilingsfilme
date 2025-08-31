// NATIVE MONGODB - NO MONGOOSE BUFFERING
const { MongoClient } = require('mongodb');

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
    
    // GET movies
    if (method === 'GET' && url === '/api/movies') {
      const movieList = await movies.find({}).toArray();
      return res.json(movieList);
    }
    
    // POST movie
    if (method === 'POST' && url === '/api/movies') {
      const { title, description, year } = req.body;
      
      if (!title || !description || !year) {
        return res.status(400).json({ 
          error: 'Missing required fields: title, description, year' 
        });
      }
      
      const newMovie = {
        title,
        description,
        year: parseInt(year),
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await movies.insertOne(newMovie);
      const savedMovie = await movies.findOne({ _id: result.insertedId });
      
      return res.status(201).json(savedMovie);
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
