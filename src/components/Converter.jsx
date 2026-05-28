import { useState, useCallback } from 'react';
import { RATE } from '../constants.js';
import { fmt } from '../utils/optimizer.js';
import LBPKeypad from './LBPKeypad.jsx';
import USDKeypad from './USDKeypad.jsx';

export default function Converter({ showToast }) {
  const [convDir, setConvDir] = useState('usd-lbp');
  const [inputVal, setInputVal] = useState('100');
  const [showLBPPad, setShowLBPPad] = useState(false);
  const [showUSDPad, setShowUSDPad] = useState(false);

  const isLBPInput = convDir === 'lbp-usd';

  const compute = useCallback((val, dir) => {
    const v = parseFloat(val) || 0;
    if (dir === 'usd-lbp') {
      const r = v * RATE;
      return { outVal: fmt(r), display: fmt(r) + ' LBP' };
    } else {
      const r = v / RATE;
      return { outVal: r.toFixed(2), display: '$' + r.toFixed(2) };
    }
  }, []);

  const { outVal, display } = compute(inputVal, convDir);

  const handleInput = (val) => setInputVal(val);

  const handleSwap = () => {
    const next = convDir === 'usd-lbp' ? 'lbp-usd' : 'usd-lbp';
    setConvDir(next);
    setInputVal(outVal.replace(/,/g, ''));
    setShowLBPPad(false);
  };

  const handleKey = (v) => {
    setInputVal(prev => {
      if (v === 'del') return prev.slice(0, -1) || '0';
      if (v === '.') return prev.includes('.') ? prev : prev + '.';
      return prev === '0' ? v : prev + v;
    });
  };

  const handlePreset = (val, ccy) => {
    if (ccy === 'USD' && convDir !== 'usd-lbp') setConvDir('usd-lbp');
    if (ccy === 'LBP' && convDir !== 'lbp-usd') setConvDir('lbp-usd');
    setInputVal(String(val));
    showToast('✓', 'Preset applied');
  };

  const doCopy = () => {
    try { navigator.clipboard.writeText(display); } catch (_) {}
    showToast('📋', 'Copied: ' + display);
  };

  const doShare = () => showToast('↗️', 'Sharing…');
  const doStar  = () => showToast('⭐', 'Saved to favourites');

  const fromFlag = convDir === 'usd-lbp' ? '🇺🇸' : '🇱🇧';
  const fromCode = convDir === 'usd-lbp' ? 'USD' : 'LBP';
  const toFlag   = convDir === 'usd-lbp' ? '🇱🇧' : '🇺🇸';
  const toCode   = convDir === 'usd-lbp' ? 'LBP' : 'USD';

  return (
    <>
      <div className="page-desc">Know the real value of your money right now.</div>
      <div className="rate-hero">
        <div className="rh-label">Market Rate · Live</div>
        <div className="rh-val">1 USD = 89,000 LBP</div>
        <svg className="rh-spark" viewBox="0 0 300 30" preserveAspectRatio="none">
          <polyline points="0,26 40,22 80,24 110,18 150,20 180,13 210,15 250,9 280,11 300,7"
            fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="0,26 40,22 80,24 110,18 150,20 180,13 210,15 250,9 280,11 300,7"
            fill="none" stroke="rgba(255,255,255,0.88)" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <div className="rh-sub">
          <span className="rh-time">Updated just now</span>
          <span className="rh-chg">↑ +0.56% 24h</span>
        </div>
      </div>

      <div className="rate-grid">
        <div className="rbox">
          <div className="rbox-lbl">BDL Official</div>
          <div className="rbox-val">89,500</div>
          <div className="rbox-sub">LBP per USD</div>
          <div className="conf">
            <div className="cd"/><div className="cd"/><div className="cd"/>
            <div className="cd"/><div className="cd off"/>
          </div>
        </div>
        <div className="rbox">
          <div className="rbox-lbl">Local Market</div>
          <div className="rbox-val">89,000</div>
          <div className="rbox-sub">LBP per USD</div>
          <div className="conf">
            <div className="cd"/><div className="cd"/><div className="cd"/>
            <div className="cd off"/><div className="cd off"/>
          </div>
        </div>
      </div>

      <div className="conv-block">
        <div className="conv-row">
          <div className="conv-ccy">{fromFlag} <span>{fromCode}</span></div>
          {isLBPInput ? (
            <div className="conv-inp" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setShowLBPPad(true)}>
              {parseFloat(inputVal) > 0 ? fmt(parseFloat(inputVal)) : <span style={{ color: 'var(--t3)' }}>0</span>}
            </div>
          ) : (
            <div className="conv-inp" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              onClick={() => setShowUSDPad(true)}>
              {inputVal && inputVal !== '0' ? inputVal : <span style={{ color: 'var(--t3)' }}>0</span>}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', margin: '2px 0' }}>
          <div className="swap-btn" onClick={handleSwap}>⇅</div>
        </div>
        <div className="conv-row">
          <div className="conv-ccy">{toFlag} <span>{toCode}</span></div>
          <input
            className="conv-inp"
            type="number"
            readOnly
            style={{ color: 'var(--cg)' }}
            placeholder="0"
            value={outVal}
          />
        </div>
      </div>

      <div className="res-card">
        <div>
          <div className="res-lbl">Result</div>
          <div className="res-val">{display}</div>
        </div>
        <div className="res-acts">
          <div className="abt" onClick={doCopy}>📋</div>
          <div className="abt" onClick={doShare}>↗️</div>
          <div className="abt" onClick={doStar}>⭐</div>
        </div>
      </div>

      <div className="card">
        <div className="ci">
          <div className="ctitle">Quick presets</div>
          <div className="presets">
            <div className="pre" onClick={() => handlePreset(10,    'USD')}>$10</div>
            <div className="pre" onClick={() => handlePreset(20,    'USD')}>$20</div>
            <div className="pre" onClick={() => handlePreset(50,    'USD')}>$50</div>
            <div className="pre" onClick={() => handlePreset(100,   'USD')}>$100</div>
            <div className="pre" onClick={() => handlePreset(500,   'USD')}>$500</div>
            <div className="pre" onClick={() => handlePreset(1e6,   'LBP')}>1M LBP</div>
            <div className="pre" onClick={() => handlePreset(5e6,   'LBP')}>5M LBP</div>
            <div className="pre" onClick={() => handlePreset(1e7,   'LBP')}>10M LBP</div>
          </div>
        </div>
      </div>

      {showUSDPad && (
        <USDKeypad
          initialValue={inputVal}
          label="Amount (USD)"
          onValue={v => setInputVal(v || '0')}
          onClose={() => setShowUSDPad(false)}
        />
      )}
      {showLBPPad && (
        <LBPKeypad
          initialValue={parseFloat(inputVal) || 0}
          label="Amount (LBP)"
          onValue={v => setInputVal(String(v))}
          onClose={() => setShowLBPPad(false)}
        />
      )}
    </>
  );
}
