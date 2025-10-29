export interface Exoplanet {
  pl_name: string;           // Planet Name
  hostname: string;          // Host Name
  discoverymethod: string;   // Discovery Method
  disc_year: number;         // Discovery Year
  disc_facility: string;     // Discovery Facility
  pl_orbper?: number;        // Orbital Period (days)
  pl_rade?: number;          // Planet Radius (Earth Radius)
  pl_masse?: number;         // Planet Mass (Earth Mass)
  sy_dist?: number;          // Distance (parsecs)
}

export interface QueryFilters {
  year?: number;
  method?: string;
  hostname?: string;
  facility?: string;
}

export interface QueryOptions {
  years: number[];
  methods: string[];
  hostnames: string[];
  facilities: string[];
}
