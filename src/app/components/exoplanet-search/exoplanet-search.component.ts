import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { QueryPanelComponent } from '../query-panel/query-panel.component';
import { ResultsTableComponent } from '../results-table/results-table.component';
import { ExoplanetService } from '../../services/exoplanet.service';
import { Exoplanet, QueryFilters, QueryOptions } from '../../models/exoplanet.model';
import { Footer } from '../footer/footer';
import { Header } from '../header/header';



@Component({
  selector: 'app-exoplanet-search',
  standalone: true,
  imports: [CommonModule, QueryPanelComponent, ResultsTableComponent, Header,Footer],
  templateUrl: './exoplanet-search.component.html',
  styleUrl: './exoplanet-search.component.scss'
})
export class ExoplanetSearchComponent implements OnInit {
  queryOptions: QueryOptions = {
    years: [],
    methods: [],
    hostnames: [],
    facilities: []
  };

  searchResults: Exoplanet[] = [];
  isLoading = true;
  hasSearched = false;

  constructor(private exoplanetService: ExoplanetService) {}

  ngOnInit(): void {
    console.log('ExoplanetSearch: Component initialized');
    this.exoplanetService.isDataLoaded().subscribe(loaded => {
      console.log('ExoplanetSearch: Data loaded status:', loaded);
      if (loaded) {
        this.queryOptions = this.exoplanetService.getQueryOptions();
        console.log('ExoplanetSearch: Query options loaded:', {
          years: this.queryOptions.years.length,
          methods: this.queryOptions.methods.length,
          hostnames: this.queryOptions.hostnames.length,
          facilities: this.queryOptions.facilities.length
        });
        this.isLoading = false;
      }
    });
  }

  onSearch(filters: QueryFilters): void {
    console.log('ExoplanetSearch: Search triggered with filters:', filters);
    this.hasSearched = true;
    this.searchResults = this.exoplanetService.search(filters);
    console.log('ExoplanetSearch: Search results:', this.searchResults.length, 'planets found');
  }

  onClear(): void {
    this.searchResults = [];
    this.hasSearched = false;
  }
}
