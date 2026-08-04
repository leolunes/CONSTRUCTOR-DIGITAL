# 07 — Dependencias

## Propósito

Este documento identifica las dependencias funcionales entre los módulos del Constructor MGA Pro.

Su objetivo es conocer qué componentes consumen información de otros, cuáles son críticos para la operación de la plataforma y cómo deben evolucionar sin romper la arquitectura existente.

---

# Principio general

Toda dependencia debe ser:

- Explícita.
- Documentada.
- Reutilizable.
- Basada en Project Core.

Se debe evitar que un módulo dependa directamente de la lógica interna de otro cuando esa información pueda obtenerse desde Project Core o mediante el Motor Central.

---

# Dependencias principales

## Project Core

Es el componente con mayor nivel de dependencia.

Es utilizado por:

- Cerebro MGA.
- Motor de Formulación Automática.
- Panel de Cobertura MGA.
- Inspector MGA.
- Asesor Experto MGA.
- Semáforo de Radicación.
- Exportador MGA.
- Reporte Ejecutivo.
- Módulos de Presupuesto.
- APUs.
- Motor Central.

Ninguno de estos componentes debe mantener una copia permanente del proyecto.

---

## Motor Central

Coordina la interacción entre los motores inteligentes.

Depende de:

- Project Core.
- Motores especializados.
- Catálogos.
- Plantillas.
- Configuración.

Es consumido por:

- Inspector MGA.
- Asesor Experto.
- Reporte Ejecutivo.
- Semáforo.
- Exportador.
- Futuros módulos inteligentes.

---

## Módulos MGA

Dependen de:

- Project Core.
- Motor Central.
- Catálogos.
- Plantillas.
- Documentos.

---

## Módulos de Presupuesto

Dependen de:

- Project Core.
- Base de APUs.
- Presupuesto.
- Costos Directos.
- Costos Indirectos.
- Subproductos.

Comparten información con:

- Cronograma.
- Actividades.
- Reportes.
- Exportador.

---

## Reportes

Consumen información de:

- Project Core.
- Cobertura.
- Inspector.
- Calidad.
- Semáforo.
- Presupuesto.

No deben recalcular información; únicamente consolidarla y presentarla.

---

# Dependencias permitidas

```text
Interfaz
      ↓
Motor Central
      ↓
Project Core
      ↓
Motores especializados
      ↓
Módulos funcionales
      ↓
Reportes
```

---

# Dependencias no permitidas

No se recomienda:

- Duplicar reglas de negocio.
- Acceder directamente a estructuras privadas de otros módulos.
- Mantener estados paralelos del proyecto.
- Copiar información permanente fuera del Project Core.

---

# Gestión de cambios

Cuando un módulo evolucione deberán revisarse sus dependencias para garantizar:

- Compatibilidad.
- Integridad.
- Sincronización.
- Trazabilidad.

---

# Beneficios

- Facilita el mantenimiento.
- Reduce errores de integración.
- Evita duplicidades.
- Permite ampliar la plataforma con menor riesgo.

---

# Estado

Documento de referencia para las dependencias del Constructor MGA Pro Versión 1.0.
