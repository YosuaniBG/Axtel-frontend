import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { lastValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilesService {
    private uploadUrl = 'http://localhost:3000/fileProcess';

  private http = inject(HttpClient);

  uploadFile(file: File): Promise<any> {
    const formData = new FormData();
    formData.append('file', file);

    return lastValueFrom(this.http.post(`${this.uploadUrl}/upload`, formData))
      .catch((error: HttpErrorResponse) => {
        console.error('Error al subir archivo:', error);
        throw error;
      });
  }

  normalizer(data: any): Promise<any>{
    return lastValueFrom(this.http.post(`${this.uploadUrl}/normalize-sales?target=USD`, data))
      .catch((error: HttpErrorResponse) => {
        console.error('Error al intentar normalizar los datos:', error);
        throw error;
      });
  }
}
