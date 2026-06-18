import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MalaiseService } from '../services/malaise.service';
import { EventService, BraceEvent } from '../services/event.service';

@Component({
  selector: 'app-liste-malaise',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './liste-malaise.html',
  styleUrl: './liste-malaise.scss',
})
export class ListeMalaise implements OnInit {
  events: BraceEvent[] = [];
  selectedEventId = '';
  loading = false;

  constructor(
    public malaiseService: MalaiseService,
    private eventService: EventService,
  ) {}

  async ngOnInit() {
    await this.eventService.loadEvents();
    this.events = this.eventService.events();
    const active = this.eventService.activeEvent();
    this.selectedEventId = active?.id ?? '';
    await this.reload();
  }

  async onEventChange() {
    await this.reload();
  }

  private async reload() {
    this.loading = true;
    await this.malaiseService.loadMalaisesForEvent(this.selectedEventId || null);
    this.loading = false;
  }
}
