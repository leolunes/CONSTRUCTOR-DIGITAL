# 05 — Módulos de Presupuesto

## Propósito

Este documento describe los módulos de presupuesto integrados en el Constructor MGA Pro y explica cómo se relacionan con la formulación técnica del proyecto.

Estos componentes provienen de la evolución del proyecto **presupuesto-pro**, el cual fue integrado y ampliado hasta convertirse en una parte fundamental del Constructor MGA Pro.

Su finalidad es garantizar que la formulación técnica y la estructuración financiera del proyecto trabajen de forma coordinada.

---

# Objetivo

Integrar la formulación MGA con el presupuesto detallado del proyecto, permitiendo que ambos componentes compartan información mediante el Project Core.

---

# Principios

- El presupuesto forma parte del proyecto.
- Toda actividad debe poder relacionarse con costos.
- Todo producto debe poder justificarse financieramente.
- El presupuesto debe mantenerse sincronizado con la formulación.

---

# Componentes principales

## Presupuesto General

Administra la estructura presupuestal del proyecto.

Incluye:

- Capítulos.
- Ítems.
- Cantidades.
- Unidades.
- Precios unitarios.
- Valores parciales.
- Valor total.

---

## APUs

Permite administrar los Análisis de Precios Unitarios asociados a cada actividad.

Incluye:

- Materiales.
- Mano de obra.
- Equipos.
- Transporte.
- Rendimientos.
- Costos unitarios.

---

## Base de APUs

Constituye el banco de análisis reutilizables.

Permite:

- Buscar APUs.
- Copiar APUs.
- Editar APUs por proyecto.
- Mantener una base independiente del proyecto.

---

## Costos Directos

Calcula automáticamente:

- Materiales.
- Mano de obra.
- Equipos.
- Subproductos.

---

## Costos Indirectos

Gestiona:

- Administración.
- Imprevistos.
- Utilidad.
- IVA sobre utilidad.
- Otros costos indirectos definidos por el formulador.

---

## Subproductos

Permite definir componentes intermedios reutilizables dentro de varios APUs.

---

## Auditoría Presupuestal

Facilita la comparación entre:

- Presupuesto Base.
- Presupuesto Oficial.

Permite identificar diferencias en:

- Cantidades.
- Precios.
- Costos.
- Capítulos.
- Valores finales.

---

## Exportación

El módulo permite generar:

- PDF del presupuesto.
- PDF con APUs.
- Reportes.
- Resúmenes.
- Exportación a Excel.
- Exportación de datos del proyecto.

---

# Integración con MGA

Los módulos presupuestales se relacionan directamente con:

- Productos.
- Actividades.
- Cronograma.
- Fuentes de financiación.
- Reporte Ejecutivo.
- Semáforo.
- Exportador MGA.

De esta manera la formulación técnica y el presupuesto permanecen sincronizados.

---

# Relación con Project Core

El Project Core conserva la información general del proyecto.

Los módulos de presupuesto almacenan la información especializada y comparten con Project Core únicamente los datos necesarios para la formulación, evaluación y generación de reportes.

---

# Beneficios

- Integración entre formulación y presupuesto.
- Reutilización de APUs.
- Mayor precisión financiera.
- Reducción de reprocesos.
- Generación de reportes técnicos y financieros consistentes.

---

# Estado

Documento de referencia para los módulos de Presupuesto del Constructor MGA Pro Versión 1.0.
