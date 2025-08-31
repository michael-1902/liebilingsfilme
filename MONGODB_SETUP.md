# 🚀 MongoDB Setup Guide: Lokal & Vercel

## 🏠 Lokale Entwicklung mit MongoDB Community Server

### 1) MongoDB Community Server installieren
**Windows (empfohlen):**
```powershell
# Option A: Mit Chocolatey
choco install mongodb

# Option B: Mit winget
winget install MongoDB.Server

# Option C: Manueller Download
# Gehe zu: https://www.mongodb.com/try/download/community
# Lade MongoDB Community Server herunter und installiere
```

### 2) MongoDB Service starten
```powershell
# MongoDB als Windows Service starten
net start MongoDB

# Oder manuell (falls nicht als Service installiert)
mongod --dbpath "C:\data\db"
```

**⚠️ Node.js Version Hinweis:**
Falls React Client Probleme hat, verwende Node.js v18 LTS:
```powershell
# Mit NVM-Windows (falls installiert)
nvm use 18.20.4
```
Siehe `NODE_VERSION_SETUP.md` für Details.

### 3) Lokale Datenbank testen
```powershell
# MongoDB Shell öffnen (optional)
mongosh

# In mongosh:
# use lieblingsfilme
# show collections
```

### 4) App lokal starten
```powershell
# Projekt-Root
npm run dev
```
✅ **Ergebnis**: Server verbindet sich mit `mongodb://localhost:27017/lieblingsfilme`

## ☁️ Vercel Deployment mit MongoDB Atlas

### Automatische Konfiguration
- **Vercel verwendet automatisch** die Atlas-Verbindung aus `vercel.json`
- **Keine weitere Konfiguration nötig** - Deploy funktioniert sofort

### Manuelle Vercel Environment Variables (Alternative)
Falls du die Vercel UI bevorzugst:
1. Gehe zu Vercel Dashboard > Dein Projekt > Settings > Environment Variables
2. Füge hinzu:
   ```
   MONGO_URI = mongodb+srv://mikegithub_db_user:5jwR3ZGTi8aEHGwG@cluster0.6ddhr0i.mongodb.net/lieblingsfilme?retryWrites=true&w=majority
   NODE_ENV = production
   ```

## 🔄 Automatische Umgebungserkennung

Die App erkennt automatisch die Umgebung:
- **Lokal**: `NODE_ENV=development` → MongoDB Community Server
- **Vercel**: `NODE_ENV=production` → MongoDB Atlas

## 🛠️ Troubleshooting

### MongoDB Community Server
```powershell
# Service Status prüfen
sc query MongoDB

# Logs anzeigen (Windows)
Get-EventLog -LogName Application -Source MongoDB

# Manuell starten falls Service nicht läuft
mongod --dbpath "C:\data\db" --logpath "C:\data\log\mongodb.log"
```

### Vercel Deployment
- **Build-Logs** in Vercel Dashboard anzeigen
- **Environment Variables** überprüfen
- **Atlas IP Whitelist**: 0.0.0.0/0 für Vercel

## 📋 Schnell-Checkliste

**Lokal:**
- [ ] MongoDB Community Server installiert
- [ ] MongoDB Service läuft (`net start MongoDB`)
- [ ] `server/.env` mit lokaler URI vorhanden
- [ ] `npm run dev` startet ohne Fehler

**Vercel:**
- [ ] Repository zu GitHub gepusht
- [ ] Vercel mit GitHub verbunden
- [ ] Atlas-URI in `vercel.json` eingetragen
- [ ] Deploy funktioniert

## 🎯 Nächste Schritte
1. **MongoDB installieren** (siehe Anleitung oben)
2. **Lokal testen**: `npm run dev`
3. **Zu Vercel deployen**: `git push`
