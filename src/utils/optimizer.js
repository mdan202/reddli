import { RATE, USD_DENOMS, LBP_DENOMS } from '../constants.js';

export function fmt(n) {
  return Math.round(n).toLocaleString();
}

export function getSubs(arr) {
  const c = {};
  arr.forEach(v => c[v] = (c[v] || 0) + 1);
  const ks = Object.keys(c).map(Number);
  const res = [[]];
  for (const d of ks) {
    const cn = c[d];
    const cu = [...res];
    for (let q = 1; q <= cn; q++) {
      for (const s of cu) res.push([...s, ...Array(q).fill(d)]);
    }
  }
  return res;
}

export function brk(bills, unit) {
  if (!bills || !bills.length) return '';
  const c = {};
  bills.forEach(b => c[b] = (c[b] || 0) + 1);
  return Object.entries(c)
    .sort((a, b) => b[0] - a[0])
    .map(([v, n]) => `${n}×${unit === '$' ? '$' + v : fmt(+v) + ' LL'}`)
    .join(' + ');
}

export function runOptimizer(billAmt, billCcy, usdQ, lbpQ) {
  const raw = parseFloat(billAmt) || 0;
  const billUSD = billCcy === 'LBP' ? raw / RATE : raw;

  const uB = [], lB = [];
  USD_DENOMS.forEach(d => { for (let i = 0; i < (usdQ[d.val] || 0); i++) uB.push(d.val); });
  LBP_DENOMS.forEach(d => { for (let i = 0; i < (lbpQ[d.val] || 0); i++) lB.push(d.val); });

  if (!billUSD) return { type: 'no-amount' };
  if (!uB.length && !lB.length) return { type: 'no-bills' };

  const tot = uB.reduce((a, b) => a + b, 0) + lB.reduce((a, b) => a + b, 0) / RATE;
  if (tot < billUSD - 0.01) return { type: 'insufficient', have: tot, need: billUSD };

  const uSS = getSubs(uB), lSS = getSubs(lB);
  const opts = [], seen = new Set();

  for (const us of uSS) {
    const gU = us.reduce((a, b) => a + b, 0);
    for (const ls of lSS) {
      const gL = ls.reduce((a, b) => a + b, 0);
      const give = gU + gL / RATE;
      if (give < billUSD - 0.005 || give - billUSD > 55) continue;
      const key = gU + '_' + gL;
      if (seen.has(key)) continue;
      seen.add(key);
      const ch = give - billUSD;
      const isEx = ch < 0.01;
      const chU = Math.floor(ch);
      const chL = Math.round((ch - chU) * RATE / 1000) * 1000;
      const sc =
        (isEx ? 0 : 1) * 1e10 +
        give * 1e4 +
        ch * 1e3 +
        (us.every(b => [100, 50, 20, 10].includes(b)) ? 0 : 400) +
        (ls.every(b => [100000, 50000, 20000].includes(b)) ? 0 : 150);
      opts.push({ gU, gL, chU, chL, isEx, ch, sc, us, ls });
    }
  }

  opts.sort((a, b) => a.sc - b.sc);
  const top = opts.slice(0, 5);
  if (!top.length) return { type: 'no-combo' };
  return { type: 'ok', options: top };
}
