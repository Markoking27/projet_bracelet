import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MalaiseService } from '../services/malaise.service';

@Component({
  selector: 'app-formulaire-malaise',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './formulaire-malaise.html',
  styleUrl: './formulaire-malaise.scss'
})
export class FormulaireMalaise {

  form: FormGroup;
  submitted = false;

  heures = Array.from({ length: 24 }, (_, i) => i);
  minutes = Array.from({ length: 60 }, (_, i) => i);

  constructor(private fb: FormBuilder, private malaiseService: MalaiseService) {
    this.form = this.fb.group({

      // Typologie
      typeMalaise: ['', Validators.required],
      autreType: [''],

      // Profil
      sexe: ['', Validators.required],
      trancheAge: ['', Validators.required],

      // Contexte spatial
      zone: ['', Validators.required],
      zoneDetail: [''],
      densite: ['', Validators.required],

      // Contexte événementiel
      typeEvent: ['', Validators.required],
      autreEvent: [''],
      sousType: [''],

      // Gravité
      gravite: ['', Validators.required],

      // Intervention
      intervention: ['', Validators.required],
      tempsPrise: ['', Validators.required],
      alcool: ['', Validators.required],

      // Heure
      heure: ['', Validators.required],
      minute: ['', Validators.required],
    });
  }

  onSubmit() {
  this.submitted = true;

  if (this.form.valid) {

    const today = new Date();

    const newMalaise = {
      date: today.toISOString().split('T')[0],

      type: this.form.value.typeMalaise === 'autre'
        ? this.form.value.autreType
        : this.form.value.typeMalaise,

      age: this.form.value.trancheAge,
      sexe: this.form.value.sexe,

      zone: this.form.value.zone === 'annexe'
        ? this.form.value.zoneDetail
        : this.form.value.zone,

      densite: this.form.value.densite,

      event: this.form.value.typeEvent === 'autre'
        ? this.form.value.autreEvent
        : this.form.value.typeEvent,

      gravite: this.form.value.gravite,
      intervention: this.form.value.intervention,

      heure: `${this.form.value.heure}:${this.form.value.minute}`
    };

    this.malaiseService.addMalaise(newMalaise);

    this.form.reset();
    this.submitted = false;
  }
}

  isInvalid(control: string) {
    return !!(this.form.get(control)?.invalid && this.submitted);
  }
}