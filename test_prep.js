const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');

const html = fs.readFileSync('index.html', 'utf8');
const source = (start, end) => html.slice(html.indexOf(start), html.indexOf(end, html.indexOf(start)));
const toast = { classList: { toggle() {}, add() {}, remove() {} } };
let opened = false;
const ctx = {
  S: { day: 1, money: 400000, unlocked: { tea: true, top: true } },
  R: { mode: 'prep', plan: {} }, BASE_KEYS: ['tea'], TOP_KEYS: ['top'],
  stock: {}, qty: k => ctx.stock[k] || 0, planTotal: () => 0,
  $: () => toast, performance: { now: () => 0 },
  clearTimeout() {}, setTimeout() {}, renderPrep() {},
  startDay: () => { opened = true; }
};
vm.createContext(ctx);
vm.runInContext(
  source('function ico(', '\n') +
  source('function obarHTML(){', '\nfunction renderObar(') +
  source('function missingPrep(){', '\nfunction paneUpg(') +
  source('let tt,tPri=0;', '\n\n'), ctx);

for (const [stock, message, tab] of [
  [{}, 'Trà, Topping, Ly', 0],
  [{ tea: 5, cup: 5 }, 'Topping', 1],
  [{ tea: 5, top: 5 }, 'Ly', 2]
]) {
  ctx.stock = stock;
  const button = ctx.obarHTML();
  assert.match(button, /<img class="ico"/);
  assert.match(button, /Chưa nấu/);
  ctx.tryOpen();
  assert.doesNotMatch(toast.textContent, /<[^>]*>/, 'warning must not display raw HTML');
  assert.match(toast.textContent, new RegExp('Chưa nấu: ' + message + '$'));
  assert.equal(ctx.R.sub.kho, tab, 'open the first missing stock category');
  assert.equal(opened, false, 'missing stock must prevent opening');
}
ctx.stock = { tea: 5, top: 5, cup: 5 };
ctx.tryOpen();
assert.equal(opened, true);
console.log('Preparation warnings and stock tabs: OK');
