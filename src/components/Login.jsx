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
    if (error) setError('[ERROR: EMAIL O CONTRASEÑA INVÁLIDOS]');
  }

  return (
    <div className="login">
      <form className="login-card" onSubmit={handleSubmit}>
        <div>
          <span className="login-dot" aria-hidden="true" />
          <h1 className="login-brand">HOBBYCOUNT</h1>
          <p className="login-sub">Ayelen &amp; Franco — Colecciones</p>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-email">Email</label>
          <input id="login-email" className="login-input" type="email" autoComplete="email" required
            placeholder="tu@email.com" value={email} onChange={e => setEmail(e.target.value)} />
        </div>

        <div className="field">
          <label className="field-label" htmlFor="login-password">Contraseña</label>
          <input id="login-password" className="login-input" type="password" autoComplete="current-password" required
            placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
        </div>

        {error && <span className="inline-status error" role="alert">{error}</span>}

        <button className="btn btn-primary" type="submit" disabled={busy}>
          {busy ? 'Ingresando...' : 'Ingresar'}
        </button>

        <p className="login-foot">[ Acceso privado ]</p>
      </form>
    </div>
  );
}
