import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./simulation-bracelet/simulation-bracelet')
        .then(m => m.SimulationBracelet)
  },

   {  path: 'statistiques',
    loadComponent: () =>
      import('./stats-malaise/stats-malaise')
        .then(m => m.StatsMalaiseComponent)
  },

  {
    path: 'design-test',
    loadComponent: () =>
      import('./design-test/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },
  {
    path: 'formulaire-malaise',
    loadComponent: () =>
      import('./formulaire-malaise/formulaire-malaise')
        .then(m => m.FormulaireMalaise)
  },
  {
    path: 'real',
    loadComponent: () =>
      import('./real-bracelet/real-bracelet')
        .then(m => m.RealBraceletComponent)
  }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}
