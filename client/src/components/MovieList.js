import React from 'react';
import MovieItem from './MovieItem';

// Diese Komponente zeigt die Liste der Filme an.
// Sie erhält das 'movies'-Array, die 'deleteMovie'-Funktion und die 'updateMovie'-Funktion von App.js.
function MovieList({ movies, deleteMovie, updateMovie }) {
  return (
    <div className="movie-list">
      {/* Wenn keine Filme vorhanden sind, zeige eine Nachricht an. Andernfalls die Liste rendern. */}
      {movies.length === 0 ? (
        <p>Noch keine Filme. Füge einen hinzu!</p>
      ) : (
        movies.map((movie) => (
          // Für jeden Film im Array wird eine MovieItem-Komponente gerendert
          <MovieItem key={movie._id} movie={movie} deleteMovie={deleteMovie} updateMovie={updateMovie} />
        ))
      )}
    </div>
  );
}

export default MovieList;
