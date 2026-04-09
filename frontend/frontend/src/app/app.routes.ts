import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./simulation-bracelet/simulation-bracelet')
        .then(m => m.SimulationBracelet)
  },
  {
    path: 'liste-malaise',
    loadComponent: () =>
      import('./liste-malaise/liste-malaise')
        .then(m => m.ListeMalaise)
  },
  {
    path: 'formulaire-malaise',
    loadComponent: () =>
      import('./formulaire-malaise/formulaire-malaise')
        .then(m => m.FormulaireMalaise)
  }
];