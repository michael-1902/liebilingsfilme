
# Lieblingsfilme-App

## Projektbeschreibung und Ziele

Die Movies-App ist eine Fullstack-Webanwendung, mit der Nutzer ihre Lieblingsfilme verwalten können. Ziel des Projekts ist es, eine moderne, benutzerfreundliche Oberfläche mit React zu bieten, die über eine REST-API mit einem Node.js/Express-Backend und einer MongoDB-Datenbank kommuniziert. Nutzer können Filme hinzufügen, anzeigen und löschen.

---

## Datenmodell und API-Design

### Datenmodell (MongoDB/Mongoose)

Jeder Film besteht aus folgenden Feldern:
- **title** (String, erforderlich): Der Titel des Films
- **year** (Number, erforderlich): Das Erscheinungsjahr
- **createdAt/updatedAt** (automatisch): Zeitstempel für Erstellung und Änderung

```js
{
  title: String,
  year: Number,
  createdAt: Date,
  updatedAt: Date
}
```

### API-Endpunkte

- **GET /api/movies/**  
  Gibt alle Filme als JSON zurück.

- **POST /api/movies/add**  
  Erwartet `{ title, year }` im Body. Legt einen neuen Film an.

- **DELETE /api/movies/:id**  
  Löscht den Film mit der angegebenen ID.

---

## Installationsanleitung

### Voraussetzungen

- Node.js und npm installiert
- MongoDB Atlas-Cluster (oder lokale MongoDB)

### Installation

1. **Backend installieren**
   ```bash
   cd server
   npm install
   ```
   Erstelle eine `.env`-Datei mit folgendem Inhalt:
   ```
   PORT=5001
   MONGO_URI=<dein MongoDB-URI>
   ```

2. **Frontend installieren**
   ```bash
   cd ../client
   npm install
   ```

### Starten der Anwendung

- **Backend starten**
  ```bash
  cd server
  npm start
  ```
- **Frontend starten**
  ```bash
  cd client
  npm start
  ```
  Die App ist dann unter [http://localhost:3000](http://localhost:3000) erreichbar.

---

## Reflexion: Herausforderungen und Lösungsansätze

**Herausforderungen:**
- **MongoDB Atlas-Verbindung:**  
  Viele Netzwerke blockieren Port 27017 oder SRV-Records. Die Fehlersuche erforderte Tests mit verschiedenen Clustern, Regionen, VPN und alternativen Verbindungsarten.
- **CORS-Probleme:**  
  Die Kommunikation zwischen Frontend (Port 3000) und Backend (Port 5001) erforderte die Konfiguration von CORS im Express-Server.
- **Deployment:**  
  Für das Hosting auf Vercel muss eine Cloud-Datenbank verwendet werden, da lokale MongoDB-Instanzen nicht unterstützt werden.

**Lösungsansätze:**
- Nutzung von VPN oder Wechsel des Netzwerks, falls Atlas nicht erreichbar ist.
- Detaillierte Fehlerausgaben im Backend und Testen der API mit Tools wie Postman oder curl.
- Sorgfältige Trennung von Frontend und Backend, um die Entwicklung und das Deployment zu erleichtern.

---
