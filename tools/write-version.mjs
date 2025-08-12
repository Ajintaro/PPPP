// tools/write-version.mjs
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
const pkg = JSON.parse(readFileSync('package.json','utf8'));
const VERSION = pkg.version || '0.0.0-dev';
const BUILD = new Date().toISOString().replace(/[:.]/g,'-');
mkdirSync('src', { recursive: true });
writeFileSync('src/version.js', `export const VERSION='${VERSION}';\nexport const BUILD='${BUILD}';\n`, 'utf8');
console.log('[write-version] version.js ->', VERSION, BUILD);
