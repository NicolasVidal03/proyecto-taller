import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { usePresentations } from '../hooks/usePresentations';
import { useColors } from '../hooks/useColors';
import {
  ProductsSection,
  BrandsSection,
  CategoriesSection,
  PresentationsSection,
  ColorsSection
} from '../components/products/sections';
import { ToastContainer, useToast } from '../components/shared/Toast';

type ActiveSection = 'products' | 'brands' | 'categories' | 'presentations' | 'colors';

export const ProductsPage: React.FC = () => {
  const { total } = useProducts();
  const { brands, fetchBrands } = useBrands();
  const { categories, fetchCategories } = useCategories();
  const { presentations, fetchPresentations } = usePresentations();
  const { colors, fetchColors } = useColors();
  const toast = useToast();

  const [activeSection, setActiveSection] = useState<ActiveSection>('products');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');


  useEffect(() => {
    Promise.all([fetchCategories(), fetchBrands(), fetchPresentations(), fetchColors()]);
  }, [fetchCategories, fetchBrands, fetchPresentations, fetchColors]);

  // Callback para toasts de las secciones
  const handleToast = useCallback((type: 'success' | 'error', message: string) => {
    if (type === 'success') {
      toast.success(message);
    } else {
      toast.error(message);
    }
  }, [toast]);

  // Placeholder del buscador segun seccion activa
  const searchPlaceholder = useMemo(() => {
    switch (activeSection) {
      case 'products': return 'Buscar por nombre, codigo de barras o codigo interno';
      case 'brands': return 'Buscar marcas por nombre';
      case 'categories': return 'Buscar categorias por nombre';
      case 'presentations': return 'Buscar presentaciones por nombre';
      case 'colors': return 'Buscar colores por nombre';
      default: return 'Buscar...';
    }
  }, [activeSection]);

  // Estadisticas para el header
  const stats = useMemo(() => ({
    cards: [
      { label: 'Total Productos', value: total, accent: 'from-brand-900 to-brand-600' },
    ],
    breakdown: [
      { label: 'Marcas', value: brands.length },
      { label: 'Categorias', value: categories.length },
      { label: 'Presentaciones', value: presentations.length },
      { label: 'Colores', value: colors.length },
    ],
  }), [total, brands.length, categories.length, presentations.length, colors.length]);

  // Botones de navegacion entre secciones
  const sectionButtons: { key: ActiveSection; label: string }[] = [
    { key: 'products', label: 'Productos' },
    { key: 'brands', label: 'Marcas' },
    { key: 'categories', label: 'Categorias' },
    { key: 'presentations', label: 'Presentaciones' },
    { key: 'colors', label: 'Colores' },
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
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Productos</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestiona tu catalogo de productos, marcas y categorias
                </h2>

                {/* Buscador y filtros */}
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input-plain flex-1"
                      placeholder={searchPlaceholder}
                      value={searchTerm}
                      onChange={e => setSearchTerm(e.target.value)}
                    />
                  </div>
                  {activeSection === 'products' && (
                    <div className="flex flex-wrap gap-3">
                      <select
                        className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      >
                        <option value="all" className="text-lead-900">Todas las categorias</option>
                        {categories.filter(c => c.state).map(c => (
                          <option key={c.id} value={c.id} className="text-lead-900">{c.name}</option>
                        ))}
                      </select>
                      <select
                        className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                        value={brandFilter}
                        onChange={(e) => setBrandFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      >
                        <option value="all" className="text-lead-900">Todas las marcas</option>
                        {brands.filter(b => b.state).map(b => (
                          <option key={b.id} value={b.id} className="text-lead-900">{b.name}</option>
                        ))}
                      </select>
                    </div>
                  )}
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
                className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${activeSection === key
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
            {activeSection === 'products' && (
              <ProductsSection
                searchTerm={searchTerm}
                categoryFilter={categoryFilter}
                brandFilter={brandFilter}
                onToast={handleToast}
              />
            )}

            {activeSection === 'brands' && (
              <BrandsSection
                searchTerm={searchTerm}
                onToast={handleToast}
              />
            )}

            {activeSection === 'categories' && (
              <CategoriesSection
                searchTerm={searchTerm}
                onToast={handleToast}
              />
            )}

            {activeSection === 'presentations' && (
              <PresentationsSection
                searchTerm={searchTerm}
                onToast={handleToast}
              />
            )}

            {activeSection === 'colors' && (
              <ColorsSection
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
