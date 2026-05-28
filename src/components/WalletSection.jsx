import { useState } from 'react';
import BillCard from './BillCard.jsx';
import { fmt } from '../utils/optimizer.js';

export default function WalletSection({ currency, denoms, quantities, onChangeQty }) {
  const [open, setOpen] = useState(false);

  const prefix  = currency === 'usd' ? 'u' : 'l';
  const flag    = currency === 'usd' ? '🇺🇸' : '🇱🇧';
  const title   = currency === 'usd' ? 'USD bills' : 'LBP notes';
  const hasAny  = denoms.some(d => quantities[d.val] > 0);

  const summary = currency === 'usd'
    ? '$' + denoms.reduce((s, d) => s + (quantities[d.val] || 0) * d.val, 0)
    : fmt(denoms.reduce((s, d) => s + (quantities[d.val] || 0) * d.val, 0)) + ' LL';

  const subtitle = hasAny
    ? denoms.filter(d => quantities[d.val] > 0).map(d => quantities[d.val] + '×' + d.label).join(' ')
    : `Tap to add your ${currency === 'usd' ? 'bills' : 'notes'}`;

  return (
    <div className="wallet-section">
      <div className="wallet-header" onClick={() => setOpen(o => !o)}>
        <div className="wallet-header-left">
          <span className="wallet-flag">{flag}</span>
          <div>
            <div className="wallet-title">{title}</div>
            <div className="wallet-subtitle">{subtitle}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span className="wallet-summary">{summary}</span>
          <span className={`wallet-arrow${open ? ' open' : ''}`}>▼</span>
        </div>
      </div>
      <div className={`bills-panel${open ? ' open' : ''}`}>
        <div className="bills-grid">
          {denoms.map(d => (
            <BillCard
              key={d.val}
              denom={d}
              qty={quantities[d.val] || 0}
              prefix={prefix}
              onChangeQty={(val, delta) => onChangeQty(currency, val, delta)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
