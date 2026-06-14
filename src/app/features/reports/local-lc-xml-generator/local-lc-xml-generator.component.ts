import { DecimalPipe } from '@angular/common';
import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LocalLCDto } from '../../../core/models/Local-lc.model';
import { ReportService } from '../../../core/services/report.service';

@Component({
  selector: 'app-local-lc-xml-generator',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './local-lc-xml-generator.component.html',
  styleUrls: ['./local-lc-xml-generator.component.scss']
})
export class LocalLcXmlGeneratorComponent implements OnInit {

  private readonly reports = inject(ReportService);

  displayedColumns: string[] = [
    'SLNO', 'LC_TYPE', 'BENEFICIARY_NAME', 'BENEFICIARY_ADDRESS',
    'LC_YEAR', 'LC_DATE', 'LC_EXPIRY_DATE', 'LC_VALUE'
  ];

  readonly rows = signal<LocalLCDto[]>([]);
  readonly loading = signal(false);
  readonly xmlLoading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.refresh();
  }

  refresh(): void {
    this.error.set(null);
    this.loading.set(true);
    this.reports.get_LOcal_LCXML_Data().subscribe({
      next: (data) => {
        this.rows.set(data);
        this.loading.set(false);
        console.log('Local LC Data loaded:', data);
      },
      error: (err) => {
        this.loading.set(false);
        this.error.set('Could not load data. Is the API running?');
        console.error('Error loading data', err);
      },
    });
  }

  downloadXml(): void {
    this.error.set(null);
    this.xmlLoading.set(true);
    this.reports.getLCDataXmlReport().subscribe({
      next: (blob) => {
        this.xmlLoading.set(false);
        this.triggerDownloadBlob('LocalLC-Data.xml', blob);
      },
      error: () => {
        this.xmlLoading.set(false);
        this.error.set('Could not download XML. Is the API running and are you signed in?');
      },
    });
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

