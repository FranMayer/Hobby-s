import { useState, useEffect } from 'react';
import { Download, Upload, ChevronRight } from 'lucide-react';
import { getAll, migrateFromLocalStorage, restoreBackup } from '../data/store';
import { exportAll } from '../data/csv';
import { COLLECTIONS } from '../data/collections';

const EMPTY = { vinilos: [], camaras: [], autosf1: [], monedas: [] };
const OWNERS = Object.entries(Object.groupBy(Object.values(COLLECTIONS), c => c.owner));

export default function Dashboard({ onNavigate }) {
  const [all, setAll] = useState(EMPTY);
  const [loading, setLoading] = useState(true);
  const [migrationMsg, setMigrationMsg] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function init() {
      try {
        const result = await migrateFromLocalStorage();
        if (result.migrated) {
          setMigrationMsg(`[${result.count} ITEMS MIGRADOS DESDE CACHÉ LOCAL]`);
          setTimeout(() => setMigrationMsg(null), 5000);
        }
        setAll(await getAll());
      } catch {
        setError('[ERROR: SIN CONEXIÓN A LA BASE DE DATOS]');
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  async function handleRestore(e) {
    const file = e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try {
      const count = await restoreBackup(JSON.parse((await file.text()).replace(/^\uFEFF/, '')));
      setAll(await getAll());
      setMigrationMsg(`[${count} ITEMS RESTAURADOS]`);
    } catch {
      setMigrationMsg('[ERROR: BACKUP INVÁLIDO]');
    }
    setTimeout(() => setMigrationMsg(null), 5000);
  }

  const stats = Object.fromEntries(
    Object.entries(all).map(([id, items]) => [
      id,
      { owned: items.filter(i => !i.wishlist).length, wishlist: items.filter(i => i.wishlist).length },
    ])
  );

  const totalWishlist = Object.values(stats).reduce((s, v) => s + v.wishlist, 0);

  if (loading || error) {
    return (
      <div style={{ padding: 'var(--space-3xl) 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: error ? 'var(--accent)' : 'var(--text-disabled)' }}>
        {error ?? '[CARGANDO...]'}
      </div>
    );
  }

  return (
    <div>
      <div className="dash-top">
        <div>
          {migrationMsg && (
            <div className="dash-note" style={{ color: migrationMsg.startsWith('[ERROR') ? 'var(--accent)' : 'var(--success)' }}>
              {migrationMsg}
            </div>
          )}
          {totalWishlist > 0 && (
            <div className="dash-note" style={{ color: 'var(--warning)' }}>
              {totalWishlist} deseados en total
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <label className="btn btn-secondary btn-sm" title="Restaurar desde un backup .json">
            <Upload size={13} /> Restaurar
            <input type="file" accept=".json" hidden onChange={handleRestore} />
          </label>
          <button className="btn btn-secondary btn-sm" onClick={() => exportAll(all)}>
            <Download size={13} /> Exportar Todo
          </button>
        </div>
      </div>

      <div className="owner-grid">
        {OWNERS.map(([owner, cols]) => {
          const owned = cols.reduce((s, c) => s + stats[c.id].owned, 0);
          const wishlist = cols.reduce((s, c) => s + stats[c.id].wishlist, 0);
          return (
            <section key={owner} className="owner-panel">
              <div className="dot-bg" />
              <header className="owner-head">
                <span className="owner-name">{owner}</span>
                <div className="owner-total">
                  <span className="owner-number">{owned}</span>
                  <span className="owner-unit">items</span>
                  {wishlist > 0 && <span className="owner-wish">+{wishlist} deseados</span>}
                </div>
              </header>

              <div className="owner-cols">
                {cols.map(col => {
                  const s = stats[col.id];
                  const pct = owned > 0 ? Math.round((s.owned / owned) * 100) : 0;
                  return (
                    <button key={col.id} className="col-row" onClick={() => onNavigate(col.id)}>
                      <span className="col-icon"><col.icon size={18} strokeWidth={1.5} aria-hidden="true" /></span>
                      <span className="col-info">
                        <span className="col-top">
                          <span className="col-label">{col.label}</span>
                          <span className="col-count">
                            {s.owned}
                            {s.wishlist > 0 && <span className="owner-wish">+{s.wishlist}</span>}
                          </span>
                        </span>
                        <SegBar pct={pct} />
                      </span>
                      <ChevronRight size={14} className="col-arrow" aria-hidden="true" />
                    </button>
                  );
                })}
              </div>
            </section>
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
    <span style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: total }).map((_, i) => (
        <span key={i} style={{ flex: 1, height: 4, background: i < filled ? 'var(--text-display)' : 'var(--border-visible)' }} />
      ))}
    </span>
  );
}
