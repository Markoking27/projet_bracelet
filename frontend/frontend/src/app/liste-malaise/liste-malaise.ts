import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MalaiseService } from '../services/malaise.service';

@Component({
  selector: 'app-liste-malaise',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './liste-malaise.html',
  styleUrl: './liste-malaise.scss'
})
export class ListeMalaise {

  constructor(public malaiseService: MalaiseService) {}

}

