import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useBranches } from '../hooks/useBranches';
import { UsersSection, BranchesSection } from '../components/users/sections';
import { ToastContainer, useToast } from '../components/shared/Toast';

type ActiveSection = 'users' | 'branches';
type RoleFilter = 'all' | 'gerente' | 'administrador' | 'prevendedor' | 'transportista';

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'gerente', label: 'Gerentes' },
  { value: 'administrador', label: 'Admins' },
  { value: 'prevendedor', label: 'Prevendedores' },
  { value: 'transportista', label: 'Transportistas' },
];

export const UsersPage: React.FC = () => {
  const { users, fetchUsers } = useUsers();
  const { branches, branchMap, isLoading: branchesLoading, fetchBranches } = useBranches();
  const toast = useToast();

  const [activeSection, setActiveSection] = useState<ActiveSection>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  // Colapsar stats en mobile para ganar espacio vertical
  const [statsOpen, setStatsOpen] = useState(false);

  useEffect(() => {
    Promise.all([fetchUsers(), fetchBranches()]);
  }, [fetchBranches, fetchUsers]);

  const handleToast = useCallback(
    (type: 'success' | 'error', message: string) => {
      type === 'success' ? toast.success(message) : toast.error(message);
    },
    [toast],
  );

  const searchPlaceholder = useMemo(() => {
    switch (activeSection) {
      case 'users':    return 'Buscar por nombre, apellido o usuario…';
      case 'branches': return 'Buscar sucursales por nombre…';
      default:         return 'Buscar…';
    }
  }, [activeSection]);

  const stats = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
    const total   = safeUsers.length;
    const admins  = safeUsers.filter(u => u.role === 'administrador').length;
    const sellers = safeUsers.filter(u => u.role === 'prevendedor').length;
    const drivers = safeUsers.filter(u => u.role === 'transportista').length;
    return {
      cards: [
        { label: 'Total usuarios', value: total,  accent: 'from-brand-900 to-brand-600' },
        { label: 'Admins',         value: admins,  accent: 'from-brand-500 to-brand-300' },
      ],
      breakdown: [
        { label: 'Prevendedores',  value: sellers },
        { label: 'Transportistas', value: drivers },
        { label: 'Sucursales',     value: branches.length },
      ],
    };
  }, [users, branches.length]);

  const sectionButtons: { key: ActiveSection; label: string }[] = [
    { key: 'users',    label: 'Usuarios'   },
    { key: 'branches', label: 'Sucursales' },
  ];

  return (
    <>
      <div className="relative overflow-hidden">
        {/* Fondo decorativo */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />

        <div className="relative space-y-6 px-3 py-5 sm:px-6 sm:py-8 lg:px-10 lg:py-12">

          {/* ── HERO ── */}
          <section className="relative overflow-hidden rounded-2xl sm:rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg,rgba(255,255,255,.25) 0%,rgba(255,255,255,0) 45%)' }}
            />

            {/* Grid principal: columna izquierda (título + buscador) | columna derecha (stats) */}
            <div className="relative grid gap-6 px-5 py-7 sm:px-8 sm:py-10 md:px-12 lg:grid-cols-[2fr,1.2fr] lg:items-start">

              {/* ── COLUMNA IZQUIERDA ── */}
              <div className="flex flex-col gap-6">

                {/* Encabezado + toggle stats (mobile) */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[0.6rem] uppercase tracking-[0.45em] text-white/70">
                      Panel de Usuarios
                    </p>
                    <h2 className="text-xl font-semibold leading-tight sm:text-2xl md:text-3xl lg:text-4xl">
                      Gestiona usuarios<br className="hidden xs:block" /> y accesos
                    </h2>
                  </div>

                  {/* Botón colapsar stats — solo visible en pantallas < lg */}
                  <button
                    type="button"
                    onClick={() => setStatsOpen(o => !o)}
                    className="lg:hidden mt-1 shrink-0 flex items-center gap-1 rounded-full border border-white/30 bg-white/10 px-3 py-1.5 text-xs font-semibold text-white/80 backdrop-blur transition hover:bg-white/20"
                  >
                    <span>{statsOpen ? 'Ocultar' : 'Ver'} stats</span>
                    <svg
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${statsOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                </div>

                {/* Buscador + filtros */}
                <div className="rounded-2xl bg-white/10 backdrop-blur border border-white/10 p-3 sm:p-4">
                  <input
                    className="input-plain w-full text-sm"
                    placeholder={searchPlaceholder}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                  <div
                    className="flex flex-col gap-2 sm:flex-row sm:flex-wrap"
                    style={activeSection !== 'users' ? { height: 0, marginTop: 0, overflow: 'hidden', visibility: 'hidden' } : { marginTop: '0.75rem' }}
                  >
                    {ROLE_FILTERS.map(option => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => setRoleFilter(option.value)}
                        disabled={activeSection !== 'users'}
                        className={`w-full rounded-full px-3 py-2 text-xs font-semibold transition sm:w-auto sm:px-4 sm:py-2 sm:text-sm ${
                          roleFilter === option.value
                            ? 'bg-lead-50 text-brand-700 shadow-lg'
                            : 'bg-white/10 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Stats colapsables en mobile (debajo del buscador) */}
                {statsOpen && (
                  <div className="lg:hidden">
                    <div className="relative space-y-4 rounded-2xl border border-white/20 bg-white/10 px-5 py-6 backdrop-blur">
                      <div className="grid grid-cols-2 gap-3">
                        {stats.cards.map(card => (
                          <div key={card.label} className={`rounded-xl bg-gradient-to-br ${card.accent} px-3 py-4 shadow-lg`}>
                            <p className="text-[0.65rem] uppercase tracking-wide text-white/80">{card.label}</p>
                            <p className="mt-1.5 text-2xl font-semibold text-white">{card.value}</p>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white/80">
                        <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/60">Desglose</p>
                        {stats.breakdown.map(item => (
                          <div key={item.label} className="flex items-center justify-between">
                            <span className="text-xs">{item.label}</span>
                            <span className="font-semibold text-white">{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* ── COLUMNA DERECHA — stats desktop (siempre visible en lg+) ── */}
              <div className="hidden lg:block">
                <div className="relative">
                  <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                  <div className="relative space-y-4 rounded-[2rem] border border-white/20 bg-white/10 px-5 py-6 backdrop-blur">
                    <div className="grid grid-cols-2 gap-3">
                      {stats.cards.map(card => (
                        <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.accent} px-4 py-5 shadow-lg`}>
                          <p className="text-[0.65rem] uppercase tracking-wide text-white/80">{card.label}</p>
                          <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                        </div>
                      ))}
                    </div>
                    <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white/80">
                      <p className="text-[0.6rem] uppercase tracking-[0.35em] text-white/60">Desglose</p>
                      {stats.breakdown.map(item => (
                        <div key={item.label} className="flex items-center justify-between">
                          <span>{item.label}</span>
                          <span className="font-semibold text-white">{item.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </section>

          {/* ── TABS ── */}
          <div className="flex gap-2 sm:gap-3">
            {sectionButtons.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                  activeSection === key
                    ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                    : 'bg-white/70 text-lead-600 hover:bg-white'
                }`}
                onClick={() => setActiveSection(key)}
              >
                {label}
              </button>
            ))}
          </div>

          {/* ── CONTENIDO ── */}
          <section className="grid gap-8 xl:grid-cols-[1fr]">
            {activeSection === 'users' && (
              <UsersSection
                searchTerm={searchTerm}
                roleFilter={roleFilter}
                branches={branches}
                branchMap={branchMap}
                branchesLoading={branchesLoading}
                onToast={handleToast}
              />
            )}
            {activeSection === 'branches' && (
              <BranchesSection
                searchTerm={searchTerm}
                onToast={handleToast}
              />
            )}
          </section>

        </div>
      </div>

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};