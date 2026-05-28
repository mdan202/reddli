import { useState } from 'react';
import { RATE } from '../constants.js';
import { fmt } from '../utils/optimizer.js';
import LBPKeypad from './LBPKeypad.jsx';
import USDKeypad from './USDKeypad.jsx';

export default function ChangeChecker() {
  const [bill,    setBill]    = useState('');
  const [billCcy, setBillCcy] = useState('USD');
  const [paidU,   setPaidU]   = useState('');
  const [paidL,   setPaidL]   = useState(0);
  const [chngU,   setChngU]   = useState('');
  const [chngL,   setChngL]   = useState(0);
  const [result,  setResult]  = useState(null);

  // which keypad is open: null | 'paidL' | 'chngL' | 'billLBP' | 'paidU' | 'chngU'
  const [lbpPad, setLbpPad] = useState(null);
  const [usdPad, setUsdPad] = useState(null);

  const run = () => {
    const raw = parseFloat(bill) || 0;
    const b   = billCcy === 'USD' ? raw : raw / RATE;
    const pu  = parseFloat(paidU) || 0;
    const cu  = parseFloat(chngU) || 0;
    if (!b) { setResult(null); return; }
    const paid = pu + paidL / RATE;
    const chng = cu + chngL / RATE;
    const net  = paid - chng;
    const diff = net - b;
    const abs  = Math.abs(diff);
    const ok   = abs < 0.015;
    setResult({ ok, diff, abs });
  };

  const lbpDisplay = (val) => val > 0 ? fmt(val) + ' LL' : '0';

  return (
    <>
      <div className="page-desc">Did they give you the right change? Enter what you paid and what you got back — it tells you instantly if you were shortchanged in the LBP/USD mix. Catches the everyday rip-offs.</div>
      <div className="card">
      <div className="ci">
        <div className="ctitle">Change Checker · Works Offline</div>

        {/* Bill amount */}
        <div className="ctitle" style={{ fontSize: 12, marginBottom: 6 }}>Bill Amount</div>
        <div className="bill-input-row" style={{ marginBottom: 12 }}>
          {billCcy === 'USD' ? (
            <div className="bill-in" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setUsdPad('billUSD')}>
              {bill || <span style={{ color: 'var(--t3)' }}>0</span>}
            </div>
          ) : (
            <div className="bill-in" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setLbpPad('billLBP')}>
              {parseFloat(bill) > 0 ? fmt(parseFloat(bill)) : <span style={{ color: 'var(--t3)' }}>0</span>}
            </div>
          )}
          <div className="ccy-pill" onClick={() => { setBillCcy(c => c === 'USD' ? 'LBP' : 'USD'); setBill(''); setResult(null); }}>
            {billCcy}
          </div>
        </div>

        <div className="cc-lbl">💳 What you paid</div>
        <div className="cc-inputs">
          <div className="cc-iw" style={{ cursor: 'pointer' }} onClick={() => setUsdPad('paidU')}>
            <div className="cc-in" style={{ flex: 1, display: 'flex', alignItems: 'center', color: paidU ? 'var(--t)' : 'var(--t3)' }}>
              {paidU || '0'}
            </div>
            <span className="badge">USD</span>
          </div>
          <div className="cc-iw" style={{ cursor: 'pointer' }} onClick={() => setLbpPad('paidL')}>
            <div className="cc-in" style={{ flex: 1, display: 'flex', alignItems: 'center', color: paidL > 0 ? 'var(--t)' : 'var(--t3)' }}>
              {lbpDisplay(paidL)}
            </div>
            <span className="badge">LBP</span>
          </div>
        </div>

        <div className="cc-lbl">🔄 Change you received</div>
        <div className="cc-inputs">
          <div className="cc-iw" style={{ cursor: 'pointer' }} onClick={() => setUsdPad('chngU')}>
            <div className="cc-in" style={{ flex: 1, display: 'flex', alignItems: 'center', color: chngU ? 'var(--t)' : 'var(--t3)' }}>
              {chngU || '0'}
            </div>
            <span className="badge">USD</span>
          </div>
          <div className="cc-iw" style={{ cursor: 'pointer' }} onClick={() => setLbpPad('chngL')}>
            <div className="cc-in" style={{ flex: 1, display: 'flex', alignItems: 'center', color: chngL > 0 ? 'var(--t)' : 'var(--t3)' }}>
              {lbpDisplay(chngL)}
            </div>
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

      {/* LBP Keypads */}
      {lbpPad === 'paidL' && (
        <LBPKeypad
          initialValue={paidL}
          label="LBP Paid"
          onValue={v => { setPaidL(v); setResult(null); }}
          onClose={() => setLbpPad(null)}
        />
      )}
      {lbpPad === 'chngL' && (
        <LBPKeypad
          initialValue={chngL}
          label="LBP Change Received"
          onValue={v => { setChngL(v); setResult(null); }}
          onClose={() => setLbpPad(null)}
        />
      )}
      {lbpPad === 'billLBP' && (
        <LBPKeypad
          initialValue={parseFloat(bill) || 0}
          label="Bill Amount (LBP)"
          onValue={v => { setBill(String(v)); setResult(null); }}
          onClose={() => setLbpPad(null)}
        />
      )}
      {usdPad === 'billUSD' && (
        <USDKeypad
          initialValue={bill}
          label="Bill Amount (USD)"
          onValue={v => { setBill(v); setResult(null); }}
          onClose={() => setUsdPad(null)}
        />
      )}
      {usdPad === 'paidU' && (
        <USDKeypad
          initialValue={paidU}
          label="USD Paid"
          onValue={v => { setPaidU(v); setResult(null); }}
          onClose={() => setUsdPad(null)}
        />
      )}
      {usdPad === 'chngU' && (
        <USDKeypad
          initialValue={chngU}
          label="USD Change Received"
          onValue={v => { setChngU(v); setResult(null); }}
          onClose={() => setUsdPad(null)}
        />
      )}
    </>
  );
}
