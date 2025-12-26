export interface Area {
  id: number;
  name: string;
  description?: string;
  status: boolean;
}

export type AreaMap = Record<number, string>;

export const createAreaMap = (areas: Area[]): AreaMap => {
  return areas.reduce((acc, area) => {
    acc[area.id] = area.name;
    return acc;
  }, {} as AreaMap);
};

export const getAreaName = (areaMap: AreaMap, areaId: number | null | undefined): string => {
  if (areaId == null) return 'Sin área';
  return areaMap[areaId] || `Área #${areaId}`;
};
