import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieList from './components/MovieList';
import AddMovieForm from './components/AddMovieForm';
import './App.css';

// The base URL for our backend API
const API_URL = 'https://lieblingsfilme.onrender.com/api/movies';

function App() {
  // State to hold the array of movies
  const [movies, setMovies] = useState([]);

  // useEffect hook to fetch movies when the component mounts
  useEffect(() => {
    getMovies();
  }, []);

  // --- API Functions ---

  // Function to fetch all movies from the backend
  const getMovies = async () => {
    try {
      const response = await axios.get(API_URL);
      setMovies(response.data); // Update state with fetched movies
    } catch (error) {
      console.error('Error fetching movies:', error);
    }
  };

  // Function to add a new movie
  const addMovie = async (movie) => {
    try {
      const response = await axios.post(`${API_URL}/add`, movie);
      // Add the new movie returned from the API to our local state
      setMovies([...movies, response.data]);
    } catch (error) {
      console.error('Error adding movie:', error);
    }
  };

  // Function to delete a movie by its ID
  const deleteMovie = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      // Filter out the deleted movie from our local state
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (error) {
      console.error('Error deleting movie:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>My Favorite Movies</h1>
      </header>
      <main className="App-main">
        <section className="add-movie-section">
          <AddMovieForm addMovie={addMovie} />
        </section>
        <section className="movie-list-section">
          <MovieList movies={movies} deleteMovie={deleteMovie} />
        </section>
      </main>
    </div>
  );
}

export default App;
