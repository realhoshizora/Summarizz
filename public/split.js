// Pure split math. All money is integer đồng; no floats touch a balance.
(function (root) {
  const UNIT = 1000; // transfers are rounded to 1.000đ

  // "120.000", "120,000", "120 000" → 120000. Returns NaN when there are no digits.
  function parseVND(text) {
    const digits = String(text).replace(/\D/g, '');
    return digits ? Number(digits) : NaN;
  }

  function formatVND(n) {
    return (n < 0 ? '−' : '') + Math.abs(n).toLocaleString('vi-VN');
  }

  // Split one amount among sharers exactly: everyone gets floor(amount/n),
  // the leftover đồng go one each to the first sharers in member order.
  function shareOf(amount, sharerIds) {
    const n = sharerIds.length, base = Math.floor(amount / n), extra = amount - base * n;
    const out = {};
    sharerIds.forEach((id, i) => { out[id] = base + (i < extra ? 1 : 0); });
    return out;
  }

  // paid, owed and exact net per member (sum of nets is always 0).
  function balances(members, expenses) {
    const rows = {};
    members.forEach(m => { rows[m.id] = { id: m.id, name: m.name, paid: 0, owed: 0 }; });
    for (const e of expenses) {
      rows[e.payerId].paid += e.amount;
      const order = members.map(m => m.id).filter(id => e.sharerIds.includes(id));
      const shares = shareOf(e.amount, order);
      for (const id in shares) rows[id].owed += shares[id];
    }
    return members.map(m => { const r = rows[m.id]; r.net = r.paid - r.owed; return r; });
  }

  // Round every net to a multiple of UNIT while keeping the sum at exactly 0
  // (largest-remainder method): floor all, then give +UNIT to the people with
  // the biggest leftovers until the books balance. Every |rounded − exact| < UNIT.
  function roundNets(nets) {
    const floors = nets.map(n => Math.floor(n / UNIT) * UNIT);
    let missing = -floors.reduce((a, b) => a + b, 0) / UNIT;
    const byLeftover = nets.map((n, i) => i).sort((a, b) => (nets[b] - floors[b]) - (nets[a] - floors[a]) || a - b);
    const out = floors.slice();
    for (const i of byLeftover) { if (missing-- <= 0) break; out[i] += UNIT; }
    return out;
  }

  // Settle one group whose balances sum to 0: biggest debtor pays biggest creditor.
  // A group of m people is settled in at most m − 1 transfers.
  function settleGreedy(people) {
    const cred = people.filter(p => p.amt > 0).map(p => ({ ...p })).sort((a, b) => b.amt - a.amt);
    const debt = people.filter(p => p.amt < 0).map(p => ({ ...p, amt: -p.amt })).sort((a, b) => b.amt - a.amt);
    const out = [];
    let i = 0, j = 0;
    while (i < debt.length && j < cred.length) {
      const x = Math.min(debt[i].amt, cred[j].amt);
      out.push({ from: debt[i].id, to: cred[j].id, amount: x });
      if (!(debt[i].amt -= x)) i++;
      if (!(cred[j].amt -= x)) j++;
    }
    return out;
  }

  // Minimum number of transfers. With k people still owed/owing, the answer is
  // k − G, where G is the largest number of disjoint groups that each sum to 0
  // (each such group settles internally in size − 1 transfers). G is found
  // exactly by a DP over subsets: dp[mask] = most zero-sum groups that the
  // people in `mask` can be split into.
  const EXACT_LIMIT = 18; // 2^18 subsets is still instant in a browser
  function minTransfers(people) {
    const ps = people.filter(p => p.amt !== 0);
    const k = ps.length;
    // shortcut: above EXACT_LIMIT people the greedy may use a few extra transfers; fine for real outings.
    if (k > EXACT_LIMIT) return settleGreedy(ps);
    const full = (1 << k) - 1, sum = new Array(full + 1).fill(0), dp = new Int8Array(full + 1);
    for (let mask = 1; mask <= full; mask++) {
      const low = mask & -mask, i = 31 - Math.clz32(low);
      sum[mask] = sum[mask ^ low] + ps[i].amt;
      let best = 0;
      for (let b = mask; b; b &= b - 1) best = Math.max(best, dp[mask ^ (b & -b)]);
      dp[mask] = best + (sum[mask] === 0 ? 1 : 0);
    }
    // Walk back through the DP to recover the groups, then settle each one.
    const out = [];
    let mask = full, group = [];
    while (mask) {
      const gain = sum[mask] === 0 ? 1 : 0;
      let b = mask;
      while (dp[mask ^ (b & -b)] + gain !== dp[mask]) b &= b - 1;
      const bit = b & -b;
      group.push(ps[31 - Math.clz32(bit)]);
      mask ^= bit;
      if (sum[mask] === 0) { out.push(...settleGreedy(group)); group = []; }
    }
    return out;
  }

  // Everything the UI needs for one session.
  function settle(session) {
    const rows = balances(session.members, session.expenses);
    const rounded = roundNets(rows.map(r => r.net));
    rows.forEach((r, i) => { r.rounded = rounded[i]; r.roundDiff = rounded[i] - r.net; });
    const transfers = minTransfers(rows.map(r => ({ id: r.id, amt: r.rounded })));
    const total = session.expenses.reduce((a, e) => a + e.amount, 0);
    return { rows, transfers, total };
  }

  const api = { UNIT, parseVND, formatVND, shareOf, balances, roundNets, minTransfers, settle };
  if (typeof module !== 'undefined') module.exports = api; else root.Split = api;
})(this);
