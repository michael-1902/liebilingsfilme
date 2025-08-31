# 🔧 Node.js Version Management für React Client

## Problem
- **Node.js v22.18.0** hat Kompatibilitätsprobleme mit React Scripts
- **Fehler**: "Cannot find module debug/src/index.js"
- **Lösung**: Wechsel zu Node.js v18 LTS oder v20 LTS

## 🚀 Schnelle Lösung: NVM für Windows installieren

### 1) NVM-Windows installieren
```powershell
# Option A: Mit winget (empfohlen)
winget install CoreyButler.NVMforWindows

# Option B: Manueller Download
# Gehe zu: https://github.com/coreybutler/nvm-windows/releases
# Lade nvm-setup.exe herunter und installiere
```

### 2) PowerShell neu starten
**WICHTIG**: Schließe alle PowerShell-Fenster und öffne ein neues als Administrator.

### 3) Node.js v18 LTS installieren und verwenden
```powershell
# Verfügbare Versionen anzeigen
nvm list available

# Node.js v18 LTS installieren (empfohlen für React)
nvm install 18.20.4

# Zu Node.js v18 wechseln
nvm use 18.20.4

# Version bestätigen
node --version
# Sollte zeigen: v18.20.4
```

### 4) Client-Dependencies neu installieren
```powershell
cd "c:\Users\HP\OneDrive\Documents\Web\lieblingsfilme\client"
# node_modules löschen
Remove-Item -Recurse -Force node_modules
Remove-Item package-lock.json

# Neu installieren mit Node.js v18
npm install
```

### 5) App starten
```powershell
# Projekt-Root
cd "c:\Users\HP\OneDrive\Documents\Web\lieblingsfilme"
npm run dev
```

## 🔄 Version wechseln (nach Installation)

```powershell
# Installierte Versionen anzeigen
nvm list

# Zu einer Version wechseln
nvm use 18.20.4    # Für React Development
nvm use 22.18.0    # Zurück zur neuesten Version

# Standard-Version setzen
nvm alias default 18.20.4
```

## 🛠️ Alternative: Node.js v20 LTS

Falls v18 Probleme macht:
```powershell
nvm install 20.17.0
nvm use 20.17.0
```

## 📋 Troubleshooting

### NVM funktioniert nicht
```powershell
# Als Administrator ausführen
# PowerShell Execution Policy prüfen
Get-ExecutionPolicy

# Falls Restricted, ändern zu RemoteSigned
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Alte Node.js Installation entfernen (optional)
```powershell
# Programme und Features öffnen
appwiz.cpl
# "Node.js" deinstallieren, dann NVM verwenden
```

## ✅ Erfolgreich wenn:
- `node --version` zeigt v18.20.4
- `npm start` (im client/) startet ohne Fehler
- React App öffnet sich im Browser (http://localhost:3000)

## 🎯 Empfohlene Versions-Strategie
- **Development (React)**: Node.js v18 LTS
- **Production/Vercel**: Automatisch (verwendet kompatible Version)
- **Schneller Wechsel**: `nvm use 18` / `nvm use 22`
