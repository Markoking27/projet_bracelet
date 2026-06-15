import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BraceletService, Bracelet } from '../services/bracelet';
import { BaseChartDirective } from 'ng2-charts';
import {ChartConfiguration,ChartOptions} from 'chart.js';

@Component({
  selector: 'app-simulation-bracelet',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './simulation-bracelet.html',
  styleUrl: './simulation-bracelet.scss',
})
export class SimulationBracelet implements OnInit, OnDestroy {
  bracelets: Bracelet[] = [];
  selectedBracelet: Bracelet | null = null;

  balises: { id: string; x: number | null; y: number | null }[] = [
  { id: 'B1', x: null, y: null },
  { id: 'B2', x: null, y: null },
  { id: 'B3', x: null, y: null },
];

placementBalises = false;
draggedBalise: string | null = null;

placerBalises(): void {
  this.balises = [
    { id: 'B1', x: null, y: null },
    { id: 'B2', x: null, y: null },
    { id: 'B3', x: null, y: null },
  ];
  this.placementBalises = true;
}

onMapClick(event: MouseEvent): void {
  if (!this.placementBalises) return;

  const map = event.currentTarget as HTMLElement;
  const rect = map.getBoundingClientRect();

  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  const next = this.balises.find(b => b.x === null || b.y === null);
  if (!next) {
    this.placementBalises = false;
    return;
  }

  next.x = Math.round(x);
  next.y = Math.round(y);

  if (this.balises.every(b => b.x !== null && b.y !== null)) {
    this.placementBalises = false;
  }
}

startDragBalise(id: string, event: MouseEvent): void {
  event.stopPropagation();
  this.draggedBalise = id;
}

onMapMouseMove(event: MouseEvent): void {
  if (!this.draggedBalise) return;

  const map = event.currentTarget as HTMLElement;
  const rect = map.getBoundingClientRect();

  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;

  const balise = this.balises.find(b => b.id === this.draggedBalise);
  if (balise) {
    balise.x = Math.round(Math.max(0, Math.min(100, x)));
    balise.y = Math.round(Math.max(0, Math.min(100, y)));
  }
}

stopDragBalise(): void {
  this.draggedBalise = null;
}

balisesPlacees() {
  return this.balises.filter(b => b.x !== null && b.y !== null);
}

getBalisePosition(balise: { x: number | null; y: number | null }): { left: string; top: string } {
  return {
    left: `${balise.x}%`,
    top: `${balise.y}%`
  };
}
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
      next: data => {
        this.bracelets = data;

        if (this.selectedBracelet) {
          const updated = this.bracelets.find(b => b.id === this.selectedBracelet?.id);
          this.selectedBracelet = updated ?? this.selectedBracelet;
        }
      },
      error: err => console.error('Erreur API', err)
    });
  }

  selectBracelet(bracelet: Bracelet): void {
    this.selectedBracelet = bracelet;
  }

  isSelected(bracelet: Bracelet): boolean {
    return this.selectedBracelet?.id === bracelet.id;
  }

  getLevelLabel(level: number): string {
    switch (level) {
      case 0: return 'Normal';
      case 1: return 'Attention';
      case 2: return 'Critique';
      default: return 'Inconnu';
    }
  }

  getLevelClass(level: number): string {
    switch (level) {
      case 0: return 'normal';
      case 1: return 'warning';
      case 2: return 'danger';
      default: return '';
    }
  }

  braceletsEnAlerte(): Bracelet[] {
    return this.bracelets.filter(b => b.level > 0);
  }

  tousLesBracelets(): Bracelet[] {
    return this.bracelets;
  }

  braceletsAvecPosition(): Bracelet[] {
    return this.bracelets.filter(
      b => b.x !== undefined && b.y !== undefined
    );
  }

  getMapPosition(bracelet: Bracelet): { left: string; top: string } {
    return {
      left: `${bracelet.x}%`,
      top: `${bracelet.y}%`
    };
  }

  getAlertCount(): number {
    return this.braceletsEnAlerte().length;
  }

  getActiveCount(): number {
    return this.bracelets.length;
  }

  getRiskZoneCount(): number {
    return 0;
  }

  getBraceletDisplayName(bracelet: Bracelet): string {
    return bracelet.name || `Bracelet #${bracelet.id}`;
  }

  hasChartData(bracelet: Bracelet | null): boolean {
    if (!bracelet) return false;

    return !!(
      bracelet.labels?.length &&
      bracelet.fcHistory?.length &&
      bracelet.hrvHistory?.length &&
      bracelet.temperatureHistory?.length
    );
  }

  // Graphiques
  get fcChartData(): ChartConfiguration<'line'>['data'] {
    const b = this.selectedBracelet;
    return {
      labels: b?.labels ?? [],
      datasets: [
        {
          data: b?.fcHistory ?? [],
          label: 'Fréquence cardiaque',
          borderColor: '#ef4444',
          backgroundColor: 'rgba(239,68,68,0.15)',
          tension: 0.35,
          fill: false,
          pointRadius: 0
        }
      ]
    };
  }

  get hrvChartData(): ChartConfiguration<'line'>['data'] {
    const b = this.selectedBracelet;
    return {
      labels: b?.labels ?? [],
      datasets: [
        {
          data: b?.hrvHistory ?? [],
          label: 'HRV',
          borderColor: '#3b82f6',
          backgroundColor: 'rgba(59,130,246,0.15)',
          tension: 0.35,
          fill: false,
          pointRadius: 0
        }
      ]
    };
  }

  get tempChartData(): ChartConfiguration<'line'>['data'] {
    const b = this.selectedBracelet;
    return {
      labels: b?.labels ?? [],
      datasets: [
        {
          data: b?.temperatureHistory ?? [],
          label: 'Température',
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139,92,246,0.15)',
          tension: 0.35,
          fill: false,
          pointRadius: 0
        }
      ]
    };
  }

  lineChartType: 'line' = 'line';

  lineChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: {
        grid: {
          color: '#d1d5db'
        },
        ticks: {
          color: '#64748b'
        }
      },
      y: {
        grid: {
          color: '#d1d5db'
        },
        ticks: {
          color: '#64748b'
        }
      }
    }
  };
  
  getCriticalAlertCount(): number {
  return this.braceletsEnAlerte().filter(b => b.level === 2).length;
}

getWarningAlertCount(): number {
  return this.braceletsEnAlerte().filter(b => b.level === 1).length;
}
}