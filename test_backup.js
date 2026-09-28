const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const backupCode = html.slice(html.indexOf('/* ---------- SAO LƯU / KHÔI PHỤC'), html.indexOf('function showSettings(){'));
const restoreCode = html.slice(html.indexOf('function applyRestore('), html.indexOf('function giftCheck('));
const store = new Map([['ttnShop1', '{"day":4}']]);
const state = { day: 1, money: 400000, stock: {}, upg: {}, sell: {}, unlocked: {}, reviews: [], history: [], cur: {} };
const ctx = {
  S: state, R: {}, SAVE: 'ttnShop1', ITEMS: {},
  window: { CompressionStream, DecompressionStream },
  Blob, Response, TextEncoder, TextDecoder, Uint8Array, atob, btoa,
  localStorage: { getItem: k => store.get(k) ?? null, setItem: (k, v) => store.set(k, v) },
  loadFrom: () => { throw Error('bad save'); },
  toast: () => {}, save: () => {}, renderPrep: () => {}, shopName: () => 'Test',
  document: { title: '' }, $: () => ({})
};
vm.createContext(ctx);
vm.runInContext(backupCode + restoreCode, ctx);

(async () => {
  assert(!backupCode.includes('workers.dev') && !backupCode.includes('cloudFetch'));
  const code = await ctx.makeBackup();
  assert.match(code, /^TTN2\./);
  assert.equal((await ctx.readBackup(code)).day, 1);
  await assert.rejects(ctx.readBackup(code.replace('TTN2.', 'TTN1.')));
  ctx.applyRestore({ ...state, day: 2 });
  assert.equal(store.get('ttnShop1'), '{"day":4}', 'invalid restore must preserve the current save');
  assert.equal(ctx.S, state, 'invalid restore must preserve the active game');
  console.log('Backup format and failed restore: OK');
})().catch(e => { console.error(e); process.exitCode = 1; });
