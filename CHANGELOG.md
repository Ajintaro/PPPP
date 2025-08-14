# Changelog

## 2025-01-27 – Balancing: Salami Orbit Fix + Force Field Fix
- **FIX**: Salami Orbit spawnt jetzt nur 1 Salami initial
- **FIX**: Weitere Salamis nur durch "+1 Orbit" Level-Up-Upgrades (max. 6)
- **FIX**: Orbitale rotieren kontinuierlich ohne Lebensdauer
- **FIX**: Cheese Force Field macht jetzt Schaden (Timer-Bug behoben)
- **IMPROVE**: Force Field Balancing (8 DMG, 80 Radius, 0.6s Tick)
- **NEW**: Orbital-System mit `spawnOrbitalSet()`, `updateOrbitals()`, `removeWeaponOrbitals()`
- **NEW**: Waffen-spezifische Orbital-Verwaltung mit `weaponKey` Tracking
- **IMPROVE**: Kollisionserkennung für Orbitale (kein Pierce, keine Zerstörung)
- **IMPROVE**: Upgrade-System für Orbital-Waffen
- **IMPROVE**: Force Field Upgrade-Pool (+3 DMG, +25% Radius, -20% Tick)

## 2025-08-11 – Patch: Feature-Flags + Prozess
- Add FEATURE_FLAGS in src/config.js (SPRITES_BETA=false, SIMULATION_V2=true)
- Add src/version.extra.js (BUILD_INFO)
- Add PR-Template
- Add apply-patch scripts (idempotent)

## '"$(date +%Y-%m-%d)"' – Patch: Feature-Flags + Prozess
- Add FEATURE_FLAGS in src/config.js (SPRITES_BETA=false, SIMULATION_V2=true)
- Add src/version.extra.js (BUILD_INFO)
- Add PR-Template
- Add apply-patch scripts (idempotent)
