import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BraceletService, Bracelet } from '../services/bracelet';

@Component({
  selector: 'app-simulation-bracelet',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './simulation-bracelet.html',
  styleUrls: ['./simulation-bracelet.scss'],
})
export class SimulationBracelet implements OnInit, OnDestroy {
  bracelets: Bracelet[] = [];
  private interval: any;

  constructor(private braceletService: BraceletService) {}

  ngOnInit(): void {
    this.fetchData();
    this.interval = setInterval(() => this.fetchData(), 2000);
  }

  ngOnDestroy(): void {
    clearInterval(this.interval);
  }

  fetchData(): void {
    this.braceletService.getBracelets().subscribe({
      next: data => this.bracelets = data,
      error: err => console.error('Erreur API', err)
    });
  }

  getLevelLabel(level: number): string {
    switch(level) {
      case 0: return 'Normal';
      case 1: return 'Attention';
      case 2: return 'Alerte';
      default: return 'Inconnu';
    }
  }

  getLevelClass(level: number): string {
    switch(level) {
      case 0: return 'normal';
      case 1: return 'warning';
      case 2: return 'danger';
      default: return '';
    }
  }

  braceletsEnAlerte(): Bracelet[] {
    return this.bracelets; // le backend filtre déjà
  }
}