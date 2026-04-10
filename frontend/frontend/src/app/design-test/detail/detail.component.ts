// DESIGN-TEST
import { Component, input, output } from '@angular/core';
import { BraceletExtended } from '../bracelet-extended.service';

@Component({
  selector: 'app-design-test-detail',
  standalone: true,
  templateUrl: './detail.component.html',
  styleUrl: './detail.component.scss',
})
export class DetailComponent {
  bracelet = input.required<BraceletExtended>();
  close = output<void>();

  levelLabel(l: number): string {
    return ['NORMAL', 'ATTENTION', 'ALERTE', 'URGENCE'][l] ?? '—';
  }

  levelClass(l: number): string {
    return ['normal', 'attention', 'alerte', 'urgence'][l] ?? '';
  }

  /** Builds an SVG polyline path string from an array of values */
  buildPath(values: number[], w: number, h: number, pad = 3): string {
    if (!values || values.length < 2) return '';
    const min = Math.min(...values) - pad;
    const max = Math.max(...values) + pad;
    const range = max - min || 1;
    return values
      .map((v, i) => {
        const x = (i / (values.length - 1)) * w;
        const y = h - 4 - ((v - min) / range) * (h - 8);
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');
  }

  /** Builds a closed area path for gradient fill */
  buildArea(values: number[], w: number, h: number, pad = 3): string {
    const line = this.buildPath(values, w, h, pad);
    if (!line) return '';
    return `${line} L ${w} ${h} L 0 ${h} Z`;
  }

  minVal(arr: number[]): number { return arr?.length ? Math.min(...arr) : 0; }
  maxVal(arr: number[]): number { return arr?.length ? Math.max(...arr) : 0; }

  rssiBar(value: number): number {
    // RSSI is -20 (strong) to -100 (weak) — map to 0-100%
    return Math.round(clamp(((value + 100) / 80) * 100, 0, 100));
  }
}

function clamp(v: number, a: number, b: number): number {
  return Math.min(Math.max(v, a), b);
}
