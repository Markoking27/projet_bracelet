import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Bracelet {

  id: number;
  name?: string;
  level: number;
  malaise: string | null;

  fc?: number;
  hrv?: number;
  temperature?: number;

  x?: number;
  y?: number;

  fcHistory?: number[];
  hrvHistory?: number[];
  temperatureHistory?: number[];
  labels?: string[];
}

@Injectable({
  providedIn: 'root',
})
export class BraceletService {
  private backendUrl = 'http://localhost:3000/api/bracelet'; 

  constructor(private http: HttpClient) { }

  getBracelets(): Observable<Bracelet[]> {
    return this.http.get<Bracelet[]>(this.backendUrl);
  }
}
