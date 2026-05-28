import { useState, useEffect } from 'react';

/*
  LBPKeypad — bottom-sheet keypad for LBP amounts.
  Props:
    initialValue  number   starting numeric value (optional)
    onValue       fn(num)  called on every keystroke with current numeric value
    onClose       fn()     called when user taps Done or backdrop
    label         string   field label shown at top of sheet
*/
export default function LBPKeypad({ initialValue = 0, onValue, onClose, label = 'Amount (LBP)' }) {
  const initDisplay = initialValue > 0 ? String(initialValue) : '';
  const [digits, setDigits] = useState(initDisplay);
  const [mult,   setMult]   = useState(''); // '' | 'K' | 'M'

  const numericValue = (d = digits, m = mult) => {
    const n = parseFloat(d) || 0;
    if (m === 'K') return n * 1000;
    if (m === 'M') return n * 1000000;
    return n;
  };

  useEffect(() => {
    onValue(numericValue());
  }, [digits, mult]);

  const handleKey = (k) => {
    if (mult) return; // locked after K/M
    if (k === 'del') {
      setDigits(d => d.slice(0, -1));
      return;
    }
    if (digits.length >= 9) return;
    setDigits(d => (d === '0' ? k : d + k));
  };

  const handleMult = (m) => {
    if (!digits || digits === '0') return;
    if (mult === m) { setMult(''); return; } // toggle off
    setMult(m);
  };

  const displayStr = digits
    ? digits + (mult ? mult : '')
    : '0';

  const subLabel = mult === 'K'
    ? `${digits} Alf`
    : mult === 'M'
    ? `${digits} Malyon`
    : '';

  return (
    <div
      onClick={onClose}
      style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 200,
        display: 'flex', alignItems: 'flex-end' }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{ width: '100%', maxWidth: 390, margin: '0 auto',
          background: 'var(--s)', borderRadius: '20px 20px 0 0',
          padding: '16px 16px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}
      >
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'var(--t3)', fontWeight: 600 }}>{label}</div>
          <button
            onClick={onClose}
            style={{ background: 'var(--cg)', color: '#fff', border: 'none', borderRadius: 8,
              padding: '6px 18px', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}
          >
            Done
          </button>
        </div>

        {/* Display */}
        <div style={{ background: 'var(--s2)', borderRadius: 14, padding: '14px 16px',
          border: '0.5px solid var(--bo)' }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--t)', letterSpacing: 1 }}>
            {displayStr} <span style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 500 }}>LBP</span>
          </div>
          {subLabel && (
            <div style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600, marginTop: 3 }}>
              {subLabel}
            </div>
          )}
        </div>

        {/* K / M multiplier buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
          {[
            { m: 'K', label: 'K', sub: 'Alf' },
            { m: 'M', label: 'M', sub: 'Malyon' },
          ].map(({ m, label: ml, sub }) => (
            <button
              key={m}
              onClick={() => handleMult(m)}
              style={{
                height: 50, borderRadius: 12, border: '0.5px solid var(--bo)',
                background: mult === m ? 'var(--gold)' : 'var(--s2)',
                color: mult === m ? '#fff' : 'var(--t)',
                fontSize: 15, fontWeight: 700, cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
            >
              {ml}
              <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.8 }}>({sub})</span>
            </button>
          ))}
        </div>

        {/* Number grid */}
        <div className="keypad">
          {['1','2','3','4','5','6','7','8','9'].map(k => (
            <div key={k} className="key" onClick={() => handleKey(k)}>{k}</div>
          ))}
          <div className="key key-clr" onClick={() => { setDigits(''); setMult(''); }}>C</div>
          <div className="key" onClick={() => handleKey('0')}>0</div>
          <div className="key key-del" onClick={() => handleKey('del')}>⌫</div>
        </div>
      </div>
    </div>
  );
}
