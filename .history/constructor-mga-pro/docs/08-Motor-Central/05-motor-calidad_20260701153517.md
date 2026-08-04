# 05 — Motor de Calidad

## Propósito

El archivo `motor-calidad.js` será el responsable de evaluar la calidad técnica del proyecto formulado.

A diferencia del Inspector MGA, cuyo objetivo principal es detectar errores, el Motor de Calidad realizará una evaluación integral del proyecto, calificando la consistencia, claridad y nivel técnico de cada componente.

Su propósito es responder una pregunta:

> ¿Este proyecto tendría una alta probabilidad de ser aceptado durante una revisión técnica antes de ser llevado a MGA Web?

---

## Objetivo general

Garantizar que el Constructor MGA Pro no solo complete campos, sino que produzca proyectos técnicamente sólidos, coherentes y defendibles.

---

## Principios

- Evaluar calidad y no únicamente cumplimiento.
- Analizar relaciones entre componentes.
- Fundamentar cada calificación.
- Priorizar recomendaciones útiles.
- Mantener criterios homogéneos para todos los proyectos.

---

## Componentes que evaluará

El Motor de Calidad revisará, entre otros:

- Identificación del proyecto.
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
- Metas.
- Riesgos.
- Cronograma.
- Presupuesto.
- Fuentes de financiación.
- Sostenibilidad.
- Documentos.
- Cobertura MGA Web.

---

## Criterios de evaluación

### Claridad

Verifica que la información sea comprensible, específica y bien redactada.

### Coherencia

Comprueba que exista relación lógica entre todos los componentes del proyecto.

### Completitud

Determina si el componente contiene la información necesaria para la formulación.

### Consistencia

Valida que un mismo dato no presente contradicciones en diferentes módulos.

### Pertinencia

Analiza si la información corresponde al sector, la tipología y el producto MGA seleccionados.

### Trazabilidad

Verifica que cada decisión pueda justificarse técnicamente.

---

## Escala de evaluación

Se propone la siguiente clasificación:

- Excelente (90 a 100).
- Bueno (80 a 89).
- Aceptable (70 a 79).
- Requiere fortalecimiento (60 a 69).
- No recomendado (menor a 60).

---

## Resultado esperado

Cada evaluación deberá producir:

- Puntaje general.
- Puntaje por componente.
- Nivel técnico.
- Riesgos identificados.
- Aspectos destacados.
- Aspectos por mejorar.
- Recomendaciones priorizadas.

Ejemplo:

```text
Calidad técnica: 92/100

Nivel:
Excelente.

Fortalezas:
- Diagnóstico sólido.
- Objetivos coherentes.
- Indicadores adecuados.

Aspectos por mejorar:
- Ampliar la justificación.
- Fortalecer sostenibilidad.
```

---

## Integración

El Motor de Calidad será utilizado por:

- Maestro MGA.
- Inspector MGA.
- Asesor Experto MGA.
- Semáforo de Radicación.
- Reporte Ejecutivo.
- Motor de Decisiones.

---

## Entradas

- Project Core.
- Resultados del Motor de Razonamiento.
- Cobertura MGA Web.
- Observaciones del Inspector.
- Recomendaciones del Asesor.

---

## Salidas

- Puntaje global.
- Puntajes por componente.
- Recomendaciones.
- Probabilidad de devolución.
- Estado de calidad.

---

## Relación con otros motores

### Motor de Razonamiento

Detecta la coherencia.

### Motor de Calidad

Califica el nivel técnico de esa coherencia.

### Motor de Decisiones

Utiliza el puntaje para determinar el estado del proyecto.

---

## Beneficios esperados

- Reducir observaciones durante la revisión.
- Homogeneizar la calidad de los proyectos.
- Facilitar el trabajo de formuladores con poca experiencia.
- Aumentar la confianza en los resultados del Constructor MGA Pro.

---

## Regla de arquitectura

El Motor de Calidad nunca debe modificar directamente el proyecto.

Su función es evaluar y recomendar.

Las modificaciones deberán ser coordinadas por el Maestro MGA y registradas en Project Core.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/motor-calidad.js
```
