# Pew Pew Pizza Pirates - Balancing Patch

## Salami Orbit Balancing Fix

### Problem
Das Salami Orbit-System spawnte bei jedem Cooldown neue Orbitale, was zu einer unkontrollierten Anzahl von rotierenden Salamis führte.

### Lösung
- **Feste Anzahl**: Nur 1 Salami wird initial gespawnt
- **Level-Up Upgrades**: Weitere Salamis nur durch "+1 Orbit" Upgrades (max. 6)
- **Kontinuierliche Rotation**: Orbitale rotieren kontinuierlich um den Spieler
- **Keine Lebensdauer**: Orbitale werden nicht durch Zeit zerstört, sondern durch die Waffe verwaltet

### Technische Änderungen

#### weapons.js
- Neue Funktionen: `spawnOrbitalSet()`, `updateOrbitals()`, `removeWeaponOrbitals()`
- Orbital-Waffen haben jetzt `orbitalsInitialized` Flag
- Orbitale werden mit `weaponKey` getrackt
- Upgrade "+1 Orbit" setzt `orbitalsInitialized = false` für Neuspawn

#### game.js
- Entfernung der doppelten Orbital-Bewegungsberechnung
- Orbitale werden nicht mehr durch Lebensdauer zerstört
- Kollisionserkennung für Orbitale (kein Pierce, aber auch keine Zerstörung)

#### ui.js
- Spezielle Behandlung für Orbital-Upgrades im Level-Up-System

### Balancing-Werte
- **Start**: 1 Salami
- **Max**: 6 Salamis durch Upgrades
- **Rotation**: 2.0 rad/s
- **Radius**: 80 (upgradebar)
- **Schaden**: 8 (upgradebar)

### Testen
1. Starte das Spiel
2. Wähle Salami Orbit als Waffe
3. Überprüfe: Nur 1 Salami rotiert
4. Level-Up: Wähle "+1 Orbit" Upgrade
5. Überprüfe: 2 Salamis rotieren
6. Wiederhole bis max. 6 Salamis

### Nächste Schritte
- [ ] HUD mit Waffen-Panel implementieren
- [ ] Level-Up-Dialog mit klickbaren Karten
- [ ] Pause-Menü (ESC)
- [ ] Assets (Sprites, SFX, Musik)
