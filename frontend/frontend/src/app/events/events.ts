import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { EventService, BraceEvent } from '../services/event.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './events.html',
  styleUrl: './events.scss',
})
export class EventsComponent implements OnInit {
  showForm = signal(false);
  loading = signal(false);
  error = signal<string | null>(null);

  nom = '';
  lieu = '';
  type = 'musique';
  date = '';
  nbBracelets = 0;

  readonly events;
  readonly activeEvent;

  readonly typeOptions = [
    { value: 'musique', label: 'Concert / Musique' },
    { value: 'sport', label: 'Sport' },
    { value: 'festival', label: 'Festival' },
    { value: 'politique', label: 'Politique / Manifestation' },
    { value: 'autre', label: 'Autre' },
  ];

  constructor(
    public eventService: EventService,
    private router: Router,
  ) {
    this.events = eventService.events;
    this.activeEvent = eventService.activeEvent;
  }

  async ngOnInit() {
    await this.eventService.loadEvents();
  }

  async createEvent() {
    if (!this.nom || !this.lieu || !this.date) {
      this.error.set('Nom, lieu et date sont requis');
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    try {
      await this.eventService.createEvent({
        nom: this.nom,
        lieu: this.lieu,
        type: this.type,
        date: this.date,
        nbBracelets: this.nbBracelets,
      });
      this.showForm.set(false);
      this.nom = '';
      this.lieu = '';
      this.date = '';
      this.nbBracelets = 0;
    } catch (e: any) {
      this.error.set(e.message);
    } finally {
      this.loading.set(false);
    }
  }

  async activate(id: string) {
    await this.eventService.activateEvent(id);
    this.router.navigate(['/design-test']);
  }

  async closeEvent(id: string) {
    if (confirm('Terminer cet événement ? Les données seront conservées mais l\'événement ne sera plus actif.')) {
      await this.eventService.closeEvent(id);
    }
  }

  statutLabel(s: string): string {
    return ({ planifie: 'Planifié', actif: 'En cours', termine: 'Terminé' } as Record<string, string>)[s] ?? s;
  }

  typeLabel(t: string): string {
    return this.typeOptions.find(o => o.value === t)?.label ?? t;
  }
}
