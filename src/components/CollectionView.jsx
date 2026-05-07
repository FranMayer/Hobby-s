import { useState, useMemo, useRef, useEffect } from 'react';
import { Plus, Pencil, Trash2, Bookmark, BookmarkCheck, Download, Upload } from 'lucide-react';
import { COLLECTIONS, CONDITION_CLASS } from '../data/collections';
import { getCollection, deleteItem, updateItem, importItems } from '../data/store';
import { exportCollection, parseCSV } from '../data/csv';
import AddModal from './AddModal';

const VIEWS = [
  { id: 'all',      label: 'Todos' },
  { id: 'owned',    label: 'En posesión' },
  { id: 'wishlist', label: 'Deseados' },
];

export default function CollectionView({ collectionId }) {
  const col = COLLECTIONS[collectionId];
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState({});
  const [view, setView] = useState('all');
  const [modal, setModal] = useState(null);
  const [importStatus, setImportStatus] = useState(null);
  const fileRef = useRef();

  function applySort(data) {
    const { defaultSort } = col;
    if (!defaultSort) return data;
    return [...data].sort((a, b) => {
      const va = (a[defaultSort.key] ?? '').toString().toLowerCase();
      const vb = (b[defaultSort.key] ?? '').toString().toLowerCase();
      return defaultSort.asc ? va.localeCompare(vb) : vb.localeCompare(va);
    });
  }

  async function refresh() {
    setLoading(true);
    try {
      setItems(applySort(await getCollection(collectionId)));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [collectionId]);

  async function handleDelete(id) {
    if (!window.confirm('¿Eliminar este item?')) return;
    await deleteItem(collectionId, id);
    refresh();
  }

  async function handleWishlistToggle(item) {
    await updateItem(collectionId, item.id, { wishlist: !item.wishlist });
    refresh();
  }

  function handleExport() {
    exportCollection(collectionId, items);
  }

  function handleImportFile(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      try {
        const parsed = parseCSV(collectionId, ev.target.result);
        const added = await importItems(collectionId, parsed);
        await refresh();
        setImportStatus(`[+${added} IMPORTADOS]`);
        setTimeout(() => setImportStatus(null), 3000);
      } catch {
        setImportStatus('[ERROR: ARCHIVO INVÁLIDO]');
        setTimeout(() => setImportStatus(null), 3000);
      }
      e.target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  const filterableFields = col.fields.filter(f => f.filterable && (f.type === 'select' || f.filterType === 'dynamic'));

  function getOptions(f) {
    if (f.type === 'select') return f.options;
    return [...new Set(items.map(i => i[f.key]).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  }

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    return items.filter(item => {
      if (view === 'owned' && item.wishlist) return false;
      if (view === 'wishlist' && !item.wishlist) return false;
      if (q) {
        const haystack = col.fields.map(f => item[f.key] ?? '').join(' ').toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      for (const [key, val] of Object.entries(filters)) {
        if (val && item[key] !== val) return false;
      }
      return true;
    });
  }, [items, search, filters, view, col]);

  const owned = items.filter(i => !i.wishlist).length;
  const wished = items.filter(i => i.wishlist).length;
  const columns = col.tableColumns.map(k => col.fields.find(f => f.key === k));

  return (
    <div>
      <div className="section-header">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
          <span className="section-title">{col.label}</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--text-disabled)', letterSpacing: '0.06em' }}>
            {col.owner} — {owned} items · {wished} deseados
          </span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {importStatus && (
            <span className={`inline-status ${importStatus.startsWith('[+') ? 'saved' : 'error'}`}>
              {importStatus}
            </span>
          )}
          <button className="btn-icon" title="Importar CSV" onClick={() => fileRef.current?.click()}>
            <Upload size={14} />
          </button>
          <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={handleImportFile} />
          <button className="btn-icon" title="Exportar CSV" onClick={handleExport}>
            <Download size={14} />
          </button>
          <button className="btn btn-primary btn-sm" onClick={() => setModal('add')}>
            <Plus size={13} /> Agregar
          </button>
        </div>
      </div>

      {/* View segmented control */}
      <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-visible)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: 'var(--space-md)', width: 'fit-content' }}>
        {VIEWS.map(v => (
          <button
            key={v.id}
            onClick={() => setView(v.id)}
            style={{
              fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
              padding: '7px 16px', border: 'none', cursor: 'pointer', transition: 'all 200ms var(--ease-out)',
              background: view === v.id ? 'var(--text-display)' : 'transparent',
              color: view === v.id ? 'var(--black)' : 'var(--text-secondary)',
            }}
          >
            {v.id === 'wishlist' && wished > 0 ? `${v.label} (${wished})` : v.label}
          </button>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <input
          className="filter-input"
          placeholder="Buscar..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        {filterableFields.map(f => (
          <select
            key={f.key}
            className="filter-select"
            value={filters[f.key] ?? ''}
            onChange={e => setFilters(prev => ({ ...prev, [f.key]: e.target.value }))}
          >
            <option value="">{f.label}</option>
            {getOptions(f).map(o => <option key={o} value={o}>{o}</option>)}
          </select>
        ))}
        {(search || Object.values(filters).some(Boolean)) && (
          <button className="btn btn-ghost btn-sm" onClick={() => { setSearch(''); setFilters({}); }}>
            Limpiar
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-3xl) 0', textAlign: 'center', fontFamily: 'var(--font-mono)', fontSize: 12, letterSpacing: '0.08em', color: 'var(--text-disabled)' }}>
          [CARGANDO...]
        </div>
      ) : filtered.length === 0 ? (
        <div className="empty-state">
          <p>
            {items.length === 0 ? 'Colección vacía'
              : view === 'wishlist' ? 'Sin items deseados'
              : 'Sin resultados'}
          </p>
          <p>
            {items.length === 0 ? `Agregá tu primer item a ${col.label}.`
              : view === 'wishlist' ? 'Marcá items como "Deseado" al agregar o editar.'
              : 'Probá con otros filtros.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 32 }}></th>
                {columns.map(c => <th key={c.key}>{c.label}</th>)}
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => (
                <tr key={item.id} style={{ opacity: item.wishlist ? 0.65 : 1 }}>
                  <td style={{ padding: '12px 8px' }}>
                    <button
                      onClick={() => handleWishlistToggle(item)}
                      title={item.wishlist ? 'Marcar como en posesión' : 'Marcar como deseado'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2, color: item.wishlist ? 'var(--warning)' : 'var(--text-disabled)', display: 'flex' }}
                    >
                      {item.wishlist ? <BookmarkCheck size={14} /> : <Bookmark size={14} />}
                    </button>
                  </td>
                  {columns.map(c => (
                    <td key={c.key}>
                      {c.key === 'condition' && item[c.key] ? (
                        <span className={`badge ${CONDITION_CLASS[item[c.key]] ?? 'badge-good'}`}>
                          {item[c.key]}
                        </span>
                      ) : (
                        item[c.key] || <span className="td-dim">—</span>
                      )}
                    </td>
                  ))}
                  <td className="td-action" style={{ whiteSpace: 'nowrap' }}>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button
                        className="btn-icon" style={{ width: 28, minHeight: 28 }}
                        onClick={() => setModal(item)} title="Editar"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        className="btn-icon" style={{ width: 28, minHeight: 28, borderColor: 'var(--accent)', color: 'var(--accent)' }}
                        onClick={() => handleDelete(item.id)} title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modal && (
        <AddModal
          collectionId={collectionId}
          editItem={modal === 'add' ? null : modal}
          onClose={() => setModal(null)}
          onSaved={refresh}
        />
      )}
    </div>
  );
}
