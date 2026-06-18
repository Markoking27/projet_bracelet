import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartType } from 'chart.js';

import { AuthService } from '../services/auth.service';
import { EventService, BraceEvent } from '../services/event.service';
import { SupabaseService } from '../services/supabase';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-malaise',
  standalone: true,
  imports: [CommonModule, FormsModule, BaseChartDirective],
  templateUrl: './stats-malaise.html',
  styleUrl: './stats-malaise.scss'
})
export class StatsMalaiseComponent implements OnInit {

  loading = true;

  events: BraceEvent[] = [];
  selectedEventId = '';

  allMalaises: any[] = [];

  constructor(
    private auth: AuthService,
    private eventService: EventService,
    private supabase: SupabaseService
  ) {}

  async ngOnInit() {
    await this.eventService.loadEvents();
    this.events = this.eventService.events();

    this.selectedEventId = this.eventService.activeEvent()?.id ?? '';

    await this.loadData();
  }

  get selectedEventName(): string {
    if (!this.selectedEventId) return '';
    return this.events.find(e => e.id === this.selectedEventId)?.nom ?? '';
  }

  barType: ChartType = 'bar';
  lineType: ChartType = 'line';
  pieType: ChartType = 'pie';
  doughnutType: ChartType = 'doughnut';

  totalMalaises = 0;
  graviteElevee = 0;

  typeChartData!: ChartData<'bar'>;
  graviteChartData!: ChartData<'doughnut'>;
  sexeChartData!: ChartData<'pie'>;
  ageChartData!: ChartData<'bar'>;
  zoneChartData!: ChartData<'bar'>;
  densiteChartData!: ChartData<'doughnut'>;
  eventChartData!: ChartData<'pie'>;
  alcoolChartData!: ChartData<'bar'>;
  tempsChartData!: ChartData<'bar'>;
  evolutionChartData!: ChartData<'line'>;
  heureChartData!: ChartData<'line'>;

  chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: true } },
    scales: {
      x: { type: 'category' },
      y: { beginAtZero: true, ticks: { precision: 0 } }
    }
  };

  async loadData() {

    this.loading = true;

    const client = this.supabase.getClient();

    let query = client.from('malaise').select('*');

    if (this.selectedEventId) {
      const eventName =
        this.events.find(e => e.id === this.selectedEventId)?.nom;

      if (eventName) {
        query = query.eq('evenement', eventName);
      }
    }

    const { data, error } = await query;

    if (error) {
      console.error(error);
      this.allMalaises = [];
    } else {
      this.allMalaises = data ?? [];
    }

    this.buildAll();
    this.loading = false;
  }

  async onEventChange() {
    await this.loadData();
  }

  get malaises() {
    return this.allMalaises;
  }

  buildAll() {

    const malaises = this.malaises;

    this.totalMalaises = malaises.length;
    this.graviteElevee = malaises.filter(m => m.gravite === 'elevee').length;

    const typeMap: Record<string, number> = {};
    const graviteMap = { faible: 0, moderee: 0, elevee: 0 };
    const sexeMap = { homme: 0, femme: 0, np: 0 };
    const ageMap: Record<string, number> = {};
    const zoneMap: Record<string, number> = {};
    const densiteMap = { faible: 0, moyenne: 0, forte: 0 };
    const eventMap: Record<string, number> = {};
    const alcoolMap = { faible: 0, modere: 0, non_mesure: 0, eleve: 0 };
    const tempsMap = { '<10': 0, '10-20': 0, '>20': 0 };
    const dateMap: Record<string, number> = {};
    const heureMap = Array(24).fill(0);

    for (const m of malaises) {

      const validTypes = ['vagal','déshydratation','hypoglycémie','chaleur','alcool','chute'];
      const t = validTypes.includes(m.type) ? m.type : 'autre';
      typeMap[t] = (typeMap[t] || 0) + 1;

      if (graviteMap[m.gravite as keyof typeof graviteMap] !== undefined)
        graviteMap[m.gravite as keyof typeof graviteMap]++;

      if (sexeMap[m.sexe as keyof typeof sexeMap] !== undefined)
        sexeMap[m.sexe as keyof typeof sexeMap]++;

      if (m.age) ageMap[m.age] = (ageMap[m.age] || 0) + 1;

      const validZones = ['milieu','avant_scene','arriere'];
      const z = validZones.includes(m.zone) ? m.zone : 'autre';
      zoneMap[z] = (zoneMap[z] || 0) + 1;

      if (densiteMap[m.densite as keyof typeof densiteMap] !== undefined)
        densiteMap[m.densite as keyof typeof densiteMap]++;

      const validEvents = ['sport','politique','musique'];
      const e = validEvents.includes(m.event) ? m.event : 'autre';
      eventMap[e] = (eventMap[e] || 0) + 1;

      if (alcoolMap[m.alcool as keyof typeof alcoolMap] !== undefined)
        alcoolMap[m.alcool as keyof typeof alcoolMap]++;

      if (tempsMap[m.temps as keyof typeof tempsMap] !== undefined)
        tempsMap[m.temps as keyof typeof tempsMap]++;

      if (m.date) dateMap[m.date] = (dateMap[m.date] || 0) + 1;

      if (m.heure) {
        const h = parseInt(m.heure.split(':')[0], 10);
        if (!isNaN(h)) heureMap[h]++;
      }
    }

    // 🔥 FIX IMPORTANT : AJOUT DES LABELS POUR SUPPRIMER "undefined"

    this.typeChartData = {
      labels: Object.keys(typeMap),
      datasets: [{ label: 'Types de malaise', data: Object.values(typeMap) }]
    };

    this.graviteChartData = {
      labels: ['Faible','Modérée','Élevée'],
      datasets: [{ label: 'Gravité', data: Object.values(graviteMap) }]
    };

    this.sexeChartData = {
      labels: ['Homme','Femme','NP'],
      datasets: [{ label: 'Sexe', data: Object.values(sexeMap) }]
    };

    this.ageChartData = {
      labels: Object.keys(ageMap),
      datasets: [{ label: 'Répartition par âge', data: Object.values(ageMap) }]
    };

    this.zoneChartData = {
      labels: Object.keys(zoneMap),
      datasets: [{ label: 'Zones', data: Object.values(zoneMap) }]
    };

    this.densiteChartData = {
      labels: ['Faible','Moyenne','Forte'],
      datasets: [{ label: 'Densité', data: Object.values(densiteMap) }]
    };

    this.eventChartData = {
      labels: Object.keys(eventMap),
      datasets: [{ label: 'Événements', data: Object.values(eventMap) }]
    };

    this.alcoolChartData = {
      labels: ['Faible','Modéré','Non mesuré','Élevé'],
      datasets: [{ label: 'Alcool', data: Object.values(alcoolMap) }]
    };

    this.tempsChartData = {
      labels: ['<10 min','10-20 min','>20 min'],
      datasets: [{ label: "Temps d'intervention", data: Object.values(tempsMap) }]
    };

    const sortedDates = Object.keys(dateMap).sort();

    this.evolutionChartData = {
      labels: sortedDates,
      datasets: [{
        label: 'Évolution des malaises',
        data: sortedDates.map(d => dateMap[d]),
        tension: 0.3
      }]
    };

    this.heureChartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{
        label: 'Répartition par heure',
        data: heureMap
      }]
    };
  }
}