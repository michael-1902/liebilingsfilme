const mongoose = require('mongoose');
require('dotenv').config();

console.log('=== MongoDB-Verbindungstest ===');
console.log('Umgebungsvariablen geladen:');
console.log('- PORT:', process.env.PORT);
console.log('- MONGO_URI vorhanden:', !!process.env.MONGO_URI);

if (process.env.MONGO_URI) {
  // Passwort aus Sicherheitsgründen maskieren
  const maskedUri = process.env.MONGO_URI.replace(/:([^:@]+)@/, ':****@');
  console.log('- Verbindungszeichenfolge (maskiert):', maskedUri);
}

console.log('\nVersuche zu verbinden...');

const connectionOptions = {
  serverSelectionTimeoutMS: 10000, // Timeout reduzieren für schnelleres Feedback
  socketTimeoutMS: 45000,
  family: 4, // Use IPv4
  bufferCommands: false
};

mongoose.connect(process.env.MONGO_URI, connectionOptions)
  .then(() => {
  console.log('✅ MongoDB-Verbindung erfolgreich!');
  console.log('Verbunden mit Datenbank:', mongoose.connection.name || 'default');
    mongoose.connection.close();
    process.exit(0);
  })
  .catch(err => {
    console.error('❌ MongoDB-Verbindung fehlgeschlagen:');
    console.error('Fehlername:', err.name);
    console.error('Fehlermeldung:', err.message);
    if (err.reason) {
      console.error('Fehlergrund:', err.reason);
    }
    if (err.code) {
      console.error('Fehlercode:', err.code);
    }
    process.exit(1);
  });

// Timeout after 15 seconds for faster feedback
setTimeout(() => {
  console.error('❌ Verbindungs-Timeout nach 15 Sekunden');
  process.exit(1);
}, 15000);
