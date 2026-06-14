import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BraceletService, Bracelet } from '../services/bracelet';
import { BaseChartDirective } from 'ng2-charts';
import {ChartConfiguration,ChartOptions} from 'chart.js';
import { RealBraceletService, RealBracelet } from '../services/real-bracelet';

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
  realBracelet : RealBracelet | null = null;
  private interval: any;

  constructor(
    private braceletService: BraceletService,
    private realBraceletService : RealBraceletService,
  ) {}

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
        if(this.realBracelet) this.injectRealBracelet();

        if (this.selectedBracelet) {
          const updated = this.bracelets.find(b => b.id === this.selectedBracelet?.id);
          this.selectedBracelet = updated ?? this.selectedBracelet;
        }
      },
      error: err => console.error('Erreur API', err)
    });
    this.realBraceletService.getBracelet().subscribe({
      next: data => {
        this.realBracelet = data; 
        if (data) this.injectRealBracelet();
      },
      error: err => console.error('Erreur Bracelet réel', err)
    })
  }

  private injectRealBracelet(): void {
    if (!this.realBracelet) return;

    const realAsSimulated: Bracelet = {
      id: 0,                                      // id fixe pour le vrai bracelet
      name: `📡 ${this.realBracelet.bracelet_id}`,
      level: this.computeRealLevel(),
      malaise: null,
      bpm: this.realBracelet.bpm,
      fc: this.realBracelet.bpm,
      temperature: undefined,
      x: this.getRealBraceletX(),                 // position depuis RSSI
      y: this.getRealBraceletY(),
    };

    const idx = this.bracelets.findIndex(b => b.id === 0);
    if (idx >= 0) {
      this.bracelets[idx] = realAsSimulated;
    } else {
      this.bracelets = [realAsSimulated, ...this.bracelets];
    }
}

private computeRealLevel(): number {
  if (!this.realBracelet) return 0;
  if (!this.realBracelet.finger) return 1;
  if (this.realBracelet.bpm === 0) return 2;
  if (this.realBracelet.bpm > 120 || this.realBracelet.spo2 < 94) return 2;
  if (this.realBracelet.bpm > 100 || this.realBracelet.spo2 < 96) return 1;
  return 0;
}

private getRealBraceletX(): number | undefined {
  if (!this.realBracelet?.gtags?.length) return undefined;
  // Utilise le RSSI de la balise la plus proche pour estimer la position
  const closest = this.realBracelet.gtags
    .sort((a, b) => b.rssi - a.rssi)[0];
  // Adapte selon tes balises — ici exemple fixe par adresse
  const positions: Record<string, { x: number; y: number }> = {
    'AA:BB:CC:DD:EE:01': { x: 20, y: 30 },
    'AA:BB:CC:DD:EE:02': { x: 60, y: 50 },
    'AA:BB:CC:DD:EE:03': { x: 80, y: 70 },
  };
  return positions[closest.address]?.x;
}

private getRealBraceletY(): number | undefined {
  if (!this.realBracelet?.gtags?.length) return undefined;
  const closest = this.realBracelet.gtags
    .sort((a, b) => b.rssi - a.rssi)[0];
  const positions: Record<string, { x: number; y: number }> = {
    'AA:BB:CC:DD:EE:01': { x: 20, y: 30 },
    'AA:BB:CC:DD:EE:02': { x: 60, y: 50 },
    'AA:BB:CC:DD:EE:03': { x: 80, y: 70 },
  };
  return positions[closest.address]?.y;
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

  addBracelet(): void {
    this.braceletService.addBracelet().subscribe({
      next: res => console.log('Bracelet ajouté', res),
      error: err => console.error('Erreur ajout bracelet', err)
    })
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

  getProximityClass(proximity: string): string {
  switch (proximity) {
    case 'tres_proche': return 'tres-proche';
    case 'proche':      return 'proche';
    default:            return 'loin';
  }
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