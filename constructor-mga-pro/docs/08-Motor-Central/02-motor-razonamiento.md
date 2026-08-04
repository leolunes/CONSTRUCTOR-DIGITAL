# 02 — Motor de Razonamiento

## Propósito

El archivo `motor-razonamiento.js` contendrá la lógica que permitirá al Constructor MGA Pro analizar la coherencia técnica de un proyecto de inversión.

Su función principal será responder una pregunta fundamental:

> ¿Todo lo que contiene el proyecto tiene sentido desde el punto de vista de la formulación?

Este motor no generará contenido. Su responsabilidad será analizar, comparar, validar y justificar.

---

## Objetivo general

Evaluar las relaciones existentes entre los diferentes componentes del Project Core para detectar inconsistencias técnicas antes de que el proyecto llegue a MGA Web.

---

## Principios

- Analizar antes de sugerir.
- Explicar antes de corregir.
- Justificar cada observación.
- No modificar información sin autorización del Motor Maestro.
- Trabajar siempre sobre Project Core.

---

## Componentes que debe revisar

- Diagnóstico.
- Problema central.
- Causas.
- Efectos.
- Objetivo general.
- Objetivos específicos.
- Participantes.
- Población.
- Alternativas.
- Cadena de valor.
- Productos.
- Actividades.
- Indicadores.
- Riesgos.
- Presupuesto.
- Cronograma.
- Sostenibilidad.
- Documentos.

---

## Validaciones principales

### Problema

Debe verificar:

- Que sea un problema y no una solución.
- Que describa una situación negativa.
- Que sea claro y medible.

### Objetivo

Debe verificar:

- Que responda al problema central.
- Que describa un estado futuro deseado.
- Que no sea una actividad.

### Causas

Debe comprobar que expliquen el problema y que no sean efectos.

### Efectos

Debe comprobar que realmente se deriven del problema.

### Cadena de valor

Debe validar:

Actividades → Productos → Objetivos → Problema.

### Indicadores

Debe revisar que cada indicador mida realmente el componente al que está asociado.

### Riesgos

Debe validar que correspondan al tipo de proyecto y tengan medidas de mitigación.

### Presupuesto

Debe comprobar que exista relación entre las actividades y los costos.

---

## Tipo de observaciones

Cada observación deberá incluir:

- Componente.
- Nivel (Crítico, Alto, Medio o Bajo).
- Descripción.
- Justificación.
- Recomendación.

Ejemplo:

Componente:
Indicador.

Nivel:
Alto.

Observación:
El indicador no mide el producto.

Recomendación:
Utilizar un indicador que mida el bien o servicio entregado.

---

## Integración

Este motor será utilizado por:

- Maestro MGA.
- Inspector MGA.
- Asesor Experto MGA.
- Semáforo de Radicación.
- Reporte Ejecutivo.

---

## Entradas

- Project Core.
- Catálogos.
- Plantillas.
- Resultados del Motor de Conocimiento.

## Salidas

- Observaciones.
- Alertas.
- Puntaje de coherencia.
- Recomendaciones.

---

## Regla de arquitectura

Toda conclusión del Motor de Razonamiento deberá poder ser explicada al usuario con argumentos técnicos.

No debe emitir respuestas sin una justificación clara.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/motor-razonamiento.js
```
