import { airports } from '@/lib/data/airports';

export interface MeshCoreRegion {
  code: string;
  label: string;
}

export const COLORADO_MESH_REGIONS: MeshCoreRegion[] = airports
  .map((airport) => ({
    code: airport.code.toLowerCase(),
    label: airport.airport,
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

export const COLORADO_MESH_REGION_CODES = COLORADO_MESH_REGIONS.map(
  (region) => region.code,
);

export function isColoradoMeshRegionCode(value: string): boolean {
  return COLORADO_MESH_REGION_CODES.includes(value.toLowerCase());
}
