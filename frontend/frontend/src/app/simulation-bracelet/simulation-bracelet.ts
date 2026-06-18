import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BraceletService, Bracelet } from '../services/bracelet';
import { BaseChartDirective } from 'ng2-charts';
import {ChartConfiguration,ChartOptions} from 'chart.js';
import { RealBraceletService, RealBracelet, GTag } from '../services/real-bracelet';

@Component({
  selector: 'app-simulation-bracelet',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './simulation-bracelet.html',
  styleUrls: ['./simulation-bracelet.scss'],
})
export class SimulationBracelet implements OnInit, OnDestroy {
  bracelets: Bracelet[] = [];
  selectedBracelet: Bracelet | null = null;

  private readonly simPositions = new Map<number, { x: number; y: number }>();

  private getSimPos(id: number): { x: number; y: number } {
    if (!this.simPositions.has(id)) {
      this.simPositions.set(id, {
        x: Math.round(10 + Math.random() * 80),
        y: Math.round(10 + Math.random() * 80),
      });
    }
    return this.simPositions.get(id)!;
  }

  balises: { id: string; x: number | null; y: number | null }[] = [
    { id: 'B1', x: 20, y: 30 },
    { id: 'B2', x: 60, y: 30 },
    { id: 'B3', x: 40, y: 70 },
  ];

placementBalises = false;
draggedBalise: string | null = null;

  private readonly gtagAddressToAnchorId: Record<string, string> = {
    '7C2F80949A1': 'B1',
    '7C2F80949A82': 'B2',
    '7C2F80A6E7': 'B3',
    'B1': 'B1',
    'B2': 'B2',
    'B3': 'B3'
  };

  private normalizeAddress(address: string): string {
    return address.toUpperCase().replace(/[^A-F0-9]/g, '');
  }

  private findAnchorIdByPrefix(address: string): string | undefined {
    const normalizedAddress = this.normalizeAddress(address);
    const matchKey = Object.keys(this.gtagAddressToAnchorId).find(key => {
      const normalizedKey = this.normalizeAddress(key);
      return normalizedAddress.startsWith(normalizedKey) || normalizedKey.startsWith(normalizedAddress);
    });
    return matchKey ? this.gtagAddressToAnchorId[matchKey] : undefined;
  }

  private getAnchorPositionFromGtag(gtag: GTag): { id: string; x: number; y: number } | undefined {
    const anchorId = this.gtagAddressToAnchorId[gtag.address] || this.findAnchorIdByPrefix(gtag.address);
    const anchor = this.balises.find(b => b.id === anchorId && b.x !== null && b.y !== null);
    if (!anchor || anchor.x === null || anchor.y === null) {
      return undefined;
    }
    return { id: anchor.id, x: anchor.x, y: anchor.y };
  }

  private rssiToDistance(rssi: number): number {
    const txPower = -40;
    const pathLoss = 2;
    const meters = Math.pow(10, (txPower - rssi) / (10 * pathLoss));
    return meters * 12;
  }

  private trilateratePoints(points: { x: number; y: number; r: number }[]): { x: number; y: number } | undefined {
    if (points.length < 3) {
      return undefined;
    }

    const [p1, p2, p3] = points;
    const x1 = p1.x;
    const y1 = p1.y;
    const r1 = p1.r;
    const x2 = p2.x;
    const y2 = p2.y;
    const r2 = p2.r;
    const x3 = p3.x;
    const y3 = p3.y;
    const r3 = p3.r;

    const dx = x2 - x1;
    const dy = y2 - y1;
    const d = Math.sqrt(dx * dx + dy * dy);
    if (d === 0) {
      return undefined;
    }

    const ex = { x: dx / d, y: dy / d };
    const i = ex.x * (x3 - x1) + ex.y * (y3 - y1);
    const auxx = x3 - x1 - i * ex.x;
    const auxy = y3 - y1 - i * ex.y;
    const j = Math.sqrt(auxx * auxx + auxy * auxy);
    if (j === 0) {
      return undefined;
    }

    const x = (r1 * r1 - r2 * r2 + d * d) / (2 * d);
    const y = (r1 * r1 - r3 * r3 + i * i + j * j) / (2 * j) - (i / j) * x;
    const resultX = x1 + x * ex.x + y * (auxx / j);
    const resultY = y1 + x * ex.y + y * (auxy / j);

    return {
      x: Math.round(Math.max(0, Math.min(100, resultX))),
      y: Math.round(Math.max(0, Math.min(100, resultY)))
    };
  }

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

  const next = this.balises.find(b => b.x === null || b.y === null) || this.balises[0];
  if (!next) {
    this.placementBalises = false;
    return;
  }

  next.x = Math.round(Math.max(0, Math.min(100, x)));
  next.y = Math.round(Math.max(0, Math.min(100, y)));
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

startDragBalise(id: string, event: MouseEvent): void {
  event.stopPropagation();
  this.draggedBalise = id;
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
        this.bracelets = data.map(b => {
          const pos = b.level > 0 && b.x === undefined ? this.getSimPos(b.id) : {};
          return {
            ...b,
            ...(pos as object),
            fcHistory:           b.fcHistory           ?? b.history?.bpm,
            temperatureHistory:  b.temperatureHistory  ?? b.history?.temperature,
            spo2History:         (b as any).spo2History ?? b.history?.spo2,
            labels:              b.labels              ?? b.history?.labels,
          };
        });
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

    const position = this.resolveRealBraceletPosition();
    const realAsSimulated: Bracelet = {
      id: 0,                                      // id fixe pour le vrai bracelet
      name: `📡 ${this.realBracelet.bracelet_id}`,
      level: this.computeRealLevel(),
      malaise: null,
      bpm: this.realBracelet.bpm,
      bpm_avg: this.realBracelet.bpm_avg,
      fc: this.realBracelet.bpm,
      spo2: this.realBracelet.spo2,
      humidity: this.realBracelet.humidity,
      gtag_count: this.realBracelet.gtag_count,
      temperature: undefined,
      time: this.realBracelet.time,
      isReal: true,
      x: position.x,
      y: position.y,
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

private resolveRealBraceletPosition(): { x?: number; y?: number } {
  if (!this.realBracelet?.gtags?.length) return {};

  const anchors = this.realBracelet.gtags
    .map(gt => {
      const anchor = this.getAnchorPositionFromGtag(gt);
      return anchor ? { x: anchor.x, y: anchor.y, r: this.rssiToDistance(gt.rssi) } : undefined;
    })
    .filter((anchor): anchor is { x: number; y: number; r: number } => !!anchor);

  if (anchors.length >= 3) {
    const strongestThree = anchors
      .slice()
      .sort((a, b) => a.r - b.r)
      .slice(0, 3);
    const position = this.trilateratePoints(strongestThree);
    if (position) {
      return position;
    }
  }

  if (anchors.length > 0) {
    const totalWeight = anchors.reduce((sum, item) => sum + 1 / (item.r || 1), 0);
    if (totalWeight > 0) {
      const x = anchors.reduce((sum, item) => sum + item.x / (item.r || 1), 0) / totalWeight;
      const y = anchors.reduce((sum, item) => sum + item.y / (item.r || 1), 0) / totalWeight;
      return {
        x: Math.round(Math.max(0, Math.min(100, x))),
        y: Math.round(Math.max(0, Math.min(100, y)))
      };
    }
  }

  return {};
}

getRealBraceletPositionLabel(): string {
  const position = this.resolveRealBraceletPosition();
  if (position.x === undefined || position.y === undefined) {
    return 'Inconnue';
  }
  return `x: ${position.x}, y: ${position.y}`;
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

  get spo2ChartData(): ChartConfiguration<'line'>['data'] {
    const b = this.selectedBracelet;
    return {
      labels: b?.labels ?? [],
      datasets: [
        {
          data: (b as any)?.spo2History ?? [],
          label: 'SpO₂',
          borderColor: '#22d3ee',
          backgroundColor: 'rgba(34,211,238,0.15)',
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

  readonly modes = ['normal', 'effort', 'vagal', 'deshydratation', 'chaleur', 'alcool'];
  readonly modeLabels: Record<string, string> = {
    normal: 'Normal', effort: 'Effort', vagal: 'Vagal',
    deshydratation: 'Déshydratation', chaleur: 'Coup de chaleur', alcool: 'Alcool',
  };

  onModeChange(id: number, event: Event): void {
    const mode = (event.target as HTMLSelectElement).value;
    this.braceletService.setBraceletMode(id, mode).subscribe({
      error: err => console.error('Erreur changement de mode', err)
    });
  }

  miniChartOptions: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: false,
    animation: false,
    plugins: { legend: { display: false }, tooltip: { enabled: false } },
    scales: {
      x: { display: false },
      y: { display: false },
    },
  };

  getBpmMiniChart(b: Bracelet): ChartConfiguration<'line'>['data'] {
    return {
      labels: b.labels ?? [],
      datasets: [{
        data: b.fcHistory ?? (b.history?.bpm) ?? [],
        borderColor: '#ef4444',
        backgroundColor: 'rgba(239,68,68,0.1)',
        tension: 0.4, fill: true, pointRadius: 0, borderWidth: 2,
      }]
    };
  }

  getSpo2MiniChart(b: Bracelet): ChartConfiguration<'line'>['data'] {
    return {
      labels: b.labels ?? [],
      datasets: [{
        data: (b as any).spo2History ?? (b.history?.spo2) ?? [],
        borderColor: '#22d3ee',
        backgroundColor: 'rgba(34,211,238,0.1)',
        tension: 0.4, fill: true, pointRadius: 0, borderWidth: 2,
      }]
    };
  }

  getTempMiniChart(b: Bracelet): ChartConfiguration<'line'>['data'] {
    return {
      labels: b.labels ?? [],
      datasets: [{
        data: b.temperatureHistory ?? (b.history?.temperature) ?? [],
        borderColor: '#8b5cf6',
        backgroundColor: 'rgba(139,92,246,0.1)',
        tension: 0.4, fill: true, pointRadius: 0, borderWidth: 2,
      }]
    };
  }

  hasMiniChart(b: Bracelet): boolean {
    const bpmLen = (b.fcHistory ?? b.history?.bpm ?? []).length;
    return bpmLen > 1;
  }

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

fmt(val: number, decimals = 1): string {
  if (val == null || isNaN(val)) return '—';
  return val.toFixed(decimals);
}

padId(id: number): string {
  return id < 10 ? `0${id}` : `${id}`;
}

simLevelLabel(l: number): string {
  return ['NORMAL', 'ATTENTION', 'ALERTE', 'URGENCE'][l] ?? '—';
}

simLevelClass(l: number): string {
  return ['normal', 'attention', 'alerte', 'urgence'][l] ?? '';
}

simModeLabel(mode: string): string {
  const labels: Record<string, string> = {
    normal: 'Normal', effort: 'Effort', vagal: 'Vagal',
    deshydratation: 'Déshydratation', chaleur: 'Coup de chaleur', alcool: 'Alcool',
  };
  return labels[mode] ?? mode;
}
}