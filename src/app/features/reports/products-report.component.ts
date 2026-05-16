import { DecimalPipe } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { ProductDto, ReportService } from '../../core/services/report.service';

@Component({
  selector: 'app-products-report',
  standalone: true,
  imports: [DecimalPipe],
  templateUrl: './products-report.component.html',
  styleUrl: './products-report.component.scss',
})
export class ProductsReportComponent {
  private readonly reports = inject(ReportService);

  readonly loading = signal(false);
  readonly pdfLoading = signal(false);
  readonly error = signal<string | null>(null);
  readonly rows = signal<ProductDto[]>([]);

  constructor() {
    this.refresh();
  }

  refresh(): void {
    this.error.set(null);
    this.loading.set(true);
    this.reports.listProducts().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
        this.error.set('Could not load products. Is the API running?');
      },
    });
  }

  openProductDetailsPdf(): void {
    this.error.set(null);
    this.pdfLoading.set(true);
    this.reports.getProductDetailsPdfReport().subscribe({
      next: (blob) => {
        this.pdfLoading.set(false);
        const url = URL.createObjectURL(blob);
        window.open(url, '_blank', 'noopener,noreferrer');
        setTimeout(() => URL.revokeObjectURL(url), 120_000);
      },
      error: () => {
        this.pdfLoading.set(false);
        this.error.set('Could not open PDF report. Is the API running and are you signed in?');
      },
    });
  }

  downloadCsv(): void {
    const list = this.rows();
    const header = 'id,name,sku,unitPrice,createdAt';
    const body = list.map(
      (p) =>
        `${p.id},"${p.name.replace(/"/g, '""')}","${p.sku.replace(/"/g, '""')}",${p.unitPrice},${p.createdAt}`,
    );
    const csv = [header, ...body].join('\n');
    this.triggerDownload('products.csv', csv);
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
