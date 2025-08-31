# setup-local.ps1
# Einfaches PowerShell-Setup-Skript für das Lieblingsfilme-Projekt

Param(
    [string]$ProjectPath = ".",
    [switch]$StartApps
)

Set-StrictMode -Version Latest

function Write-Ok($msg) { Write-Host "[OK]    $msg" -ForegroundColor Green }
function Write-Warn($msg) { Write-Host "[WARN]  $msg" -ForegroundColor Yellow }
function Write-Err($msg) { Write-Host "[FEHLER] $msg" -ForegroundColor Red }

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
    $absolutePath = (Resolve-Path -Path $ProjectPath).Path
} catch {
    Write-Err "Projektpfad nicht gefunden: $ProjectPath"
    exit 1
}

Write-Host "Projektpfad: $absolutePath"

# Prüfe Verfügbarkeit von Befehlen
function Has-Command($name) {
    try { 
        Get-Command $name -ErrorAction Stop | Out-Null
        return $true 
    } catch { 
        return $false 
    }
}

# Prüfe winget
if (-not (Has-Command winget)) {
    Write-Warn "winget nicht gefunden. Einige automatische Installationen werden übersprungen."
} else {
    Write-Ok "winget gefunden"
}

# Check/install NVM
if (-not (Has-Command nvm)) {
    Write-Host "NVM nicht gefunden. Starte automatische Installation..."
    
    $nvmInstalled = $false
    
    # Method 1: Try winget first
    if (Has-Command winget) {
        Write-Host "Versuche nvm mit winget zu installieren..."
        try {
            Start-Process winget -ArgumentList 'install','--id','CoreyButler.NVMforWindows','-e' -NoNewWindow -Wait -Verb runAs
            Write-Ok "winget-Installationsbefehl ausgeführt."
            $nvmInstalled = $true
        } catch {
            Write-Warn "winget-Installation fehlgeschlagen. Versuche alternative Methode..."
        }
    }
    
    # Method 2: Direct download if winget failed or not available
    if (-not $nvmInstalled) {
        Write-Host "Versuche nvm direkt herunterzuladen und zu installieren..."
        try {
            $nvmUrl = "https://github.com/coreybutler/nvm-windows/releases/latest/download/nvm-setup.exe"
            $tempPath = "$env:TEMP\nvm-setup.exe"
            
            Write-Host "Lade nvm-Installer herunter..."
            Invoke-WebRequest -Uri $nvmUrl -OutFile $tempPath -UseBasicParsing
            
            Write-Host "Führe nvm-Installer aus (erfordert Administratorrechte)..."
            Start-Process $tempPath -Wait -Verb runAs
            
            Remove-Item $tempPath -ErrorAction SilentlyContinue
            Write-Ok "NVM-Installation abgeschlossen."
            $nvmInstalled = $true
        } catch {
            Write-Warn "Direkter Download/Installation fehlgeschlagen: $_"
        }
    }
    
    if ($nvmInstalled) {
        Write-Host ""
        Write-Host "NVM wurde erfolgreich installiert!"
        Write-Host "WICHTIG: Bitte dieses PowerShell-Fenster schließen und ein neues öffnen, damit nvm verfügbar wird."
        Write-Host "Dann dieses Script erneut ausführen: .\setup-local-simple.ps1"
        Write-Host ""
        Read-Host "Drücke Enter, um das Fenster zu schließen"
        exit 0
    } else {
        Write-Warn "Automatische nvm-Installation fehlgeschlagen."
        Write-Host "Bitte installiere NVM for Windows manuell:"
        Write-Host "1. Öffne: https://github.com/coreybutler/nvm-windows/releases"
        Write-Host "2. Lade die neueste nvm-setup.exe herunter"
        Write-Host "3. Führe sie als Administrator aus"
        Write-Host "4. Schließe PowerShell und öffne es erneut"
        Write-Host "5. Führe dieses Script erneut aus"
        Write-Host ""
        Read-Host "Drücke Enter, um das Script zu beenden"
        exit 1
    }
} else {
    Write-Ok "nvm ist installiert"
}

# Install Node 18
function Ensure-Node18() {
    if (-not (Has-Command nvm)) {
        Write-Warn "nvm nicht verfügbar - überspringe Node-Installation. Stelle sicher, dass Node v18 verfügbar ist."
        return $false
    }

    $targetVersion = '18.20.4'
    $installed = & nvm list 2>$null | Select-String $targetVersion
    if ($installed) {
        Write-Ok "Node $targetVersion bereits installiert"
    } else {
        Write-Host "Installiere Node $targetVersion via nvm..."
        & nvm install $targetVersion
    }

    Write-Host "Setze aktive Node-Version auf $targetVersion..."
    & nvm use $targetVersion | Out-Null

    if (Has-Command node) {
        $v = & node --version
        Write-Ok "node verfügbar: $v"
    } else {
        Write-Warn "node nicht im PATH - möglicherweise Terminal neu starten nach nvm-Installation."
        return $false
    }
    return $true
}

$nodeOk = Ensure-Node18

# MongoDB hint
if (-not (Has-Command mongod)) {
    Write-Warn "mongod nicht gefunden. Für eine lokale MongoDB installiere diese oder nutze Atlas."
    if (Has-Command winget) {
        Write-Host "Tipp: Du kannst MongoDB Community mit winget installieren (Administratorrechte erforderlich):"
        Write-Host "winget install --id MongoDB.Server -e"
    }
} else {
    Write-Ok "mongod ist verfügbar"
}

# Install dependencies
if (-not $nodeOk) {
    Write-Warn "Node seems not correctly activated. Trying to install dependencies anyway."
}

Push-Location $absolutePath
try {
    # Root dependencies
    if (Test-Path package.json) {
        Write-Host "Installiere Root-Abhängigkeiten..."
        & npm install
        Write-Ok "Root-Abhängigkeiten installiert"
    } else {
        Write-Warn "package.json im Root nicht gefunden - überspringe Root-Installation."
    }

    # Server dependencies
    if (Test-Path (Join-Path $absolutePath 'server\package.json')) {
        Write-Host "Installiere Server-Abhängigkeiten..."
        Push-Location (Join-Path $absolutePath 'server')
        & npm install
        Pop-Location
        Write-Ok "Server-Abhängigkeiten installiert"
    } else {
        Write-Warn "server/package.json nicht gefunden - überspringe Server-Installation."
    }

    # Client dependencies
    if (Test-Path (Join-Path $absolutePath 'client\package.json')) {
        Write-Host "Installiere Client-Abhängigkeiten..."
        Push-Location (Join-Path $absolutePath 'client')
        & npm install
        Pop-Location
        Write-Ok "Client-Abhängigkeiten installiert"
    } else {
        Write-Warn "client/package.json nicht gefunden - überspringe Client-Installation."
    }

    # Create server/.env if needed
    $envExample = Join-Path $absolutePath 'server\.env.example'
    $envFile = Join-Path $absolutePath 'server\.env'
    if (-not (Test-Path $envFile)) {
        if (Test-Path $envExample) {
            Copy-Item $envExample $envFile
            Write-Ok "server/.env aus .env.example erstellt - bitte MONGO_URI prüfen"
        } else {
            "PORT=5001" | Out-File -FilePath $envFile -Encoding utf8
            "MONGO_URI=mongodb://localhost:27017/lieblingsfilme" | Out-File -FilePath $envFile -Encoding utf8 -Append
            "NODE_ENV=development" | Out-File -FilePath $envFile -Encoding utf8 -Append
            Write-Ok "server/.env mit Standardwerten erstellt - ggf. MONGO_URI prüfen"
        }
    } else {
        Write-Ok "server/.env existiert bereits - überspringe Erstellung"
    }

    Write-Host ""
    Write-Host "Setup erfolgreich abgeschlossen!"
    Write-Host "Nächste Schritte:"
    Write-Host "1) Stelle sicher, dass MongoDB läuft (lokal) oder setze MONGO_URI in server/.env auf deinen Atlas-String."
    Write-Host "2) Starte das Projekt im Projekt-Root mit: npm run dev"
    Write-Host "   Oder separat: (Server) cd server; npm run dev   (Client) cd client; npm start"

    # Start apps if requested
    if ($StartApps) {
    Write-Host ""
    Write-Host "Starte Server und Client in neuen PowerShell-Fenstern..."

        # Choose available shell
        if (Has-Command pwsh) {
            $shellExe = 'pwsh'
        } elseif (Has-Command powershell) {
            $shellExe = 'powershell.exe'
        } else {
            Write-Warn "Weder 'pwsh' noch 'powershell' gefunden - automatischer Start wird übersprungen."
            $shellExe = $null
        }

        if ($shellExe) {
            Write-Host "Verwendete Shell: $shellExe"

            # Server window
            $serverCmd = "cd `"$absolutePath\server`"; npm run dev"
            Start-Process -FilePath $shellExe -ArgumentList @('-NoExit','-Command',$serverCmd) -WindowStyle Normal

            # Client window
            $clientCmd = "cd `"$absolutePath\client`"; npm start"
            Start-Process -FilePath $shellExe -ArgumentList @('-NoExit','-Command',$clientCmd) -WindowStyle Normal

            Write-Ok "Server und Client sollten in neuen PowerShell-Fenstern laufen."
        }
    }

} catch {
    Write-Err "Fehler während der Installation: $_"
    Pop-Location
    exit 1
} finally {
    Pop-Location
}

Write-Ok "Setup-Skript abgeschlossen."
Write-Host "Du kannst dieses Skript jederzeit erneut ausführen, um Abhängigkeiten zu aktualisieren oder die Apps zu starten."
