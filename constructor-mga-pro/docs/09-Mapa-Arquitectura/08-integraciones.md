# 08 — Integraciones

## Propósito

Este documento describe las integraciones existentes del Constructor MGA Pro y la forma en que los diferentes componentes colaboran para ofrecer una única plataforma de formulación de proyectos de inversión pública.

No se trata de integraciones aisladas. Todas forman parte de un mismo ecosistema soportado por Project Core y coordinado por el Motor Central.

---

# Objetivo

Garantizar que todos los módulos intercambien información de manera consistente, evitando reprocesos y manteniendo una única versión del proyecto.

---

# Principios

- Una sola fuente de verdad: Project Core.
- Una sola capa de coordinación: Motor Central.
- Módulos especializados e independientes.
- Integración antes que duplicación.

---

# Integración con MGA

Incluye:

- Cerebro MGA.
- Motor de Formulación Automática.
- Panel de Cobertura MGA Web.
- Inspector MGA.
- Asesor Experto MGA.
- Semáforo de Radicación.
- Exportador MGA Web.
- Reporte Ejecutivo.

Todos consultan el mismo Project Core.

---

# Integración con Presupuesto

Los módulos presupuestales trabajan coordinadamente con:

- Presupuesto General.
- APUs.
- Costos Directos.
- Costos Indirectos.
- Subproductos.
- Auditoría Presupuestal.

La información financiera complementa la formulación técnica.

---

# Integración con Project Core

Project Core recibe y distribuye la información del proyecto.

Todos los cambios relevantes deben terminar registrados en este componente.

---

# Integración con el Motor Central

El Motor Central coordinará:

- Razonamiento.
- Conocimiento.
- Flujo.
- Calidad.
- Aprendizaje.
- Decisiones.

No reemplaza los módulos existentes; los organiza.

---

# Integración con Catálogos y Plantillas

El Constructor reutiliza:

- Catálogos.
- Plantillas sectoriales.
- Productos MGA.
- Indicadores.
- Riesgos.
- Configuración.

Estas fuentes alimentan el Motor de Conocimiento.

---

# Integración con Documentación

La carpeta `docs/` documenta la arquitectura, reglas, motores y evolución de la plataforma.

La documentación hace parte integral del proyecto y guía futuras ampliaciones.

---

# Integración con Reportes

Los reportes consolidan información proveniente de:

- Project Core.
- Cobertura.
- Calidad.
- Inspector.
- Presupuesto.
- Semáforo.

Su función es presentar resultados, no recalcularlos.

---

# Integración con Exportaciones

El sistema permite generar información para:

- MGA Web.
- Reportes PDF.
- Reportes Excel.
- Documentación técnica.

---

# Integración con la PWA

La aplicación mantiene integración con:

- Manifest.
- Service Worker.
- Almacenamiento local.
- Persistencia del proyecto.

Esto facilita el trabajo continuo del formulador.

---

# Beneficios

- Plataforma unificada.
- Información consistente.
- Menor duplicidad.
- Mejor mantenimiento.
- Mayor escalabilidad.

---

# Estado

Documento de referencia para las integraciones del Constructor MGA Pro Versión 1.0.
