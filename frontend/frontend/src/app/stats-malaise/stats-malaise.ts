import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseChartDirective } from 'ng2-charts';
import { Chart, registerables, ChartData, ChartType } from 'chart.js';
import { SupabaseService } from '../services/supabase';

Chart.register(...registerables);

@Component({
  selector: 'app-stats-malaise',
  standalone: true,
  imports: [CommonModule, BaseChartDirective],
  templateUrl: './stats-malaise.html',
  styleUrl: './stats-malaise.scss'
})
export class StatsMalaiseComponent implements OnInit {

  loading = true;
  malaises: any[] = [];

  constructor(private supabase: SupabaseService) {}

  async ngOnInit() {
    await this.loadData();
  }

  // ======================
  // TYPES
  // ======================
  barType: ChartType = 'bar';
  lineType: ChartType = 'line';
  doughnutType: ChartType = 'doughnut';
  pieType: ChartType = 'pie';

  // ======================
  // KPI
  // ======================
  totalMalaises = 0;
  graviteElevee = 0;

  // ======================
  // CHART DATA
  // ======================
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

    plugins: {
      legend: { display: true }
    },

    scales: {
      x: {
        type: 'category'
      },
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0
        }
      }
    }
  };

  async loadData() {
    this.loading = true;

    const { data, error } = await this.supabase
      .getClient()
      .from('malaises')
      .select('*');

    if (error) {
      console.error(error);
      this.loading = false;
      return;
    }

    this.malaises = data ?? [];
    this.buildAll();
    this.loading = false;
  }

  // ======================
  // BUILD ALL STATS
  // ======================
  buildAll() {

    this.totalMalaises = this.malaises.length;
    this.graviteElevee = this.malaises.filter(m => m.gravite === 'elevee').length;

    // MAPS
    const typeMap: Record<string, number> = {};
    const graviteMap: Record<string, number> = { faible: 0, moderee: 0, elevee: 0 };
    const sexeMap: Record<string, number> = { homme: 0, femme: 0, np: 0 };
    const ageMap: Record<string, number> = {};
    const zoneMap: Record<string, number> = {};
    const densiteMap: Record<string, number> = { faible: 0, moyenne: 0, forte: 0 };
    const eventMap: Record<string, number> = {};
    const alcoolMap: Record<string, number> = { faible: 0, modere: 0, non_mesure: 0, eleve: 0 };
    const tempsMap: Record<string, number> = { '<10': 0, '10-20': 0, '>20': 0 };
    const dateMap: Record<string, number> = {};
    const heureMap: number[] = Array(24).fill(0);

    for (const m of this.malaises) {

      // TYPE
      const validTypes = ['vagal','déshydratation','hypoglycémie','chaleur','alcool','chute'];
      let t = m.type?.trim();
      if (!t || !validTypes.includes(t)) t = 'autre';
      typeMap[t] = (typeMap[t] || 0) + 1;

      // GRAVITE
      const graviteKey = m.gravite as keyof typeof graviteMap;
      if (graviteMap[graviteKey] !== undefined) graviteMap[graviteKey]++;

      // SEXE
      const sexeKey = m.sexe as keyof typeof sexeMap;
      if (sexeMap[sexeKey] !== undefined) sexeMap[sexeKey]++;

      // AGE
      if (m.age) {
        ageMap[m.age] = (ageMap[m.age] || 0) + 1;
      }

      // ZONE
      const validZones = ['milieu', 'avant_scene', 'arriere'];
      let zoneKey = m.zone?.trim();
      if (!zoneKey || !validZones.includes(zoneKey)) zoneKey = 'autre';
      zoneMap[zoneKey] = (zoneMap[zoneKey] || 0) + 1;

      // DENSITE
      const densiteKey = m.densite as keyof typeof densiteMap;
      if (densiteMap[densiteKey] !== undefined) densiteMap[densiteKey]++;

      // EVENT
      const validEvents = ['sport', 'politique', 'musique'];
      let eventKey = m.event?.trim();
      if (!eventKey || !validEvents.includes(eventKey)) eventKey = 'autre';
      eventMap[eventKey] = (eventMap[eventKey] || 0) + 1;

      // ALCOOL
      const alcoolKey = m.alcool as keyof typeof alcoolMap;
      if (alcoolMap[alcoolKey] !== undefined) alcoolMap[alcoolKey]++;

      // TEMPS
      const tempsKey = m.temps as keyof typeof tempsMap;
      if (tempsMap[tempsKey] !== undefined) tempsMap[tempsKey]++;

      // DATE
      if (m.date) {
        dateMap[m.date] = (dateMap[m.date] || 0) + 1;
      }

      // HEURE
      if (m.heure) {
        const h = parseInt(m.heure.split(':')[0], 10);
        if (!isNaN(h) && h >= 0 && h < 24) {
          heureMap[h]++;
        }
      }
    }

    // ======================
    // CHART BUILD
    // ======================

    this.typeChartData = {
      labels: Object.keys(typeMap),
      datasets: [{ label: 'Types de malaise', data: Object.values(typeMap) }]
    };

    this.graviteChartData = {
      labels: ['Faible','Modérée','Élevée'],
      datasets: [{ label: 'Gravité', data: Object.values(graviteMap) }]
    };

    this.sexeChartData = {
      labels: ['Homme','Femme','Non précisé'],
      datasets: [{ label: 'Sexe', data: Object.values(sexeMap) }]
    };

    this.ageChartData = {
      labels: Object.keys(ageMap),
      datasets: [{ label: 'Âge', data: Object.values(ageMap) }]
    };

    this.zoneChartData = {
      labels: Object.keys(zoneMap),
      datasets: [{ label: 'Zone', data: Object.values(zoneMap) }]
    };

    this.densiteChartData = {
      labels: ['Faible','Moyenne','Forte'],
      datasets: [{ label: 'Densité', data: Object.values(densiteMap) }]
    };

    this.eventChartData = {
      labels: Object.keys(eventMap),
      datasets: [{ label: 'Événement', data: Object.values(eventMap) }]
    };

    this.alcoolChartData = {
      labels: ['Faible','Modéré','Non mesuré','Élevé'],
      datasets: [{ label: 'Alcool', data: Object.values(alcoolMap) }]
    };

    this.tempsChartData = {
      labels: ['<10','10-20','>20'],
      datasets: [{ label: 'Temps', data: Object.values(tempsMap) }]
    };

    // ======================
    // EVOLUTION FIX (IMPORTANT)
    // ======================

const sortedDates = Object.keys(dateMap).sort();

this.evolutionChartData = {
  labels: sortedDates,
  datasets: [
    {
      label: 'Malaises',
      data: sortedDates.map(d => dateMap[d]),
      tension: 0
    }
  ]
};

    // ======================
    // HEURE
    // ======================

    this.heureChartData = {
      labels: Array.from({ length: 24 }, (_, i) => `${i}h`),
      datasets: [{
        label: 'Malaises',
        data: heureMap
      }]
    };
  }
}