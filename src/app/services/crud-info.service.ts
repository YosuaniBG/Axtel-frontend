import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudInfoService {
    private uploadUrl = 'http://localhost:3000/crudInfo'; 

  private http = inject(HttpClient);

  saveNormalizedSales(data: any): Promise<any> {
    return lastValueFrom(this.http.post(`${this.uploadUrl}/save-sales`, data))
      .catch((error: HttpErrorResponse) => {
        console.error('Error al guardar las ventas normalizadas:', error);
        throw error;
      });
  }

  getNormalizedSales(): Promise<any>{
    return lastValueFrom(this.http.get(`${this.uploadUrl}/normalized-sales`))
      .catch((error: HttpErrorResponse) => {
        console.error('Error al intentar obtener los datos de la BD:', error);
        throw error;
      });
  }

  getSalesSummary(): Promise<any>{
    return lastValueFrom(this.http.get(`${this.uploadUrl}/summary-by-country`))
      .catch((error: HttpErrorResponse) => {
        console.error('Error al intentar obtener el resumen de ventas:', error);
        throw error;
      });
  }
}
