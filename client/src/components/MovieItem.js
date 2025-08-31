import React, { useState } from 'react';

// Diese Komponente zeigt die Details eines einzelnen Films an.
// Sie erhält das 'movie'-Objekt, die 'deleteMovie'-Funktion und die 'updateMovie'-Funktion von MovieList.js.
function MovieItem({ movie, deleteMovie, updateMovie }) {
  // State für den Bearbeitungsmodus
  const [isEditing, setIsEditing] = useState(false);
  // State für die bearbeiteten Werte
  const [editTitle, setEditTitle] = useState(movie.title);
  const [editYear, setEditYear] = useState(movie.year);

  // Funktion zum Speichern der Änderungen
  const handleSave = () => {
    // Einfache Validierung
    if (!editTitle || !editYear) return;
    
    // Die updateMovie-Funktion aufrufen
    updateMovie(movie._id, { title: editTitle, year: Number(editYear) });
    
    // Bearbeitungsmodus beenden
    setIsEditing(false);
  };

  // Funktion zum Abbrechen der Bearbeitung
  const handleCancel = () => {
    // Werte zurücksetzen
    setEditTitle(movie.title);
    setEditYear(movie.year);
    // Bearbeitungsmodus beenden
    setIsEditing(false);
  };

  // Generate movie genre colors based on title hash
  const getGenreColor = (title) => {
    const colors = [
      '#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57',
      '#ff9ff3', '#54a0ff', '#5f27cd', '#00d2d3', '#ff9f43'
    ];
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      hash = title.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const movieColor = getGenreColor(movie.title);

  return (
    <div className="movie-item">
      {isEditing ? (
        // Bearbeitungsmodus: Eingabefelder anzeigen
        <div className="edit-mode">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="edit-input"
            placeholder="Film Titel"
          />
          <input
            type="number"
            value={editYear}
            onChange={(e) => setEditYear(e.target.value)}
            className="edit-input"
            placeholder="Jahr"
          />
          <div className="edit-buttons">
            <button onClick={handleSave} className="save-btn">Speichern</button>
            <button onClick={handleCancel} className="cancel-btn">Abbrechen</button>
          </div>
        </div>
      ) : (
        // Anzeigemodus: Film-Details anzeigen (ohne Bild)
        <div className="movie-card">
          <div className="movie-poster-text" style={{ backgroundColor: movieColor }}>
            <div className="movie-icon">🎬</div>
            <div className="movie-year-badge">{movie.year}</div>
            <div className="movie-overlay">
              <div className="movie-actions">
                <button onClick={() => setIsEditing(true)} className="action-btn edit-btn" title="Bearbeiten">
                  ✏️
                </button>
                <button onClick={() => deleteMovie(movie._id)} className="action-btn delete-btn" title="Löschen">
                  🗑️
                </button>
              </div>
            </div>
          </div>
          <div className="movie-info">
            <h3 className="movie-title">{movie.title}</h3>
            <p className="movie-year-text">Jahr: {movie.year}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default MovieItem;
