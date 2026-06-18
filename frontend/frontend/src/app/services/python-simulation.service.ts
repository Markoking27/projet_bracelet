import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, interval, of } from 'rxjs';
import { startWith, switchMap, catchError, map } from 'rxjs/operators';

export interface SimBracelet {
  id: number;
  mode: string;
  level: number;
  malaise: string | null;
  bpm: number;
  spo2: number;
  temperature: number;
  accel: number;
  accelVariance: number;
  x: number;
  y: number;
}

@Injectable({ providedIn: 'root' })
export class PythonSimulationService {
  private readonly url = 'http://localhost:3000/api/sim-bracelets';
  private http = inject(HttpClient);

  private positions = new Map<number, { x: number; y: number }>();

  private getPos(id: number): { x: number; y: number } {
    if (!this.positions.has(id)) {
      this.positions.set(id, {
        x: Math.round(180 + Math.random() * 440),
        y: Math.round(100 + Math.random() * 300),
      });
    }
    return this.positions.get(id)!;
  }

  poll(): Observable<SimBracelet[]> {
    return interval(2000).pipe(
      startWith(0),
      switchMap(() =>
        this.http.get<any[]>(this.url).pipe(
          catchError(() => of([]))
        )
      ),
      map(raw => raw.map(b => ({ ...b, ...this.getPos(b.id) })))
    );
  }
}
