// DESIGN-TEST — supprimer ce dossier pour retirer le dashboard
import { Component, OnInit, OnDestroy, signal } from '@angular/core';
import { Subscription } from 'rxjs';
import { BraceletExtendedService, BraceletExtended, DashboardStats } from '../bracelet-extended.service';
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
  bracelets  = signal<BraceletExtended[]>([]);
  stats      = signal<DashboardStats>({ total: 0, normal: 0, attention: 0, alerte: 0, urgence: 0 });
  selected   = signal<BraceletExtended | null>(null);
  lastUpdate = signal<string>('--:--:--');
  connected  = signal(false);

  private sub?: Subscription;

  constructor(private svc: BraceletExtendedService) {}

  ngOnInit(): void {
    this.sub = this.svc.poll().subscribe(data => {
      // Keep selected bracelet in sync with latest data
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
  }

  ngOnDestroy(): void { this.sub?.unsubscribe(); }

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
}
