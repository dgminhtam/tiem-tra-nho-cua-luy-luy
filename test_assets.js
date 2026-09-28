const assert = require('node:assert/strict');
const fs = require('node:fs');

const sw = fs.readFileSync('sw.js', 'utf8');
const list = sw.match(/const FILES = \[(.*?)\];/s);
assert(list, 'service worker cache list is missing');
const files = [...list[1].matchAll(/'([^']+)'/g)]
  .map(match => match[1]);

assert(files.length > 0, 'service worker cache list is empty');
for (const file of files) assert(fs.existsSync(file), `missing cache asset: ${file}`);
console.log(`Service-worker assets: ${files.length} paths OK`);
