import React, { useState } from 'react';

// Dieses Komponente rendert ein Formular, um einen neuen Film hinzuzufügen.
// Die Funktion 'addMovie' wird als Prop vom Elternteil (App.js) übergeben.
function AddMovieForm({ addMovie }) {
  // State für das Eingabefeld Titel
  const [title, setTitle] = useState('');
  // State für das Eingabefeld Jahr
  const [year, setYear] = useState('');

  // Behandelt das Absenden des Formulars
  const handleSubmit = (e) => {
    // Verhindert das Standardverhalten des Formulars (Seiten-Reload)
    e.preventDefault();
    // Einfache Validierung: Wenn ein Feld leer ist, tue nichts.
    if (!title || !year) return;

    // Die addMovie-Funktion aufrufen, die von App.js übergeben wurde
    addMovie({ title, year: Number(year) });

    // Die Eingabefelder nach dem Absenden leeren
    setTitle('');
    setYear('');
  };

  // Das Formular rendern
  return (
    <form onSubmit={handleSubmit} className="add-movie-form">
      <h2>Neuen Lieblingsfilm hinzufügen</h2>
      <input
        type="text"
        placeholder="Filmtitel"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <input
        type="number"
        placeholder="Jahr"
        value={year}
        onChange={(e) => setYear(e.target.value)}
        required
      />
      <button type="submit">Film hinzufügen</button>
    </form>
  );
}

export default AddMovieForm;
