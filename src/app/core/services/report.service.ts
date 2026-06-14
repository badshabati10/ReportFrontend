import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { LocalLCDto } from '../models/Local-lc.model';
import { Observable } from 'rxjs';

export interface InventoryStatsDto {
  productCount: number;
  sumUnitPrice: number;
}

export interface ProductDto {
  id: number;
  name: string;
  sku: string;
  unitPrice: number;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class ReportService {
  private readonly http = inject(HttpClient);

  getInventoryStats() {
    return this.http.get<InventoryStatsDto>(`${environment.apiUrl}/api/v1/products/stats`);
  }

  listProducts() {
    return this.http.get<ProductDto[]>(`${environment.apiUrl}/api/v1/products`);
  }

  /** GET /api/v1/products/report/pdf — JWT attached by auth interceptor. */
  getProductDetailsPdfReport() {
    return this.http.get(`${environment.apiUrl}/api/v1/products/report/pdf`, {
      responseType: 'blob',
    });
  }

    /** GET /api/v1/lcdata/xml-file — JWT attached by auth interceptor. */
  getLCDataXmlReport() {
  return this.http.get(`${environment.apiUrl}/api/v1/locallc/xml-file`, {
    responseType: 'blob',
  });
}

  get_LOcal_LCXML_Data(){
    return this.http.get<LocalLCDto[]>(`${environment.apiUrl}/api/v1/locallc/all-data`);
}
  
}

