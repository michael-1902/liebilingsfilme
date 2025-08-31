# Lieblingsfilme — Lokale Installation (Windows / PowerShell)

Dieses Dokument erklärt, wie du die Anwendung lokal startest (Backend + Frontend) unter Windows mit PowerShell. Es enthält Hinweise zu Node-Version, MongoDB, Umgebungsvariablen, Startbefehlen und Troubleshooting.

## Kurz-Checklist (schnell)
- Node v18 über nvm (empfohlen)
- MongoDB Community lokal installiert und gestartet
- `server/.env` mit `MONGO_URI` angelegt
- Abhängigkeiten installiert: `npm install` (Root, Server, Client)
- App starten: `npm run dev` im Projekt-Root

## Voraussetzungen
- Windows 10/11
- PowerShell (Standard)
- Empfohlene Node-Version: v18 (LTS)

Warum v18? Einige Create-React-App / react-scripts-Versionen arbeiten nicht zuverlässig mit sehr neuen Node-Releases.

## 1) Node-Version verwalten (nvm for Windows)

Installation (winget):

```powershell
winget install CoreyButler.NVMforWindows
```

Nach Installation PowerShell schließen und neu öffnen. Dann:

```powershell
nvm install 18.20.4
nvm use 18.20.4
node --version  # sollte v18.20.4 anzeigen
```

Optional kannst du `nvm alias default 18.20.4` setzen.

## 2) MongoDB Community (lokal)

Installieren mit winget oder manuell herunterladen:

```powershell
winget install MongoDB.Server
# oder manuell von https://www.mongodb.com/try/download/community
```

MongoDB starten (Service) oder manuell:

```powershell
# Als Service
net start MongoDB

# Oder manuell (falls installiert ohne Service)
mongod --dbpath "C:\data\db"
```

Prüfen (optional):

```powershell
# mongosh
# use lieblingsfilme
# show collections
```

## 3) Abhängigkeiten installieren

Wechsle in das Projekt-Root und installiere Abhängigkeiten für Root, Server und Client:

```powershell
cd "C:\Users\HP\OneDrive\Documents\Web\lieblingsfilme"
# Root dependencies (concurrently etc.)
npm install

# Server
cd server
npm install

# Client (neues Terminal-Tab oder zurück navigieren)
cd ..\client
npm install
```

Hinweis: Falls bei `npm install` Warnungen erscheinen, sind das meist Hinweise; sie verhindern normalerweise nicht das Starten.

## 4) Umgebungsvariablen einrichten

- Server: Kopiere `server/.env.example` nach `server/.env` und setze:

```text
PORT=5001
MONGO_URI=mongodb://localhost:27017/lieblingsfilme
NODE_ENV=development
```

- Client: `client/.env.local` kann für lokale Entwicklung benutzt werden. Standardwert im Repo ist bereits auf `http://localhost:5001/api/movies` eingestellt. Du kannst temporär in PowerShell setzen:

```powershell
# $env:REACT_APP_API_URL = "http://localhost:5001/api/movies"
```

Wichtig: Committe keine geheimen Daten. `server/.env` sollte lokal bleiben und in `.gitignore` stehen.

## 5) App starten

Empfohlen: Ein Terminal im Projekt-Root verwenden, damit das Root-Script beide Teile parallel startet.

Gemeinsam (einfach):

```powershell
cd "C:\Users\HP\OneDrive\Documents\Web\lieblingsfilme"
npm run dev
```

Getrennt (zwei Terminals):

```powershell
# Terminal A — Server
cd "C:\Users\HP\OneDrive\Documents\Web\lieblingsfilme\server"
npm run dev   # startet nodemon

# Terminal B — Client
cd "C:\Users\HP\OneDrive\Documents\Web\lieblingsfilme\client"
npm start
```

Standard-URLs nach erfolgreichem Start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api/movies

Wenn du `npm run dev` im `client`-Ordner ausführst, bekommst du den Fehler `Missing script: "dev"` — das ist normal, weil das `dev`-Script im Repo-Root definiert ist. Starte es im Projekt-Root.

## 6) Schnelltests

Teste die API:

```powershell
Invoke-RestMethod http://localhost:5001/api/movies
# oder (falls curl installiert)
curl http://localhost:5001/api/movies
```

## 7) Troubleshooting (häufige Probleme)

- Problem: `MONGO_URI Umgebungsvariable ist nicht gesetzt`
  - Lösung: `server/.env` anlegen oder `$env:MONGO_URI = 'mongodb://localhost:27017/lieblingsfilme'` setzen und Server neu starten.

- Problem: `Cannot find module ... debug/src/index.js` oder `react-scripts`-Fehler
  - Ursache: inkompatible Node-Version
  - Lösung: Mit nvm auf Node v18 wechseln (`nvm use 18.20.4`) und im `client`-Ordner `npm install` erneut ausführen.

- Problem: CORS oder API nicht erreichbar
  - Lösung: Prüfe, dass Backend auf `PORT` (standard 5001) läuft und `client` auf `REACT_APP_API_URL` zeigt.

- Problem: MongoDB-Verbindung schlägt fehl
  - Lösung: Prüfe, ob MongoDB-Service läuft (`net start MongoDB`) und ob `MONGO_URI` korrekt ist. Bei Atlas: IP-Whitelist und Credentials prüfen.

## 8) Nützliche Befehle (PowerShell)

```powershell
# NVM / Node
nvm list
nvm install 18.20.4
nvm use 18.20.4

# Root: dependencies & start
cd "C:\Users\HP\OneDrive\Documents\Web\lieblingsfilme"
npm install
npm run dev

# Alternativ: Server einzeln
cd server
npm run dev

# Client einzeln
cd ..\client
npm start
```

## 9) Hinweise für Deployment (kurz)

- Für Produktion nutze eine Atlas-DB und setze `MONGO_URI` als Environment-Variable in Vercel oder dem Ziel-Host (nicht im Repo).
- In Vercel: `REACT_APP_API_URL` in `client` sollte auf `/api/movies` oder die Produktions-API-Route verweisen.

---

Möchtest du, dass ich zusätzlich ein kurzes PowerShell-Setup-Skript (`setup-local.ps1`) anlege, das Node-Version prüft, Abhängigkeiten installiert und `server/.env` aus einer Vorlage erstellt? Sag kurz Bescheid, dann lege ich die Datei an.
