import { useState } from 'react';
import Dashboard from './components/Dashboard';
import CollectionView from './components/CollectionView';
import { COLLECTIONS } from './data/collections';

const TABS = [
  { id: 'dashboard', label: 'Dashboard' },
  ...Object.values(COLLECTIONS).map(c => ({ id: c.id, label: c.label })),
];

export default function App() {
  const [tab, setTab] = useState('dashboard');

  function navigateTo(id) { setTab(id); }

  return (
    <div className="app">
      <nav className="nav">
        <span className="nav-brand">HOBBYCOUNT</span>
        <div className="nav-tabs">
          {TABS.map(t => (
            <button
              key={t.id}
              className={`nav-tab${tab === t.id ? ' active' : ''}`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="page">
        {tab === 'dashboard' && <Dashboard onNavigate={navigateTo} />}
        {tab !== 'dashboard' && <CollectionView key={tab} collectionId={tab} />}
      </main>

      <footer style={{
        borderTop: '1px solid var(--border)',
        padding: '16px 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
      }}>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-disabled)' }}>
          Ayelen &amp; Franco — Colecciones
        </span>
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-disabled)' }}>
          Datos guardados localmente
        </span>
      </footer>
    </div>
  );
}
