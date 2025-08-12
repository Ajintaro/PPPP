# PPPP merged baseline v1

Dieses Paket kombiniert die saubere Electron-Basis mit deinem aktuellen Code.

## Was habe ich getan?
- Deine **src/** und **assets/** übernommen.
- **index.html** so angepasst, dass **./src/main.js** geladen wird.
- Im **src/** alle Import-Pfade wie `from './src/…'` auf `from './…'` korrigiert.
- **electron/** aus der Baseline behalten (ESM-sicher).
- Deine **package.json** als **package.user.json** beigelegt (Baseline package.json aktiv).
- Optionales Build-Config (electron-builder.yml) übernommen (falls vorhanden).

## Start
```bash
npm install
npm start
```

Wenn npm bei Electron meckert wegen Proxy/CA: Startscript un-settet `NODE_OPTIONS`, Installs machst du wie gehabt mit deinen CA-Settings.

## Bitte prüfen
- Liegt dein eigentlicher Renderer-Entry wirklich unter **src/main.js**?
  - Falls nicht, habe ich einen **Stub** erzeugt, der z. B. **src/app.js** importiert.
- In DevTools (Console):
  ```js
  console.log('ready');
  ```

## Änderungs-Report
- Import-Fixes in: keine gefunden

Viel Spaß! (Wenn dir noch konkrete Fehler im Renderer auffallen, poste mir die genaue Zeile aus der Console – ich patch’s dann gezielt.)
