export interface Airport {
  code: string;
  city: string;
  airport: string;
  lat: number;
  lng: number;
}

/**
 * 14 Colorado IATA airports with coordinates for distance calculations.
 * Used by the NamingWizard region selector and auto-lookup.
 */
export const airports: Airport[] = [
  { code: "ALS", city: "Alamosa", airport: "San Luis Valley Regional", lat: 37.435, lng: -105.8127 },
  { code: "ASE", city: "Aspen", airport: "Aspen/Pitkin County", lat: 39.2232, lng: -106.8689 },
  { code: "CEZ", city: "Cortez", airport: "Cortez Municipal", lat: 37.303, lng: -108.6281 },
  { code: "COS", city: "Colorado Springs", airport: "Colorado Springs Municipal", lat: 38.806, lng: -104.7007 },
  { code: "DEN", city: "Denver", airport: "Denver International", lat: 39.8561, lng: -104.6737 },
  { code: "DRO", city: "Durango", airport: "Durango\u2013La Plata County", lat: 37.1515, lng: -107.7538 },
  { code: "EGE", city: "Eagle/Vail", airport: "Eagle County Regional", lat: 39.6426, lng: -106.9159 },
  { code: "FNL", city: "Fort Collins/Loveland", airport: "Northern Colorado Regional", lat: 40.4518, lng: -105.0113 },
  { code: "GJT", city: "Grand Junction", airport: "Grand Junction Regional", lat: 39.1224, lng: -108.527 },
  { code: "GUC", city: "Gunnison", airport: "Gunnison\u2013Crested Butte Regional", lat: 38.5339, lng: -106.9332 },
  { code: "HDN", city: "Hayden/Steamboat", airport: "Yampa Valley", lat: 40.4813, lng: -107.2177 },
  { code: "MTJ", city: "Montrose", airport: "Montrose Regional", lat: 38.5098, lng: -107.8938 },
  { code: "PUB", city: "Pueblo", airport: "Pueblo Memorial", lat: 38.289, lng: -104.4967 },
  { code: "TEX", city: "Telluride", airport: "Telluride Regional", lat: 37.9538, lng: -107.9085 },
];
