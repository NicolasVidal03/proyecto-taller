import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import UserDropdown from '../components/UserDropdown';
import { useToast } from '../components/shared/Toast';
import { container } from '../../infrastructure/config/container';

const ChangePasswordForm: React.FC<{ userId: number; onClose: () => void }> = ({ userId, onClose }) => {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const toast = useToast();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password !== confirm) return toast.error('Las contraseñas no coinciden');
    setLoading(true);
    try {
      await container.users.updatePassword(userId, password);
      toast.success('Contraseña actualizada');
      onClose();
    } catch (err: any) {
      toast.error(err?.message || 'Error actualizando contraseña');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium">Nueva contraseña</label>
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" className="mt-1 block w-full rounded-lg border px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium">Confirmar contraseña</label>
        <input value={confirm} onChange={e => setConfirm(e.target.value)} type="password" className="mt-1 block w-full rounded-lg border px-3 py-2" />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="px-4 py-2 rounded border">Cancelar</button>
        <button type="submit" disabled={loading} className="px-4 py-2 rounded bg-accent-500 text-white">{loading ? 'Guardando...' : 'Guardar'}</button>
      </div>
    </form>
  );
};

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isHovered, setIsHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showChangePassword, setShowChangePassword] = useState(false);
  const toast = useToast();

  const navItems: Array<{ label: string; to: string; icon: string; disabled?: boolean }> = [
    { label: 'Clientes', to: '/clients', icon: '👥' },
    { label: 'Áreas', to: '/areas', icon: '🗺️' },
    { label: 'Rutas', to: '/routes', icon: '🛤️' },
    { label: 'Actividades', to: '/activities', icon: '📍' },
    { label: 'Productos', to: '/products', icon: '📦' },
    { label: 'Inventario', to: '/inventory', icon: '📊' },
    { label: 'Preventas', to: '/presales', icon: '🤝🏻' },
    { label: 'Usuarios', to: '/users', icon: '👤' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleNavClick = () => {
    setMobileOpen(false);
  };

  const SidebarContent = ({ expanded }: { expanded: boolean }) => (
    <>
      <div
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`cursor-pointer flex items-center gap-3 border-b border-white/10 px-4 py-6 transition-all duration-300 ${expanded ? 'justify-start' : 'justify-center'}`}
      >
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-lg font-bold text-white shadow-lg shadow-accent-500/20 ring-1 ring-white/10">
          {user?.names ? user.names.charAt(0) : 'A'}
        </div>
        <div className={`leading-tight overflow-hidden transition-all duration-300 ${expanded ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
          <p className="text-[0.6rem] uppercase tracking-[0.2em] text-brand-200 font-bold whitespace-nowrap">Administrador</p>
          <p className="text-sm font-bold text-white truncate max-w-[140px]">
            {user ? `${user.names?.split(' ')[0] || user.names} ${user.lastName || ''}`.trim() : 'Usuario'}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-5 text-sm font-medium overflow-y-auto overflow-x-hidden">
        {navItems.map(item =>
          item.disabled ? (
            <div
              key={item.label}
              className={`flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider text-white/30 cursor-not-allowed ${expanded ? 'justify-start' : 'justify-center'}`}
            >
              <span className="text-base shrink-0">🔒</span>
              {expanded && <span className="truncate">{item.label}</span>}
            </div>
          ) : (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={handleNavClick}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                  isActive || location.pathname.startsWith(item.to)
                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 translate-x-1'
                    : 'text-lead-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
                } ${expanded ? 'justify-start' : 'justify-center'}`
              }
            >
              <span className="text-base shrink-0" title={item.label}>{item.icon}</span>
              {expanded && <span className="truncate">{item.label}</span>}
            </NavLink>
          )
        )}
      </nav>

      {expanded && (
        <div className="border-t border-white/10 px-4 py-4">
          <p className="text-[0.55rem] uppercase tracking-[0.3em] text-brand-400/60 text-center whitespace-nowrap">SICME ELECTRIK v1.0</p>
        </div>
      )}
    </>
  );

  return (
    <div className="flex min-h-screen bg-lead-200 text-lead-800 font-sans">
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}
      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col w-64 bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white shadow-2xl transition-transform duration-300 lg:hidden ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setMobileOpen(false)}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 text-white/70 hover:bg-white/20 hover:text-white transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <SidebarContent expanded={true} />
      </div>

      <div
        className={`hidden lg:flex fixed inset-y-0 left-0 z-30 flex-col bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white shadow-2xl transition-all duration-300 ease-in-out ${
          isHovered ? 'w-60' : 'w-16'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <SidebarContent expanded={isHovered} />
      </div>

      <div className={`flex flex-1 flex-col relative z-10 transition-all duration-300 ml-0 ${isHovered ? 'lg:ml-60' : 'lg:ml-16'}`}>

        {/* Header */}
        <header className="sticky top-0 z-40 flex items-center justify-between bg-lead-100 px-4 py-3 shadow-sm border-b border-lead-300 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(true)}
              className="lg:hidden p-2 rounded-lg text-lead-600 hover:bg-lead-200 transition"
              aria-label="Abrir menú"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <p className="text-[0.6rem] uppercase tracking-[0.3em] text-brand-600 font-bold hidden sm:block">Panel General</p>
              <h1 className="text-base font-bold text-lead-900 sm:text-lg">
                {user?.role === 'gerente' ? 'Gerente' : 'Administración'}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {user && (
              <div className="leading-tight text-right hidden sm:block">
                <p className="text-sm font-bold text-lead-700">{user.names}</p>
                <p className="text-[0.6rem] uppercase tracking-wider text-lead-400 font-semibold">{user.role?.replace(/_/g, ' ')}</p>
              </div>
            )}
            <div className="hidden md:block">
              <React.Suspense fallback={
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200 text-sm">
                  {user?.names ? user.names.charAt(0) : 'S'}
                </div>
              }>
                <UserDropdown
                  user={user ?? null}
                  onViewProfile={() => navigate('/profile')}
                  onChangePassword={() => setShowChangePassword(true)}
                  onLogout={handleLogout}
                />
              </React.Suspense>
            </div>
            <div className="block md:hidden">
              <button
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200 text-sm"
              >
                {user?.names ? user.names.charAt(0) : 'S'}
              </button>
            </div>
          </div>
        </header>

        {showChangePassword && user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm px-4">
            <div className="w-full max-w-md overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
              <div className="bg-brand-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Cambiar contraseña</h2>
              </div>
              <div className="px-6 py-6">
                <ChangePasswordForm userId={user.id} onClose={() => setShowChangePassword(false)} />
              </div>
            </div>
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-3 sm:p-5 lg:p-8 bg-lead-200">
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppLayout;