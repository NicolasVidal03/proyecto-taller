import React, { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@modules/auth/providers/AuthProvider';
import Loader from '@shared/components/Loader';
import { ENV } from '@shared/config/env';

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, isLoading, error, user } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const defaultPasswordHint = `${ENV.LOCAL_PASSWORD_PREFIX}<USERNAME>`;

  useEffect(() => {
    if (isAuthenticated && user) {
      const fallback = user.role === 'super_admin' ? '/super-admin' : '/users';
      const target = (location.state as { from?: string } | null)?.from || fallback;
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, location.state, navigate]);

  const handleSubmit = async (evt: FormEvent<HTMLFormElement>) => {
    evt.preventDefault();
    setSubmitting(true);
    setFormError(null);
    try {
      await login(username.trim(), password);
    } catch (err: any) {
      const message = err?.response?.data?.error || error || 'Credenciales inválidas';
      setFormError(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (isLoading && !submitting && !isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-brand-900">
        <Loader />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-gradient-to-br from-brand-600 via-brand-800 to-brand-900 px-6 py-16 text-white sm:px-10">
      <div
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage:
            'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1), transparent 60%), radial-gradient(circle at 80% 10%, rgba(255,255,255,0.08), transparent 55%)',
        }}
      />
      <div className="absolute -bottom-32 -left-32 h-72 w-72 rounded-full bg-accent-500/30 blur-3xl" />
      <div className="absolute -top-40 -right-28 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />

      <div className="relative w-full max-w-sm space-y-10">
        <div className="space-y-2 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-xl border border-white/20 bg-white/10 backdrop-blur-sm text-white">
            <span className="text-xl font-semibold">S</span>
          </div>
          <div className="text-lg font-semibold tracking-widest text-brand-100">SICME</div>
          <div className="text-2xl font-bold tracking-[0.3em] text-accent-400">ELECTRIK</div>
        </div>

        <div className="space-y-6 rounded-[2rem] bg-brand-900/40 px-8 py-10 shadow-2xl border border-white/10 backdrop-blur-xl">
          <div>
            <h1 className="text-2xl font-bold uppercase tracking-wide text-white">Iniciar sesión</h1>
            <p className="text-sm text-brand-100/80 mt-1">Accede con tu carnet de identidad y contraseña.</p>
          </div>

          {(formError || error) && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
              {formError || error}
            </div>
          )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-brand-200" htmlFor="username">
                    Usuario
                  </label>
                  <input
                    id="username"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-accent-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent-400 transition-all"
                    value={username}
                    onChange={event => setUsername(event.target.value)}
                    autoComplete="username"
                    placeholder="tu.usuario"
                    required
                  />
                </div>
            <div className="space-y-1.5">
              <label className="text-xs font-bold uppercase tracking-wider text-brand-200" htmlFor="password">
                Contraseña
              </label>
              <input
                id="password"
                type="password"
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-white/30 focus:border-accent-400 focus:bg-white/10 focus:outline-none focus:ring-1 focus:ring-accent-400 transition-all"
                value={password}
                onChange={event => setPassword(event.target.value)}
                autoComplete="current-password"
                placeholder="••••••••"
                required
              />
            </div>
            <button 
              className="w-full rounded-xl bg-accent-500 py-3.5 text-sm font-bold uppercase tracking-wide text-white shadow-lg shadow-accent-500/20 hover:bg-accent-400 hover:shadow-accent-500/40 focus:outline-none focus:ring-2 focus:ring-accent-400 focus:ring-offset-2 focus:ring-offset-brand-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform active:scale-[0.98]" 
              type="submit" 
              disabled={submitting}
            >
              {submitting ? 'Validando...' : 'Ingresar'}
            </button>
          </form>

          <p className="text-center text-[0.7rem] text-white/50">
            Contraseña inicial sugerida: <span className="font-mono text-white/70">{defaultPasswordHint}</span>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
