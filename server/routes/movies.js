// Express importieren und Router erstellen
const router = require('express').Router();

// Movie-Modell aus dem models-Ordner importieren
// Dieses Modell erlaubt die Interaktion mit der 'movies'-Collection in MongoDB
let Movie = require('../models/movie.js');

// --- API-Endpunkte ---

// Endpunkt: GET /api/movies/
// Beschreibung: Behandelt HTTP-GET-Anfragen, um alle Filme aus der Datenbank zu holen.
router.route('/').get(async (req, res) => {
  try {
  // Das Movie-Modell verwenden, um alle Dokumente aus der movies-Collection zu finden
  const movies = await Movie.find();
  // Mit den gefundenen Filmen als JSON antworten
  res.json(movies);
  } catch (err) {
  // Falls ein Fehler auftritt, mit Status 400 und Fehlermeldung antworten
  res.status(400).json('Fehler: ' + err);
  }
});

// Endpunkt: POST /api/movies/add
// Beschreibung: Behandelt HTTP-POST-Anfragen, um einen neuen Film in die Datenbank zu speichern.
router.route('/add').post(async (req, res) => {
  // Titel und Jahr aus dem Request-Body extrahieren
  const { title, year } = req.body;

  // Neue Movie-Instanz mit den extrahierten Daten erstellen
  const newMovie = new Movie({
    title,
    year,
  });

  try {
  // Das neue Film-Dokument in der Datenbank speichern
  const savedMovie = await newMovie.save();
  // Mit dem neu erstellten Filmobjekt antworten
  res.json(savedMovie);
  } catch (err) {
  // Falls ein Fehler auftritt, mit Status 400 und Fehlermeldung antworten
  res.status(400).json('Fehler: ' + err);
  }
});

// Endpunkt: PUT /api/movies/:id
// Beschreibung: Behandelt HTTP-PUT-Anfragen, um einen bestehenden Film per ID zu aktualisieren.
router.route('/:id').put(async (req, res) => {
  try {
  // Ein Update-Objekt nur mit den gelieferten Feldern bauen
    const updateData = {};
    if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
      updateData.title = req.body.title;
    }
    if (Object.prototype.hasOwnProperty.call(req.body, 'year')) {
  // Falls geliefert, in eine Zahl konvertieren
  updateData.year = Number(req.body.year);
    }

  // Falls nichts zum Aktualisieren vorhanden ist, 400 zurückgeben
  if (Object.keys(updateData).length === 0) {
  return res.status(400).json('Fehler: Keine gültigen Felder zum Aktualisieren angegeben.');
    }

    // Find the movie by its ID and update it with new data
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true } // Return the updated document and run schema validations
    );

    if (!updatedMovie) {
      // Falls kein Film mit der angegebenen ID gefunden wurde, 404 zurückgeben
      return res.status(404).json('Fehler: Film nicht gefunden.');
    }

    // Mit dem aktualisierten Filmobjekt antworten
    res.json(updatedMovie);
  } catch (err) {
  // Falls ein Fehler auftritt (z. B. ungültiges ID-Format oder Validierungsfehler), mit 400 antworten
  res.status(400).json('Fehler: ' + err);
  }
});

// Endpunkt: DELETE /api/movies/:id
// Beschreibung: Behandelt HTTP-DELETE-Anfragen, um einen Film anhand seiner ID zu entfernen.
router.route('/:id').delete(async (req, res) => {
  try {
    // Den Film anhand der ID (aus der URL-Parameter) suchen und löschen
    const deletedMovie = await Movie.findByIdAndDelete(req.params.id);
    if (!deletedMovie) {
      // Falls kein Film mit dieser ID gefunden wurde, 404 zurückgeben
      return res.status(404).json('Fehler: Film nicht gefunden.');
    }
    // Mit einer Erfolgsmeldung antworten
    res.json('Film erfolgreich gelöscht.');
  } catch (err) {
    // Falls ein Fehler auftritt (z. B. ungültiges ID-Format), mit Status 400 antworten
    res.status(400).json('Fehler: ' + err);
  }
});

// Export the router so it can be used in our main server.js file
// Den Router exportieren, damit er in der Hauptdatei server.js verwendet werden kann
module.exports = router;
