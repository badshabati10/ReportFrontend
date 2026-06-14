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
  readonly downloadDropdownOpen = signal(false);
  private closeDropdownTimer?: ReturnType<typeof setTimeout>;

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

  toggleDownloadDropdown(): void {
    this.downloadDropdownOpen.update((open) => !open);
  }

  openDownloadDropdown(): void {
    if (this.closeDropdownTimer) {
      clearTimeout(this.closeDropdownTimer);
      this.closeDropdownTimer = undefined;
    }
    this.downloadDropdownOpen.set(true);
  }

  closeDownloadDropdown(): void {
    if (this.closeDropdownTimer) {
      clearTimeout(this.closeDropdownTimer);
    }
    this.closeDropdownTimer = setTimeout(() => {
      this.downloadDropdownOpen.set(false);
    }, 140);
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
    this.triggerDownload('inventory-summary.csv', [header, ...rows].join('\n'), 'text/csv');
    this.closeDownloadDropdown();
  }

  downloadXml(): void {
    const s = this.stats();
    if (!s) {
      return;
    }
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<inventory>
  <stats>
    <productCount>${s.productCount}</productCount>
    <sumUnitPrice>${s.sumUnitPrice}</sumUnitPrice>
  </stats>
</inventory>`;
    this.triggerDownload('inventory-summary.xml', xml, 'application/xml');
    this.closeDownloadDropdown();
  }

  downloadExcel(): void {
    const s = this.stats();
    if (!s) {
      return;
    }
    const xml = `<?xml version="1.0"?>\n<?mso-application progid="Excel.Sheet"?>\n<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n  <Worksheet ss:Name="Inventory">\n    <Table>\n      <Row>\n        <Cell><Data ss:Type="String">Metric</Data></Cell>\n        <Cell><Data ss:Type="String">Value</Data></Cell>\n      </Row>\n      <Row>\n        <Cell><Data ss:Type="String">Product count</Data></Cell>\n        <Cell><Data ss:Type="Number">${s.productCount}</Data></Cell>\n      </Row>\n      <Row>\n        <Cell><Data ss:Type="String">Sum of unit prices</Data></Cell>\n        <Cell><Data ss:Type="Number">${s.sumUnitPrice}</Data></Cell>\n      </Row>\n    </Table>\n  </Worksheet>\n</Workbook>`;
    this.triggerDownload('inventory-summary.xls', xml, 'application/vnd.ms-excel');
    this.closeDownloadDropdown();
  }

  downloadPdf(): void {
    const s = this.stats();
    if (!s) {
      return;
    }
    const pdf = this.createSimplePdf(`Inventory Summary\nProduct count: ${s.productCount}\nSum of unit prices: ${s.sumUnitPrice}`);
    this.triggerDownloadBlob('inventory-summary.pdf', pdf, 'application/pdf');
    this.closeDownloadDropdown();
  }

  private createSimplePdf(text: string): Blob {
    const escaped = text.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
    const lines = [
      '%PDF-1.3',
      '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
      '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
      '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >> endobj',
      '4 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
    ];
    const content = `BT /F1 14 Tf 72 760 Td (${escaped.split('\n')[0]}) Tj${escaped
      .split('\n')
      .slice(1)
      .map((line) => ` 0 -18 Td (${line}) Tj`)
      .join('')} ET`;
    lines.push(`5 0 obj << /Length ${content.length} >> stream`, content, 'endstream endobj');
    const xrefStart = lines.reduce((sum, line) => sum + line.length + 1, 0);
    const xref = ['xref', '0 6', '0000000000 65535 f '];
    let offset = 0;
    for (let i = 0; i < 5; i += 1) {
      const obj = `${i + 1} 0 obj`;
      const index = lines.indexOf(lines.find((line) => line.startsWith(`${i + 1} 0 obj`)) ?? '');
      if (index !== -1) {
        const position = lines.slice(0, index).reduce((sum, line) => sum + line.length + 1, 0);
        xref.push(String(position).padStart(10, '0') + ' 00000 n ');
      }
    }
    const footer = ['trailer << /Size 6 /Root 1 0 R >>', `startxref ${xrefStart}`, '%%EOF'];
    const pdfString = [...lines, ...xref, ...footer].join('\n');
    return new Blob([pdfString], { type: 'application/pdf' });
  }

  private triggerDownloadBlob(filename: string, blob: Blob, mimeType: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }

  private triggerDownload(filename: string, content: string, mimeType: string): void {
    const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
