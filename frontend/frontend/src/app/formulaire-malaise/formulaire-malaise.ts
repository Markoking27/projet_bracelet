import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MalaiseService } from '../services/malaise.service';

@Component({
  selector: 'app-formulaire-malaise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulaire-malaise.html',
  styleUrl: './formulaire-malaise.scss',
})
export class FormulaireMalaise {
  form: FormGroup;
  submitted = false;
  saving = false;
  saved = false;

  heures = Array.from({ length: 24 }, (_, i) => i);
  minutes = Array.from({ length: 60 }, (_, i) => i);

  constructor(
    private fb: FormBuilder,
    private malaiseService: MalaiseService
  ) {
    this.form = this.fb.group({
      typeMalaise: ['', Validators.required],
      autreType: [''],
      sexe: ['', Validators.required],
      trancheAge: ['', Validators.required],
      zone: ['', Validators.required],
      zoneDetail: [''],
      densite: ['', Validators.required],
      typeEvent: ['', Validators.required],
      autreEvent: [''],
      sousType: [''],
      gravite: ['', Validators.required],
      intervention: ['', Validators.required],
      tempsPrise: ['', Validators.required],
      alcool: ['', Validators.required],
      heure: ['', Validators.required],
      minute: ['', Validators.required],
    });
  }

  async onSubmit() {
  this.submitted = true;
  if (!this.form.valid) return;

  this.saving = true;

  const activeEvent = this.malaiseService['eventService'].activeEvent?.();

  const today = new Date();

  const newMalaise = {
    // 📅 DATE : event actif sinon date du jour
    date: activeEvent
      ? activeEvent.date
      : today.toISOString().split('T')[0],

    // 🕒 HEURE : format SQL TIME (HH:MM:SS)
    heure:
      `${String(this.form.value.heure).padStart(2, '0')}:` +
      `${String(this.form.value.minute).padStart(2, '0')}:00`,

    // 🧠 TYPE
    type:
      this.form.value.typeMalaise === 'autre'
        ? this.form.value.autreType
        : this.form.value.typeMalaise,

    // 👤 PROFIL
    age: this.form.value.trancheAge,
    sexe: this.form.value.sexe,

    // 📍 ZONE
    zone:
      this.form.value.zone === 'annexe'
        ? this.form.value.zoneDetail
        : this.form.value.zone,

    // 👥 DENSITÉ
    densite: this.form.value.densite,

    // 🎪 EVENT (type)
    event:
      this.form.value.typeEvent === 'autre'
        ? this.form.value.autreEvent
        : this.form.value.typeEvent,

    // 🚨 GRAVITÉ
    gravite: this.form.value.gravite,

    // 🚑 INTERVENTION
    intervention: this.form.value.intervention,

    // ⏱ TEMPS PRISE EN CHARGE
    temps: this.form.value.tempsPrise,

    // 🍺 ALCOOL
    alcool: this.form.value.alcool,

    // 🏷 NOM ÉVÉNEMENT ACTIF (ou vide)
    evenement: activeEvent ? activeEvent.nom : ''
  };

  try {
    await this.malaiseService.addMalaise(newMalaise);

    this.saved = true;
    this.form.reset();
    this.submitted = false;

    setTimeout(() => (this.saved = false), 3000);

  } catch (err) {
    console.error('Erreur insertion Supabase:', err);
  } finally {
    this.saving = false;
  }
}

isInvalid(control: string): boolean {
  return !!(
    this.form.get(control)?.invalid &&
    this.submitted
  );
}

}
