import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  // Pages publiques
  {
    path: 'login',
    loadComponent: () => import('./auth/login/login').then(m => m.LoginComponent),
  },
  {
    path: 'register',
    loadComponent: () => import('./auth/register/register').then(m => m.RegisterComponent),
  },

  // Pages protégées
  {
    path: '',
    canActivate: [authGuard],
    loadComponent: () => import('./simulation-bracelet/simulation-bracelet').then(m => m.SimulationBracelet),
  },
  {
    path: 'liste-malaise',
    canActivate: [authGuard],
    loadComponent: () => import('./liste-malaise/liste-malaise').then(m => m.ListeMalaise),
  },
  {
    path: 'formulaire-malaise',
    canActivate: [authGuard],
    loadComponent: () => import('./formulaire-malaise/formulaire-malaise').then(m => m.FormulaireMalaise),
  },
  {
    path: 'events',
    canActivate: [authGuard],
    loadComponent: () => import('./events/events').then(m => m.EventsComponent),
  },
  {
    path: 'statistiques',
    canActivate: [authGuard],
    loadComponent: () => import('./stats-malaise/stats-malaise').then(m => m.StatsMalaiseComponent),
  },
  {
    path: 'real',
    canActivate: [authGuard],
    loadComponent: () => import('./real-bracelet/real-bracelet').then(m => m.RealBraceletComponent),
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
