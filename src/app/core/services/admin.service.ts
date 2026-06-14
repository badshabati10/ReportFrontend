import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RoleDto {
  id: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class AdminService {
  private readonly http = inject(HttpClient);

  getRoles(): Observable<RoleDto[]> {
    return this.http.get<RoleDto[]>(`${environment.apiUrl || ''}/api/v1/users/roles`);
  }

  createUser(payload: { username: string; password: string; roles?: string[] }) {
    return this.http.post(`${environment.apiUrl || ''}/api/v1/admin/users`, payload);
  }
}
