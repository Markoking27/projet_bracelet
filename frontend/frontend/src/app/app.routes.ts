import { RouterModule, Routes } from '@angular/router';
import { NgModule } from '@angular/core';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' },

  {
    path: 'home',
    loadComponent: () => import('./app').then(m => m.App)
  },

  {
    path: 'simulator',
    loadComponent: () =>
      import('./simulation-bracelet/simulation-bracelet')
        .then(m => m.SimulationBracelet)
  },

  // DESIGN-TEST — retirer ce bloc pour supprimer le dashboard
  {
    path: 'design-test',
    loadComponent: () =>
      import('./design-test/dashboard/dashboard')
        .then(m => m.DashboardComponent)
  },
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}
