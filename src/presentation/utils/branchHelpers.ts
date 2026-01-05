/**
 * Branch Helpers - Presentation Layer
 * Funciones de utilidad para sucursales en la UI
 */
import type { Branch } from '../../domain/entities/Branch';

/**
 * Tipo para el mapa de sucursales (Patrón Diccionario)
 * Permite acceso O(1) al nombre de sucursal por ID
 */
export type BranchMap = Map<number, string>;

/**
 * Helper para crear un mapa de branches
 */
export function createBranchMap(branches: Branch[]): BranchMap {
  return new Map(branches.map(branch => [branch.id, branch.name]));
}

/**
 * Helper para obtener nombre de branch con fallback
 */
export function getBranchName(branchMap: BranchMap, branchId: number | null | undefined): string {
  if (branchId == null) return 'Sin sucursal';
  return branchMap.get(branchId) ?? `Sucursal #${branchId}`;
}
