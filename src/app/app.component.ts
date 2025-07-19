import { ChangeDetectorRef, Component, effect, inject, PLATFORM_ID } from '@angular/core';
import { TableModule } from 'primeng/table';
import { CommonModule } from '@angular/common';
import { FileUploadModule } from 'primeng/fileupload';
import { SkeletonModule } from 'primeng/skeleton';
import { FilesService } from './services/files.service';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from "primeng/button";
import { CrudInfoService } from './services/crud-info.service';
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-root',
  imports: [CommonModule, TableModule, FileUploadModule, SkeletonModule, DialogModule, ButtonModule, ToastModule, ChartModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  providers: [MessageService]
})
export class AppComponent {

  skeletonList = Array.from({ length: 5 }).map((_, i) => `Item #${i}`);

  sales: any[] = [];
  salesSummary: any[] = [];

  visible: boolean = false;
  loading: boolean = false;
  normalizing: boolean = false;
  normalized: boolean = false;

  private filesService = inject(FilesService);
  private crudInfoService = inject(CrudInfoService);
  private messageService = inject(MessageService);
  private cd = inject(ChangeDetectorRef);


  async onUploadFile(event: any) {
    this.loading = true;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      const file: File = event.files[0];
      const response = await this.filesService.uploadFile(file);

      await delay(2000);

      if (!this.validateCSVStructure(response.data)) {
        console.error('Estructura del archivo CSV no válida');
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'La estructura del archivo no es válida. Asegúrese de que contenga las columnas: ID_Venta, Fecha, País, Monto, Moneda.',
        });
        return;
      }

      if (response.message == "Success") {
        this.sales = response.data
      }

      if (this.checkNonUSDcurrencies(response.data)) {
        this.visible = true
      }

    } catch (error) {
      console.error('Error en la carga:', error);
    } finally {

      this.loading = false;
    }
  }

  // Función validadora, se asegura que el fichero tenga las columnas requeridas no importa si contiene otras
  // ya que solo visualizará y procesará las que son de interés
  validateCSVStructure(data: any[]): boolean {
    if (!data || data.length === 0) return false;

    const requiredHeaders = ['ID_Venta', 'Fecha', 'País', 'Monto', 'Moneda'];
    const firstRowKeys = Object.keys(data[0]);

    return requiredHeaders.every(header => firstRowKeys.includes(header));
  }

  // Esta función es para decorar la app su objetivo es identificar si hay 
  // diferentes tipos de moneda en el archivo recibido para luego aplicar una normalización
  checkNonUSDcurrencies(data: any[]): boolean {
    const currencies = new Set<string>();

    data.forEach(item => {
      if (item.Moneda) {
        currencies.add(item.Moneda.toUpperCase());
      }
    });

    if ([...currencies].some(curr => curr !== 'USD')) {
      return true
    }
    return false
  }

  // En esta función se procede a llamar al servicio de la API encargado de normalizar los datos
  // una vez normalizados se guardan automaticamente en la BD y se obtiene el resumen (ambas funciones estan separadas mas abajo)
  async normalizer() {
    this.visible = false;
    this.normalizing = true;
    this.loading = true;

    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

    try {
      const response = await this.filesService.normalizer(this.sales);

      await delay(2000);

      if (response.message == "Success") {
        this.sales = response.data
      }

      await this.saveNormalizedData(this.sales);
      await this.getSalesSummary();

      this.initCharts(this.salesSummary);

    } catch (error) {
      console.error('Error durante el proceso de normalización:', error);
    } finally {

      this.loading = false;
      this.normalized = true;
    }
  }

  async saveNormalizedData(data: any[]): Promise<void> {
    try {
      const response = await this.crudInfoService.saveNormalizedSales(data);

      if (response.message === 'Success') {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Las ventas normalizadas fueron guardadas correctamente.'
        });
      }
    } catch (error) {
      console.error('Error al guardar los datos en la base de datos:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Hubo un problema al guardar las ventas normalizadas.'
      });
    }
  }

  async getSalesSummary(): Promise<void> {
    try {
      const response = await this.crudInfoService.getSalesSummary();
      if (response.message === 'Success') {
        this.salesSummary = response.data;
        console.log('Resumen de ventas cargado:', this.salesSummary);
      }
    } catch (error) {
      console.error('Error al obtener el resumen de ventas:', error);
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'No se pudo cargar el resumen de ventas.'
      });
    }
  }

  // Función contenedora donde se estarán ejecutando los diferentes Gráficos
  initCharts(data: any) {
    this.initChartBar(data);
    this.initChartLine();
  }

  // Función decorativa para obtener los iconos de las banderas de los paises de manera dinámica
  getFlagUrl(code: string): string {
    return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
  }

  exportToCSV() {
    const headers = Object.keys(this.sales[0]);
    const csvRows = [
      headers.join(','), // encabezados
      ...this.sales.map(item =>
        headers.map(field => `"${item[field]}"`).join(',')
      )
    ];
    const csvContent = csvRows.join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'ventas_normalizadas.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    this.messageService.add({
      severity: 'success',
      summary: 'Éxito',
      detail: 'Se descargó el fichero ventas_normalizadas.csv'
    });
  }

  // ----------------------------- Chart Section ---------------------------------------------------

  basicData: any;
  basicOptions: any;
  data: any;
  options: any;

  initChartBar(data: any) {

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.basicData = {
      labels: data.map((item: any) => item.Pais),
      datasets: [
        {
          label: 'Ventas por paises',
          data: data.map((item: any) => item.Total_Ventas_USD),
          backgroundColor: [
            '#94a3b8',
            '#a7b3c2ff',
            '#e2e8f0'
          ],
          borderColor: ['#94a3b8', '#a7b3c2ff', '#e2e8f0',],
          borderWidth: 1,
          borderRadius: 10,
        },
      ],
    };

    this.basicOptions = {
      plugins: {
        legend: {
          labels: {
            color: textColor,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColorSecondary,
          },
          grid: {
            color: surfaceBorder,
          },
        },
      },
    };
    this.cd.markForCheck()
  }

  initChartLine() {
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--p-text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--p-text-muted-color');
    const surfaceBorder = documentStyle.getPropertyValue('--p-content-border-color');

    this.data = {
      labels: this.sales.map((sale: any) => sale.Fecha),
      datasets: [
        {
          label: 'Ventas por día (USD)',
          data: this.sales.map((sale: any) => sale.Monto_Normalizado),
          fill: false,
          borderColor: documentStyle.getPropertyValue('--p-gray-500'),
          tension: 0.4
        }
      ]
    };

    this.options = {
      maintainAspectRatio: false,
      aspectRatio: 0.6,
      plugins: {
        legend: {
          labels: {
            color: textColor
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        },
        y: {
          ticks: {
            color: textColorSecondary
          },
          grid: {
            color: surfaceBorder,
            drawBorder: false
          }
        }
      }
    };
    this.cd.markForCheck()
  }

}
