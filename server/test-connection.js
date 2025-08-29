const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== MongoDB Connection Test ===');
console.log('Environment variables loaded:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGO_URI exists:', !!process.env.MONGO_URI);

if (process.env.MONGO_URI) {
  // Mask password for security
  const maskedUri = process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@');
  console.log('- Connection string (masked):', maskedUri);
}

console.log('\nAttempting to connect...');

const connectionOptions = {
  serverSelectionTimeoutMS: 10000, // Reduce timeout for faster feedback
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4
  bufferCommands: false
};

mongoose.connect(process.env.MONGO_URI, connectionOptions)
  .then(() => {
    console.log('✅ MongoDB connection successful!');
    console.log('Connected to database:', mongoose.connection.name || 'default');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB connection failed:');
    console.error('Error name:', err.name);
    console.error('Error message:', err.message);
    if (err.reason) {
      console.error('Error reason:', err.reason);
    }
    if (err.code) {
      console.error('Error code:', err.code);
    }
    process.exit(1);
  });

// Timeout after 15 seconds for faster feedback
setTimeout(() => {
  console.error('❌ Connection timeout after 15 seconds');
  process.exit(1);
}, 15000);
