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
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule{}
