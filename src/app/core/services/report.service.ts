import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';

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
}
