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

  constructor(private fb: FormBuilder, private malaiseService: MalaiseService) {
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
    const today = new Date();

    const newMalaise = {
      date: today.toISOString().split('T')[0],
      type: this.form.value.typeMalaise === 'autre' ? this.form.value.autreType : this.form.value.typeMalaise,
      age: this.form.value.trancheAge,
      sexe: this.form.value.sexe,
      zone: this.form.value.zone === 'annexe' ? this.form.value.zoneDetail : this.form.value.zone,
      densite: this.form.value.densite,
      event: this.form.value.typeEvent === 'autre' ? this.form.value.autreEvent : this.form.value.typeEvent,
      gravite: this.form.value.gravite,
      intervention: this.form.value.intervention,
      heure: `${this.form.value.heure}:${String(this.form.value.minute).padStart(2, '0')}`,
    };

    await this.malaiseService.addMalaise(newMalaise);

    this.saving = false;
    this.saved = true;
    this.form.reset();
    this.submitted = false;
    setTimeout(() => (this.saved = false), 3000);
  }

  isInvalid(control: string) {
    return !!(this.form.get(control)?.invalid && this.submitted);
  }
}
