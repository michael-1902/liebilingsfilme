# setup-local-ultimate.ps1
# Ultimatives PowerShell-Setup-Skript fuer das Lieblingsfilme-Projekt
# Kombiniert automatische Node.js-Installation mit mehreren Fallback-Methoden und Abhaengigkeitsverwaltung

param(
    [string]$ProjectPath = ".",
    [switch]$StartApps,
    [switch]$SkipNodeInstall
)

function Write-Ok($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[FEHLER] $msg" -ForegroundColor Red }
function Write-Info($msg) { Write-Host "[INFO]  $msg" -ForegroundColor Cyan }

function Has-Command($name) {
    try { 
        Get-Command $name -ErrorAction Stop | Out-Null
        return $true 
    } catch { 
        return $false 
    }
}

function Refresh-Environment() {
    Write-Info "Aktualisiere Umgebungsvariablen..."
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

function Test-NodeCompatibility() {
    if (-not (Has-Command node)) {
        return $false
    }
    
    $nodeVersion = & node --version
    Write-Info "Gefundene Node.js Version: $nodeVersion"
    
    # Pruefe ob es eine unterstuetzte Version ist (v16+)
    if ($nodeVersion -match "v(\d+)\.") {
        $majorVersion = [int]$matches[1]
        if ($majorVersion -ge 16) {
            Write-Ok "Node.js Version ist kompatibel (v$majorVersion.x >= v16)"
            return $true
        } else {
            Write-Warn "Node.js Version v$majorVersion ist veraltet. Empfohlen: v18 oder v22 LTS"
            return $true  # Trotzdem fortfahren, aber warnen
        }
    }
    
    Write-Warn "Konnte Node.js Version nicht ermitteln: $nodeVersion"
    return $true  # Angenommen, es funktioniert
}

function Install-NodeJS() {
    Write-Info "=== Node.js Installation ==="
    
    # Methode 1: Versuche zuerst winget mit LTS Version
    if (Has-Command winget) {
        Write-Host "Methode 1: Versuche Node.js LTS Installation ueber winget..."
        try {
            $wingetOutput = & winget install OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements 2>&1
            if ($LASTEXITCODE -eq 0 -or $wingetOutput -like "*successfully installed*") {
                Write-Ok "Node.js LTS ueber winget installiert"
                Refresh-Environment
                if (Test-NodeCompatibility) {
                    return $true
                }
            }
        } catch {
            Write-Warn "winget Node.js LTS Installation fehlgeschlagen: $_"
        }
        
        # Versuche NVM ueber winget als Fallback
        Write-Host "Methode 2: Versuche NVM Installation ueber winget..."
        try {
            & winget install CoreyButler.NVMforWindows --accept-source-agreements --accept-package-agreements
            if ($LASTEXITCODE -eq 0) {
                Write-Ok "NVM ueber winget installiert"
                Write-Host "WICHTIG: PowerShell muss neu gestartet werden, damit NVM funktioniert."
                Write-Host "Bitte schliesse dieses Fenster und fuehre das Script erneut aus:"
                Write-Host ".\setup-local-ultimate.ps1 -StartApps"
                Read-Host "Druecke Enter, um das Fenster zu schliessen"
                exit 0
            }
        } catch {
            Write-Warn "winget NVM Installation fehlgeschlagen: $_"
        }
    } else {
        Write-Warn "winget nicht verfuegbar - ueberspringe winget-basierte Installationen"
    }
    
    # Methode 3: Direkter NVM Download und Installation
    Write-Host "Methode 3: Versuche direkten NVM Download..."
    try {
        $nvmUrl = "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe"
        $tempPath = "$env:TEMP\nvm-setup.exe"
        
        Write-Host "Lade NVM-Installer herunter..."
        Invoke-WebRequest -Uri $nvmUrl -OutFile $tempPath -UseBasicParsing
        
        Write-Host "Fuehre NVM-Installer aus (erfordert Administratorrechte)..."
        $process = Start-Process $tempPath -Wait -PassThru -Verb runAs
        
        Remove-Item $tempPath -ErrorAction SilentlyContinue
        
        if ($process.ExitCode -eq 0) {
            Write-Ok "NVM erfolgreich installiert"
            Write-Host "WICHTIG: PowerShell muss neu gestartet werden, damit NVM funktioniert."
            Write-Host "Bitte schliesse dieses Fenster und fuehre das Script erneut aus:"
            Write-Host ".\setup-local-ultimate.ps1 -StartApps"
            Read-Host "Druecke Enter, um das Fenster zu schliessen"
            exit 0
        }
    } catch {
        Write-Warn "Direkter NVM Download fehlgeschlagen: $_"
    }
    
    # Methode 4: Manuelle Installationsanweisungen
    Write-Err "Automatische Node.js Installation fehlgeschlagen!"
    Write-Host ""
    Write-Host "Bitte installiere Node.js manuell mit einer der folgenden Optionen:"
    Write-Host ""
    Write-Host "=== OPTION 1: Node.js direkt (empfohlen) ==="
    Write-Host "1. Besuche: https://nodejs.org/en/download/"
    Write-Host "2. Lade Node.js v18 LTS oder v22 LTS herunter"
    Write-Host "3. Fuehre die Installation aus"
    Write-Host "4. Starte PowerShell neu"
    Write-Host "5. Fuehre dieses Script erneut aus: .\setup-local-ultimate.ps1 -StartApps"
    Write-Host ""
    Write-Host "=== OPTION 2: NVM fuer Windows ==="
    Write-Host "1. Besuche: https://github.com/coreybutler/nvm-windows/releases"
    Write-Host "2. Lade nvm-setup.exe herunter"
    Write-Host "3. Fuehre die Installation als Administrator aus"
    Write-Host "4. Starte PowerShell neu"
    Write-Host "5. Fuehre aus: nvm install 18.20.4 && nvm use 18.20.4"
    Write-Host "6. Fuehre dieses Script erneut aus: .\setup-local-ultimate.ps1 -StartApps"
    Write-Host ""
    Read-Host "Druecke Enter, um das Script zu beenden"
    exit 1
}

function Install-NodeViaExistingNVM() {
    if (-not (Has-Command nvm)) {
        return $false
    }
    
    Write-Host "NVM gefunden - installiere Node.js v18..."
    
    # Versuche Node 18.20.4 zu installieren
    $targetVersion = '18.20.4'
    
    # Pruefe ob bereits installiert
    $installed = & nvm list 2>$null | Select-String $targetVersion
    if ($installed) {
        Write-Ok "Node $targetVersion bereits ueber NVM installiert"
    } else {
        Write-Host "Installiere Node $targetVersion ueber NVM..."
        & nvm install $targetVersion
        if ($LASTEXITCODE -ne 0) {
            Write-Warn "NVM Node.js Installation fehlgeschlagen"
            return $false
        }
    }
    
    # Setze als aktive Version
    Write-Host "Setze Node $targetVersion als aktive Version..."
    & nvm use $targetVersion
    
    # Aktualisiere Umgebung
    Refresh-Environment
    
    return (Test-NodeCompatibility)
}

# Projektpfad interaktiv abfragen, falls Standard verwendet wird
if ($ProjectPath -eq "." -or [string]::IsNullOrWhiteSpace($ProjectPath)) {
    $pwd = (Get-Location).Path
    $inputPath = Read-Host "Projektpfad eingeben (Enter = aktuelles Verzeichnis: $pwd)"
    if (-not [string]::IsNullOrWhiteSpace($inputPath)) { 
        $ProjectPath = $inputPath 
    } else { 
        $ProjectPath = $pwd 
    }
}

try {
    $absolutePath = Resolve-Path $ProjectPath -ErrorAction Stop
} catch {
    Write-Err "Projektpfad nicht gefunden: $ProjectPath"
    exit 1
}

Write-Host "Projektpfad: $absolutePath"
Write-Host ""

# Pruefe System-Voraussetzungen
Write-Info "=== System-Check ==="

if (Has-Command winget) {
    Write-Ok "winget verfuegbar"
} else {
    Write-Warn "winget nicht gefunden - einige automatische Installationen koennten fehlschlagen"
}

# Node.js Erkennung und Installation
Write-Info "=== Node.js Setup ==="

$nodeAvailable = $false

# Pruefe zuerst ob Node.js bereits verfuegbar ist
Refresh-Environment
if (Test-NodeCompatibility) {
    $nodeVersion = & node --version
    $npmVersion = & npm --version
    Write-Ok "Node.js bereits verfuegbar: $nodeVersion"
    Write-Ok "npm verfuegbar: $npmVersion"
    $nodeAvailable = $true
} else {
    if ($SkipNodeInstall) {
        Write-Warn "Node.js nicht verfuegbar, aber -SkipNodeInstall wurde angegeben"
        Write-Host "Bitte installiere Node.js manuell und fuehre das Script ohne -SkipNodeInstall aus"
        exit 1
    }
    
    Write-Host "Node.js nicht gefunden - starte Installation..."
    
    # Versuche zuerst NVM falls verfuegbar
    if (Has-Command nvm) {
        Write-Host "NVM gefunden - versuche Node.js Installation ueber NVM..."
        if (Install-NodeViaExistingNVM) {
            $nodeAvailable = $true
        }
    }
    
    # Falls immer noch nicht verfuegbar, versuche vollstaendige Installation
    if (-not $nodeAvailable) {
        Install-NodeJS
        # Diese Funktion beendet das Script falls Installation fehlschlaegt
    }
}

# MongoDB hint
Write-Info "=== Database Setup ==="
if (-not (Has-Command mongod)) {
    Write-Warn "MongoDB nicht gefunden"
    Write-Host "Fuer lokale Entwicklung kannst du MongoDB installieren:"
    if (Has-Command winget) {
        Write-Host "  winget install --id MongoDB.Server -e"
    } else {
        Write-Host "  Download von: https://www.mongodb.com/try/download/community"
    }
    Write-Host "Alternativ: Nutze MongoDB Atlas (Cloud-Datenbank)"
    Write-Host "Setze dann MONGO_URI in server/.env entsprechend"
} else {
    Write-Ok "MongoDB verfuegbar"
}

# Install dependencies
Write-Info "=== Abhaengigkeiten installieren ==="

Push-Location $absolutePath
try {
    # Check for npm availability after all installations
    if (-not (Has-Command npm)) {
        Write-Err "npm nicht verfuegbar! Dies sollte mit Node.js installiert werden."
        Write-Host "Bitte ueberpruefe deine Node.js Installation"
        exit 1
    }
    
    # Root dependencies
    if (Test-Path package.json) {
        Write-Host "Installiere Root-Abhaengigkeiten..."
        try {
            $originalLocation = Get-Location
            Set-Location $absolutePath
            $output = cmd /c "npm install 2>&1"
            $exitCode = $LASTEXITCODE
            Set-Location $originalLocation
            
            if ($exitCode -eq 0) {
                Write-Ok "Root-Abhaengigkeiten erfolgreich installiert"
            } else {
                Write-Warn "Fehler bei Root-Installation (Exit Code: $exitCode)"
                if ($output) { Write-Host $output }
            }
        } catch {
            Write-Warn "Fehler beim Ausfuehren von npm install: $_"
        }
    } else {
        Write-Warn "package.json im Root nicht gefunden"
    }

    # Server dependencies
    $serverPackageJson = Join-Path $absolutePath 'server\package.json'
    if (Test-Path $serverPackageJson) {
        Write-Host "Installiere Server-Abhaengigkeiten..."
        try {
            $serverPath = Join-Path $absolutePath 'server'
            $originalLocation = Get-Location
            Set-Location $serverPath
            $output = cmd /c "npm install 2>&1"
            $exitCode = $LASTEXITCODE
            Set-Location $originalLocation
            
            if ($exitCode -eq 0) {
                Write-Ok "Server-Abhaengigkeiten erfolgreich installiert"
            } else {
                Write-Warn "Fehler bei Server-Installation (Exit Code: $exitCode)"
                if ($output) { Write-Host $output }
            }
        } catch {
            Write-Warn "Fehler beim Ausfuehren von npm install: $_"
        }
    } else {
        Write-Warn "server/package.json nicht gefunden"
    }

    # Client dependencies
    $clientPackageJson = Join-Path $absolutePath 'client\package.json'
    if (Test-Path $clientPackageJson) {
        Write-Host "Installiere Client-Abhaengigkeiten..."
        try {
            $clientPath = Join-Path $absolutePath 'client'
            $originalLocation = Get-Location
            Set-Location $clientPath
            $output = cmd /c "npm install 2>&1"
            $exitCode = $LASTEXITCODE
            Set-Location $originalLocation
            
            if ($exitCode -eq 0) {
                Write-Ok "Client-Abhaengigkeiten erfolgreich installiert"
            } else {
                Write-Warn "Fehler bei Client-Installation (Exit Code: $exitCode)"
                if ($output) { Write-Host $output }
            }
        } catch {
            Write-Warn "Fehler beim Ausfuehren von npm install: $_"
        }
    } else {
        Write-Warn "client/package.json nicht gefunden"
    }

    # Create server/.env if needed
    Write-Info "=== Umgebungskonfiguration ==="
    $envExample = Join-Path $absolutePath 'server\.env.example'
    $envFile = Join-Path $absolutePath 'server\.env'
    
    if (-not (Test-Path $envFile)) {
        if (Test-Path $envExample) {
            Copy-Item $envExample $envFile
            Write-Ok "server/.env aus .env.example erstellt"
            Write-Host "Bitte pruefe MONGO_URI in server/.env"
        } else {
            # Create default .env
            $defaultEnv = @"
PORT=5001
MONGO_URI=mongodb://localhost:27017/lieblingsfilme
NODE_ENV=development
"@
            $defaultEnv | Out-File -FilePath $envFile -Encoding utf8
            Write-Ok "server/.env mit Standardwerten erstellt"
            Write-Host "Standard MONGO_URI: mongodb://localhost:27017/lieblingsfilme"
        }
    } else {
        Write-Ok "server/.env existiert bereits"
    }

    Write-Host ""
    Write-Ok "=== Setup erfolgreich abgeschlossen! ==="
    Write-Host ""
    Write-Host "Naechste Schritte:"
    Write-Host "1. Stelle sicher, dass deine Datenbank laeuft:"
    Write-Host "   - Lokal: Starte MongoDB Service"
    Write-Host "   - Atlas: Setze MONGO_URI in server/.env"
    Write-Host ""
    Write-Host "2. Starte die Anwendung:"
    Write-Host "   - Automatisch: Verwende -StartApps Parameter"
    Write-Host "   - Manuell: npm run dev (im Projekt-Root)"
    Write-Host "   - Separat: Server: cd server && npm run dev"
    Write-Host "            Client: cd client && npm start"
    Write-Host ""
    
    # Start apps if requested
    if ($StartApps) {
        Write-Info "=== Starte Anwendungen ==="
        Write-Host "Oeffne Server und Client in neuen PowerShell-Fenstern..."

        # Choose available shell
        $shellExe = $null
        if (Has-Command pwsh) {
            $shellExe = 'pwsh'
        } elseif (Has-Command powershell) {
            $shellExe = 'powershell.exe'
        }

        if ($shellExe) {
            Write-Host "Verwendete Shell: $shellExe"

            # Server window
            $serverPath = Join-Path $absolutePath 'server'
            $serverCmd = "Set-Location '$serverPath'; Write-Host 'Starte Server...'; npm run dev"
            Start-Process -FilePath $shellExe -ArgumentList @('-NoExit', '-Command', $serverCmd) -WindowStyle Normal

            # Wait a moment
            Start-Sleep -Seconds 2

            # Client window  
            $clientPath = Join-Path $absolutePath 'client'
            $clientCmd = "Set-Location '$clientPath'; Write-Host 'Starte Client...'; npm start"
            Start-Process -FilePath $shellExe -ArgumentList @('-NoExit', '-Command', $clientCmd) -WindowStyle Normal

            Write-Ok "Server und Client gestartet!"
            Write-Host ""
            Write-Host "URLs nach dem Start:"
            Write-Host "  Frontend: http://localhost:3000"
            Write-Host "  Backend API: http://localhost:5001/api/movies"
            Write-Host ""
            Write-Host "Hinweis: Es kann einige Sekunden dauern, bis beide Services verfuegbar sind."
        } else {
            Write-Warn "Keine PowerShell gefunden - automatischer Start uebersprungen"
            Write-Host "Starte manuell mit: npm run dev"
        }
    } else {
        Write-Host "Verwende -StartApps um Server und Client automatisch zu starten"
    }

} catch {
    Write-Err "Fehler waehrend der Installation: $_"
    Write-Host "Stack Trace: $($_.ScriptStackTrace)"
    exit 1
} finally {
    Pop-Location
}

Write-Host ""
Write-Ok "Setup-Script abgeschlossen."
Write-Host "Du kannst dieses Script jederzeit erneut ausfuehren:"
Write-Host "  .\setup-local-ultimate.ps1                 # Setup ohne automatischen Start"
Write-Host "  .\setup-local-ultimate.ps1 -StartApps      # Setup mit automatischem Start"
Write-Host "  .\setup-local-ultimate.ps1 -SkipNodeInstall # Nur Abhaengigkeiten (Node.js bereits vorhanden)"
