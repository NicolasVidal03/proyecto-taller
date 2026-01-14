
import type { Branch } from '../../domain/entities/Branch';


export type BranchMap = Map<number, string>;


export function createBranchMap(branches: Branch[]): BranchMap {
  return new Map(branches.map(branch => [branch.id, branch.name]));
}

export function getBranchName(branchMap: BranchMap, branchId: number | null | undefined): string {
  if (branchId == null) return 'Sin sucursal';
  return branchMap.get(branchId) ?? `${branchId}`;
}
