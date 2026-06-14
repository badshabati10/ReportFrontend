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
  readonly downloadDropdownOpen = signal(false);
  private closeDropdownTimer?: ReturnType<typeof setTimeout>;

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
    const list = this.rows();
    const header = 'id,name,sku,unitPrice,createdAt';
    const body = list.map(
      (p) =>
        `${p.id},"${p.name.replace(/"/g, '""')}","${p.sku.replace(/"/g, '""')}",${p.unitPrice},${p.createdAt}`,
    );
    const csv = [header, ...body].join('\n');
    this.triggerDownload('products.csv', csv, 'text/csv');
    this.closeDownloadDropdown();
  }

  downloadXml(): void {
    const list = this.rows();
    const items = list
      .map(
        (p) => `  <product>
    <id>${this.escapeXml(String(p.id))}</id>
    <name>${this.escapeXml(p.name)}</name>
    <sku>${this.escapeXml(p.sku)}</sku>
    <unitPrice>${this.escapeXml(String(p.unitPrice))}</unitPrice>
    <createdAt>${this.escapeXml(p.createdAt)}</createdAt>
  </product>`,
      )
      .join('\n');
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<products>
${items}
</products>`;
    this.triggerDownload('products.xml', xml, 'application/xml');
    this.closeDownloadDropdown();
  }

  downloadExcel(): void {
    const list = this.rows();
    const rowsXml = list
      .map(
        (p) => `      <Row>
        <Cell><Data ss:Type="Number">${p.id}</Data></Cell>
        <Cell><Data ss:Type="String">${this.escapeXml(p.name)}</Data></Cell>
        <Cell><Data ss:Type="String">${this.escapeXml(p.sku)}</Data></Cell>
        <Cell><Data ss:Type="Number">${p.unitPrice}</Data></Cell>
        <Cell><Data ss:Type="String">${this.escapeXml(p.createdAt)}</Data></Cell>
      </Row>`,
      )
      .join('\n');
    const xml = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">
  <Worksheet ss:Name="Products">
    <Table>
      <Row>
        <Cell><Data ss:Type="String">ID</Data></Cell>
        <Cell><Data ss:Type="String">Name</Data></Cell>
        <Cell><Data ss:Type="String">SKU</Data></Cell>
        <Cell><Data ss:Type="String">Unit Price</Data></Cell>
        <Cell><Data ss:Type="String">Created At</Data></Cell>
      </Row>
${rowsXml}
    </Table>
  </Worksheet>
</Workbook>`;
    this.triggerDownload('products.xls', xml, 'application/vnd.ms-excel');
    this.closeDownloadDropdown();
  }

  downloadPdf(): void {
    this.error.set(null);
    this.pdfLoading.set(true);
    this.reports.getProductDetailsPdfReport().subscribe({
      next: (blob) => {
        this.pdfLoading.set(false);
        this.triggerDownloadBlob('products-report.pdf', blob);
        this.closeDownloadDropdown();
      },
      error: () => {
        this.pdfLoading.set(false);
        this.error.set('Could not download PDF report. Is the API running and are you signed in?');
      },
    });
  }

  // product.component.ts

 downloadXmlReport(): void {

    this.reports.getLCDataXmlReport().subscribe({
      next: (response: Blob) => {

        const blob = new Blob([response], {
          type: 'application/xml'
        });

        const downloadURL = window.URL.createObjectURL(blob);

        const link = document.createElement('a');

        link.href = downloadURL;

        // file name
        link.download = 'LCData.xml';

        // trigger download
        link.click();

        // cleanup
        window.URL.revokeObjectURL(downloadURL);
      },

      error: (error) => {
        console.error('Error downloading XML report:', error);
      }
    });
  }


  private escapeXml(str: string): string {
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
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

  private triggerDownloadBlob(filename: string, blob: Blob): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  }
}
