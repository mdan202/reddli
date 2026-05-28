import { useState } from 'react';
import WalletSection from './WalletSection.jsx';
import { USD_DENOMS, LBP_DENOMS, RATE } from '../constants.js';
import { runOptimizer, fmt, brk } from '../utils/optimizer.js';
import USDKeypad from './USDKeypad.jsx';
import LBPKeypad from './LBPKeypad.jsx';

const initQty = (denoms) => Object.fromEntries(denoms.map(d => [d.val, 0]));

export default function SmartPay({ showToast }) {
  const [usdQ,    setUsdQ]    = useState(() => initQty(USD_DENOMS));
  const [lbpQ,    setLbpQ]    = useState(() => initQty(LBP_DENOMS));
  const [billAmt, setBillAmt] = useState('117');
  const [billCcy, setBillCcy] = useState('USD');
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showUSDPad, setShowUSDPad] = useState(false);
  const [showLBPPad, setShowLBPPad] = useState(false);

  const changeQty = (currency, denom, delta) => {
    const setter = currency === 'usd' ? setUsdQ : setLbpQ;
    setter(prev => ({ ...prev, [denom]: Math.max(0, (prev[denom] || 0) + delta) }));
  };

  const totalUSD = USD_DENOMS.reduce((s, d) => s + (usdQ[d.val] || 0) * d.val, 0);
  const totalLBP = LBP_DENOMS.reduce((s, d) => s + (lbpQ[d.val] || 0) * d.val, 0);
  const totalAll = totalUSD + totalLBP / RATE;

  const handleRun = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const res = runOptimizer(billAmt, billCcy, usdQ, lbpQ);
      setResults(res);
      if (res.type === 'ok') showToast('⚡', res.options.length + ' options — best shown first');
    }, 440);
  };

  const cpOpt = (btn, txt) => {
    try { navigator.clipboard.writeText(txt); } catch (_) {}
    btn.textContent = '✓ Copied';
    setTimeout(() => { btn.textContent = '📋 Copy'; }, 1800);
    showToast('📋', txt.substring(0, 50) + (txt.length > 50 ? '…' : ''));
  };

  return (
    <>
      <div className="page-desc">Pay with exactly what you have — tell it which bills you're carrying and it finds the smartest way to pay, avoiding overpaying or getting bad change back. Saves you money every transaction.</div>
      <div className="card">
        <div className="ci">
          <div className="ctitle">Bill Amount</div>
          <div className="bill-input-row">
            <div className="bill-in" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => billCcy === 'USD' ? setShowUSDPad(true) : setShowLBPPad(true)}>
              {billAmt && billAmt !== '0'
                ? (billCcy === 'LBP' ? fmt(parseFloat(billAmt)) : billAmt)
                : <span style={{ color: 'var(--t3)' }}>0</span>}
            </div>
            <div className="ccy-pill" onClick={() => { setBillCcy(c => c === 'USD' ? 'LBP' : 'USD'); setBillAmt(''); }}>
              {billCcy}
            </div>
          </div>
        </div>
      </div>

      <WalletSection currency="usd" denoms={USD_DENOMS} quantities={usdQ} onChangeQty={changeQty} />
      <WalletSection currency="lbp" denoms={LBP_DENOMS} quantities={lbpQ} onChangeQty={changeQty} />

      <div className="total-bar">
        <div>
          <div className="total-bar-lbl">Total in wallet</div>
          <div className="total-bar-val">${totalAll.toFixed(2)}</div>
        </div>
        <div style={{ fontSize: '11.5px', color: 'var(--cg)', textAlign: 'right', lineHeight: 1.6 }}>
          <div>${totalUSD} cash</div>
          <div>{fmt(totalLBP)} LL</div>
        </div>
      </div>

      <button className="calc-btn" disabled={loading} onClick={handleRun}>
        {loading
          ? <><span style={{ opacity: 0.4 }}>⚡ Find Best Payment Options</span><span className="spin" /></>
          : <span>⚡ Find Best Payment Options</span>
        }
      </button>

      <OptResults results={results} cpOpt={cpOpt} />

      {showUSDPad && (
        <USDKeypad
          initialValue={billAmt}
          label="Bill Amount (USD)"
          onValue={v => setBillAmt(v)}
          onClose={() => setShowUSDPad(false)}
        />
      )}
      {showLBPPad && (
        <LBPKeypad
          initialValue={parseFloat(billAmt) || 0}
          label="Bill Amount (LBP)"
          onValue={v => setBillAmt(String(v))}
          onClose={() => setShowLBPPad(false)}
        />
      )}
    </>
  );
}

function OptResults({ results, cpOpt }) {
  if (!results) return null;

  if (results.type === 'no-amount') return (
    <div className="empty">
      <div className="empty-ic">🧾</div>
      <div className="empty-t">Enter a bill amount</div>
    </div>
  );
  if (results.type === 'no-bills') return (
    <div className="empty">
      <div className="empty-ic">👜</div>
      <div className="empty-t">Add your bills first</div>
      <div className="empty-s">Tap USD or LBP section above</div>
    </div>
  );
  if (results.type === 'insufficient') return (
    <div className="empty">
      <div className="empty-ic">💸</div>
      <div className="empty-t">Not enough funds</div>
      <div className="empty-s">Have ${results.have.toFixed(2)} need ${results.need.toFixed(2)}</div>
    </div>
  );
  if (results.type === 'no-combo') return (
    <div className="empty">
      <div className="empty-ic">🤔</div>
      <div className="empty-t">No valid combinations</div>
    </div>
  );

  return (
    <div className="results-list fade">
      {results.options.map((o, i) => {
        const isBest = i === 0;
        const cls    = o.isEx ? 'exact' : isBest ? 'best' : '';
        const gParts = [];
        if (o.gU > 0) gParts.push('$' + o.gU);
        if (o.gL > 0) gParts.push(fmt(o.gL) + ' LL');
        const gS = gParts.join(' + ') || '—';
        const cParts = [];
        if (o.chU > 0) cParts.push('$' + o.chU);
        if (o.chL > 0) cParts.push(fmt(o.chL) + ' LL');
        const cS   = cParts.join(' + ') || 'No change';
        const uBD  = brk(o.us, '$');
        const lBD  = brk(o.ls, 'LL');
        const cpTxt = 'Give ' + gS + (o.isEx ? ' — exact payment' : ' | Change: ' + cS);

        return (
          <div key={i} className={`opt-card ${cls}`}>
            <div className="opt-badges">
              {o.isEx  && <span className="b-exact">✓ Exact</span>}
              {isBest && !o.isEx && <span className="b-best">★ Best Option</span>}
              {!isBest && <span className="b-rank">#{i + 1}</span>}
            </div>
            <div className="opt-give">Give <em>{gS}</em></div>
            {uBD && <div className="opt-bills">💵 {uBD}</div>}
            {lBD && <div className="opt-bills">🇱🇧 {lBD}</div>}
            <div className="opt-footer">
              <div style={{ fontSize: 11, color: 'var(--t3)' }}>
                {o.isEx
                  ? '🎯 No change needed'
                  : <>🔄 Change: <strong style={{ color: 'var(--cg)' }}>{cS}</strong></>
                }
              </div>
              <button className="copy-btn" onClick={e => cpOpt(e.currentTarget, cpTxt)}>
                📋 Copy
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
