# 03 — Motor de Conocimiento

## Propósito

El archivo `motor-conocimiento.js` será el responsable de suministrar conocimiento técnico al Constructor MGA Pro.

No generará contenido por sí mismo. Su función será consultar, organizar y entregar información confiable proveniente de catálogos, plantillas, parámetros y reglas de formulación.

---

## Objetivo general

Permitir que todos los motores inteligentes trabajen sobre una base común de conocimiento, evitando respuestas improvisadas y garantizando coherencia técnica.

---

## Principios

- Consultar antes de sugerir.
- Reutilizar antes de crear.
- Centralizar el conocimiento.
- Mantener una única fuente de información.
- Ser independiente de la interfaz.

---

## Fuentes de conocimiento

El Motor de Conocimiento consultará, entre otras, las siguientes fuentes existentes del proyecto:

- Catálogos.
- Plantillas sectoriales.
- Productos MGA.
- Indicadores.
- Riesgos.
- Sectores.
- Tipologías.
- Actividades tipo.
- Normativa.
- Base documental.
- Archivos JSON de configuración.
- Documentación técnica ubicada en `docs/`.

---

## Información que debe proporcionar

### Identificación

- Sector.
- Programa.
- Tipología.
- Producto MGA.
- Clasificación del proyecto.

### Formulación

- Problemas frecuentes.
- Objetivos sugeridos.
- Causas comunes.
- Efectos comunes.
- Productos asociados.
- Actividades típicas.

### Seguimiento

- Indicadores recomendados.
- Medios de verificación.
- Riesgos frecuentes.
- Medidas de mitigación.

### Planeación

- Cronogramas de referencia.
- Fuentes de financiación.
- Normativa relacionada.

---

## Integración

Este motor será utilizado por:

- Maestro MGA.
- Motor de Razonamiento.
- Motor de Calidad.
- Motor de Decisiones.
- Cerebro MGA.
- Formulación Automática.
- Asesor Experto.

---

## Entradas

- Idea del proyecto.
- Información almacenada en Project Core.
- Sector seleccionado.
- Tipología.
- Producto MGA.

---

## Salidas

- Conocimiento estructurado.
- Sugerencias técnicas.
- Reglas aplicables.
- Plantillas recomendadas.
- Parámetros para los demás motores.

---

## Reglas de arquitectura

El Motor de Conocimiento no almacenará información permanente del proyecto.

Su responsabilidad será consultar y entregar información.

Toda actualización definitiva deberá realizarse a través del Project Core.

---

## Evolución futura

Este motor permitirá incorporar progresivamente:

- Nuevos sectores.
- Nuevas tipologías.
- Nuevos productos MGA.
- Casos de éxito.
- Lecciones aprendidas.
- Buenas prácticas.
- Cambios normativos.

Sin modificar los demás motores.

---

## Resultado esperado

Todos los componentes del Constructor MGA Pro consultarán una misma base de conocimiento, garantizando uniformidad en la formulación y reduciendo inconsistencias.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/motor-conocimiento.js
```
