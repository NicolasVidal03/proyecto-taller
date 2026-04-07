import { getPriceByPriceType, getPriceTypeLabel, getSuggestedPriceForPriceType } from "@presentation/utils";

describe('getPriceTypeLabel', () => {
  it.each([
    [1, 'Regular'],
    [2, 'Minorista'],
    [3, 'Mayorista'],
  ])('id=%i → "%s"', (id, label) => {
    expect(getPriceTypeLabel(id)).toBe(label);
  });
  it('retorna "Desconocido" para undefined', () => {
    expect(getPriceTypeLabel(undefined)).toBe('Desconocido');
  });
  it('retorna fallback "Tipo N" para ids desconocidos', () => {
    expect(getPriceTypeLabel(99)).toBe('Tipo 99');
  });
});

describe('getPriceByPriceType', () => {
  const prices = [{ priceTypeId: 1, price: 10 }, { priceTypeId: 2, price: 8 }];

  it('retorna el precio para el tipo correcto', () => {
    expect(getPriceByPriceType(prices, 1)).toBe(10);
    expect(getPriceByPriceType(prices, 2)).toBe(8);
  });
  it('retorna null si el tipo no existe', () => {
    expect(getPriceByPriceType(prices, 99)).toBeNull();
  });
  it('retorna null para array vacío', () => {
    expect(getPriceByPriceType([], 1)).toBeNull();
  });
  it('retorna null para undefined', () => {
    expect(getPriceByPriceType(undefined, 1)).toBeNull();
  });
});

describe('getSuggestedPriceForPriceType', () => {
  const prices = [{ priceTypeId: 1, price: 10 }, { priceTypeId: 2, price: 8 }];

  it('retorna el precio exacto si existe', () => {
    expect(getSuggestedPriceForPriceType(prices, 2)).toBe(8);
  });
  it('cae al precio Regular (id=1) si el tipo no existe', () => {
    expect(getSuggestedPriceForPriceType(prices, 3)).toBe(10);
  });
  it('cae al primer precio si no hay Regular', () => {
    expect(getSuggestedPriceForPriceType([{ priceTypeId: 5, price: 99 }], 3)).toBe(99);
  });
  it('retorna 0 para array vacío', () => {
    expect(getSuggestedPriceForPriceType([], 1)).toBe(0);
  });
  it('retorna 0 para undefined', () => {
    expect(getSuggestedPriceForPriceType(undefined, 1)).toBe(0);
  });
});