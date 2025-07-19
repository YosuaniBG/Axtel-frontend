# AXTEL FRONTEND
Este proyecto es la interfaz frontend desarrollada en Angular para visualizar, gestionar y exportar datos de ventas, incluyendo resúmenes por país, generación de gráficas y exportación de datos a CSV.

## 🧩 Tecnologías utilizadas

- **Angular 20**
- **PrimeNG** (Componentes UI)
- **PrimeFlex** (Estilos y utilidades CSS)
- **TypeScript**
- **Chart.js** (a través de `p-chart`)
- **Bootstrap / CSS personalizado**
- **Exportación a CSV (desde el frontend)**

---

## 🚀 Funcionalidades principales

- Visualización de resumen de ventas por país
- Gráficas de barras comparativas (`<p-chart>`)
- Bandera dinámica por país (`flagcdn.com`)
- Exportación de datos a CSV
- Validaciones de los datos recibidos en el CSV
- Responsive y adaptado a escritorio/dispositivos móviles

📤 Exportación a CSV
Los datos presentes en sales[] se exportan directamente desde el frontend utilizando Blob y FileSaver, sin necesidad de intervención del backend.

📊 Visualización con Power BI
Si se desea integrar con Power BI, se puede utilizar el mismo endpoint de resumen de ventas como fuente de datos o exportar los datos en formato CSV desde el frontend.

# Axtel-frontend Preview

<img width="1908" height="862" alt="Screenshot 2025-07-19 102437" src="https://github.com/user-attachments/assets/fab8a816-8871-4dd2-8e2e-95d2e3abcf55" />

<img width="1920" height="1337" alt="screencapture-localhost-4200-2025-07-19-10_24_45" src="https://github.com/user-attachments/assets/175997ea-4594-4624-9540-c026c8d9e3d0" />

