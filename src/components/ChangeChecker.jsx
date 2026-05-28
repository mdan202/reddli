import { useState } from 'react';
import { RATE } from '../constants.js';
import { fmt } from '../utils/optimizer.js';

export default function ChangeChecker() {
  const [bill,    setBill]    = useState('');
  const [billCcy, setBillCcy] = useState('USD');
  const [paidU,   setPaidU]   = useState('');
  const [paidL,   setPaidL]   = useState('');
  const [chngU,   setChngU]   = useState('');
  const [chngL,   setChngL]   = useState('');
  const [result,  setResult]  = useState(null);

  const run = () => {
    const raw = parseFloat(bill) || 0;
    const b   = billCcy === 'USD' ? raw : raw / RATE;
    const pu = parseFloat(paidU) || 0;
    const pl = parseFloat(paidL) || 0;
    const cu = parseFloat(chngU) || 0;
    const cl = parseFloat(chngL) || 0;
    if (!b) { setResult(null); return; }
    const paid = pu + pl / RATE;
    const chng = cu + cl / RATE;
    const net  = paid - chng;
    const diff = net - b;
    const abs  = Math.abs(diff);
    const ok   = abs < 0.015;
    setResult({ ok, diff, abs });
  };

  return (
    <>
      <div className="page-desc">Did they give you the right change? Enter what you paid and what you got back — it tells you instantly if you were shortchanged in the LBP/USD mix. Catches the everyday rip-offs.</div>
      <div className="card">
      <div className="ci">
        <div className="ctitle">Change Checker · Works Offline</div>

        <div className="ctitle">Bill Amount</div>
        <div className="bill-input-row" style={{ marginBottom: 12 }}>
          <input className="bill-in" type="number" placeholder="0"
            value={bill} onChange={e => { setBill(e.target.value); run(); }} />
          <div className="ccy-pill" onClick={() => { setBillCcy(c => c === 'USD' ? 'LBP' : 'USD'); setResult(null); }}>
            {billCcy}
          </div>
        </div>

        <div className="cc-lbl">💳 What you paid</div>
        <div className="cc-inputs">
          <div className="cc-iw">
            <input className="cc-in" type="number" placeholder="0"
              value={paidU} onChange={e => { setPaidU(e.target.value); run(); }} />
            <span className="badge">USD</span>
          </div>
          <div className="cc-iw">
            <input className="cc-in" type="number" placeholder="0"
              value={paidL} onChange={e => { setPaidL(e.target.value); run(); }} />
            <span className="badge">LBP</span>
          </div>
        </div>

        <div className="cc-lbl">🔄 Change you received</div>
        <div className="cc-inputs">
          <div className="cc-iw">
            <input className="cc-in" type="number" placeholder="0"
              value={chngU} onChange={e => { setChngU(e.target.value); run(); }} />
            <span className="badge">USD</span>
          </div>
          <div className="cc-iw">
            <input className="cc-in" type="number" placeholder="0"
              value={chngL} onChange={e => { setChngL(e.target.value); run(); }} />
            <span className="badge">LBP</span>
          </div>
        </div>

        <button className="btn-p" style={{ marginTop: 4 }} onClick={run}>
          ✓ Verify Change
        </button>

        {result && (
          <div style={{ marginTop: 12 }}>
            {result.ok ? (
              <div className="cc-res ok fade">
                <div className="cc-res-ico">✅</div>
                <div className="cc-res-ttl">Correct Change</div>
              </div>
            ) : (
              <div className="cc-res bad fade">
                <div className="cc-res-ico">❌</div>
                <div className="cc-res-ttl">{result.diff > 0 ? 'Shortchanged' : 'You Overpaid'}</div>
                <div className="cc-bk">
                  <div className="cc-bk-item">
                    <div className="cc-bk-lbl">{result.diff > 0 ? 'Owed to you' : 'Overpaid by'}</div>
                    <div className="cc-bk-val" style={{ color: result.diff > 0 ? 'var(--red)' : 'var(--green)' }}>
                      ${result.abs.toFixed(2)} / {fmt(result.abs * RATE)} LL
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
    </>
  );
}
