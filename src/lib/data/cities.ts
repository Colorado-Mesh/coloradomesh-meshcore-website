import { UPSTREAM_UTILITIES_ALL_CITIES } from '@/lib/upstream-utilities';

export interface City {
  code: string;
  name: string;
}

export const cities: City[] = UPSTREAM_UTILITIES_ALL_CITIES
  .map((city) => ({
    code: city.abbreviations.five_letter,
    name: city.name,
  }))
  .filter((city) => /^[A-Z]{1,5}$/.test(city.code))
  .sort((a, b) => a.name.localeCompare(b.name));
