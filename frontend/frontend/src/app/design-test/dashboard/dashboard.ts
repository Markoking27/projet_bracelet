import { Component, OnInit, OnDestroy, signal, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { BraceletExtendedService, BraceletExtended, DashboardStats } from '../bracelet-extended.service';
import { PythonSimulationService, SimBracelet } from '../../services/python-simulation.service';
import { MapComponent } from '../map/map.component';
import { DetailComponent } from '../detail/detail.component';

@Component({
  selector: 'app-design-test-dashboard',
  standalone: true,
  imports: [MapComponent, DetailComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class DashboardComponent implements OnInit, OnDestroy {
  bracelets    = signal<BraceletExtended[]>([]);
  stats        = signal<DashboardStats>({ total: 0, normal: 0, attention: 0, alerte: 0, urgence: 0 });
  selected     = signal<BraceletExtended | null>(null);
  lastUpdate   = signal<string>('--:--:--');
  connected    = signal(false);
  simBracelets = signal<SimBracelet[]>([]);

  // Bracelets Python convertis pour la carte (BraceletExtended compatible)
  allMapBracelets = computed<BraceletExtended[]>(() => {
    const fromPython: BraceletExtended[] = this.simBracelets().map(b => ({
      id: b.id + 100,   // offset pour éviter les collisions d'ID avec les bracelets Node
      level: b.level,
      malaise: b.malaise,
      x: b.x,
      y: b.y,
      bpm: Math.round(b.bpm),
      spo2: b.spo2,
      temp: b.temperature,
      rssi: [],
      history: { bpm: [], spo2: [], temp: [], ts: [] },
    }));
    return [...this.bracelets(), ...fromPython];
  });

  private sub?: Subscription;
  private simSub?: Subscription;

  constructor(
    private svc: BraceletExtendedService,
    private pythonSvc: PythonSimulationService
  ) {}

  ngOnInit(): void {
    this.sub = this.svc.poll().subscribe(data => {
      const sel = this.selected();
      if (sel) {
        const updated = data.bracelets.find(b => b.id === sel.id);
        if (updated) this.selected.set(updated);
      }
      this.bracelets.set(data.bracelets);
      this.stats.set(data.stats);
      this.lastUpdate.set(new Date().toLocaleTimeString('fr-FR'));
      this.connected.set(true);
    });

    this.simSub = this.pythonSvc.poll().subscribe(data => {
      this.simBracelets.set(data);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.simSub?.unsubscribe();
  }

  selectBracelet(b: BraceletExtended): void {
    this.selected.set(this.selected()?.id === b.id ? null : b);
  }

  closeDetail(): void { this.selected.set(null); }

  levelLabel(l: number): string {
    return ['NORMAL', 'ATTENTION', 'ALERTE', 'URGENCE'][l] ?? '—';
  }

  levelClass(l: number): string {
    return ['normal', 'attention', 'alerte', 'urgence'][l] ?? '';
  }

  padId(id: number): string {
    return id < 10 ? `0${id}` : `${id}`;
  }

  modeLabel(mode: string): string {
    const labels: Record<string, string> = {
      normal: 'Normal', effort: 'Effort',
      vagal: 'Vagal', deshydratation: 'Déshydratation',
      chaleur: 'Coup de chaleur', alcool: 'Alcool',
    };
    return labels[mode] ?? mode;
  }

  fmt(val: number, decimals = 1): string {
    if (val == null || isNaN(val)) return '—';
    return val.toFixed(decimals);
  }
}
