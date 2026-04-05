import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';


export interface Bracelet {
  id: number;
  level: number;
  malaise: string | null;
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
