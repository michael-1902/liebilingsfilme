// Simple health check API
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  return res.json({
    status: 'API is working',
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    hasMongoUri: !!(process.env.MONGO_URI || process.env.MONGODB_URI),
    nodeEnv: process.env.NODE_ENV
  });
};
