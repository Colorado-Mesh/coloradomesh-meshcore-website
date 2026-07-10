import {UPSTREAM_UTILITIES_AIRPORTS} from '@/lib/upstream-utilities';

export interface MeshCoreRegion {
  code: string;
  label: string;
}

export const COLORADO_MESH_REGIONS: MeshCoreRegion[] = UPSTREAM_UTILITIES_AIRPORTS
  .map((airport) => ({
    code: airport.iata_code.toLowerCase(),
    label: airport.name,
  }))
  .sort((a, b) => a.code.localeCompare(b.code));

export const COLORADO_MESH_REGION_CODES = COLORADO_MESH_REGIONS.map(
  (region) => region.code,
);

export function isColoradoMeshRegionCode(value: string): boolean {
  return COLORADO_MESH_REGION_CODES.includes(value.toLowerCase());
}
