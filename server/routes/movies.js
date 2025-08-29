// Import the Express library to create a router
const router = require('express').Router();

// Import the Movie model from our models folder
// This model allows us to interact with the 'movies' collection in MongoDB
let Movie = require('../models/movie.js');

// --- API Endpoints ---

// Endpoint: GET /api/movies/
// Description: Handles HTTP GET requests to fetch all movies from the database.
router.route('/').get(async (req, res) => {
  try {
    // Use the Movie model to find all documents in the movies collection
    const movies = await Movie.find();
    // Respond with the found movies in JSON format
    res.json(movies);
  } catch (err) {
    // If an error occurs, respond with a 400 status and the error message
    res.status(400).json('Error: ' + err);
  }
});

// Endpoint: POST /api/movies/add
// Description: Handles HTTP POST requests to add a new movie to the database.
router.route('/add').post(async (req, res) => {
  // Extract the title and year from the request body
  const { title, year } = req.body;

  // Create a new Movie instance with the extracted data
  const newMovie = new Movie({
    title,
    year,
  });

  try {
    // Save the new movie document to the database
    const savedMovie = await newMovie.save();
    // Respond with the newly created movie object
    res.json(savedMovie);
  } catch (err) {
    // If an error occurs, respond with a 400 status and the error message
    res.status(400).json('Error: ' + err);
  }
});

// Endpoint: PUT /api/movies/:id
// Description: Handles HTTP PUT requests to update an existing movie by its ID.
router.route('/:id').put(async (req, res) => {
  try {
    // Build an update object only with fields that were supplied
    const updateData = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      updateData.title = req.body.title;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'year')) {
      // convert to number when provided
      updateData.year = Number(req.body.year);
    }

    // If nothing to update, return 400
    if (Object.keys(updateData).length === 0) {
      return res.status(400).json('Error: No valid fields provided to update.');
    }

    // Find the movie by its ID and update it with new data
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return the updated document and run schema validations
    );

    if (!updatedMovie) {
      // If no movie was found with that ID, return a 404 error
      return res.status(404).json('Error: Movie not found.');
    }

    // Respond with the updated movie object
    res.json(updatedMovie);
  } catch (err) {
    // If an error occurs (e.g., invalid ID format or validation error), respond with a 400 status
    res.status(400).json('Error: ' + err);
  }
});

// Endpoint: DELETE /api/movies/:id
// Description: Handles HTTP DELETE requests to remove a movie by its ID.
router.route('/:id').delete(async (req, res) => {
  try {
    // Find the movie by its ID (from the URL parameter) and delete it
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      // If no movie was found with that ID, return a 404 error
      return res.status(404).json('Error: Movie not found.');
    }
    // Respond with a success message
    res.json('Movie deleted successfully.');
  } catch (err) {
    // If an error occurs (e.g., invalid ID format), respond with a 400 status
    res.status(400).json('Error: ' + err);
  }
});

// Export the router so it can be used in our main server.js file
module.exports = router;
