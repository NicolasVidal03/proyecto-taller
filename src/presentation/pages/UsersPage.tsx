import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useUsers } from '../hooks/useUsers';
import { useBranches } from '../hooks/useBranches';
import { UsersSection, BranchesSection } from '../components/users/sections';
import { ToastContainer, useToast } from '../components/shared/Toast';

type ActiveSection = 'users' | 'branches';
type RoleFilter = 'all' | 'propietario' | 'administrador' | 'prevendedor' | 'transportista';

const ROLE_FILTERS: Array<{ value: RoleFilter; label: string }> = [
  { value: 'all', label: 'Todos' },
  { value: 'propietario', label: 'Propietarios' },
  { value: 'administrador', label: 'Administradores' },
  { value: 'prevendedor', label: 'Prevendedores' },
  { value: 'transportista', label: 'Transportistas' },
];

export const UsersPage: React.FC = () => {
  const { users } = useUsers();
  const { branches, branchMap, isLoading: branchesLoading, fetchBranches } = useBranches();
  const toast = useToast();

  const [activeSection, setActiveSection] = useState<ActiveSection>('users');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  useEffect(() => {
    fetchBranches();
  }, [fetchBranches]);

  const handleToast = useCallback((type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [toast]);

  const searchPlaceholder = useMemo(() => {
    switch (activeSection) {
      case 'users': return 'Buscar por nombre, apellido o usuario';
      case 'branches': return 'Buscar sucursales por nombre';
      default: return 'Buscar...';
    }
  }, [activeSection]);

  const stats = useMemo(() => {
    const safeUsers = Array.isArray(users) ? users.filter(Boolean) : [];
    const total = safeUsers.length;
    const admins = safeUsers.filter(u => u.role === 'administrador').length;
    const sellers = safeUsers.filter(u => u.role === 'prevendedor').length;
    const drivers = safeUsers.filter(u => u.role === 'transportista').length;
    return {
      cards: [
        { label: 'Total de usuarios', value: total, accent: 'from-brand-900 to-brand-600' },
        { label: 'Admins', value: admins, accent: 'from-brand-500 to-brand-300' },
      ],
      breakdown: [
        { label: 'Prevendedores', value: sellers },
        { label: 'Transportistas', value: drivers },
        { label: 'Sucursales', value: branches.length },
      ],
    };
  }, [users, branches.length]);

  const sectionButtons: { key: ActiveSection; label: string }[] = [
    { key: 'users', label: 'Usuarios' },
    { key: 'branches', label: 'Sucursales' },
  ];

  return (
    <>
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
        <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">

          {/* Hero Section */}
          <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
            <div
              className="absolute inset-0 opacity-30"
              style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
            />
            <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
              <div className="space-y-6">
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Usuarios</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestiona usuarios y accesos centralizados
                </h2>

                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input-plain flex-1"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {activeSection === 'users' && (
                    <div className="flex flex-wrap gap-3">
                      {ROLE_FILTERS.map(option => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => setRoleFilter(option.value)}
                          className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                            roleFilter === option.value
                              ? 'bg-lead-50 text-brand-700 shadow-lg'
                              : 'bg-white/10 text-white/70 hover:bg-white/20'
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="relative">
                <div className="absolute inset-0 rounded-[2rem] bg-white/10 blur-xl" />
                <div className="relative space-y-5 rounded-[2rem] border border-white/20 bg-white/10 px-7 py-8 backdrop-blur">
                  <div className="grid grid-cols-2 gap-4">
                    {stats.cards.map(card => (
                      <div key={card.label} className={`rounded-2xl bg-gradient-to-br ${card.accent} px-4 py-5 shadow-lg`}>
                        <p className="text-xs uppercase tracking-wide text-white/80">{card.label}</p>
                        <p className="mt-2 text-3xl font-semibold text-white">{card.value}</p>
                      </div>
                    ))}
                  </div>
                  <div className="space-y-2 rounded-xl border border-white/20 bg-white/10 p-4 text-sm text-white/80">
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Desglose</p>
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
          </section>

          {/* Navigation Tabs */}
          <div className="flex flex-wrap gap-3">
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

          {/* Content Sections */}
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
