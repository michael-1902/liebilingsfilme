// Benötigte Pakete importieren
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// In production, environment variables are provided by the hosting platform
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config(); // Only load .env in development
}

// Express-Anwendung initialisieren
const app = express();

// Middleware
app.use(cors()); // Cross-Origin Resource Sharing aktivieren
app.use(express.json()); // Express-Anwendung erlaubt das Parsen von JSON-Request-Bodies

// --- API-Routen ---
// Den Movies-Router importieren
const moviesRouter = require('./routes/movies');
// Den Movies-Router für alle Anfragen an '/api/movies' verwenden
// Zum Beispiel wird eine GET-Anfrage an '/api/movies' vom Router behandelt.
app.use('/api/movies', moviesRouter);


// Den Port definieren, auf dem der Server läuft
// Verwendet PORT aus der .env-Datei oder 5001, falls nicht definiert
const PORT = process.env.PORT || 5001;

// Einfache Route zum Testen des Servers
app.get('/', (req, res) => {
  res.send('Wir testen den Movies-App-Server!');
});

// --- MongoDB-Verbindung ---
// Die Verbindungszeichenfolge aus den Umgebungsvariablen holen
const uri = process.env.MONGO_URI;

console.log('Versuche, eine Verbindung zu MongoDB herzustellen...');
console.log('MONGO_URI vorhanden:', !!uri);

if (!uri) {
  console.error('MONGO_URI Umgebungsvariable ist nicht gesetzt!');
  process.exit(1);
}

// Mit Mongoose zu MongoDB verbinden
mongoose.connect(uri, {
  serverSelectionTimeoutMS: 30000, // Keep trying to send operations for 30 seconds
  socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
  family: 4 // Use IPv4, skip trying IPv6
})
  .then(() => {
    console.log('MongoDB-Verbindung erfolgreich hergestellt');
    // Server erst nach erfolgreicher DB-Verbindung starten (nur lokal)
    if (process.env.NODE_ENV !== 'production') {
      app.listen(PORT, () => {
        console.log(`Server läuft auf Port: ${PORT}`);
      });
    }
  })
  .catch(err => {
    console.error('MongoDB-Verbindungsfehler:', err);
    if (process.env.NODE_ENV !== 'production') {
      process.exit(1);
    }
  });

// Export für Vercel (serverless)
module.exports = app;
