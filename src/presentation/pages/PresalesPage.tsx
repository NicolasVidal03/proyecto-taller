import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { ToastContainer, useToast } from '../components/shared/Toast';
import { useBranches } from '@presentation/hooks';

export const PresalesPage: React.FC = () => {
    const { branches, fetchBranches, isLoading: branchesLoading } = useBranches();

    const [branchFilter, setBranchFilter] = useState<number | 'all'>('all');


    const stats = useMemo(() => ({
        cards: [
            { label: 'Total Preventas', value: branches.length, accent: 'from-brand-900 to-brand-600' }
        ]
    }), [branches.length])


    return (
        <>
            <div className="relative overflow-hidden">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(17,93,216,0.12),transparent_60%),radial-gradient(circle_at_80%_0%,rgba(255,100,27,0.08),transparent_55%)]" />
                <div className="relative space-y-10 px-6 py-8 lg:px-10 lg:py-12">
                    <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-brand-900 via-brand-700 to-brand-500 text-white shadow-2xl">
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{ backgroundImage: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0) 45%)' }}
                        />
                        <div className="grid gap-10 px-8 py-10 md:px-12 lg:grid-cols-[2fr,1.2fr]">
                            <div className="space-y-6">
                                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Preventas</p>
                                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                                    Preventas por Sucursal
                                </h2>

                                {/* Buscador y filtros */}
                                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                                    <div className="flex flex-col gap-3 md:flex-row">
                                        <input
                                            className="input-plain flex-1"
                                            placeholder={'hola'}
                                            value={'hola'}
                                            onChange={e => console.log('hola')}
                                        />
                                    </div>
                                        <div className="flex flex-wrap gap-3">
                                            <select
                                                className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                                                value={branchFilter}
                                                onChange={(e) => setBranchFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                                            >
                                                <option value="all" className="text-lead-900">Todas las categorias</option>
                                                {branches.filter(c => c.state).map(c => (
                                                    <option key={c.id} value={c.id} className="text-lead-900">{c.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                </div>
                            </div>

                            {/* Estadisticas */}
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
                                        <p className="text-xs uppercase tracking-[0.35em] text-white/60">Catalogo</p>
                                        {/* {stats.breakdown.map(item => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span>{item.label}</span>
                                                <span className="font-semibold text-white">{item.value}</span>
                                            </div>
                                        ))} */}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

        </>
    );
};