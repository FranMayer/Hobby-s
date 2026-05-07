import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { getAll, migrateFromLocalStorage } from '../data/store';
import { exportAll } from '../data/csv';
import { COLLECTIONS } from '../data/collections';

const EMPTY = { vinilos: [], camaras: [], autosf1: [], monedas: [] };

export default function Dashboard({ onNavigate }) {
  const [all, setAll] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [migrationMsg, setMigrationMsg] = useState(null);

  useEffect(() => {
    async function init() {
      const result = await migrateFromLocalStorage();
      if (result.migrated) {
        setMigrationMsg(`[${result.count} ITEMS MIGRADOS DESDE CACHÉ LOCAL]`);
        setTimeout(() => setMigrationMsg(null), 5000);
      }
      setAll(await getAll());
      setLoading(false);
    }
    init();
  }, []);

  const stats = Object.fromEntries(
    Object.entries(all).map(([id, items]) => [
      id,
      { total: items.length, owned: items.filter(i => !i.wishlist).length, wishlist: items.filter(i => i.wishlist).length },
    ])
  );

  const totalWishlist = Object.values(stats).reduce((s, v) => s + v.wishlist, 0);

  const byOwner = { Ayelen: ['vinilos', 'camaras'], Franco: ['autosf1', 'monedas'] };

  const ownerStats = Object.fromEntries(
    Object.entries(byOwner).map(([owner, ids]) => [
      owner,
      {
        owned:    ids.reduce((s, id) => s + (stats[id]?.owned ?? 0), 0),
        wishlist: ids.reduce((s, id) => s + (stats[id]?.wishlist ?? 0), 0),
      },
    ])
  );

  if (loading) {
    return (
      <div style={{ padding: 'var(--space-3xl) 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--text-disabled)' }}>
        [CARGANDO...]
      </div>
    );
  }

  return (
    <div>
      {/* Hero */}
      <div style={{ marginBottom: 'var(--space-2xl)', paddingBottom: 'var(--space-2xl)', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-md)' }}>
        <div>
          {migrationMsg && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', color: 'var(--success)', marginBottom: 8 }}>
              {migrationMsg}
            </div>
          )}
          <div style={{ display: 'flex', gap: 'var(--space-2xl)', flexWrap: 'wrap' }}>
            {Object.entries(ownerStats).map(([owner, s]) => (
              <div key={owner}>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: 4 }}>
                  {owner}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: 96, lineHeight: 1, letterSpacing: '-0.03em', color: 'var(--text-display)' }}>
                    {s.owned}
                  </span>
                  {s.wishlist > 0 && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--warning)' }}>
                      +{s.wishlist}
                    </span>
                  )}
                </div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-disabled)', marginTop: 4 }}>
                  items
                </div>
              </div>
            ))}
          </div>
          {totalWishlist > 0 && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--warning)', marginTop: 8 }}>
              {totalWishlist} deseados en total
            </div>
          )}
        </div>
        <button className="btn btn-secondary btn-sm" onClick={() => exportAll(all)}>
          <Download size={13} /> Exportar Todo
        </button>
      </div>

      {/* Collection cards */}
      <div className="hero-grid">
        {Object.values(COLLECTIONS).map(col => {
          const s = stats[col.id] ?? { owned: 0, wishlist: 0 };
          return (
            <div key={col.id} className="hero-card" style={{ cursor: 'pointer' }} onClick={() => onNavigate(col.id)}>
              <div className="dot-bg" />
              <div style={{ position: 'relative' }}>
                <div className="hero-card-owner">{col.owner}</div>
                <div className="hero-card-label">{col.label}</div>
                <div className="hero-card-number">{s.owned}</div>
                {s.wishlist > 0
                  ? <div className="hero-card-sub" style={{ color: 'var(--warning)' }}>+ {s.wishlist} deseados</div>
                  : <div className="hero-card-sub">Ver colección →</div>
                }
              </div>
            </div>
          );
        })}
      </div>

      {/* Per-owner breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-2xl)' }}>
        {Object.entries(byOwner).map(([owner, ids]) => {
          const ownerOwned = ids.reduce((s, id) => s + (stats[id]?.owned ?? 0), 0);
          const ownerWishlist = ids.reduce((s, id) => s + (stats[id]?.wishlist ?? 0), 0);
          return (
            <div key={owner} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
              <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-disabled)', marginBottom: 4 }}>
                {owner}
              </div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 'var(--space-md)' }}>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: 40, lineHeight: 1, color: 'var(--text-display)' }}>
                  {ownerOwned}
                </span>
                {ownerWishlist > 0 && (
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--warning)' }}>
                    +{ownerWishlist}
                  </span>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, borderTop: '1px solid var(--border)', paddingTop: 'var(--space-md)' }}>
                {ids.map(id => {
                  const c = COLLECTIONS[id];
                  const s = stats[id] ?? { owned: 0, wishlist: 0 };
                  const pct = ownerOwned > 0 ? Math.round((s.owned / ownerOwned) * 100) : 0;
                  return (
                    <div key={id}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-secondary)' }}>
                          {c.label}
                        </span>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-display)' }}>
                          {s.owned}
                          {s.wishlist > 0 && <span style={{ color: 'var(--warning)', marginLeft: 4 }}>+{s.wishlist}</span>}
                        </span>
                      </div>
                      <SegBar pct={pct} />
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SegBar({ pct }) {
  const total = 20;
  const filled = Math.round((pct / 100) * total);
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <div key={i} style={{ flex: 1, height: 4, background: i < filled ? 'var(--text-display)' : 'var(--border-visible)' }} />
      ))}
    </div>
  );
}
