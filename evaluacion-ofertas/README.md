# APP EVALUACIÓN DE OFERTAS

Aplicación desarrollada para apoyar la evaluación de ofertas en procesos de contratación pública, con énfasis en:

- Identificación de ofertas artificialmente bajas (OAB)
- Gestión de decisiones del comité evaluador
- Aplicación de los métodos de ponderación económica de pliegos tipo
- Generación de informes en PDF
- Funcionamiento local tipo PWA

---

## 1. Objetivo

Esta app permite registrar propuestas, evaluar posibles precios artificialmente bajos, depurar las ofertas aceptadas y aplicar la evaluación económica según los métodos contemplados en pliegos tipo:

1. Mediana con valor absoluto  
2. Media geométrica  
3. Media aritmética baja  
4. Menor valor  

La selección del método económico se determina con base en los centavos de la TRM.

---

## 2. Estructura del proyecto

```text
CONSTRUCTOR-DIGITAL/
│
├── evaluacion-ofertas/
│   ├── assets/
│   │   ├── bg-header.png
│   │   ├── icon-192.svg
│   │   ├── icon-512.svg
│   │   └── logo.svg
│   │
│   ├── css/
│   │   └── styles.css
│   │
│   ├── js/
│   │   ├── app.js
│   │   ├── calc.js
│   │   ├── db.js
│   │   ├── economica.js
│   │   ├── oab.js
│   │   ├── pdf.js
│   │   ├── report.js
│   │   ├── storage.js
│   │   ├── trm.js
│   │   ├── ui.js
│   │   └── validators.js
│   │
│   ├── pwa/
│   │   ├── manifest.webmanifest
│   │   └── sw.js
│   │
│   ├── economica.html
│   ├── index.html
│   ├── informes.html
│   ├── oab.html
│   ├── ofertas.html
│   └── README.md
```

---

## 3. Funcionalidades principales

### 3.1 Registro del proceso
Permite registrar:
- nombre o número del proceso
- objeto
- entidad
- presupuesto oficial
- TRM
- puntaje máximo por valor de oferta
- fecha de evaluación
- observaciones

### 3.2 Registro de ofertas
Permite agregar cualquier cantidad de ofertas manualmente:
- nombre del proponente
- valor ofertado

### 3.3 Evaluación OAB
La app calcula:
- promedio
- mediana
- desviación estándar
- valor mínimo aceptable
- límite absoluto

Clasifica inicialmente cada oferta como:
- SIGUE EN CURSO
- POSIBLE OAB - REQUERIR SUSTENTACIÓN

### 3.4 Decisión del comité
Permite definir:
- si respondió la sustentación
- si el sustento fue válido
- si la oferta queda:
  - ACEPTADA
  - PENDIENTE
  - RECHAZADA

### 3.5 Evaluación económica
Sobre las ofertas finalmente aceptadas, la app aplica el método económico determinado por la TRM:
- MEDIANA
- GEOMETRICA
- ARITMETICA_BAJA
- MENOR_VALOR

Calcula:
- puntaje por oferta
- ranking
- mejor oferta económica

### 3.6 Informes
La app genera:
- informe básico
- informe técnico
- informe final de adjudicación
- PDF de ofertas
- PDF económico
- PDF final

---

## 4. Lógica de evaluación económica

### 4.1 Selección del método por TRM
La app toma los decimales de la TRM y define el método así:

- 0.00 a 0.24 → Mediana con valor absoluto
- 0.25 a 0.49 → Media geométrica
- 0.50 a 0.74 → Media aritmética baja
- 0.75 a 0.99 → Menor valor

### 4.2 Puntaje máximo
La app no asume un puntaje fijo de 100.

El usuario debe ingresar manualmente el valor de:
**puntaje máximo por valor de oferta**

Y sobre ese valor se realizan los cálculos.

---

## 5. Uso de la app

### Paso 1
Abrir `index.html`

### Paso 2
Registrar los datos del proceso.

### Paso 3
Agregar las ofertas.

### Paso 4
Ejecutar la evaluación de ofertas artificialmente bajas.

### Paso 5
Definir las decisiones del comité:
- aceptada
- rechazada
- pendiente

### Paso 6
Registrar la TRM y el puntaje máximo.

### Paso 7
Ejecutar la evaluación económica.

### Paso 8
Generar los informes o exportarlos en PDF.

---

## 6. Archivos clave

### `db.js`
Base de datos principal de la app.

### `storage.js`
Guarda y recupera datos desde `localStorage`.

### `calc.js`
Funciones matemáticas generales.

### `oab.js`
Lógica de ofertas artificialmente bajas.

### `trm.js`
Selección del método según la TRM.

### `economica.js`
Aplicación de las fórmulas de ponderación económica.

### `report.js`
Generación de textos automáticos para informes.

### `pdf.js`
Emisión de informes en PDF.

### `ui.js`
Render de la información en pantalla.

### `validators.js`
Validaciones generales.

### `app.js`
Controlador principal de la aplicación.

---

## 7. Requisitos para funcionar

La app funciona en navegador moderno.

### Librerías externas usadas:
- `jsPDF`
- `jspdf-autotable`

Se cargan desde CDN en los archivos HTML.

---

## 8. PWA

La aplicación incluye:
- `manifest.webmanifest`
- `sw.js`

Esto permite:
- instalación local
- funcionamiento básico offline
- caché de archivos principales

---

## 9. Recomendaciones de uso

- Usar un servidor local en Visual Studio Code, por ejemplo:
  - Live Server
- Verificar que los archivos estén ubicados en las rutas correctas.
- No mover los archivos de carpeta sin ajustar las rutas.
- Validar siempre:
  - presupuesto oficial
  - TRM
  - puntaje máximo
  - estado definitivo de las ofertas

---

## 10. Observación importante

La app apoya el análisis técnico y matemático, pero no reemplaza el criterio jurídico ni la competencia del comité evaluador.

Las decisiones finales deben sustentarse en:
- documentos del proceso
- respuestas del proponente
- análisis de sostenibilidad
- revisión técnica y jurídica

---

## 11. Autor / Proyecto

Proyecto desarrollado dentro de la carpeta:
**CONSTRUCTOR-DIGITAL**

Módulo:
**Evaluación de ofertas**

