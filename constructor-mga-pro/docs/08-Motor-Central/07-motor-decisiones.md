# 07 — Motor de Decisiones

## Propósito

El archivo `motor-decisiones.js` será el componente encargado de determinar la siguiente acción que debe ejecutar el Constructor MGA Pro sobre un proyecto.

Mientras el Motor de Razonamiento analiza y el Motor de Calidad evalúa, el Motor de Decisiones decidirá cuál es el siguiente paso lógico de la formulación.

---

## Objetivo general

Tomar decisiones automáticas, consistentes y trazables con base en el estado del Project Core y en los resultados de los demás motores.

---

## Principios

- Decidir con base en evidencia.
- No duplicar funciones de otros motores.
- Priorizar acciones críticas.
- Mantener trazabilidad de cada decisión.
- Trabajar siempre sobre Project Core.

---

## Información que analiza

El Motor de Decisiones utilizará, entre otros, los siguientes elementos:

- Estado del Project Core.
- Cobertura MGA Web.
- Inspector MGA.
- Motor de Calidad.
- Motor de Razonamiento.
- Semáforo de Radicación.
- Reporte Ejecutivo.
- Presupuesto.
- Documentos.

---

## Estados del proyecto

El proyecto podrá encontrarse en alguno de los siguientes estados:

```text
IDEA_INICIAL
IDENTIFICADO
FORMULACION_EN_PROCESO
FORMULACION_COMPLETA
REQUIERE_AJUSTES
LISTO_REVISION_FINAL
LISTO_MGA_WEB
```

Cada estado tendrá reglas específicas de actuación.

---

## Ejemplos de decisiones

### Caso 1

Si solo existe una idea inicial:

Acción:

- Activar Maestro MGA.
- Consultar Motor de Conocimiento.
- Iniciar formulación.

### Caso 2

Si existe diagnóstico pero no objetivo general:

Acción:

- Activar Motor de Razonamiento.
- Solicitar formulación de objetivos.

### Caso 3

Si la cobertura es inferior al 80 %:

Acción:

- Priorizar componentes faltantes.
- Actualizar Asesor Experto.

### Caso 4

Si existen errores críticos:

Acción:

- Ejecutar Inspector.
- Solicitar revisión antes de continuar.

### Caso 5

Si la cobertura supera el 95 % y no existen errores críticos:

Acción:

- Actualizar Semáforo.
- Generar Reporte Ejecutivo.
- Preparar Exportador MGA Web.

---

## Prioridad de decisiones

Las decisiones deberán seguir este orden:

1. Errores críticos.
2. Inconsistencias técnicas.
3. Componentes faltantes.
4. Calidad.
5. Cobertura.
6. Preparación para MGA Web.

---

## Integración

Este motor trabajará directamente con:

- Maestro MGA.
- Motor de Calidad.
- Motor de Flujo.
- Motor de Razonamiento.
- Project Core.

Y entregará resultados a:

- Inspector MGA.
- Asesor Experto.
- Semáforo.
- Reporte Ejecutivo.
- Exportador MGA.

---

## Entradas

- Estado del proyecto.
- Puntajes.
- Observaciones.
- Cobertura.
- Historial.
- Eventos del usuario.

---

## Salidas

- Próxima acción recomendada.
- Estado actualizado.
- Prioridad de trabajo.
- Lista de tareas.
- Recomendaciones automáticas.

---

## Reglas de arquitectura

El Motor de Decisiones no debe modificar directamente la información técnica del proyecto.

Su función consiste en decidir qué debe ocurrir y delegar la ejecución al Maestro MGA y a los motores especializados.

---

## Beneficios esperados

- Guiar automáticamente la formulación.
- Reducir decisiones manuales.
- Priorizar el trabajo pendiente.
- Evitar pasos innecesarios.
- Preparar el proyecto para MGA Web de manera ordenada.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/motor-decisiones.js
```
