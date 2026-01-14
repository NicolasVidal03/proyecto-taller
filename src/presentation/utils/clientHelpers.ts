/**
 * Client Helpers - Presentation Layer
 * Constantes y opciones para clientes en la UI
 */
import type { ClientType, BusinessType } from '../../domain/entities/Client';

export const CLIENT_TYPES: Array<{ value: ClientType; label: string }> = [
  { value: 'Mayorista', label: 'Mayorista' },
  { value: 'Minorista', label: 'Minorista' },
  { value: 'Regular', label: 'Regular' },
  { value: 'Otro', label: 'Otro' },
];

export const BUSINESS_TYPES: Array<{ value: BusinessType; label: string }> = [
  { value: 'Ferreteria', label: 'Ferretería' },
  { value: 'Tienda', label: 'Tienda' },
  { value: 'Institucion', label: 'Institución' },
  { value: 'Otro', label: 'Otro' },
];
