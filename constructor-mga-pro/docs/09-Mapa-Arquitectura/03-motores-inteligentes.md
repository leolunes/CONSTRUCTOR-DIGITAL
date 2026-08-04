# 03 — Motores Inteligentes

## Propósito

Este documento describe los motores inteligentes que conforman actualmente el Constructor MGA Pro y explica la responsabilidad de cada uno dentro de la arquitectura general.

El objetivo es dejar claramente definido qué hace cada motor, cómo se integra con el Project Core y cómo interactúa con los demás componentes.

---

# Filosofía

El Constructor MGA Pro no depende de un único algoritmo.

Su inteligencia está distribuida en motores especializados que colaboran entre sí bajo la coordinación del Motor Central.

Cada motor tiene una responsabilidad específica.

---

# Arquitectura general

```text
Usuario
↓
Interfaz
↓
Motor Central
↓
Project Core
↓
Motores Inteligentes
↓
Módulos Visuales
```

---

# Motores existentes

## Cerebro MGA

### Función

Interpretar la idea inicial del proyecto y generar una primera propuesta de formulación.

### Responsabilidades

- Interpretar la necesidad.
- Identificar el sector.
- Proponer la tipología.
- Generar contenido inicial.

---

## Motor de Formulación Automática

### Función

Completar automáticamente componentes faltantes del proyecto.

### Responsabilidades

- Detectar vacíos.
- Generar información complementaria.
- Actualizar el Project Core.

---

## Panel de Cobertura MGA Web

### Función

Medir el porcentaje de avance del proyecto respecto de la estructura requerida por la MGA Web.

### Responsabilidades

- Identificar componentes completos.
- Detectar pendientes.
- Calcular cobertura.

---

## Inspector MGA

### Función

Revisar el proyecto e identificar errores, inconsistencias y omisiones.

### Responsabilidades

- Validar información.
- Detectar conflictos.
- Generar observaciones.

---

## Asesor Experto MGA

### Función

Explicar al usuario qué debe mejorar y cómo hacerlo.

### Responsabilidades

- Interpretar observaciones.
- Priorizar recomendaciones.
- Guiar la formulación.

---

## Semáforo de Radicación

### Función

Determinar el nivel de preparación del proyecto.

### Estados

- No listo.
- Requiere ajustes.
- Listo para revisión.
- Listo para MGA Web.

---

## Exportador MGA Web

### Función

Preparar la información del proyecto para facilitar su diligenciamiento en la MGA Web.

### Responsabilidades

- Organizar textos.
- Consolidar componentes.
- Facilitar la transferencia de información.

---

## Reporte Ejecutivo

### Función

Presentar un resumen técnico del estado del proyecto.

### Incluye

- Cobertura.
- Calidad.
- Estado.
- Recomendaciones.
- Próximas acciones.

---

## Motor Central

### Función

Coordinar todos los motores inteligentes.

### Componentes

- Maestro MGA.
- Motor de Razonamiento.
- Motor de Conocimiento.
- Motor de Flujo.
- Motor de Calidad.
- Motor de Aprendizaje.
- Motor de Decisiones.

---

# Relación entre motores

Cada motor conserva su responsabilidad.

El Motor Central coordina.

El Project Core almacena.

Los módulos visuales presentan resultados.

---

# Principios de integración

- No duplicar funciones.
- Compartir información mediante Project Core.
- Mantener independencia entre motores.
- Facilitar futuras ampliaciones.

---

# Evolución

Los nuevos motores deberán integrarse respetando esta arquitectura.

No deberán reemplazar los componentes existentes cuando puedan complementarlos.

---

# Estado

Documento de referencia para la arquitectura de los Motores Inteligentes del Constructor MGA Pro Versión 1.0.
