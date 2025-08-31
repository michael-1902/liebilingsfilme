// Mongoose-Bibliothek importieren
const mongoose = require('mongoose');

// Das Schema-Konstruktur von Mongoose holen
const Schema = mongoose.Schema;

// --- Movie-Schema definieren ---
// Dieses Schema definiert die Struktur eines Film-Dokuments in der MongoDB-Collection.
const movieSchema = new Schema({
  // Feld 'title':
  // - Typ: String
  // - Erforderlich: Jeder Film benötigt einen Titel
  // - 'trim' entfernt führende und nachfolgende Leerzeichen
  title: {
    type: String,
    required: true,
    trim: true,
  },
  // Feld 'description':
  // - Typ: String
  // - Erforderlich: Jeder Film benötigt eine Beschreibung
  // - 'trim' entfernt führende und nachfolgende Leerzeichen
  description: {
    type: String,
    required: true,
    trim: true,
  },
  // Feld 'year':
  // - Typ: Number
  // - Erforderlich
  year: {
    type: Number,
    required: true,
  },
}, {
  // --- Schema-Optionen ---
  // 'timestamps: true' fügt automatisch 'createdAt' und 'updatedAt' Felder
  // zum Dokument hinzu. Nützlich, um Erstellungs- und Änderungszeitpunkte zu verfolgen.
  timestamps: true,
});

// --- Modell erstellen ---
// mongoose.model() kompiliert das Schema zu einem Modell.
// Ein Modell ist eine Klasse, mit der Dokumente erzeugt werden.
// Das erste Argument ist der singuläre Name der Collection; Mongoose sucht automatisch
// nach der pluralen, kleingeschriebenen Version als Collection-Namen.
// Für das Modell 'Movie' wird also die Collection 'movies' verwendet.
const Movie = mongoose.model('Movie', movieSchema);

// Das Movie-Modell exportieren, damit es in anderen Teilen der Anwendung (z. B. in den Routen) verwendet werden kann.
module.exports = Movie;
