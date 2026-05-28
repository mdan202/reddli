import { useState, useEffect, useRef, useCallback } from 'react';
import Converter from './components/Converter.jsx';
import ChangeChecker from './components/ChangeChecker.jsx';
import SmartPay from './components/SmartPay.jsx';
import Toast from './components/Toast.jsx';
import { AuthProvider, useAuth } from './context/AuthContext.tsx';
import LoginScreen from './screens/LoginScreen.tsx';
import RegisterScreen from './screens/RegisterScreen.tsx';
import DashboardScreen from './screens/DashboardScreen.tsx';
import ExpensesScreen from './screens/ExpensesScreen.tsx';

// Nav icons
import homeBlack   from './assets/icons/home-black-removebg-preview.png';
import homeGold    from './assets/icons/home-gold-removebg-preview.png';
import convertBlack  from './assets/icons/convert-black-removebg-preview.png';
import convertGold   from './assets/icons/convert-gold-removebg-preview.png';
import changeBlack   from './assets/icons/change-black-removebg-preview.png';
import changeGold    from './assets/icons/change-gold-removebg-preview.png';
import smartpayBlack from './assets/icons/smartpay-black-removebg-preview.png';
import smartpayGold  from './assets/icons/smartpay-gold-removebg-preview.png';
import expensesBlack from './assets/icons/expenses-black-removebg-preview.png';
import expensesGold  from './assets/icons/expenses-gold-removebg-preview.png';
import darkmodeIcon   from './assets/icons/darkmode.png';
import notifIcon      from './assets/icons/notifcation.png';

function useClock() {
  const fmt = () => {
    const n = new Date();
    return n.getHours().toString().padStart(2, '0') + ':' + n.getMinutes().toString().padStart(2, '0');
  };
  const [time, setTime] = useState(fmt);
  useEffect(() => {
    const id = setInterval(() => setTime(fmt()), 15000);
    return () => clearInterval(id);
  }, []);
  return time;
}

function AppShell() {
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [activeTab, setActiveTab] = useState(0);
  const [dark,      setDark]      = useState(false);
  const [toast,     setToast]     = useState({ visible: false, icon: '', message: '' });
  const [authMode,  setAuthMode]  = useState('login'); // 'login' | 'register'
  const [showAuth,  setShowAuth]  = useState(false);
  const toastTimer = useRef(null);
  const navRef = useRef(null);
  const time = useClock();

  const showToast = useCallback((icon, message) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ visible: true, icon, message });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, visible: false })), 2400);
  }, []);

  // Close auth overlay when user logs in
  useEffect(() => {
    if (isAuthenticated) setShowAuth(false);
  }, [isAuthenticated]);

  // Ripple effect
  useEffect(() => {
    const handler = (e) => {
      const el = e.target.closest(
        '.key,.pre,.btn-p,.calc-btn,.abt,.ibt,.copy-btn,.qbtn,.wallet-header,.bill-card'
      );
      if (!el) return;
      el.style.position = 'relative';
      el.style.overflow = 'hidden';
      const r = document.createElement('span');
      r.className = 'ripple';
      const rect = el.getBoundingClientRect();
      const sz = Math.max(rect.width, rect.height);
      r.style.cssText = `width:${sz}px;height:${sz}px;left:${e.clientX - rect.left - sz / 2}px;top:${e.clientY - rect.top - sz / 2}px;`;
      el.appendChild(r);
      setTimeout(() => r.remove(), 600);
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, []);

  const tabs = isAuthenticated
    ? [
        { label: 'Home',      black: homeBlack,     gold: homeGold },
        { label: 'Convert',   black: convertBlack,  gold: convertGold },
        { label: 'Change',    black: changeBlack,   gold: changeGold },
        { label: 'Smart Pay', black: smartpayBlack, gold: smartpayGold },
        { label: 'Expenses',  black: expensesBlack, gold: expensesGold },
      ]
    : [
        { label: 'Convert',   black: convertBlack,  gold: convertGold },
        { label: 'Change',    black: changeBlack,   gold: changeGold },
        { label: 'Smart Pay', black: smartpayBlack, gold: smartpayGold },
      ];

  // When auth state changes, reset to first tab
  const prevAuth = useRef(isAuthenticated);
  useEffect(() => {
    if (prevAuth.current !== isAuthenticated) {
      setActiveTab(0);
      prevAuth.current = isAuthenticated;
    }
  }, [isAuthenticated]);

  const handleLogout = async () => {
    await logout();
    setActiveTab(0);
    showToast('👋', 'Signed out');
  };

  // Tab indices shift by 1 when authenticated (Dashboard is 0)
  const convertTab  = isAuthenticated ? 1 : 0;
  const changeTab   = isAuthenticated ? 2 : 1;
  const smartPayTab = isAuthenticated ? 3 : 2;
  const expensesTab = isAuthenticated ? 4 : -1;

  if (authLoading) return (
    <div className="frame">
      <div className={`phone${dark ? ' dm' : ''}`}>
        <div className="notch"><span className="notch-t">{time}</span><span className="notch-i">● ●●●</span></div>
        <div className="screen" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--t3)', fontSize: 13 }}>Loading…</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="frame">
      <div className={`phone${dark ? ' dm' : ''}`}>
        <div className="notch">
          <span className="notch-t">{time}</span>
          <span className="notch-i">● ●●●</span>
        </div>

        <div className="screen">
          <div className="sticky-header">
            <div className="topbar">
              <div className="logo-row">
                <div className="logo-ic">ر</div>
                <div>
                  <span className="logo-txt">Redeli </span>
                  <span className="logo-ar">ردلي</span>
                </div>
              </div>
              <div className="topbar-btns">
                <div className="ibt" style={{ cursor: 'default', opacity: 0.5 }}>
                  <img src={darkmodeIcon} alt="Dark mode" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                </div>
                {isAuthenticated
                  ? <div className="ibt" onClick={handleLogout} title="Sign out">👤</div>
                  : <div className="ibt" onClick={() => { setAuthMode('login'); setShowAuth(true); }}>🔑</div>
                }
                <div className="ibt">
                  <img src={notifIcon} alt="Notifications" style={{ width: 20, height: 20, objectFit: 'contain' }} />
                </div>
              </div>
            </div>

            <div className="nav" ref={navRef}>
              <div className="nav-slider" style={{
                left: `${(activeTab / tabs.length) * 100}%`,
                width: `${100 / tabs.length}%`,
              }} />
              {tabs.map((t, i) => (
                <button
                  key={i}
                  className={`nit${activeTab === i ? ' on' : ''}`}
                  onClick={() => setActiveTab(i)}
                >
                  <img className="ni" src={activeTab === i ? t.gold : t.black} alt={t.label} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {isAuthenticated && (
            <div className={`pane${activeTab === 0 ? ' on' : ''}`}>
              <DashboardScreen onNavigate={(tab) => setActiveTab(tab + 1)} onExpenses={() => setActiveTab(expensesTab)} />
            </div>
          )}

          <div className={`pane${activeTab === convertTab ? ' on' : ''}`}>
            <Converter showToast={showToast} />
          </div>

          <div className={`pane${activeTab === changeTab ? ' on' : ''}`}>
            <ChangeChecker />
          </div>

          <div className={`pane${activeTab === smartPayTab ? ' on' : ''}`}>
            <SmartPay showToast={showToast} />
          </div>

          {isAuthenticated && (
            <div className={`pane${activeTab === expensesTab ? ' on' : ''}`}>
              <ExpensesScreen />
            </div>
          )}
        </div>

        <Toast icon={toast.icon} message={toast.message} visible={toast.visible} />

        {/* Auth overlay */}
        {showAuth && !isAuthenticated && (
          <div style={{
            position: 'absolute', inset: 0, background: 'var(--s)',
            zIndex: 50, display: 'flex', flexDirection: 'column',
            overflowY: 'auto',
          }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '12px 16px' }}>
              <div className="ibt" onClick={() => setShowAuth(false)}>✕</div>
            </div>
            {authMode === 'login'
              ? <LoginScreen    onSwitch={() => setAuthMode('register')} />
              : <RegisterScreen onSwitch={() => setAuthMode('login')} />
            }
          </div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppShell />
    </AuthProvider>
  );
}
