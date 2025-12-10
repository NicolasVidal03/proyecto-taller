import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@modules/auth/providers/AuthProvider';

const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems: Array<{ label: string; to: string; disabled?: boolean }> = [
    { label: 'Clientes', to: '#', disabled: true },
    { label: 'Productos', to: '#', disabled: true },
    { label: 'Proveedores', to: '#', disabled: true },
    { label: 'Usuarios', to: '/users' },
    { label: 'Pedidos', to: '#', disabled: true },
  ];

  return (
    <div className="flex min-h-screen bg-lead-200 text-lead-800 font-sans">
      <aside className="hidden flex-col bg-gradient-to-b from-brand-900 via-brand-800 to-brand-900 text-white shadow-2xl md:flex md:w-64 lg:w-72 relative z-20 border-r border-white/5">
        <div className="flex items-center gap-3 border-b border-white/10 px-7 py-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 text-xl font-bold text-white shadow-lg shadow-accent-500/20 ring-1 ring-white/10">
            {user?.names ? user.names.charAt(0) : 'A'}
          </div>
          <div className="leading-tight">
            <p className="text-[0.65rem] uppercase tracking-[0.2em] text-brand-200 font-bold">Administrador</p>
            <p className="text-base font-bold text-white truncate max-w-[140px]">
              {user ? `${user.names.split(' ')[0] || user.names} ${user.last_name || ''}`.trim() : 'Usuario'}
            </p>
          </div>
        </div>

        <nav className="flex-1 space-y-2 px-4 py-8 text-sm font-medium">
          {navItems.map(item =>
            item.disabled ? (
              <div
                key={item.label}
                className="flex items-center rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-wider text-white/30 cursor-not-allowed"
              >
                {item.label}
              </div>
            ) : (
              <NavLink
                key={item.label}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center rounded-xl px-4 py-3.5 text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
                    isActive || location.pathname.startsWith(item.to)
                      ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/25 translate-x-1'
                      : 'text-lead-200 hover:bg-white/10 hover:text-white hover:translate-x-1'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ),
          )}
        </nav>

        <div className="border-t border-white/10 px-7 py-6">
          <p className="text-[0.6rem] uppercase tracking-[0.3em] text-brand-400/60 text-center">SICME ELECTRIK v1.0</p>
        </div>
      </aside>

      <div className="flex flex-1 flex-col relative z-10">
        <header className="flex items-center justify-between bg-lead-100 px-6 py-4 shadow-sm lg:px-10 border-b border-lead-300">
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
            <button
              type="button"
              onClick={logout}
              className="hidden rounded-lg border border-lead-200 bg-white px-4 py-2 text-xs font-bold uppercase tracking-wide text-lead-600 hover:bg-lead-50 hover:text-brand-600 transition md:inline-flex"
            >
              Salir
            </button>
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-brand-700 font-bold border border-brand-200">
              {user?.names ? user.names.charAt(0) : 'S'}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-lead-200">{children}</main>
      </div>
    </div>
  );
};

export default AppLayout;
