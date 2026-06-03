import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';


export const routes: Routes = [
  {
    path: '',
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
  ///////////////////////:fin DESIGN-TEST
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

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}
