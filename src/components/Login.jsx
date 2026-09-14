import { useState } from 'react';
import { supabase } from '../data/supabase';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setBusy(false);
    if (error) setError('[ERROR: NO SE PUDO INGRESAR]');
  }

  return (
    <div className="modal-backdrop">
      <form className="modal" style={{ maxWidth: 380 }} onSubmit={handleSubmit}>
        <div className="modal-header">
          <span className="modal-title">HobbyCount — Ingresar</span>
        </div>
        <div className="modal-body">
          <div className="field">
            <label className="field-label" htmlFor="login-email">Email</label>
            <input id="login-email" className="field-input" type="email" autoComplete="email" required
              value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="login-password">Contraseña</label>
            <input id="login-password" className="field-input" type="password" autoComplete="current-password" required
              value={password} onChange={e => setPassword(e.target.value)} />
          </div>
        </div>
        <div className="modal-footer">
          {error && <span className="inline-status error">{error}</span>}
          <button className="btn btn-primary btn-sm" type="submit" disabled={busy}>
            {busy ? 'Ingresando...' : 'Ingresar'}
          </button>
        </div>
      </form>
    </div>
  );
}
