

export const PRICE_TYPES: Array<{ id: number; label: string }> = [
  { id: 1, label: 'Regular' },
  { id: 2, label: 'Minorista' },
  { id: 3, label: 'Mayorista' },
];

export function getPriceTypeLabel(id?: number): string {
  if (!id) return 'Desconocido';
  const found = PRICE_TYPES.find(c => c.id === id);
  return found ? found.label : `Tipo ${id}`;
}

export function getPriceByPriceType(
  prices: Array<{ priceTypeId: number; price: number }> | undefined,
  priceTypeId: number
): number | null {
  if (!prices || prices.length === 0) return null;
  const priceInfo = prices.find(p => p.priceTypeId === priceTypeId);
  return priceInfo ? priceInfo.price : null;
}

export function getSuggestedPriceForPriceType(
  prices: Array<{ priceTypeId: number; price: number }> | undefined,
  priceTypeId: number
): number {
  const price = getPriceByPriceType(prices, priceTypeId);
  if (price !== null) return price;
  
  const regular = getPriceByPriceType(prices, 1);
  if (regular !== null) return regular;
  
  if (prices && prices.length > 0) return prices[0].price;
  
  return 0;
}
