import { Routes } from '@angular/router';
import { ExoplanetSearchComponent } from './components/exoplanet-search/exoplanet-search.component';

export const routes: Routes = [
  {
    path: '',
    component: ExoplanetSearchComponent
  },
  {
    path: '**',
    redirectTo: ''
  }
];
