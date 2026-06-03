import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Bracelet {

  id: number;
  name?: string;
  level: number;
  malaise: string | null;
  mode?: string;
  bpm?: number;

  fc?: number;
  hrv?: number;
  temperature?: number;
  accel?: number;
  accelVariance?: number;

  x?: number;
  y?: number;

  history?: {
    bpm?: number[];
    temperature?: number[];
    spo2?: number[];
    labels?: string[];
  };

  fcHistory?: number[];
  hrvHistory?: number[];
  temperatureHistory?: number[];
  labels?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class BraceletService {
  private backendUrl = 'http://localhost:5000/api/bracelets'; 

  constructor(private http: HttpClient) { }

  getBracelets(): Observable<Bracelet[]> {
    return this.http.get<Bracelet[]>(this.backendUrl);
  }

  setBraceletMode(id: number, mode: string): Observable<any> {
    return this.http.post(`${this.backendUrl}/${id}/mode`, { mode });
  }
}
