// Import required packages
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// In production, environment variables are provided by the hosting platform
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Only load .env in development
}

// Initialize the Express app
const app = express();

// Middleware
app.use(cors()); // Enable Cross-Origin Resource Sharing
app.use(express.json()); // Enable the express app to parse JSON formatted request bodies

// --- API Routes ---
// Import the movies router
const moviesRouter = require('./routes/movies');
// Use the movies router for any requests to '/api/movies'
// For example, a GET request to '/api/movies' will be handled by the router.
app.use('/api/movies', moviesRouter);


// Define the port the server will run on
// It will use the PORT from the .env file, or 5001 if it's not defined
const PORT = process.env.PORT || 5001;

// A simple route for testing the server
app.get('/', (req, res) => {
  res.send('Wir testen den Movies-App-Server!');
});

// --- MongoDB Connection ---
// Get the connection string from the environment variables
const uri = process.env.MONGO_URI;

console.log('Attempting to connect to MongoDB...');
console.log('MONGO_URI exists:', !!uri);

if (!uri) {
  console.error('MONGO_URI environment variable is not set!');
  process.exit(1);
}

// Connect to MongoDB using Mongoose
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => {
    console.log('MongoDB connection established successfully');
    // Start the server only after the database connection is successful
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
    process.exit(1);
  });
