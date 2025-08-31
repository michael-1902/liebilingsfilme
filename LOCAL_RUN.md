# Lieblingsfilme — Lokale Installation (Windows / PowerShell)

Dieses Dokument erklärt, wie du die Anwendung lokal startest (Backend + Frontend) unter Windows mit PowerShell. Es enthält Hinweise zu Node-Version, MongoDB, Umgebungsvariablen, Startbefehlen und Troubleshooting.

## Kurz-Checklist (schnell)
- **Automatisch**: Führe `.\setup-local.ps1` aus (installiert alles automatisch)
- **Manuell**: Node v18 über nvm (empfohlen)
- MongoDB Community lokal installiert und gestartet
- `server/.env` mit `MONGO_URI` angelegt
- Abhängigkeiten installiert: `npm install` (Root, Server, Client)
- App starten: `npm run dev` im Projekt-Root

**Ein-Klick-Setup:**
```powershell
.\setup-local.ps1 -StartApps
```
Dieses Script installiert automatisch nvm, Node v18, alle Abhängigkeiten und startet Server + Client.

Warum v18? Einige Create-React-App / react-scripts-Versionen arbeiten nicht zuverlässig mit sehr neuen Node-Releases.

## 1) Node-Version verwalten (nvm for Windows)

### Automatische Installation mit setup-local.ps1:

```powershell
.\setup-local.ps1
```

Das Script installiert automatisch nvm, Node v18 und alle Abhängigkeiten.

### Manuelle Installation:

**Option 1: winget (empfohlen, falls verfügbar):**

```powershell
winget install CoreyButler.NVMforWindows
```

**Option 2: Manueller Download (falls winget nicht verfügbar):**

1. Gehe zu: https://github.com/coreybutler/nvm-windows/releases
2. Lade die neueste `nvm-setup.exe` herunter
3. Führe die Installation als Administrator aus
4. PowerShell schließen und neu öffnen

**Option 3: Mit Admin-PowerShell (automatisch):**

```powershell
# Als Administrator ausführen:
Invoke-WebRequest -Uri "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe" -OutFile "nvm-setup.exe"
Start-Process "nvm-setup.exe" -Wait
Remove-Item "nvm-setup.exe"
```

Nach Installation PowerShell schließen und neu öffnen. Dann:

```powershell
nvm install 18.20.4
nvm use 18.20.4
node --version  # sollte v18.20.4 anzeigen
```

Optional kannst du `nvm alias default 18.20.4` setzen.

## macOS — Lokale Installation (macOS / Terminal)

Die folgenden Anweisungen spiegeln die Windows-Beschreibung, angepasst für macOS (Intel / Apple Silicon). Sie erklären Node (nvm), MongoDB (Homebrew), Umgebungsvariablen, Startbefehle und Troubleshooting.

### 1) Node-Version verwalten (nvm auf macOS)

Installation (Homebrew oder Install-Skript):

```bash
# Homebrew (empfohlen, falls installiert)
brew install nvm

# Falls Homebrew nicht vorhanden ist, nutze das offizielle Install-Skript:
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.5/install.sh | bash
```

Nach der Installation öffne ein neues Terminal und führe die Schritte aus (achte auf Docker/Apple-Silicon-Pfade):

```bash
# Falls Homebrew verwendet wurde, ggf. das NVM-Setup in ~/.zshrc oder ~/.bash_profile ergänzen:
export NVM_DIR="$HOME/.nvm"
source "$(brew --prefix nvm)/nvm.sh"  # oder die vom Installskript vorgeschlagene Zeile

nvm install 18.20.4
nvm use 18.20.4
node --version  # sollte v18.20.4 anzeigen

# Optional:
nvm alias default 18.20.4
```

Warum v18? Einige Create-React-App / react-scripts-Versionen arbeiten nicht zuverlässig mit sehr neuen Node-Releases.

### 2) MongoDB Community (lokal auf macOS)

Installation mit Homebrew (empfohlen):

```bash
brew tap mongodb/brew
brew install mongodb-community@6.0
```

MongoDB als Service starten:

```bash
brew services start mongodb-community@6.0
# Status prüfen:
brew services list
```

Alternativ manuell (nur falls du Service nicht verwenden willst):

```bash
# z.B. DB-Verzeichnis anlegen und mongod starten
mkdir -p ~/data/db
mongod --dbpath "$HOME/data/db"
```

Prüfen (optional):

```bash
# mongosh
# use lieblingsfilme
# show collections
```

### 3) Abhängigkeiten installieren

```bash
cd "$(pwd)"  # Projekt-Root anpassen, z.B. ~/Projects/lieblingsfilme
# Root dependencies (concurrently etc.)
npm install

# Server
cd server
npm install

# Client (neues Terminal-Tab oder zurück navigieren)
cd ../client
npm install
```

Hinweis: Falls bei `npm install` Warnungen erscheinen, sind das meist Hinweise; sie verhindern normalerweise nicht das Starten.

### 4) Umgebungsvariablen einrichten (macOS)

- Server: Kopiere `server/.env.example` nach `server/.env` und setze (oder exportiere temporär im Terminal):

```bash
export PORT=5001
export MONGO_URI="mongodb://localhost:27017/lieblingsfilme"
export NODE_ENV=development
```

- Client: `client/.env.local` kann für lokale Entwicklung benutzt werden. Alternativ temporär im Terminal:

```bash
export REACT_APP_API_URL="http://localhost:5001/api/movies"
```

Wichtig: Committe keine geheimen Daten. `server/.env` sollte lokal bleiben und in `.gitignore` stehen.

### 5) App starten (macOS)

Empfohlen: Ein Terminal im Projekt-Root verwenden, damit das Root-Script beide Teile parallel startet.

Gemeinsam (einfach):

```bash
cd "$(pwd)"  # Projekt-Root
npm run dev
```

Getrennt (zwei Terminals):

```bash
# Terminal A — Server
cd "$(pwd)/server"
npm run dev   # startet nodemon

# Terminal B — Client
cd "$(pwd)/client"
npm start
```

Standard-URLs nach erfolgreichem Start:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001/api/movies

Hinweis: Wenn du `npm run dev` im `client`-Ordner ausführst, bekommst du den Fehler `Missing script: "dev"` — das ist normal, weil das `dev`-Script im Repo-Root definiert ist. Starte es im Projekt-Root.

### 6) Schnelltests (macOS)

Teste die API:

```bash
curl http://localhost:5001/api/movies
# oder mit macOS curl / httpie / jq
```

### 7) Troubleshooting (häufige Probleme auf macOS)

- Problem: `MONGO_URI Umgebungsvariable ist nicht gesetzt`
  - Lösung: `server/.env` anlegen oder `export MONGO_URI='mongodb://localhost:27017/lieblingsfilme'` setzen und Server neu starten.

- Problem: `Cannot find module ...` oder `react-scripts`-Fehler
  - Ursache: inkompatible Node-Version
  - Lösung: Mit nvm auf Node v18 wechseln (`nvm use 18.20.4`) und im `client`-Ordner `npm install` erneut ausführen.

- Problem: MongoDB-Service startet nicht
  - Lösung: `brew services restart mongodb-community@6.0` oder Logs prüfen: `tail -n 200 $(brew --prefix)/var/log/mongodb/mongo*.log`

- Problem: Port belegt oder CORS/ API nicht erreichbar
  - Lösung: Prüfe, dass Backend auf `PORT` (standard 5001) läuft und `client` auf `REACT_APP_API_URL` zeigt.

### 8) Nützliche Befehle (macOS)

```bash
# NVM / Node
nvm list
nvm install 18.20.4
nvm use 18.20.4

# Root: dependencies & start
cd "$(pwd)"
npm install
npm run dev

# Alternativ: Server einzeln
cd server
npm run dev

# Client einzeln
cd ../client
npm start
```

### 9) Hinweise für Deployment (kurz)

- Für Produktion nutze eine Atlas-DB und setze `MONGO_URI` als Environment-Variable in Vercel oder dem Ziel-Host (nicht im Repo).
- In Vercel: `REACT_APP_API_URL` in `client` sollte auf `/api/movies` oder die Produktions-API-Route verweisen.

---

Wenn du möchtest, erstelle ich optional ein kurzes Setup-Skript (`setup-local-macos.sh`) das die Checks und die standardisierten Export-Kommandos enthält.

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
