# PPPP – Prozess-Geländer Patch

Dieser Patch fügt **Feature Flags**, **Build-Info** und **PR/Changelog-Struktur** hinzu, damit zukünftige Änderungen nicht versehentlich alte Fixes überschreiben.

## Inhalt
- `apply-patch.ps1` (Windows)
- `apply-patch.sh` (macOS/Linux)
- `PATCH_MANIFEST.json`
- `.github/pull_request_template.md`
- `CHANGELOG.md` (wird angelegt/ergänzt)
- erzeugt: `src/version.extra.js`
- modifiziert (idempotent): `src/config.js` (fügt `FEATURE_FLAGS` hinzu, falls nicht vorhanden)

## Anwendung
**Windows PowerShell:**
```powershell
cd <Dein/Projekt/PPPP>
# ZIP entpacken, dann:
./apply-patch.ps1
```

**macOS/Linux (zsh/bash):**
```bash
cd <Dein/Projekt/PPPP>
# ZIP entpacken, dann:
chmod +x ./apply-patch.sh
./apply-patch.sh
```

## Ergebnis
- `src/config.js` enthält:
  ```js
  export const FEATURE_FLAGS = { SPRITES_BETA: false, SIMULATION_V2: true };
  ```
- `src/version.extra.js` enthält Build-Infos (ID + Timestamp).
- `.github/pull_request_template.md` vorhanden.
- `CHANGELOG.md` ergänzt.

> Der Patch ist **idempotent**: Mehrfaches Ausführen fügt nichts doppelt ein.
