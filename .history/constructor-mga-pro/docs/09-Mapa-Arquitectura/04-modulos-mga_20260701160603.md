# 04 — Módulos MGA

## Propósito

Este documento describe los módulos especializados de MGA Web que forman parte del Constructor MGA Pro.

Estos módulos constituyen la capa funcional encargada de formular, revisar, evaluar y preparar un proyecto de inversión pública para su diligenciamiento en la MGA Web.

---

# Objetivo

Integrar todos los componentes especializados de MGA bajo una arquitectura coordinada, reutilizando el Project Core y el Motor Central.

---

# Principios

- Cada módulo tiene una responsabilidad específica.
- Todos trabajan sobre el mismo Project Core.
- Ningún módulo duplica funciones de otro.
- El Motor Central coordina su ejecución.

---

# Módulos actuales

## Cerebro MGA

### Función

Interpretar la idea inicial del usuario y proponer la estructura base del proyecto.

### Responsabilidades

- Analizar la descripción del proyecto.
- Identificar sector y tipología.
- Generar una propuesta inicial.

---

## Motor de Formulación Automática

### Función

Completar automáticamente componentes faltantes.

### Responsabilidades

- Detectar vacíos.
- Formular contenido.
- Actualizar Project Core.

---

## Panel de Cobertura MGA Web

### Función

Medir el porcentaje de avance de la formulación frente a la estructura esperada por la MGA Web.

### Resultado

- Cobertura total.
- Componentes completos.
- Componentes pendientes.

---

## Inspector MGA

### Función

Realizar una revisión técnica del proyecto.

### Verifica

- Campos incompletos.
- Inconsistencias.
- Errores.
- Observaciones.

---

## Asesor Experto MGA

### Función

Orientar al formulador.

### Genera

- Explicaciones.
- Recomendaciones.
- Acciones sugeridas.
- Prioridades.

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

Preparar los textos y la información para facilitar el diligenciamiento en MGA Web.

### Incluye

- Diagnóstico.
- Objetivos.
- Productos.
- Actividades.
- Indicadores.
- Riesgos.
- Documentos.

---

## Reporte Ejecutivo

### Función

Presentar un resumen técnico del proyecto.

### Contenido

- Estado.
- Cobertura.
- Calidad.
- Hallazgos.
- Recomendaciones.
- Próximas acciones.

---

# Relación entre módulos

Todos los módulos utilizan:

```text
Project Core
```

y son coordinados por:

```text
Motor Central
```

La interacción se resume así:

```text
Usuario
↓
Interfaz
↓
Motor Central
↓
Project Core
↓
Módulos MGA
↓
Resultados
```

---

# Integración con el resto de la plataforma

Los módulos MGA interactúan con:

- Presupuesto.
- APUs.
- Catálogos.
- Plantillas.
- Documentos.
- Reportes.
- PWA.

De esta forma, el proyecto mantiene coherencia entre la formulación técnica y la información financiera.

---

# Beneficios

- Automatización de la formulación.
- Revisión técnica integrada.
- Preparación para MGA Web.
- Reducción de errores.
- Mejor experiencia para el usuario.

---

# Estado

Documento de referencia para los módulos MGA del Constructor MGA Pro Versión 1.0.
