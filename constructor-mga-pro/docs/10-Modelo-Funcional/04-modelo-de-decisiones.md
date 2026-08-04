# 04 — Modelo de Decisiones

## Propósito

Este documento define el modelo funcional de toma de decisiones del Constructor MGA Pro.

Su finalidad es establecer cómo decide la plataforma la siguiente acción durante la formulación de un proyecto, utilizando la información almacenada en Project Core y los resultados producidos por los motores inteligentes.

No describe código.

Describe el comportamiento esperado del sistema.

---

# Objetivo

Tomar decisiones técnicas, consistentes, explicables y trazables durante todo el ciclo de vida del proyecto.

Cada decisión deberá contribuir a que el proyecto avance hacia un estado de mayor calidad y preparación para MGA Web.

---

# Principios

- Decidir con evidencia.
- Priorizar antes de ejecutar.
- Explicar cada decisión.
- Evitar acciones innecesarias.
- Mantener siempre la coherencia del proyecto.

---

# Flujo de decisión

```text
Evento
      ↓
Consultar Project Core
      ↓
Analizar estado
      ↓
Evaluar calidad
      ↓
Determinar prioridad
      ↓
Seleccionar acción
      ↓
Actualizar Project Core
      ↓
Continuar el flujo
```

---

# Eventos que generan decisiones

El sistema deberá tomar decisiones cuando ocurra alguno de estos eventos:

- Se crea un nuevo proyecto.
- El usuario modifica un componente.
- Se completa una etapa.
- Se detecta un error.
- Cambia la cobertura MGA.
- Cambia la calidad técnica.
- Se actualiza el presupuesto.
- Se incorporan nuevos documentos.

---

# Criterios para decidir

Antes de actuar el sistema deberá responder:

- ¿Existe información suficiente?
- ¿El componente es coherente?
- ¿Hay inconsistencias críticas?
- ¿Puede continuar automáticamente?
- ¿Debe consultar al usuario?
- ¿Debe recomendar un ajuste?
- ¿Debe detener la formulación?

---

# Tipos de decisiones

## Continuar automáticamente

Cuando exista suficiente información y alta confianza.

## Solicitar información

Cuando falten datos indispensables.

## Recomendar mejoras

Cuando el componente sea válido pero pueda fortalecerse.

## Corregir

Cuando existan inconsistencias técnicas claras.

## Detener el proceso

Cuando la falta de información impida continuar con un nivel aceptable de calidad.

---

# Prioridad de decisiones

El sistema atenderá las decisiones en el siguiente orden:

1. Errores críticos.
2. Inconsistencias técnicas.
3. Información obligatoria faltante.
4. Calidad de la formulación.
5. Cobertura MGA.
6. Mejoras recomendadas.

---

# Integración

Este modelo será utilizado por:

- Maestro MGA.
- Motor de Decisiones.
- Motor de Flujo.
- Motor de Calidad.
- Inspector MGA.
- Asesor Experto.
- Semáforo de Radicación.

---

# Resultado esperado

El Constructor MGA Pro deberá decidir de manera autónoma cuál es el siguiente paso lógico del proyecto, manteniendo siempre la trazabilidad de sus decisiones y permitiendo al usuario comprender por qué se ejecutó cada acción.

---

# Estado

Documento funcional para la implementación futura del modelo de decisiones del Constructor MGA Pro.
