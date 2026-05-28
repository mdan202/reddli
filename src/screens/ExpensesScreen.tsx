import { useState, useEffect } from 'react';
import { expensesApi } from '../lib/api';

interface Expense {
  id: string;
  amount: string;
  currency: string;
  category: string;
  note?: string;
  date: string;
}

const CATEGORIES = ['Food', 'Transport', 'Shopping', 'Bills', 'Health', 'Entertainment', 'Other'];

const CAT_ICONS: Record<string, string> = {
  Food: '🍔', Transport: '🚗', Shopping: '🛍️', Bills: '💡',
  Health: '💊', Entertainment: '🎬', Other: '📦',
};

export default function ExpensesScreen() {
  const [expenses, setExpenses]   = useState<Expense[]>([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState('');
  const [showAdd, setShowAdd]     = useState(false);
  const [search, setSearch]       = useState('');
  const [filterCat, setFilterCat] = useState('All');

  // Add form state
  const [amount, setAmount]     = useState('');
  const [currency, setCurrency] = useState('USD');
  const [category, setCategory] = useState('Food');
  const [note, setNote]         = useState('');
  const [date, setDate]         = useState(() => new Date().toISOString().slice(0, 10));
  const [saving, setSaving]     = useState(false);
  const [formErr, setFormErr]   = useState('');

  const load = () => {
    setLoading(true);
    expensesApi.list()
      .then((res: any) => setExpenses(Array.isArray(res) ? res : res.expenses ?? []))
      .catch((e: any) => setError(e.message ?? 'Failed to load'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleAdd = async () => {
    setFormErr('');
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setFormErr('Enter a valid amount'); return;
    }
    setSaving(true);
    try {
      await expensesApi.create({ amount: Number(amount), currency, category, note: note || undefined, date });
      setShowAdd(false);
      setAmount(''); setNote('');
      load();
    } catch (e: any) {
      setFormErr(e.message ?? 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    await expensesApi.remove(id).catch(() => {});
    setExpenses(prev => prev.filter(e => e.id !== id));
  };

  const filtered = expenses.filter(e => {
    const matchCat = filterCat === 'All' || e.category === filterCat;
    const matchSearch = !search || (e.note ?? e.category).toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const totalUSD = filtered.reduce((sum, e) => {
    if (e.currency === 'USD') return sum + Number(e.amount);
    return sum;
  }, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: 14 }}>

      {/* Description */}
      <div className="page-desc">Where did your money actually go? Track spending in USD and LBP together, see monthly breakdowns, and understand the real USD value of what you spend — not the inflated LBP number.</div>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 2 }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: 'var(--t)' }}>Expenses</div>
          <div style={{ fontSize: 11, color: 'var(--t3)', marginTop: 2 }}>{filtered.length} transactions</div>
        </div>
        <button className="btn-p" onClick={() => setShowAdd(true)}
          style={{ padding: '8px 0', fontSize: 12, borderRadius: 10, width: 72, flexShrink: 0 }}>
          + Add
        </button>
      </div>

      {/* Search */}
      <div className="cc-iw">
        <input className="cc-in" placeholder="🔍  Search expenses…" value={search}
          onChange={e => setSearch(e.target.value)} style={{ width: '100%' }} />
      </div>

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 4 }}>
        {['All', ...CATEGORIES].map(c => (
          <button key={c} onClick={() => setFilterCat(c)}
            style={{
              flexShrink: 0, padding: '5px 12px', borderRadius: 20, fontSize: 11, fontWeight: 600,
              border: '0.5px solid var(--bo)', cursor: 'pointer',
              background: filterCat === c ? 'var(--cg)' : 'var(--s2)',
              color: filterCat === c ? '#fff' : 'var(--t2)',
            }}>
            {c}
          </button>
        ))}
      </div>

      {/* Summary */}
      {filtered.length > 0 && (
        <div className="card">
          <div className="ci" style={{ padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--t3)' }}>Total (USD only)</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--t)' }}>${totalUSD.toFixed(2)}</div>
          </div>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1,2,3].map(i => (
            <div key={i} style={{ height: 60, background: 'var(--s2)', borderRadius: 12,
              animation: 'fadeIn .6s ease infinite alternate' }} />
          ))}
        </div>
      ) : error ? (
        <div className="empty">
          <div className="empty-ic">⚠️</div>
          <div className="empty-t">Could not load expenses</div>
          <div className="empty-s">{error}</div>
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-ic">🧾</div>
          <div className="empty-t">No expenses yet</div>
          <div className="empty-s">Tap + Add to record your first expense</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {filtered.map(e => (
            <div key={e.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              padding: '10px 12px', background: 'var(--s2)', borderRadius: 12,
              border: '0.5px solid var(--bo)' }}>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <div style={{ fontSize: 22 }}>{CAT_ICONS[e.category] ?? '📦'}</div>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--t)' }}>
                    {e.note || e.category}
                  </div>
                  <div style={{ fontSize: 10, color: 'var(--t3)' }}>
                    {e.category} · {new Date(e.date).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--t)', textAlign: 'right' }}>
                  {e.currency === 'USD' ? '$' : ''}{Number(e.amount).toLocaleString()}{e.currency === 'LBP' ? ' LL' : ''}
                </div>
                <div onClick={() => handleDelete(e.id)}
                  style={{ fontSize: 14, cursor: 'pointer', color: 'var(--t3)', padding: '4px 6px' }}>
                  ✕
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add expense modal */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,.6)', zIndex: 100,
          display: 'flex', alignItems: 'flex-end' }} onClick={() => setShowAdd(false)}>
          <div onClick={e => e.stopPropagation()}
            style={{ width: '100%', maxWidth: 390, margin: '0 auto',
              background: 'var(--s)', borderRadius: '20px 20px 0 0', padding: 20,
              display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--t)', marginBottom: 4 }}>Add Expense</div>

            {/* Amount + currency row */}
            <div style={{ display: 'flex', gap: 8 }}>
              <div className="cc-iw" style={{ flex: 1 }}>
                <input className="cc-in" type="number" placeholder="Amount" value={amount}
                  onChange={e => setAmount(e.target.value)} style={{ width: '100%' }} />
              </div>
              <select value={currency} onChange={e => setCurrency(e.target.value)}
                style={{ background: 'var(--s2)', border: '0.5px solid var(--bo)', borderRadius: 12,
                  padding: '0 12px', fontSize: 13, color: 'var(--t)', fontWeight: 600 }}>
                <option>USD</option>
                <option>LBP</option>
              </select>
            </div>

            {/* Category */}
            <select value={category} onChange={e => setCategory(e.target.value)}
              style={{ background: 'var(--s2)', border: '0.5px solid var(--bo)', borderRadius: 12,
                padding: '12px 14px', fontSize: 13, color: 'var(--t)' }}>
              {CATEGORIES.map(c => <option key={c}>{c}</option>)}
            </select>

            {/* Note */}
            <div className="cc-iw">
              <input className="cc-in" placeholder="Note (optional)" value={note}
                onChange={e => setNote(e.target.value)} style={{ width: '100%' }} />
            </div>

            {/* Date */}
            <input type="date" value={date} onChange={e => setDate(e.target.value)}
              style={{ background: 'var(--s2)', border: '0.5px solid var(--bo)', borderRadius: 12,
                padding: '12px 14px', fontSize: 13, color: 'var(--t)', width: '100%' }} />

            {formErr && (
              <div style={{ background: 'var(--redl)', border: '1px solid #fca5a5', borderRadius: 10,
                padding: '8px 12px', fontSize: 12, color: 'var(--red)' }}>{formErr}</div>
            )}

            <button className="btn-p" onClick={handleAdd} disabled={saving}
              style={{ opacity: saving ? 0.6 : 1 }}>
              {saving ? 'Saving…' : 'Save Expense'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
