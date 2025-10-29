import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Exoplanet, QueryFilters, QueryOptions } from '../models/exoplanet.model';

@Injectable({
  providedIn: 'root'
})
export class ExoplanetService {
  private exoplanets: Exoplanet[] = [];
  private queryOptions: QueryOptions = {
    years: [],
    methods: [],
    hostnames: [],
    facilities: []
  };

  // Use Maps for efficient O(1) lookups
  private yearIndex: Map<number, Exoplanet[]> = new Map();
  private methodIndex: Map<string, Exoplanet[]> = new Map();
  private hostnameIndex: Map<string, Exoplanet[]> = new Map();
  private facilityIndex: Map<string, Exoplanet[]> = new Map();

  private dataLoaded$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.loadData();
  }

  private async loadData(): Promise<void> {
    try {
      console.log('ExoplanetService: Starting to load CSV data...');
      const response = await fetch('assets/data/exoplanets.csv');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const csvText = await response.text();
      console.log('ExoplanetService: CSV loaded, size:', csvText.length, 'characters');

      this.parseCSV(csvText);
      this.buildIndices();
      this.dataLoaded$.next(true);
    } catch (error) {
      console.error('Error loading exoplanet data:', error);
      this.dataLoaded$.next(true); // Still emit to unblock UI
    }
  }

  private parseCSV(csvText: string): void {
    const lines = csvText.split('\n');

    // Find the header line (skip comment lines starting with #)
    let headerIndex = -1;
    let headers: string[] = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      // First non-comment line is the header
      headers = line.split(',').map(h => h.trim());
      headerIndex = i;
      break;
    }

    if (headerIndex === -1 || headers.length === 0) {
      console.error('Could not find header line in CSV');
      return;
    }

    // Get column indices
    const colIndices = {
      pl_name: headers.indexOf('pl_name'),
      hostname: headers.indexOf('hostname'),
      discoverymethod: headers.indexOf('discoverymethod'),
      disc_year: headers.indexOf('disc_year'),
      disc_facility: headers.indexOf('disc_facility'),
      pl_orbper: headers.indexOf('pl_orbper'),
      pl_rade: headers.indexOf('pl_rade'),
      pl_bmasse: headers.indexOf('pl_bmasse'),
      sy_dist: headers.indexOf('sy_dist')
    };

    // Parse data rows
    for (let i = headerIndex + 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line || line.startsWith('#')) continue;

      const values = this.parseCSVLine(line);
      if (values.length < 10) continue; // Skip incomplete rows

      const exoplanet: Exoplanet = {
        pl_name: values[colIndices.pl_name] || '',
        hostname: values[colIndices.hostname] || '',
        discoverymethod: values[colIndices.discoverymethod] || '',
        disc_year: parseInt(values[colIndices.disc_year]) || 0,
        disc_facility: values[colIndices.disc_facility] || '',
        pl_orbper: this.parseFloat(values[colIndices.pl_orbper]),
        pl_rade: this.parseFloat(values[colIndices.pl_rade]),
        pl_masse: this.parseFloat(values[colIndices.pl_bmasse]),
        sy_dist: this.parseFloat(values[colIndices.sy_dist])
      };

      // Only add planets with required fields
      if (exoplanet.hostname && exoplanet.disc_year && exoplanet.discoverymethod && exoplanet.disc_facility) {
        this.exoplanets.push(exoplanet);
      }
    }

    console.log(`Loaded ${this.exoplanets.length} exoplanets`);
  }

  private parseFloat(value: string): number | undefined {
    if (!value || value.trim() === '') return undefined;
    const num = parseFloat(value);
    return isNaN(num) ? undefined : num;
  }

  private parseCSVLine(line: string): string[] {
    const values: string[] = [];
    let currentValue = '';
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];

      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());

    return values;
  }

  private buildIndices(): void {
    const yearSet = new Set<number>();
    const methodSet = new Set<string>();
    const hostnameSet = new Set<string>();
    const facilitySet = new Set<string>();

    for (const planet of this.exoplanets) {
      // Build year index
      if (planet.disc_year) {
        yearSet.add(planet.disc_year);
        if (!this.yearIndex.has(planet.disc_year)) {
          this.yearIndex.set(planet.disc_year, []);
        }
        this.yearIndex.get(planet.disc_year)!.push(planet);
      }

      // Build method index
      if (planet.discoverymethod) {
        methodSet.add(planet.discoverymethod);
        if (!this.methodIndex.has(planet.discoverymethod)) {
          this.methodIndex.set(planet.discoverymethod, []);
        }
        this.methodIndex.get(planet.discoverymethod)!.push(planet);
      }

      // Build hostname index
      if (planet.hostname) {
        hostnameSet.add(planet.hostname);
        if (!this.hostnameIndex.has(planet.hostname)) {
          this.hostnameIndex.set(planet.hostname, []);
        }
        this.hostnameIndex.get(planet.hostname)!.push(planet);
      }

      // Build facility index
      if (planet.disc_facility) {
        facilitySet.add(planet.disc_facility);
        if (!this.facilityIndex.has(planet.disc_facility)) {
          this.facilityIndex.set(planet.disc_facility, []);
        }
        this.facilityIndex.get(planet.disc_facility)!.push(planet);
      }
    }

    this.queryOptions.years = Array.from(yearSet).sort((a, b) => b - a);
    this.queryOptions.methods = Array.from(methodSet).sort();
    this.queryOptions.hostnames = Array.from(hostnameSet).sort();
    this.queryOptions.facilities = Array.from(facilitySet).sort();
  }

  getQueryOptions(): QueryOptions {
    return this.queryOptions;
  }

  isDataLoaded(): Observable<boolean> {
    return this.dataLoaded$.asObservable();
  }

  search(filters: QueryFilters): Exoplanet[] {
    console.log('ExoplanetService: search called with filters:', filters);

    let results: Exoplanet[] = [];

    // Start with the most restrictive filter
    const filterCount = Object.keys(filters).filter(key => filters[key as keyof QueryFilters] !== undefined).length;

    console.log('ExoplanetService: Number of filters applied:', filterCount);

    if (filterCount === 0) {
      console.log('ExoplanetService: No filters applied, returning empty array');
      return [];
    }

    // Use the first filter to get initial set
    if (filters.year !== undefined) {
      results = this.yearIndex.get(filters.year) || [];
      console.log(`ExoplanetService: Year filter (${filters.year}) found ${results.length} planets`);
    } else if (filters.method !== undefined) {
      results = this.methodIndex.get(filters.method) || [];
      console.log(`ExoplanetService: Method filter (${filters.method}) found ${results.length} planets`);
    } else if (filters.hostname !== undefined) {
      results = this.hostnameIndex.get(filters.hostname) || [];
      console.log(`ExoplanetService: Hostname filter (${filters.hostname}) found ${results.length} planets`);
    } else if (filters.facility !== undefined) {
      results = this.facilityIndex.get(filters.facility) || [];
      console.log(`ExoplanetService: Facility filter (${filters.facility}) found ${results.length} planets`);
    }

    // Apply remaining filters
    if (filters.year !== undefined && results.length > 0) {
      const beforeFilter = results.length;
      results = results.filter(p => p.disc_year === filters.year);
      console.log(`ExoplanetService: Year filter reduced from ${beforeFilter} to ${results.length}`);
    }
    if (filters.method !== undefined && results.length > 0) {
      const beforeFilter = results.length;
      results = results.filter(p => p.discoverymethod === filters.method);
      console.log(`ExoplanetService: Method filter reduced from ${beforeFilter} to ${results.length}`);
    }
    if (filters.hostname !== undefined && results.length > 0) {
      const beforeFilter = results.length;
      results = results.filter(p => p.hostname === filters.hostname);
      console.log(`ExoplanetService: Hostname filter reduced from ${beforeFilter} to ${results.length}`);
    }
    if (filters.facility !== undefined && results.length > 0) {
      const beforeFilter = results.length;
      results = results.filter(p => p.disc_facility === filters.facility);
      console.log(`ExoplanetService: Facility filter reduced from ${beforeFilter} to ${results.length}`);
    }

    console.log(`ExoplanetService: Final results: ${results.length} planets`);
    return results;
  }
}
