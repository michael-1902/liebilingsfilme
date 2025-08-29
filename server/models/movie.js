// Import the Mongoose library
const mongoose = require('mongoose');

// Get the Schema constructor from Mongoose
const Schema = mongoose.Schema;

// --- Define the Movie Schema ---
// This schema defines the structure of a movie document in the MongoDB collection.
const movieSchema = new Schema({
  // 'title' field:
  // - Type must be a String.
  // - It is a required field, meaning every movie document must have a title.
  // - The 'trim' option removes any leading/trailing whitespace.
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // 'year' field:
  // - Type must be a Number.
  // - It is a required field.
  year: {
    type: Number,
    required: true,
  },
}, {
  // --- Schema Options ---
  // 'timestamps: true' automatically adds 'createdAt' and 'updatedAt' fields
  // to the document. This is useful for tracking when a document was created or modified.
  timestamps: true,
});

// --- Create the Model ---
// The mongoose.model() function compiles the schema into a model.
// A model is a class with which we construct documents.
// The first argument is the singular name of the collection your model is for.
// Mongoose automatically looks for the plural, lowercased version of your model name.
// Thus, for the model 'Movie', the collection will be 'movies'.
const Movie = mongoose.model('Movie', movieSchema);

// Export the Movie model so it can be used in other parts of the application (like our routes).
module.exports = Movie;
