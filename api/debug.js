// Simple debug endpoint for testing environment variables
module.exports = async (req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  console.log('=== DEBUG ENDPOINT ===');
  console.log('Environment variables check:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('MONGO_URI exists:', !!process.env.MONGO_URI);
  console.log('MONGODB_URI exists:', !!process.env.MONGODB_URI);
  console.log('All env vars:', Object.keys(process.env).filter(key => key.includes('MONGO')));

  return res.json({
    status: 'debug endpoint working',
    environment: process.env.NODE_ENV,
    mongoUriExists: !!process.env.MONGO_URI,
    mongodbUriExists: !!process.env.MONGODB_URI,
    allMongoEnvVars: Object.keys(process.env).filter(key => key.includes('MONGO')),
    timestamp: new Date().toISOString()
  });
};
