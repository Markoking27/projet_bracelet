// DESIGN-TEST — supprimer ce fichier pour retirer le dashboard
import { Injectable } from '@angular/core';
import { Observable, interval, from, switchMap, startWith, catchError, EMPTY } from 'rxjs';

export interface BraceletHistory {
  bpm: number[];
  spo2: number[];
  temp: number[];
  ts: string[];
}

export interface BraceletExtended {
  id: number;
  level: number;
  malaise: string | null;
  x: number;
  y: number;
  bpm: number;
  spo2: number;
  temp: number;
  rssi: { id: string; value: number }[];
  history: BraceletHistory;
}

export interface DashboardStats {
  total: number;
  normal: number;
  attention: number;
  alerte: number;
  urgence: number;
}

export interface DashboardData {
  bracelets: BraceletExtended[];
  stats: DashboardStats;
}

@Injectable({ providedIn: 'root' })
export class BraceletExtendedService {
  private readonly url = 'http://localhost:3001/api/design-test/bracelets';

  poll(): Observable<DashboardData> {
    return interval(2000).pipe(
      startWith(0),
      switchMap(() =>
        from(fetch(this.url).then(r => r.json()) as Promise<DashboardData>).pipe(
          catchError(() => EMPTY)
        )
      )
    );
  }
}
