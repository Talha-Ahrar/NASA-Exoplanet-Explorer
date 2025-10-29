import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { QueryFilters, QueryOptions } from '../../models/exoplanet.model';

@Component({
  selector: 'app-query-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, NgSelectModule],
  templateUrl: './query-panel.component.html',
  styleUrl: './query-panel.component.scss'
})
export class QueryPanelComponent {
  @Input() queryOptions: QueryOptions = {
    years: [],
    methods: [],
    hostnames: [],
    facilities: []
  };

  @Output() search = new EventEmitter<QueryFilters>();
  @Output() clear = new EventEmitter<void>();

  selectedYear: number | null = null;
  selectedMethod: string = '';
  selectedHostname: string = '';
  selectedFacility: string = '';

  errorMessage: string = '';

  onSearch(): void {
    const hasSelection = this.selectedYear !== null ||
                        (this.selectedMethod && this.selectedMethod !== '') ||
                        (this.selectedHostname && this.selectedHostname !== '') ||
                        (this.selectedFacility && this.selectedFacility !== '');

    if (!hasSelection) {
      this.errorMessage = 'Please select at least one query parameter';
      return;
    }

    this.errorMessage = '';
    const filters: QueryFilters = {};

    if (this.selectedYear !== null) {
      filters.year = this.selectedYear;
    }
    if (this.selectedMethod && this.selectedMethod !== '') {
      filters.method = this.selectedMethod;
    }
    if (this.selectedHostname && this.selectedHostname !== '') {
      filters.hostname = this.selectedHostname;
    }
    if (this.selectedFacility && this.selectedFacility !== '') {
      filters.facility = this.selectedFacility;
    }

    console.log('Search filters:', filters);
    this.search.emit(filters);
  }

  onClear(): void {
    this.selectedYear = null;
    this.selectedMethod = '';
    this.selectedHostname = '';
    this.selectedFacility = '';
    this.errorMessage = '';
    this.clear.emit();
  }
}
