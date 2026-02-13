import React, { useEffect, useState } from 'react';
import { Product, ProductPrice } from '../../../domain/entities/Product';
import { Category } from '../../../domain/entities/Category';
import { Brand } from '../../../domain/entities/Brand';
import { Presentation } from '../../../domain/entities/Presentation';
import { Color } from '../../../domain/entities/Color';

export interface ProductFormValues {
  name: string;
  barcode: string | null;
  internalCode: string | null;
  presentationId: number | null;
  colorId: number | null;
  prices: ProductPrice[];
  categoryId: number;
  brandId: number;
  imageFile?: File | null;
}

interface ProductFormModalProps {
  open: boolean;
  mode: 'create' | 'edit';
  initialData: Product | null;
  categories: Category[];
  brands: Brand[];
  presentations: Presentation[];
  colors: Color[];
  submitting: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({
  open,
  mode,
  initialData,
  categories,
  brands,
  presentations,
  colors,
  submitting,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('');
  const [barcode, setBarcode] = useState('');
  const [internalCode, setInternalCode] = useState('');
  const [presentationId, setPresentationId] = useState<number>(0);
  const [colorId, setColorId] = useState<number>(0);
  const [categoryId, setCategoryId] = useState<number>(0);
  const [brandId, setBrandId] = useState<number>(0);
  const [priceMayorista, setPriceMayorista] = useState('');
  const [priceMinorista, setPriceMinorista] = useState('');
  const [priceRegular, setPriceRegular] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); 
  const [selectedPrices, setSelectedPrices] = useState<string[]>([]);
  const [valuesPrices, setValuesPrices] = useState<Record<string, string>>({});

  const priceTypes = [
    { value: "minorista", label: "Precio Minorista" },
    { value: "mayorista", label: "Precio Mayorista" },
    { value: "regular", label: "Precio Regular" },
    { value: "institucional", label: "Precio Institucional" },
  ];
  const priceTypeIdMap: Record<string, number> = {
    regular: 1,
    minorista: 2,
    mayorista: 3,
    institucional: 4,
  };
  type TipoPrecio =
    | "regular"
    | "minorista"
    | "mayorista"
    | "institucional";



  useEffect(() => {
    if (open) {
      console.log(initialData)
      if (mode === 'edit' && initialData) {
        setName(initialData.name || '');
        setBarcode(initialData.barcode || '');
        setInternalCode(initialData.internalCode || '');
        setPresentationId(initialData.presentationId || 0);
        setColorId(initialData.colorId || 0);
        setCategoryId(initialData.categoryId || 0);
        setBrandId(initialData.brandId || 0);
        if (initialData.prices && initialData.prices.length > 0) {
          const selected: TipoPrecio[] = [];
          const values = {} as Record<TipoPrecio, string>;
          initialData.prices.forEach((p) => {
            const typeKey = p.priceTypeName as TipoPrecio;
            selected.push(typeKey);
            values[typeKey] = String(p.price);
          });
        setSelectedPrices(selected);
        setValuesPrices(values);
      }

        setImageFile(null);
        setPreviewUrl(null);
      } else {
        setName('');
        setBarcode('');
        setInternalCode('');
        setPresentationId(0);
        setColorId(0);
        setCategoryId(categories.length > 0 ? categories[0].id : 0);
        setBrandId(brands.length > 0 ? brands[0].id : 0);
        setSelectedPrices([]);
        setValuesPrices({} as Record<TipoPrecio, string>);
        setImageFile(null);
        setPreviewUrl(null);
      }
      setErrors({});
    }
  }, [open, mode, initialData, categories, brands]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!name.trim()) newErrors.name = 'El nombre es requerido';
    if (!categoryId) newErrors.categoryId = 'La categoría es requerida';
    if (!brandId) newErrors.brandId = 'La marca es requerida';
    const hasValidPrice = selectedPrices.some((type) => {
      const value = valuesPrices[type];
      return value && !isNaN(parseFloat(value)) && parseFloat(value) > 0;
    });

    if (!hasValidPrice) {
      newErrors.prices = 'Al menos un precio es requerido';
    }


    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  function formatInputTwoDecimals(raw: string): string {
    if (!raw) return '';
    let v = raw.replace(',', '.');
    v = v.replace(/[^0-9.]/g, '');
    const parts = v.split('.');
    if (parts.length === 1) return parts[0];
    const intPart = parts.shift() || '';
    const dec = parts.join('');
    const decPart = dec.slice(0, 2); 
    return intPart + '.' + decPart;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const prices: ProductPrice[] = selectedPrices
      .map((type) => {
        const rawValue = valuesPrices[type];
        if (!rawValue) return null;
        const parsed = parseFloat(rawValue);
        if (isNaN(parsed)) return null;
        return {
          priceTypeId: priceTypeIdMap[type],
          price: Math.round(parsed * 100) / 100,
        };
      })
      .filter((p): p is ProductPrice => p !== null);

    onSubmit({
      name: name.trim(),
      barcode: barcode.trim() || null,
      internalCode: internalCode.trim() || null,
      presentationId: presentationId || null,
      colorId: colorId || null,
      prices,
      imageFile: imageFile || undefined,
      categoryId,
      brandId,
    });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const handleSelectPriceType = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = e.target.value;
    if (!value) return;

    setSelectedPrices([...selectedPrices, value]);
    setValuesPrices({ ...valuesPrices, [value]: "" });

    e.target.value = ""; // resetear select
  };

  const handlePriceTypeChange = 
    (type: string) => 
    (e: React.ChangeEvent<HTMLInputElement>) => {
    setValuesPrices({
      ...valuesPrices,
      [type]: e.target.value,
    });
    console.log(valuesPrices)
  };


  const handlePriceChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatInputTwoDecimals(e.target.value);
    setter(formatted);
  };

  const availablePriceOptions = priceTypes.filter(
    (type) => !selectedPrices.includes(type.value)
  );

  // Filtrar solo elementos activos para los selects
  const activePresentations = presentations.filter(p => p.state);
  const activeColors = colors.filter(c => c.state);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-lead-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="mx-4 my-10 w-full max-w-2xl overflow-hidden rounded-xl bg-lead-50 shadow-2xl ring-1 ring-black/5">
        <div className="flex items-center justify-between bg-brand-600 px-6 py-4 text-white">
          <h3 className="text-lg font-semibold tracking-wide">
            {mode === 'create' ? 'Nuevo Producto' : 'Editar Producto'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-brand-100 hover:text-white hover:bg-brand-700 transition-colors"
            disabled={submitting}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 px-6 py-6 max-h-[70vh] overflow-y-auto">
          {/* Nombre */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-lead-700">
              Nombre del Producto *
            </label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                errors.name ? 'border-red-500' : 'border-lead-300 bg-white'
              }`}
              placeholder="Cable HDMI 2m"
              disabled={submitting}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Categoría y Marca */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="categoryId" className="block text-sm font-medium text-lead-700">
                Categoría *
              </label>
              <select
                id="categoryId"
                value={categoryId}
                onChange={(e) => setCategoryId(Number(e.target.value))}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                  errors.categoryId ? 'border-red-500' : 'border-lead-300 bg-white'
                }`}
                disabled={submitting}
              >
                <option value={0}>Seleccione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
              {errors.categoryId && <p className="mt-1 text-sm text-red-600">{errors.categoryId}</p>}
            </div>
            <div>
              <label htmlFor="brandId" className="block text-sm font-medium text-lead-700">
                Marca *
              </label>
              <select
                id="brandId"
                value={brandId}
                onChange={(e) => setBrandId(Number(e.target.value))}
                className={`mt-1 block w-full rounded-lg border px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500 ${
                  errors.brandId ? 'border-red-500' : 'border-lead-300 bg-white'
                }`}
                disabled={submitting}
              >
                <option value={0}>Seleccione...</option>
                {brands.map(brand => (
                  <option key={brand.id} value={brand.id}>{brand.name}</option>
                ))}
              </select>
              {errors.brandId && <p className="mt-1 text-sm text-red-600">{errors.brandId}</p>}
            </div>
          </div>

          {/* Códigos */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="barcode" className="block text-sm font-medium text-lead-700">
                Código de Barras
              </label>
              <input
                type="text"
                id="barcode"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                placeholder="123456789012"
                disabled={submitting}
              />
            </div>
            <div>
              <label htmlFor="internalCode" className="block text-sm font-medium text-lead-700">
                Código Interno
              </label>
              <input
                type="text"
                id="internalCode"
                value={internalCode}
                onChange={(e) => setInternalCode(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                placeholder="CAB-HDMI-2M"
                disabled={submitting}
              />
            </div>
          </div>

          {/* Presentación y Color (selects) */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="presentationId" className="block text-sm font-medium text-lead-700">
                Presentación
              </label>
              <select
                id="presentationId"
                value={presentationId}
                onChange={(e) => setPresentationId(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                disabled={submitting}
              >
                <option value={0}>Sin presentación</option>
                {activePresentations.map(pres => (
                  <option key={pres.id} value={pres.id}>{pres.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="colorId" className="block text-sm font-medium text-lead-700">
                Color
              </label>
              <select
                id="colorId"
                value={colorId}
                onChange={(e) => setColorId(Number(e.target.value))}
                className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                disabled={submitting}
              >
                <option value={0}>Sin color</option>
                {activeColors.map(color => (
                  <option key={color.id} value={color.id}>{color.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Precios */}
          <div>
            <div className='flex gap-10 items-center mb-2'>
              <label className="block text-sm font-medium text-lead-700">
                Precios de Venta *
              </label>
              <select
                onChange={handleSelectPriceType}
                className="mt-2 block rounded-lg border border-lead-300
                          px-3 py-2 text-sm
                          focus:outline-none focus:ring-1 focus:ring-brand-500"
              >
                <option key="">Añadir precio</option>
                {availablePriceOptions.map((tipo) => (
                  <option key={tipo.value} value={tipo.value}>
                    {tipo.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Inputs dinámicos */}
            {selectedPrices.map((type) => {
              const label = priceTypes.find(t => t.value === type)?.label;

              return (
                <div key={type}>
                  <label className="block text-xs text-lead-500">
                    {label} (Bs.)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    value={valuesPrices[type] || ""}
                    onChange={handlePriceTypeChange(type)}
                    className="mt-1 block w-full rounded-lg border border-lead-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-brand-500 focus:ring-brand-500"
                    placeholder="0.00"
                    pattern="^\d*(\.\d{0,2})?$"
                    min={0}
                    disabled={submitting}
                  />
                </div>
              );
            })}
            {errors.prices && <p className="mt-1 text-sm text-red-600">{errors.prices}</p>}
          </div>

          <div>
            <label htmlFor="image" className="block text-sm font-medium text-lead-700">Imagen (archivo)</label>
            <input
              type="file"
              id="image"
              accept="image/*"
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-lead-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-semibold
                file:bg-brand-50 file:text-brand-700
                hover:file:bg-brand-100
                file:transition-colors duration-200"
              disabled={submitting}
            />
            {imageFile && (
              <p className="mt-1 text-xs text-lead-600">Archivo seleccionado: {imageFile.name}</p>
            )}
            {previewUrl && (
              <img src={previewUrl} alt="preview" className="mt-2 max-h-40 object-contain" />
            )}
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-lead-100">
            <button
              type="button"
              className="rounded bg-white px-4 py-2 text-sm font-medium text-lead-700 border border-lead-300 hover:bg-lead-100 transition-colors"
              onClick={onClose}
              disabled={submitting}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="rounded bg-accent-500 px-4 py-2 text-sm font-medium text-white shadow-md hover:bg-accent-600 focus:outline-none focus:ring-2 focus:ring-accent-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              disabled={submitting}
            >
              {submitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
