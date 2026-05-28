import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { analyticsApi, communityApi } from '../lib/api';

import convertGold  from '../assets/icons/convert-gold-removebg-preview.png';
import changeGold   from '../assets/icons/change-gold-removebg-preview.png';
import smartpayGold from '../assets/icons/smartpay-gold-removebg-preview.png';
import expensesGold from '../assets/icons/expenses-gold-removebg-preview.png';

interface DashboardData {
  usdToLbp: number;
  monthlySpend: { totalUSD: number; byCategory: Record<string, number> };
  budgetCount: number;
  savingsGoals: Array<{ id: string; name: string; currentAmount: string; targetAmount: string; currency: string }>;
  recentExpenses: Array<{ id: string; amount: string; currency: string; category: string; note?: string; date: string }>;
  unreadNotifications: number;
}

interface Props { onNavigate: (tab: number) => void; onExpenses?: () => void; }

export default function DashboardScreen({ onNavigate, onExpenses }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [communityRate, setCommunityRate] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    Promise.all([
      analyticsApi.dashboard(),
      communityApi.stats(),
    ]).then(([dash, stats]: any) => {
      if (!active) return;
      setData(dash as DashboardData);
      setCommunityRate(stats.median);
    }).catch((err: any) => {
      if (active) setError(err.message ?? 'Failed to load dashboard');
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const fmt = (n: number) => Math.round(n).toLocaleString();
  const pct = (goal: DashboardData['savingsGoals'][0]) =>
    Math.min(100, Math.round((Number(goal.currentAmount) / Number(goal.targetAmount)) * 100));

  if (loading) return <DashLoading />;
  if (error || !data) return <DashError msg={error} />;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14 }}>
      {/* Rate hero */}
      <div className="rate-hero">
        <div className="rh-label">Market Rate · Live</div>
        <div className="rh-val">1 USD = {fmt(data.usdToLbp)} LBP</div>
        {communityRate && communityRate !== data.usdToLbp && (
          <div style={{ color: 'rgba(255,255,255,.65)', fontSize: 11, marginTop: 3 }}>
            Community avg: {fmt(communityRate)} LBP
          </div>
        )}
        <div className="rh-sub" style={{ marginTop: 8 }}>
          <span className="rh-time">Updated just now</span>
          <span className="rh-chg">📊 Live</span>
        </div>
      </div>

      {/* Quick actions */}
      <div className="card">
        <div className="ci">
          <div className="ctitle">Quick actions</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8 }}>
            {[
              { icon: convertGold,  label: 'Convert',   tab: 0 },
              { icon: changeGold,   label: 'Change',    tab: 1 },
              { icon: smartpayGold, label: 'Smart Pay', tab: 2 },
              { icon: expensesGold, label: 'Expenses',  tab: -1 },
            ].map(a => (
              <div key={a.label} onClick={() => a.tab === -1 ? onExpenses?.() : onNavigate(a.tab)}
                style={{ background: 'var(--s2)', border: '0.5px solid var(--bo)', borderRadius: 12,
                  padding: '10px 4px', textAlign: 'center', cursor: 'pointer' }}>
                <img src={a.icon} alt={a.label} style={{ width: 28, height: 28, objectFit: 'contain' }} />
                <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--t2)', marginTop: 4 }}>{a.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly spend */}
      <div className="card">
        <div className="ci">
          <div className="ctitle">This month</div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--t)' }}>
                ${data.monthlySpend.totalUSD.toFixed(2)}
              </div>
              <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>total spending</div>
            </div>
            <div style={{ fontSize: 11, color: 'var(--t3)', textAlign: 'right' }}>
              {Object.entries(data.monthlySpend.byCategory).slice(0, 3).map(([cat, usd]) => (
                <div key={cat}>{cat}: <strong style={{ color: 'var(--t2)' }}>${usd.toFixed(0)}</strong></div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Savings goals */}
      {data.savingsGoals.length > 0 && (
        <div className="card">
          <div className="ci">
            <div className="ctitle">Savings goals</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {data.savingsGoals.map(g => (
                <div key={g.id}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{g.name}</span>
                    <span style={{ fontSize: 12, color: 'var(--cg)' }}>{pct(g)}%</span>
                  </div>
                  <div style={{ height: 6, background: 'var(--s2)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct(g)}%`, background: 'var(--cg)', borderRadius: 3, transition: 'width .4s' }} />
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)', marginTop: 3 }}>
                    {g.currency}{Number(g.currentAmount).toLocaleString()} / {g.currency}{Number(g.targetAmount).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Recent expenses */}
      {data.recentExpenses.length > 0 && (
        <div className="card">
          <div className="ci">
            <div className="ctitle">Recent expenses</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {data.recentExpenses.map(e => (
                <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '8px 10px', background: 'var(--s2)', borderRadius: 10 }}>
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>{e.note ?? e.category}</div>
                    <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                      {e.category} · {new Date(e.date).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)' }}>
                    {e.currency === 'USD' ? '$' : ''}{Number(e.amount).toLocaleString()}{e.currency === 'LBP' ? ' LL' : ''}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DashLoading() {
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {[120, 80, 100].map((h, i) => (
        <div key={i} style={{ height: h, background: 'var(--s2)', borderRadius: 16,
          animation: 'fadeIn .6s ease infinite alternate' }} />
      ))}
    </div>
  );
}

function DashError({ msg }: { msg: string }) {
  return (
    <div className="empty" style={{ padding: 32 }}>
      <div className="empty-ic">⚠️</div>
      <div className="empty-t">Could not load dashboard</div>
      <div className="empty-s">{msg || 'Check your connection and sign in'}</div>
    </div>
  );
}
