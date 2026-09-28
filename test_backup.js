const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const backupCode = html.slice(html.indexOf('/* ---------- SAO LƯU / KHÔI PHỤC'), html.indexOf('function showSettings(){'));
const restoreCode = html.slice(html.indexOf('function restoreStorageError('), html.indexOf('function giftCheck('));
const SAVE = 'ttnShop1';
const PRE_RESTORE = 'ttnShop1_preRestore';
const record = day => ({day,sales:{},tips:0,onl:0,fee:0,equip:[],ing:{},waste:{},rent:0,util:0,tax:0,served:0,lost:0,starSum:0,starN:0,spoil:{n:0,v:0}});
const state = {day:1,money:400000,stock:{},sell:{},upg:{},unlocked:{},reviews:[],history:[],cur:record(1)};
const store = new Map([[SAVE, JSON.stringify(state)], [PRE_RESTORE, 'older copy']]);
let deniedKey = null;
const ctx = {
  S: state, R: {}, SAVE, PRE_RESTORE, ITEMS: {}, DEF_SELL: {},
  window: { CompressionStream, DecompressionStream },
  Blob, Response, TransformStream, TextEncoder, TextDecoder, Uint8Array, atob, btoa,
  localStorage: {
    getItem: key => store.get(key) ?? null,
    setItem: (key, value) => { if (key === deniedKey) throw Error('quota'); store.set(key, value); },
    removeItem: key => store.delete(key)
  },
  buildSave: d => { if (!ctx.validSave(d)) throw Error('invalid save'); return JSON.parse(JSON.stringify(d)); },
  pack: (_maxRev, value = ctx.S) => JSON.stringify(value),
  clearInterval: () => {}, clearTimeout: () => {}, newCup: () => ({}),
  renderPrep: () => {}, ask: () => {}, backupDlg: () => {}, toast: () => {},
  shopName: () => 'Test', document: { title: '' }, timer: null, cup: null, uid: 0
};
vm.createContext(ctx);
vm.runInContext(backupCode + restoreCode, ctx);

(async () => {
  assert(!backupCode.includes('workers.dev') && !backupCode.includes('cloudFetch'));
  const code = await ctx.makeBackup();
  assert.match(code, /^TTN2\./);
  assert.equal((await ctx.readBackup(code)).day, 1);
  await assert.rejects(ctx.readBackup(code.replace('TTN2.', 'TTN1.')));
  await assert.rejects(ctx.readBackup('12345678'));

  const bad = { ...state, cur: { ...state.cur, sales: 'bad' } };
  assert.equal(ctx.applyRestore(bad), false);
  assert.equal(store.get(SAVE), JSON.stringify(state));
  assert.equal(store.get(PRE_RESTORE), 'older copy');
  assert.equal(ctx.S, state);

  const next = { ...state, day: 2, cur: record(2) };
  assert.equal(ctx.applyRestore(next), true);
  assert.equal(JSON.parse(store.get(PRE_RESTORE)).day, 1);
  assert.equal(JSON.parse(store.get(SAVE)).day, 2);
  assert.equal(ctx.R.mode, 'prep');

  const later = { ...next, day: 3, cur: record(3) };
  deniedKey = SAVE;
  assert.equal(ctx.applyRestore(later), false);
  assert.equal(JSON.parse(store.get(SAVE)).day, 2, 'quota failure must retain the primary save');
  assert.equal(JSON.parse(store.get(PRE_RESTORE)).day, 2, 'current progress stays recoverable');
  assert.equal(ctx.S.day, 2, 'quota failure must retain the active game');
  console.log('TTN2 backup and safe restore: OK');
})().catch(e => { console.error(e); process.exitCode = 1; });
