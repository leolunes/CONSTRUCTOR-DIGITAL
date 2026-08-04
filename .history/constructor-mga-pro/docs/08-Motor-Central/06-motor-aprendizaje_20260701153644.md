# 06 — Motor de Aprendizaje

## Propósito

El archivo `motor-aprendizaje.js` será el encargado de registrar, analizar y aprovechar los patrones de uso del Constructor MGA Pro para mejorar continuamente las recomendaciones realizadas al formulador.

Este motor no reemplazará el criterio técnico ni modificará automáticamente la información del proyecto.

Su misión será aprender de la experiencia acumulada para ofrecer sugerencias cada vez más pertinentes.

---

## Objetivo general

Construir una memoria inteligente que permita al Constructor MGA Pro reconocer comportamientos frecuentes, reutilizar buenas prácticas y adaptar las recomendaciones al contexto del proyecto.

---

## Principios

- Aprender sin alterar la información original.
- Sugerir, nunca imponer.
- Respetar siempre la decisión del formulador.
- Mantener trazabilidad de los aprendizajes.
- Utilizar Project Core como fuente principal de información.

---

## ¿Qué puede aprender?

### Preferencias del formulador

- Tipo de proyectos más frecuentes.
- Sectores utilizados con mayor frecuencia.
- Tipologías preferidas.
- Productos MGA más empleados.

### Patrones de formulación

- Cambios frecuentes en el diagnóstico.
- Ajustes habituales al problema central.
- Objetivos que suelen modificarse.
- Indicadores reemplazados con mayor frecuencia.
- Riesgos adicionales incorporados por el usuario.

### Información presupuestal

- Fuentes de financiación más utilizadas.
- Distribución presupuestal recurrente.
- Actividades que normalmente requieren ajustes.

### Documentación

- Plantillas utilizadas.
- Formatos preferidos.
- Observaciones repetitivas.

---

## Información que NO debe aprender

El Motor de Aprendizaje no debe almacenar información sensible o específica que pueda comprometer la integridad de un proyecto.

Por ejemplo:

- Datos personales.
- Información reservada.
- Decisiones administrativas particulares.
- Valores confidenciales.

El aprendizaje debe centrarse en patrones técnicos y no en información privada.

---

## Integración

Este motor trabajará principalmente con:

- Maestro MGA.
- Project Core.
- Motor de Conocimiento.
- Motor de Decisiones.
- Reporte Ejecutivo.

---

## Entradas

- Historial del proyecto.
- Cambios realizados por el usuario.
- Recomendaciones aceptadas.
- Recomendaciones rechazadas.
- Resultados del Inspector.
- Resultados del Motor de Calidad.

---

## Salidas

- Patrones identificados.
- Recomendaciones mejoradas.
- Sugerencias personalizadas.
- Estadísticas de aprendizaje.

---

## Ejemplo de funcionamiento

Si el usuario formula varios proyectos de infraestructura vial y siempre modifica el indicador sugerido, el Motor de Aprendizaje podrá detectar ese patrón.

En un proyecto futuro podrá sugerir directamente el indicador que históricamente ha sido aceptado por el formulador, dejando claro que se trata de una recomendación y no de una decisión obligatoria.

---

## Beneficios esperados

- Reducir el tiempo de formulación.
- Disminuir correcciones repetitivas.
- Aprovechar la experiencia acumulada.
- Mejorar la calidad de las recomendaciones.
- Mantener consistencia entre proyectos similares.

---

## Relación con Project Core

Toda la información permanente continuará almacenándose en Project Core.

El Motor de Aprendizaje únicamente conservará referencias, estadísticas y patrones que sirvan para enriquecer futuras recomendaciones.

---

## Regla de arquitectura

El aprendizaje nunca podrá modificar automáticamente un proyecto.

Toda modificación deberá ser aprobada por el Maestro MGA o por el usuario.

---

## Evolución futura

En versiones posteriores este motor podrá incorporar:

- Aprendizaje por sector.
- Aprendizaje por entidad formuladora.
- Aprendizaje por tipo de proyecto.
- Estadísticas históricas.
- Recomendaciones basadas en proyectos similares.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/motor-aprendizaje.js
```
