import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-inventory-report',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './inventory-report.component.html',
  styleUrl: './inventory-report.component.scss',
})
export class InventoryReportComponent {
  private readonly reports = inject(ReportService);

  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly stats = signal<{ productCount: number; sumUnitPrice: number } | null>(null);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.error.set(null);
    this.loading.set(true);
    this.reports.getInventoryStats().subscribe({
      next: (data) => {
        this.stats.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load inventory stats. Is the API running?');
      },
    });
  }

  downloadCsv(): void {
    const s = this.stats();
    if (!s) {
      return;
    }
    const header = 'metric,value';
    const rows = [
      `productCount,${s.productCount}`,
      `sumUnitPrice,${s.sumUnitPrice}`,
    ];
    this.triggerDownload('inventory-summary.csv', [header, ...rows].join('\n'));
  }

  private triggerDownload(filename: string, content: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
