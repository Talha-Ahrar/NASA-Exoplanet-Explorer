import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Exoplanet } from '../../models/exoplanet.model';

type SortColumn = 'pl_name'|'hostname' | 'discoverymethod' | 'disc_year' | 'disc_facility' | 'pl_orbper' | 'pl_rade' | 'pl_masse' | 'sy_dist';
type SortDirection = 'asc' | 'desc' | null;

@Component({
  selector: 'app-results-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './results-table.component.html',
  styleUrl: './results-table.component.scss'
})
export class ResultsTableComponent {
  @Input() set results(value: Exoplanet[]) {
    this._results = value;
    this.sortedResults = [...value];
  }

  get results(): Exoplanet[] {
    return this._results;
  }

  private _results: Exoplanet[] = [];
  sortedResults: Exoplanet[] = [];
  sortColumn: SortColumn | null = null;
  sortDirection: SortDirection = null;

  getNASALink(hostname: string): string {
    return `https://exoplanetarchive.ipac.caltech.edu/overview/${encodeURIComponent(hostname)}`;
  }

  sort(column: SortColumn): void {
    if (this.sortColumn === column) {
      // Toggle sort direction
      if (this.sortDirection === 'asc') {
        this.sortDirection = 'desc';
      } else if (this.sortDirection === 'desc') {
        this.sortDirection = null;
        this.sortColumn = null;
        this.sortedResults = [...this._results];
        return;
      } else {
        this.sortDirection = 'asc';
      }
    } else {
      this.sortColumn = column;
      this.sortDirection = 'asc';
    }

    this.sortedResults = [...this._results].sort((a, b) => {
      const aValue = a[column];
      const bValue = b[column];

      // Handle undefined values
      if (aValue === undefined && bValue === undefined) return 0;
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      if (aValue === bValue) return 0;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      }

      return this.sortDirection === 'asc' ? comparison : -comparison;
    });
  }

  getSortIcon(column: SortColumn): string {
    if (this.sortColumn !== column) return 'both';
    return this.sortDirection === 'asc' ? 'up' : 'down';
  }

  formatNumber(value: number | undefined, decimals: number = 2): string {
    if (value === undefined) return 'N/A';
    return value.toFixed(decimals);
  }
}
