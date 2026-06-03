import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RealBraceletService, RealBracelet } from '../services/real-bracelet';

@Component({
  selector: 'app-real-bracelet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './real-bracelet.html',
  styleUrls: ['./real-bracelet.scss']
})
export class RealBraceletComponent implements OnInit, OnDestroy {
  bracelet: RealBracelet | null = null;
  private interval: any;

  constructor(private service: RealBraceletService) {}

  ngOnInit(): void {
    this.fetchData();
    this.interval = setInterval(() => this.fetchData(), 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  fetchData(): void {
    this.service.getBracelet().subscribe({
      next: data => this.bracelet = data,
      error: err => console.error('Erreur', err)
    });
  }

  getProximityClass(proximity: string): string {
    switch(proximity) {
      case 'tres_proche': return 'tres-proche';
      case 'proche':      return 'proche';
      default:            return 'loin';
    }
  }
}