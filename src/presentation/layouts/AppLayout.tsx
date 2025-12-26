import React, { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../providers/AuthProvider';
import UserDropdown from '../components/UserDropdown';
import { useToast } from '../components/shared/Toast';
import { http } from '../../infrastructure/http/httpClient';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const toast = useToast();

  const navItems: Array<{ label: string; to: string; disabled?: boolean; subItems?: Array<{ label: string; to: string }> }> = [
    { label: 'Clientes', to: '/clients' },
    { 
      label: 'Inventario', 
      to: '/inventory',
      subItems: [
        { label: 'Productos', to: '/products' },
        { label: 'Categorías', to: '/categories' }, 
      ]
    },
    { label: 'Proveedores', to: '/suppliers' },
    { label: 'Usuarios', to: '/users' },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const ChangePasswordForm: React.FC<{ userId: number; onClose: () => void }> = ({ userId, onClose }) => {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const submit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!password || password !== confirm) return toast.error('Las contraseñas no coinciden');
      setLoading(true);
      try {
        await http.patch(`/users/${userId}/password`, { password });
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

  return (
    <div className="flex min-h-screen bg-lead-200 text-lead-800 font-sans">
      {/* Sidebar Container - Fixed width when collapsed, expands on hover */}
      <div 
        className={`fixed inset-y-0 left-0 z-30 flex flex-col bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white shadow-2xl transition-all duration-300 ease-in-out ${
          isHovered ? 'w-64' : 'w-20'
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* User Profile Section */}
        <div
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className={`cursor-pointer flex items-center gap-3 border-b border-white/10 px-4 py-8 transition-all duration-300 ${isHovered ? 'justify-start' : 'justify-center'}`}
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-xl font-bold text-white shadow-lg shadow-accent-500/20 ring-1 ring-white/10">
            {user?.names ? user.names.charAt(0) : 'A'}
          </div>
          <div className={`leading-tight overflow-hidden transition-all duration-300 ${isHovered ? 'opacity-100 w-auto' : 'opacity-0 w-0'}`}>
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brand-200 font-bold whitespace-nowrap">Administrador</p>
            <p className="text-base font-bold text-white truncate max-w-[140px]">
              {user ? `${user.names?.split(' ')[0] || user.names} ${user.lastName || ''}`.trim() : 'Usuario'}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-2 px-3 py-8 text-sm font-medium overflow-y-auto overflow-x-hidden">
          {navItems.map(item => (
            <div key={item.label}>
              {item.subItems ? (
                <div className="space-y-1">
                  <div className={`flex items-center rounded-xl px-3 py-3.5 text-xs font-bold uppercase tracking-wider text-lead-200 transition-all duration-200 ${isHovered ? 'justify-start' : 'justify-center'}`}>
                    <span className={`transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0 hidden'}`}>{item.label}</span>
                    {!isHovered && <span className="text-lg" title={item.label}>📦</span>} {/* Icon placeholder for collapsed state */}
                  </div>
                  {item.subItems.map(sub => (
                    <NavLink
                      key={sub.to}
                      to={sub.to}
                      className={({ isActive }) =>
                        `flex items-center rounded-xl px-3 py-3 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                          isActive || location.pathname.startsWith(sub.to)
                            ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 translate-x-1'
                            : 'text-lead-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
                        } ${isHovered ? 'pl-8' : 'justify-center'}`
                      }
                    >
                      <span className={`truncate ${isHovered ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>{sub.label}</span>
                      {!isHovered && <span className="text-xs" title={sub.label}>•</span>}
                    </NavLink>
                  ))}
                </div>
              ) : item.disabled ? (
                <div
                  className={`flex items-center rounded-xl px-3 py-3.5 text-xs font-bold uppercase tracking-wider text-white/30 cursor-not-allowed ${isHovered ? 'justify-start' : 'justify-center'}`}
                >
                  <span className={`truncate ${isHovered ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>{item.label}</span>
                  {!isHovered && <span className="text-lg" title={item.label}>🔒</span>}
                </div>
              ) : (
                <NavLink
                  to={item.to}
                  className={({ isActive }) =>
                    `flex items-center rounded-xl px-3 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                      isActive || location.pathname.startsWith(item.to)
                        ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 translate-x-1'
                        : 'text-lead-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
                    } ${isHovered ? 'justify-start' : 'justify-center'}`
                  }
                >
                  <span className={`truncate ${isHovered ? 'opacity-100' : 'opacity-0 w-0 hidden'}`}>{item.label}</span>
                  {!isHovered && <span className="text-lg" title={item.label}>{item.label.charAt(0)}</span>}
                </NavLink>
              )}
            </div>
          ))}
        </nav>

        {/* Footer */}
        <div className={`border-t border-white/10 px-4 py-6 transition-all duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-brand-400/60 text-center whitespace-nowrap">SICME ELECTRIK v1.0</p>
        </div>
      </div>

      {/* Main Content Wrapper - Pushed by collapsed sidebar width */}
      <div className={`flex flex-1 flex-col relative z-10 transition-all duration-300 ${isHovered ? 'ml-64' : 'ml-20'}`}>
        <header className="sticky top-0 z-40 flex items-center justify-between bg-lead-100 px-6 py-4 shadow-sm lg:px-10 border-b border-lead-300">
          <div>
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-brand-600 font-bold mb-0.5">Panel General</p>
            <h1 className="text-xl font-bold text-lead-900">
              {user?.role === 'super_admin' ? 'Super Administrador' : 'Administración'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <div className="leading-tight text-right hidden sm:block">
                <p className="text-sm font-bold text-lead-700">{user.names}</p>
                <p className="text-[0.65rem] uppercase tracking-wider text-lead-400 font-semibold">{user.role?.replace(/_/g, ' ')}</p>
              </div>
            ) : null}
            {/* User dropdown handles logout, view profile and change password */}
            <div className="hidden md:block">
              {/* We'll lazy-load the dropdown in the layout to keep logic centralized */}
              <React.Suspense fallback={<div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200">{user?.names ? user.names.charAt(0) : 'S'}</div>}>
                <UserDropdown
                  user={user ?? null}
                  onViewProfile={() => navigate('/profile')}
                  onChangePassword={() => setShowChangePassword(true)}
                  onLogout={handleLogout}
                />
              </React.Suspense>
            </div>
            <div className="block md:hidden">
              <button onClick={handleLogout} className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200">{user?.names ? user.names.charAt(0) : 'S'}</button>
            </div>
          </div>
        </header>
        {/* Change password modal (simple) */}
        {showChangePassword && user && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm">
            <div className="mx-4 w-full max-w-md overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
              <div className="bg-brand-600 px-6 py-4">
                <h2 className="text-lg font-semibold text-white">Cambiar contraseña</h2>
              </div>
              <div className="px-6 py-6">
                <ChangePasswordForm userId={user.id} onClose={() => setShowChangePassword(false)} />
              </div>
            </div>
          </div>
        )}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-lead-200">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
