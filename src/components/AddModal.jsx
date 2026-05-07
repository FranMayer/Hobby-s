import { useState } from 'react';
import { X } from 'lucide-react';
import { COLLECTIONS } from '../data/collections';
import { addItem, updateItem } from '../data/store';

export default function AddModal({ collectionId, editItem, onClose, onSaved }) {
  const col = COLLECTIONS[collectionId];
  const initial = editItem
    ? Object.fromEntries(col.fields.map(f => [f.key, editItem[f.key] ?? '']))
    : Object.fromEntries(col.fields.map(f => [f.key, '']));

  const [form, setForm] = useState(initial);
  const [wishlist, setWishlist] = useState(editItem?.wishlist === true);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState(null);

  function validate() {
    const errs = {};
    col.fields.forEach(f => {
      if (f.required && !form[f.key]?.toString().trim()) errs[f.key] = true;
    });
    return errs;
  }

  async function handleSubmit() {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    try {
      if (editItem) {
        await updateItem(collectionId, editItem.id, { ...form, wishlist });
      } else {
        await addItem(collectionId, { ...form, wishlist });
      }
      setStatus('saved');
      setTimeout(() => { onSaved(); onClose(); }, 600);
    } catch {
      setStatus('error');
    }
  }

  function set(key, val) {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => { const c = { ...e }; delete c[key]; return c; });
  }

  const isEdit = Boolean(editItem);

  return (
    <div className="modal-backdrop" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal">
        <div className="modal-header">
          <span className="modal-title">
            {isEdit ? `Editar — ${col.label}` : `Agregar — ${col.label}`}
          </span>
          <button className="btn-icon" onClick={onClose} aria-label="Cerrar">
            <X size={16} />
          </button>
        </div>

        <div className="modal-body">
          {/* Wishlist toggle */}
          <div style={{ display: 'flex', gap: 0, border: '1px solid var(--border-visible)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', alignSelf: 'flex-start' }}>
            {[{ val: false, label: 'En posesión' }, { val: true, label: 'Deseado' }].map(opt => (
              <button
                key={String(opt.val)}
                onClick={() => setWishlist(opt.val)}
                style={{
                  fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.08em', textTransform: 'uppercase',
                  padding: '7px 18px', border: 'none', cursor: 'pointer', transition: 'all 200ms var(--ease-out)',
                  background: wishlist === opt.val ? 'var(--text-display)' : 'transparent',
                  color: wishlist === opt.val ? 'var(--black)' : 'var(--text-secondary)',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {col.fields.filter(f => f.key !== 'notes').reduce((rows, field, i, arr) => {
            if (i % 2 === 0) rows.push(arr.slice(i, i + 2));
            return rows;
          }, []).map((pair, ri) => (
            <div key={ri} className={pair.length === 2 ? 'form-row' : ''}>
              {pair.map(field => (
                <div key={field.key} className="field">
                  <label className="field-label">
                    {field.label}{field.required && ' *'}
                  </label>
                  {field.type === 'select' ? (
                    <select
                      className={`field-select${errors[field.key] ? ' error' : ''}`}
                      value={form[field.key]}
                      onChange={e => set(field.key, e.target.value)}
                    >
                      <option value="">— seleccionar —</option>
                      {field.options.map(o => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <input
                      className={`field-input${errors[field.key] ? ' error' : ''}`}
                      type={field.type === 'number' ? 'number' : 'text'}
                      value={form[field.key]}
                      onChange={e => set(field.key, e.target.value)}
                      placeholder={field.type === 'number' ? '—' : ''}
                    />
                  )}
                </div>
              ))}
            </div>
          ))}

          <div className="field">
            <label className="field-label">Notas</label>
            <input
              className="field-input"
              type="text"
              value={form.notes ?? ''}
              onChange={e => set('notes', e.target.value)}
              placeholder="Observaciones opcionales"
            />
          </div>
        </div>

        <div className="modal-footer">
          {status === 'saved' && <span className="inline-status saved">[GUARDADO]</span>}
          {status === 'error' && <span className="inline-status error">[ERROR]</span>}
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancelar</button>
          <button className="btn btn-primary btn-sm" onClick={handleSubmit}>
            {isEdit ? 'Guardar Cambios' : 'Agregar'}
          </button>
        </div>
      </div>
    </div>
  );
}
