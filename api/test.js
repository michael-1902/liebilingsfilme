// Simple test API function for debugging
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('=== TEST API CALL ===');
  console.log('Method:', req.method);
  console.log('URL:', req.url);
  console.log('Environment variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));

  try {
    // Test MongoDB connection
    const { MongoClient } = require('mongodb');
    
    const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return res.status(500).json({
        error: 'No MongoDB URI found',
        availableEnvVars: Object.keys(process.env).filter(key => key.includes('MONGO')),
        allEnvKeys: Object.keys(process.env).sort()
      });
    }

    console.log('Attempting MongoDB connection...');
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('MongoDB connected successfully');
    
    const db = client.db();
    const movies = db.collection('movies');
    const count = await movies.countDocuments();
    
    await client.close();
    
    return res.json({
      status: 'success',
      message: 'MongoDB connection working',
      movieCount: count,
      mongoUriExists: !!mongoUri,
      environment: process.env.NODE_ENV
    });

  } catch (error) {
    console.error('MongoDB test failed:', error);
    
    return res.status(500).json({
      error: 'MongoDB connection failed',
      message: error.message,
      mongoUriExists: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
      environment: process.env.NODE_ENV
    });
  }
};
