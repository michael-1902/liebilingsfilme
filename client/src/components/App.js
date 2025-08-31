import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MovieList from './components/MovieList';
import AddMovieForm from './components/AddMovieForm';
import './App.css';

// Basis-URL für unser Backend-API
const API_URL = 'https://lieblingsfilme.onrender.com/api/movies';

function App() {
  // State für das Array der Filme
  const [movies, setMovies] = useState([]);

  // useEffect-Hook, um Filme beim Laden der Komponente abzurufen
  useEffect(() => {
    getMovies();
  }, []);

  // --- API-Funktionen ---

  // Funktion, um alle Filme vom Backend zu holen
  const getMovies = async () => {
    try {
      const response = await axios.get(API_URL);
      setMovies(response.data); // State mit abgerufenen Filmen aktualisieren
    } catch (error) {
      console.error('Fehler beim Abrufen der Filme:', error);
    }
  };

  // Funktion, um einen neuen Film hinzuzufügen
  const addMovie = async (movie) => {
    try {
      const response = await axios.post(`${API_URL}/add`, movie);
      // Den neuen Film, der vom API zurückgegeben wird, zum lokalen State hinzufügen
      setMovies([...movies, response.data]);
    } catch (error) {
      console.error('Fehler beim Hinzufügen des Films:', error);
    }
  };

  // Funktion, um einen Film anhand seiner ID zu löschen
  const deleteMovie = async (id) => {
    try {
      await axios.delete(`${API_URL}/${id}`);
      // Den gelöschten Film aus dem lokalen State herausfiltern
      setMovies(movies.filter((movie) => movie._id !== id));
    } catch (error) {
      console.error('Fehler beim Löschen des Films:', error);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Meine Lieblingsfilme</h1>
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
