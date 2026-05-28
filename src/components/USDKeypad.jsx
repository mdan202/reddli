import { useState } from 'react';

/*
  USDKeypad — bottom-sheet keypad for USD amounts.
  Props:
    initialValue  string   starting value string
    onValue       fn(str)  called on every keystroke with current string value
    onClose       fn()     called when user taps Done or backdrop
    label         string   field label shown at top of sheet
*/
export default function USDKeypad({ initialValue = '', onValue, onClose, label = 'Amount (USD)' }) {
  const [val, setVal] = useState(initialValue || '');

  const update = (next) => {
    setVal(next);
    onValue(next);
  };

  const handleKey = (k) => {
    if (k === 'del') {
      const next = val.slice(0, -1);
      update(next);
      return;
    }
    if (k === 'clr') {
      update('');
      return;
    }
    if (k === '.') {
      if (val.includes('.')) return;
      update(val === '' ? '0.' : val + '.');
      return;
    }
    // limit to 2 decimal places
    if (val.includes('.') && val.split('.')[1]?.length >= 2) return;
    if (val.length >= 10) return;
    const next = val === '0' ? k : val + k;
    update(next);
  };

  const display = val || '0';

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
            ${display} <span style={{ fontSize: 14, color: 'var(--t3)', fontWeight: 500 }}>USD</span>
          </div>
        </div>

        {/* Number grid — 3 cols for 1-9, then 4-col last row */}
        <div className="keypad">
          {['1','2','3','4','5','6','7','8','9'].map(k => (
            <div key={k} className="key" onClick={() => handleKey(k)}>{k}</div>
          ))}
        </div>
        {/* Last row: · 0 ⌫ */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 7, marginTop: -5 }}>
          <div className="key" style={{ fontSize: 22 }} onClick={() => handleKey('.')}>·</div>
          <div className="key" onClick={() => handleKey('0')}>0</div>
          <div className="key key-del" onClick={() => handleKey('del')}>⌫</div>
        </div>
      </div>
    </div>
  );
}
