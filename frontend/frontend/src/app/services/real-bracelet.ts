import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface GTag {
  address: string;
  proximity: string;
  rssi: number;
}

export interface RealBracelet {
  bracelet_id: string;
  bpm: number;
  bpm_avg: number;
  spo2: number;
  ir: number;
  humidity: number;
  finger: boolean;
  gtag_count: number;
  gtag_found: boolean;
  gtags: GTag[];
  time: string;
}

@Injectable({ providedIn: 'root' })
export class RealBraceletService {
  private url = 'http://localhost:3000/api/bracelet/real';
  constructor(private http: HttpClient) {}
  getBracelet(): Observable<RealBracelet | null> {
    return this.http.get<RealBracelet | null>(this.url);
  }
}