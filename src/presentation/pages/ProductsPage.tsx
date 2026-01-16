import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useCategories } from '../hooks/useCategories';
import { useBrands } from '../hooks/useBrands';
import { usePresentations } from '../hooks/usePresentations';
import { useColors } from '../hooks/useColors';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../providers/AuthProvider';
import { Product } from '../../domain/entities/Product';
import { Category } from '../../domain/entities/Category';
import { Brand } from '../../domain/entities/Brand';
import { Presentation } from '../../domain/entities/Presentation';
import { Color } from '../../domain/entities/Color';
import ProductsTable from '../components/products/ProductsTable';
import ProductFormModal, { ProductFormValues } from '../components/products/ProductFormModal';
import ProductDetailsModal from '../components/products/ProductDetailsModal';
import BrandsTable from '../components/brands/BrandsTable';
import BrandFormModal, { BrandFormValues } from '../components/brands/BrandFormModal';
import CategoriesTable from '../components/categories/CategoriesTable';
import CategoryFormModal, { CategoryFormValues } from '../components/categories/CategoryFormModal';
import PresentationsTable from '../components/presentations/PresentationsTable';
import PresentationFormModal, { PresentationFormValues } from '../components/presentations/PresentationFormModal';
import ColorsTable from '../components/colors/ColorsTable';
import ColorFormModal, { ColorFormValues } from '../components/colors/ColorFormModal';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import Loader from '../components/shared/Loader';
import Pagination from '../components/shared/Pagination';
import { ToastContainer, useToast } from '../components/shared/Toast';

type ActiveSection = 'products' | 'brands' | 'categories' | 'presentations' | 'colors';

export const ProductsPage: React.FC = () => {
  const {
    products,
    isLoading: productsLoading,
    error: productsError,
    page,
    total,
    totalPages,
    goToPage,
    applyFilters,
    createProduct,
    updateProduct,
    updateProductState,
    clearError: clearProductsError,
  } = useProducts();

  const {
    categories,
    categoryMap,
    isLoading: categoriesLoading,
    error: categoriesError,
    fetchCategories,
    createCategory,
    updateCategory,
    updateCategoryState,
    clearError: clearCategoriesError,
  } = useCategories();

  const {
    brands,
    brandMap,
    isLoading: brandsLoading,
    error: brandsError,
    fetchBrands,
    createBrand,
    updateBrand,
    updateBrandState,
    clearError: clearBrandsError,
  } = useBrands();

  const {
    presentations,
    presentationMap,
    isLoading: presentationsLoading,
    error: presentationsError,
    fetchPresentations,
    createPresentation,
    updatePresentation,
    updatePresentationState,
    clearError: clearPresentationsError,
  } = usePresentations();

  const {
    colors,
    colorMap,
    isLoading: colorsLoading,
    error: colorsError,
    fetchColors,
    createColor,
    updateColor,
    updateColorState,
    clearError: clearColorsError,
  } = useColors();

  const auth = useAuth();
  const toast = useToast();

  const [activeSection, setActiveSection] = useState<ActiveSection>('products');

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<number | 'all'>('all');
  const [brandFilter, setBrandFilter] = useState<number | 'all'>('all');
  
  const debouncedSearch = useDebounce(searchTerm, 500);

  const [productFormOpen, setProductFormOpen] = useState(false);
  const [productFormMode, setProductFormMode] = useState<'create' | 'edit'>('create');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productSubmitting, setProductSubmitting] = useState(false);
  const [productConfirmOpen, setProductConfirmOpen] = useState(false);
  const [productConfirmLoading, setProductConfirmLoading] = useState(false);
  const [targetProduct, setTargetProduct] = useState<Product | null>(null);
  const [busyProductId, setBusyProductId] = useState<number | null>(null);
  const [productDetailOpen, setProductDetailOpen] = useState(false);
  const [selectedProductForView, setSelectedProductForView] = useState<Product | null>(null);

  const [brandFormOpen, setBrandFormOpen] = useState(false);
  const [brandFormMode, setBrandFormMode] = useState<'create' | 'edit'>('create');
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandSubmitting, setBrandSubmitting] = useState(false);
  const [brandConfirmOpen, setBrandConfirmOpen] = useState(false);
  const [brandConfirmLoading, setBrandConfirmLoading] = useState(false);
  const [targetBrand, setTargetBrand] = useState<Brand | null>(null);
  const [busyBrandId, setBusyBrandId] = useState<number | null>(null);

  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [categoryFormMode, setCategoryFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categorySubmitting, setCategorySubmitting] = useState(false);
  const [categoryConfirmOpen, setCategoryConfirmOpen] = useState(false);
  const [categoryConfirmLoading, setCategoryConfirmLoading] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [busyCategoryId, setBusyCategoryId] = useState<number | null>(null);

  const [presentationFormOpen, setPresentationFormOpen] = useState(false);
  const [presentationFormMode, setPresentationFormMode] = useState<'create' | 'edit'>('create');
  const [editingPresentation, setEditingPresentation] = useState<Presentation | null>(null);
  const [presentationSubmitting, setPresentationSubmitting] = useState(false);
  const [presentationConfirmOpen, setPresentationConfirmOpen] = useState(false);
  const [presentationConfirmLoading, setPresentationConfirmLoading] = useState(false);
  const [targetPresentation, setTargetPresentation] = useState<Presentation | null>(null);
  const [busyPresentationId, setBusyPresentationId] = useState<number | null>(null);

  const [colorFormOpen, setColorFormOpen] = useState(false);
  const [colorFormMode, setColorFormMode] = useState<'create' | 'edit'>('create');
  const [editingColor, setEditingColor] = useState<Color | null>(null);
  const [colorSubmitting, setColorSubmitting] = useState(false);
  const [colorConfirmOpen, setColorConfirmOpen] = useState(false);
  const [colorConfirmLoading, setColorConfirmLoading] = useState(false);
  const [targetColor, setTargetColor] = useState<Color | null>(null);
  const [busyColorId, setBusyColorId] = useState<number | null>(null);

  
  const sortedBrands = useMemo(() => {
    return [...brands].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [brands]);

  const sortedCategories = useMemo(() => {
    return [...categories].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [categories]);

  const sortedPresentations = useMemo(() => {
    return [...presentations].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [presentations]);

  const sortedColors = useMemo(() => {
    return [...colors].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
  }, [colors]);

  const sortedProducts = useMemo(() => {
    const safeProducts = Array.isArray(products) ? products.filter(Boolean) : [];
    return [...safeProducts].sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
  }, [products]);

  const loadAuxiliaryData = useCallback(async () => {
    await Promise.all([fetchCategories(), fetchBrands(), fetchPresentations(), fetchColors()]);
  }, [fetchCategories, fetchBrands, fetchPresentations, fetchColors]);

  useEffect(() => {
    loadAuxiliaryData();
  }, [loadAuxiliaryData]);
  
  useEffect(() => {
    const filters: { search?: string; categoryId?: number; brandId?: number } = {};
    
    if (debouncedSearch.trim()) {
      filters.search = debouncedSearch.trim();
    }
    if (categoryFilter !== 'all') {
      filters.categoryId = categoryFilter;
    }
    if (brandFilter !== 'all') {
      filters.brandId = brandFilter;
    }
    applyFilters(filters);
  }, [debouncedSearch, categoryFilter, brandFilter, applyFilters]);

  useEffect(() => {
    if (productsError) {
      toast.error(productsError);
      clearProductsError();
    }
  }, [productsError, toast, clearProductsError]);

  useEffect(() => {
    if (categoriesError) {
      toast.error(`Error cargando categorías: ${categoriesError}`);
      clearCategoriesError();
    }
  }, [categoriesError, toast, clearCategoriesError]);

  useEffect(() => {
    if (brandsError) {
      toast.error(`Error cargando marcas: ${brandsError}`);
      clearBrandsError();
    }
  }, [brandsError, toast, clearBrandsError]);

  useEffect(() => {
    if (presentationsError) {
      toast.error(`Error cargando presentaciones: ${presentationsError}`);
      clearPresentationsError();
    }
  }, [presentationsError, toast, clearPresentationsError]);

  useEffect(() => {
    if (colorsError) {
      toast.error(`Error cargando colores: ${colorsError}`);
      clearColorsError();
    }
  }, [colorsError, toast, clearColorsError]);

  const stats = useMemo(() => {
    const totalProducts = total;
    const totalBrands = brands.length;
    const totalCategories = categories.length;
    const totalPresentations = presentations.length;
    const totalColors = colors.length;
    return {
      cards: [
        { label: 'Total Productos', value: totalProducts, accent: 'from-brand-900 to-brand-600' },
      ],
      breakdown: [
        { label: 'Marcas', value: totalBrands },
        { label: 'Categorías', value: totalCategories },
        { label: 'Presentaciones', value: totalPresentations },
        { label: 'Colores', value: totalColors },
      ],
    };
  }, [total, brands, categories, presentations, colors]);

  const openProductCreateModal = () => {
    setProductFormMode('create');
    setEditingProduct(null);
    setProductFormOpen(true);
  };

  const openProductEditModal = (product: Product) => {
    setProductFormMode('edit');
    setEditingProduct(product);
    setProductFormOpen(true);
  };

  const openProductView = (product: Product) => {
    setSelectedProductForView(product);
    setProductDetailOpen(true);
  };

  const closeProductView = () => {
    setSelectedProductForView(null);
    setProductDetailOpen(false);
  };

  const closeProductForm = () => {
    if (productSubmitting) return;
    setProductFormOpen(false);
    setEditingProduct(null);
  };

  const handleProductSubmit = async (values: ProductFormValues) => {
    if (!auth.user) return;
    setProductSubmitting(true);
    try {
      if (productFormMode === 'create') {
        const result = await createProduct({
          name: values.name,
          barcode: values.barcode,
          internalCode: values.internalCode,
          presentationId: values.presentationId,
          colorId: values.colorId,
          salePrice: values.salePrice,
          imageFile: (values as any).imageFile,
          categoryId: values.categoryId,
          brandId: values.brandId,
          userId: auth.user.id,
        });
        if (result) {
          toast.success('Producto creado correctamente');
          setProductFormOpen(false);
        }
      } else if (editingProduct) {
        const result = await updateProduct(editingProduct.id, {
          name: values.name,
          barcode: values.barcode,
          internalCode: values.internalCode,
          presentationId: values.presentationId,
          colorId: values.colorId,
          salePrice: values.salePrice,
          imageFile: (values as any).imageFile,
          categoryId: values.categoryId,
          brandId: values.brandId,
        });
        if (result) {
          toast.success('Producto actualizado correctamente');
          setProductFormOpen(false);
          setEditingProduct(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el producto';
      toast.error(message);
    } finally {
      setProductSubmitting(false);
    }
  };

  const openProductConfirm = (product: Product) => {
    setTargetProduct(product);
    setProductConfirmOpen(true);
  };

  const closeProductConfirm = () => {
    if (productConfirmLoading) return;
    setProductConfirmOpen(false);
    setTargetProduct(null);
  };

  const executeProductConfirm = async () => {
    if (!targetProduct || !auth.user) return;
    setProductConfirmLoading(true);
    setBusyProductId(targetProduct.id);
    try {
      const success = await updateProductState(targetProduct.id, auth.user.id);
      if (success) {
        toast.success(`Producto "${targetProduct.name}" eliminado correctamente`);
      }
      setProductConfirmOpen(false);
      setTargetProduct(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setProductConfirmLoading(false);
      setBusyProductId(null);
    }
  };

  const openBrandCreateModal = () => {
    setBrandFormMode('create');
    setEditingBrand(null);
    setBrandFormOpen(true);
  };

  const openBrandEditModal = (brand: Brand) => {
    setBrandFormMode('edit');
    setEditingBrand(brand);
    setBrandFormOpen(true);
  };

  const closeBrandForm = () => {
    if (brandSubmitting) return;
    setBrandFormOpen(false);
    setEditingBrand(null);
  };

  const handleBrandSubmit = async (values: BrandFormValues) => {
    if (!auth.user) return;
    setBrandSubmitting(true);
    try {
      if (brandFormMode === 'create') {
        const result = await createBrand({ name: values.name, userId: auth.user.id });
        if (result) {
          toast.success('Marca creada correctamente');
          setBrandFormOpen(false);
        }
      } else if (editingBrand) {
        const result = await updateBrand(editingBrand.id, { name: values.name });
        if (result) {
          toast.success('Marca actualizada correctamente');
          setBrandFormOpen(false);
          setEditingBrand(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la marca';
      toast.error(message);
    } finally {
      setBrandSubmitting(false);
    }
  };

  const openBrandConfirm = (brand: Brand) => {
    setTargetBrand(brand);
    setBrandConfirmOpen(true);
  };

  const closeBrandConfirm = () => {
    if (brandConfirmLoading) return;
    setBrandConfirmOpen(false);
    setTargetBrand(null);
  };

  const executeBrandConfirm = async () => {
    if (!targetBrand || !auth.user) return;
    setBrandConfirmLoading(true);
    setBusyBrandId(targetBrand.id);
    try {
      const success = await updateBrandState(targetBrand.id, auth.user.id);
      if (success) {
        toast.success(`Marca "${targetBrand.name}" eliminada correctamente`);
      }
      setBrandConfirmOpen(false);
      setTargetBrand(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setBrandConfirmLoading(false);
      setBusyBrandId(null);
    }
  };

  const openCategoryCreateModal = () => {
    setCategoryFormMode('create');
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const openCategoryEditModal = (category: Category) => {
    setCategoryFormMode('edit');
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const closeCategoryForm = () => {
    if (categorySubmitting) return;
    setCategoryFormOpen(false);
    setEditingCategory(null);
  };

  const handleCategorySubmit = async (values: CategoryFormValues) => {
    if (!auth.user) return;
    setCategorySubmitting(true);
    try {
      if (categoryFormMode === 'create') {
        const result = await createCategory({ 
          name: values.name, 
          description: values.description,
          userId: auth.user.id
        });
        if (result) {
          toast.success('Categoría creada correctamente');
          setCategoryFormOpen(false);
        }
      } else if (editingCategory) {
        const result = await updateCategory(editingCategory.id, { 
          name: values.name, 
          description: values.description,
          user_id: auth.user.id
        });
        if (result) {
          toast.success('Categoría actualizada correctamente');
          setCategoryFormOpen(false);
          setEditingCategory(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la categoría';
      toast.error(message);
    } finally {
      setCategorySubmitting(false);
    }
  };

  const openCategoryConfirm = (category: Category) => {
    setTargetCategory(category);
    setCategoryConfirmOpen(true);
  };

  const closeCategoryConfirm = () => {
    if (categoryConfirmLoading) return;
    setCategoryConfirmOpen(false);
    setTargetCategory(null);
  };

  const executeCategoryConfirm = async () => {
    if (!targetCategory || !auth.user) return;
    setCategoryConfirmLoading(true);
    setBusyCategoryId(targetCategory.id);
    try {
      const success = await updateCategoryState(targetCategory.id, auth.user.id);
      if (success) {
        toast.success(`Categoría "${targetCategory.name}" eliminada correctamente`);
      }
      setCategoryConfirmOpen(false);
      setTargetCategory(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setCategoryConfirmLoading(false);
      setBusyCategoryId(null);
    }
  };

  const openPresentationCreateModal = () => {
    setPresentationFormMode('create');
    setEditingPresentation(null);
    setPresentationFormOpen(true);
  };

  const openPresentationEditModal = (presentation: Presentation) => {
    setPresentationFormMode('edit');
    setEditingPresentation(presentation);
    setPresentationFormOpen(true);
  };

  const closePresentationForm = () => {
    if (presentationSubmitting) return;
    setPresentationFormOpen(false);
    setEditingPresentation(null);
  };

  const handlePresentationSubmit = async (values: PresentationFormValues) => {
    if (!auth.user) return;
    setPresentationSubmitting(true);
    try {
      if (presentationFormMode === 'create') {
        const result = await createPresentation({ 
          name: values.name, 
          userId: auth.user.id
        });
        if (result) {
          toast.success('Presentación creada correctamente');
          setPresentationFormOpen(false);
        }
      } else if (editingPresentation) {
        const result = await updatePresentation(editingPresentation.id, { 
          name: values.name, 
          user_id: auth.user.id
        });
        if (result) {
          toast.success('Presentación actualizada correctamente');
          setPresentationFormOpen(false);
          setEditingPresentation(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar la presentación';
      toast.error(message);
    } finally {
      setPresentationSubmitting(false);
    }
  };

  const openPresentationConfirm = (presentation: Presentation) => {
    setTargetPresentation(presentation);
    setPresentationConfirmOpen(true);
  };

  const closePresentationConfirm = () => {
    if (presentationConfirmLoading) return;
    setPresentationConfirmOpen(false);
    setTargetPresentation(null);
  };

  const executePresentationConfirm = async () => {
    if (!targetPresentation || !auth.user) return;
    setPresentationConfirmLoading(true);
    setBusyPresentationId(targetPresentation.id);
    try {
      const success = await updatePresentationState(targetPresentation.id, auth.user.id);
      if (success) {
        toast.success(`Presentación "${targetPresentation.name}" eliminada correctamente`);
      }
      setPresentationConfirmOpen(false);
      setTargetPresentation(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setPresentationConfirmLoading(false);
      setBusyPresentationId(null);
    }
  };

  const openColorCreateModal = () => {
    setColorFormMode('create');
    setEditingColor(null);
    setColorFormOpen(true);
  };

  const openColorEditModal = (color: Color) => {
    setColorFormMode('edit');
    setEditingColor(color);
    setColorFormOpen(true);
  };

  const closeColorForm = () => {
    if (colorSubmitting) return;
    setColorFormOpen(false);
    setEditingColor(null);
  };

  const handleColorSubmit = async (values: ColorFormValues) => {
    if (!auth.user) return;
    setColorSubmitting(true);
    try {
      if (colorFormMode === 'create') {
        const result = await createColor({ 
          name: values.name, 
          userId: auth.user.id
        });
        if (result) {
          toast.success('Color creado correctamente');
          setColorFormOpen(false);
        }
      } else if (editingColor) {
        const result = await updateColor(editingColor.id, { 
          name: values.name, 
          user_id: auth.user.id
        });
        if (result) {
          toast.success('Color actualizado correctamente');
          setColorFormOpen(false);
          setEditingColor(null);
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'No se pudo guardar el color';
      toast.error(message);
    } finally {
      setColorSubmitting(false);
    }
  };

  const openColorConfirm = (color: Color) => {
    setTargetColor(color);
    setColorConfirmOpen(true);
  };

  const closeColorConfirm = () => {
    if (colorConfirmLoading) return;
    setColorConfirmOpen(false);
    setTargetColor(null);
  };

  const executeColorConfirm = async () => {
    if (!targetColor || !auth.user) return;
    setColorConfirmLoading(true);
    setBusyColorId(targetColor.id);
    try {
      const success = await updateColorState(targetColor.id, auth.user.id);
      if (success) {
        toast.success(`Color "${targetColor.name}" eliminado correctamente`);
      }
      setColorConfirmOpen(false);
      setTargetColor(null);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Acción no completada';
      toast.error(message);
    } finally {
      setColorConfirmLoading(false);
      setBusyColorId(null);
    }
  };

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
                <p className="text-xs uppercase tracking-[0.45em] text-white/70">Panel de Productos</p>
                <h2 className="text-3xl font-semibold leading-tight md:text-4xl">
                  Gestiona tu catálogo de productos, marcas y categorías
                </h2>
                <div className="space-y-3 rounded-2xl bg-white/10 p-4 backdrop-blur border border-white/10">
                  <div className="flex flex-col gap-3 md:flex-row">
                    <input
                      className="input-plain flex-1"
                      placeholder="Buscar por nombre, código de barras o código interno"
                      value={searchTerm}
                      onChange={event => setSearchTerm(event.target.value)}
                    />
                  </div>
                  {activeSection === 'products' && (
                    <div className="flex flex-wrap gap-3">
                      <select
                        className="rounded-full px-4 py-2 text-sm font-semibold bg-white/10 text-white/90 border border-white/20 focus:outline-none"
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                      >
                        <option value="all" className="text-lead-900">Todas las categorías</option>
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
                    <p className="text-xs uppercase tracking-[0.35em] text-white/60">Catálogo</p>
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

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'products'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('products')}
            >
              Productos
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'brands'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('brands')}
            >
              Marcas
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'categories'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('categories')}
            >
              Categorías
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'presentations'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('presentations')}
            >
              Presentaciones
            </button>
            <button
              type="button"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition shadow ${
                activeSection === 'colors'
                  ? 'bg-white text-brand-700 ring-2 ring-brand-200'
                  : 'bg-white/70 text-lead-600 hover:bg-white'
              }`}
              onClick={() => setActiveSection('colors')}
            >
              Colores
            </button>
          </div>

          <section className="grid gap-8 xl:grid-cols-[1fr]">
            {activeSection === 'products' && (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de productos</h3>
                    <p className="text-sm text-lead-500">
                      {totalPages > 0 && `Página ${page} de ${totalPages} • `}
                      {total.toLocaleString()} producto(s) total
                      {(debouncedSearch || categoryFilter !== 'all' || brandFilter !== 'all') && ' (filtrados)'}
                    </p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2" 
                    onClick={openProductCreateModal}
                  >
                    Crear producto
                  </button>
                </div>
                {productsLoading && products.length === 0 ? (
                  <Loader />
                ) : (
                  <>
                    <ProductsTable
                      products={sortedProducts}
                      categoryMap={categoryMap}
                      brandMap={brandMap}
                      presentationMap={presentationMap}
                      colorMap={colorMap}
                      onEdit={openProductEditModal}
                      onDeactivate={openProductConfirm}
                      onView={openProductView}
                      busyId={busyProductId}
                    />
                    {totalPages > 0 && (
                      <div className="mt-6">
                        <Pagination
                          currentPage={page}
                          totalPages={totalPages}
                          totalItems={total}
                          itemsPerPage={10}
                          onPageChange={goToPage}
                          isLoading={productsLoading}
                        />
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {activeSection === 'brands' && (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de marcas</h3>
                    <p className="text-sm text-lead-500">{brands.length} marca(s) registradas.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
                    onClick={openBrandCreateModal}
                  >
                    Crear marca
                  </button>
                </div>
                {brandsLoading ? (
                  <Loader />
                ) : (
                  <BrandsTable
                    brands={sortedBrands}
                    onEdit={openBrandEditModal}
                    onDelete={openBrandConfirm}
                    busyBrandId={busyBrandId}
                  />
                )}
              </div>
            )}

            {activeSection === 'categories' && (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de categorías</h3>
                    <p className="text-sm text-lead-500">{categories.length} categoría(s) registradas.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
                    onClick={openCategoryCreateModal}
                  >
                    Crear categoría
                  </button>
                </div>
                {categoriesLoading ? (
                  <Loader />
                ) : (
                  <CategoriesTable
                    categories={sortedCategories}
                    onEdit={openCategoryEditModal}
                    onDeactivate={openCategoryConfirm}
                    busyId={busyCategoryId}
                  />
                )}
              </div>
            )}

            {activeSection === 'presentations' && (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de presentaciones</h3>
                    <p className="text-sm text-lead-500">{presentations.length} presentación(es) registradas.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
                    onClick={openPresentationCreateModal}
                  >
                    Crear presentación
                  </button>
                </div>
                {presentationsLoading ? (
                  <Loader />
                ) : (
                  <PresentationsTable
                    presentations={sortedPresentations}
                    onEdit={openPresentationEditModal}
                    onDeactivate={openPresentationConfirm}
                    busyId={busyPresentationId}
                  />
                )}
              </div>
            )}

            {activeSection === 'colors' && (
              <div className="card shadow-xl ring-1 ring-black/5">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-lead-100 pb-4">
                  <div>
                    <h3 className="text-xl font-bold text-brand-900">Listado de colores</h3>
                    <p className="text-sm text-lead-500">{colors.length} color(es) registrados.</p>
                  </div>
                  <button 
                    type="button" 
                    className="btn-primary bg-accent-500 hover:bg-accent-600 border-transparent text-white shadow-md flex items-center gap-2" 
                    onClick={openColorCreateModal}
                  >
                    Crear color
                  </button>
                </div>
                {colorsLoading ? (
                  <Loader />
                ) : (
                  <ColorsTable
                    colors={sortedColors}
                    onEdit={openColorEditModal}
                    onDeactivate={openColorConfirm}
                    busyId={busyColorId}
                  />
                )}
              </div>
            )}
          </section>
        </div>
      </div>

      <ProductFormModal
        open={productFormOpen}
        mode={productFormMode}
        initialData={editingProduct}
        categories={categories}
        brands={brands}
        presentations={presentations}
        colors={colors}
        submitting={productSubmitting}
        onClose={closeProductForm}
        onSubmit={handleProductSubmit}
      />

      {productDetailOpen && (
        <ProductDetailsModal 
          product={selectedProductForView} 
          presentationMap={presentationMap}
          colorMap={colorMap}
          onClose={closeProductView} 
        />
      )}

      <BrandFormModal
        open={brandFormOpen}
        mode={brandFormMode}
        initialData={editingBrand}
        submitting={brandSubmitting}
        onClose={closeBrandForm}
        onSubmit={handleBrandSubmit}
      />

      <CategoryFormModal
        open={categoryFormOpen}
        mode={categoryFormMode}
        initialData={editingCategory}
        submitting={categorySubmitting}
        onClose={closeCategoryForm}
        onSubmit={handleCategorySubmit}
      />

      <PresentationFormModal
        open={presentationFormOpen}
        mode={presentationFormMode}
        initialData={editingPresentation}
        submitting={presentationSubmitting}
        onClose={closePresentationForm}
        onSubmit={handlePresentationSubmit}
      />

      <ColorFormModal
        open={colorFormOpen}
        mode={colorFormMode}
        initialData={editingColor}
        submitting={colorSubmitting}
        onClose={closeColorForm}
        onSubmit={handleColorSubmit}
      />

      <ConfirmDialog
        open={productConfirmOpen}
        title="Eliminar producto"
        confirmLabel="Eliminar"
        onConfirm={executeProductConfirm}
        onCancel={closeProductConfirm}
        disabled={productConfirmLoading}
      />

      <ConfirmDialog
        open={brandConfirmOpen}
        title="Eliminar marca"
        confirmLabel="Eliminar"
        onConfirm={executeBrandConfirm}
        onCancel={closeBrandConfirm}
        disabled={brandConfirmLoading}
      />

      <ConfirmDialog
        open={categoryConfirmOpen}
        title="Eliminar categoría"
        confirmLabel="Eliminar"
        onConfirm={executeCategoryConfirm}
        onCancel={closeCategoryConfirm}
        disabled={categoryConfirmLoading}
      />

      <ConfirmDialog
        open={presentationConfirmOpen}
        title="Eliminar presentación"
        confirmLabel="Eliminar"
        onConfirm={executePresentationConfirm}
        onCancel={closePresentationConfirm}
        disabled={presentationConfirmLoading}
      />

      <ConfirmDialog
        open={colorConfirmOpen}
        title="Eliminar color"
        confirmLabel="Eliminar"
        onConfirm={executeColorConfirm}
        onCancel={closeColorConfirm}
        disabled={colorConfirmLoading}
      />

      <ToastContainer toasts={toast.toasts} onDismiss={toast.dismissToast} />
    </>
  );
};
