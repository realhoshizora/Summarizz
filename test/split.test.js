// Run: node --test
const test = require('node:test');
const assert = require('node:assert');
const S = require('../public/split.js');

const m = names => names.map(n => ({ id: n, name: n }));
const sumBy = (arr, f) => arr.reduce((a, x) => a + f(x), 0);

test('parseVND accepts dots, commas, spaces', () => {
  assert.strictEqual(S.parseVND('120.000'), 120000);
  assert.strictEqual(S.parseVND('120,000'), 120000);
  assert.strictEqual(S.parseVND(' 1 200 000đ'), 1200000);
  assert.ok(Number.isNaN(S.parseVND('abc')));
});

test('shares are exact to the đồng', () => {
  const s = S.shareOf(100000, ['a', 'b', 'c']);
  assert.deepStrictEqual(s, { a: 33334, b: 33333, c: 33333 });
});

test('subset split from the brief: trà tắc for 3, xe for 6', () => {
  const members = m(['A', 'B', 'C', 'D', 'E', 'F']);
  const expenses = [
    { payerId: 'A', amount: 45000, sharerIds: ['A', 'B', 'C'] },
    { payerId: 'D', amount: 240000, sharerIds: members.map(x => x.id) },
  ];
  const { rows, transfers } = S.settle({ members, expenses });
  assert.strictEqual(sumBy(rows, r => r.net), 0);
  assert.strictEqual(sumBy(rows, r => r.rounded), 0);
  rows.forEach(r => assert.ok(Math.abs(r.roundDiff) < S.UNIT));
  transfers.forEach(t => assert.strictEqual(t.amount % S.UNIT, 0));
  // Applying the transfers zeroes every rounded balance.
  const bal = Object.fromEntries(rows.map(r => [r.id, r.rounded]));
  transfers.forEach(t => { bal[t.from] += t.amount; bal[t.to] -= t.amount; });
  Object.values(bal).forEach(v => assert.strictEqual(v, 0));
});

test('finds zero-sum pairs that greedy would miss', () => {
  // Greedy (largest-to-largest) needs 4 transfers here; optimum is 3: (A,D) and (B,C,E) groups.
  const people = [
    { id: 'A', amt: 6000 }, { id: 'B', amt: 5000 }, { id: 'C', amt: 2000 },
    { id: 'D', amt: -6000 }, { id: 'E', amt: -7000 },
  ];
  assert.strictEqual(S.minTransfers(people).length, 3);
});

test('random sessions: always balanced and never more than n−1 transfers', () => {
  for (let t = 0; t < 300; t++) {
    const members = m('ABCDEFGH'.slice(0, 2 + (t % 7)).split(''));
    const ids = members.map(x => x.id);
    const expenses = Array.from({ length: 1 + (t % 6) }, (_, i) => {
      const sharers = ids.filter((_, j) => (t * 7 + i * 3 + j) % 3) ;
      return { payerId: ids[(t + i) % ids.length], amount: 1000 + ((t * 7919 + i * 104729) % 900000), sharerIds: sharers.length ? sharers : ids };
    });
    const { rows, transfers } = S.settle({ members, expenses });
    assert.strictEqual(sumBy(rows, r => r.owed), sumBy(expenses, e => e.amount));
    const bal = Object.fromEntries(rows.map(r => [r.id, r.rounded]));
    transfers.forEach(x => { assert.ok(x.amount > 0); bal[x.from] += x.amount; bal[x.to] -= x.amount; });
    Object.values(bal).forEach(v => assert.strictEqual(v, 0));
    assert.ok(transfers.length <= rows.filter(r => r.rounded).length - 1 || transfers.length === 0);
  }
});
