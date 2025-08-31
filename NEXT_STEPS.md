# ✅ NVM-Windows Installation Erfolgreich!

## 🔄 Nächste Schritte (WICHTIG: PowerShell neu starten)

### 1) PowerShell KOMPLETT schließen und neu öffnen
**WICHTIG**: Schließe VS Code und alle PowerShell-Fenster, dann öffne VS Code neu.

### 2) NVM testen
```powershell
# In neuer PowerShell Session:
nvm version
# Sollte zeigen: 1.2.2
```

### 3) Node.js v18 LTS installieren
```powershell
# Verfügbare LTS Versionen anzeigen
nvm list available

# Node.js v18 LTS installieren
nvm install 18.20.4

# Zu v18 wechseln
nvm use 18.20.4

# Version bestätigen
node --version
# Sollte zeigen: v18.20.4 (nicht v22.18.0)
```

### 4) Client Dependencies neu installieren
```powershell
cd "c:\Users\HP\OneDrive\Documents\Web\lieblingsfilme\client"
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue
npm install
```

### 5) App starten
```powershell
cd "c:\Users\HP\OneDrive\Documents\Web\lieblingsfilme"
npm run dev
```

## 🎯 Erwartetes Ergebnis
- Server: ✅ Läuft auf Port 5001 (MongoDB lokal)
- Client: ✅ Läuft auf Port 3000 (React App)
- Browser: ✅ http://localhost:3000 öffnet die App
