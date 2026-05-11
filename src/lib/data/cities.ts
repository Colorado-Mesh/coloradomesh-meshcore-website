import { UPSTREAM_UTILITIES_REGIONS } from '@/lib/upstream-utilities';

export interface City {
  code: string;
  name: string;
}

export const cities: City[] = UPSTREAM_UTILITIES_REGIONS.cities
  .map((city) => ({
    code: city.codes.five,
    name: city.name,
  }))
  .filter((city) => /^[A-Z]{1,5}$/.test(city.code))
  .sort((a, b) => a.name.localeCompare(b.name));
