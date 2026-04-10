// DESIGN-TEST
import { Component, input, output } from '@angular/core';
import { BraceletExtended } from '../bracelet-extended.service';

@Component({
  selector: 'app-design-test-map',
  standalone: true,
  templateUrl: './map.component.html',
  styleUrl: './map.component.scss',
})
export class MapComponent {
  bracelets = input<BraceletExtended[]>([]);
  selected  = input<BraceletExtended | null>(null);
  braceletClick = output<BraceletExtended>();

  levelClass(l: number): string {
    return ['normal', 'attention', 'alerte', 'urgence'][l] ?? 'normal';
  }

  dotFill(l: number): string {
    return ['#22c55e', '#f59e0b', '#f97316', '#ef4444'][l] ?? '#22c55e';
  }

  pulseColor(l: number): string {
    return ['transparent', '#f59e0b', '#f97316', '#ef4444'][l] ?? 'transparent';
  }

  isSelected(b: BraceletExtended): boolean {
    return this.selected()?.id === b.id;
  }
}
