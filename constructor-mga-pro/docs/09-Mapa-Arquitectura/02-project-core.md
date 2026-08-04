# 02 — Project Core

## Propósito

El Project Core constituye el núcleo del Constructor MGA Pro.

Es la única fuente oficial de información del proyecto y el punto de integración entre todos los módulos de la plataforma.

Ningún componente debe mantener una copia permanente del proyecto fuera del Project Core.

---

# Objetivos

- Centralizar toda la información del proyecto.
- Evitar duplicidad de datos.
- Garantizar consistencia entre módulos.
- Facilitar la sincronización automática.
- Servir como base para el Motor Central.

---

# Principio de arquitectura

Todos los componentes leen y escriben sobre el mismo Project Core.

```text
Usuario
↓
Interfaz
↓
Project Core
↓
Motores
↓
Módulos
```

---

# Información administrada

El Project Core administra, entre otros:

- Identificación del proyecto.
- Diagnóstico.
- Problema central.
- Árbol de problemas.
- Árbol de objetivos.
- Participantes.
- Población.
- Alternativas.
- Cadena de valor.
- Productos.
- Actividades.
- Indicadores.
- Riesgos.
- Cronograma.
- Presupuesto.
- APUs asociados.
- Fuentes de financiación.
- Sostenibilidad.
- Documentos.
- Historial.
- Memoria inteligente.
- Estado del proyecto.

---

# Relación con los módulos actuales

El Project Core alimenta directamente a:

- Cerebro MGA.
- Motor de Formulación Automática.
- Panel de Cobertura MGA Web.
- Inspector MGA.
- Asesor Experto MGA.
- Semáforo de Radicación.
- Exportador MGA Web.
- Reporte Ejecutivo.
- Presupuesto.
- APUs.
- Motor Central.

Todos estos módulos consultan la misma información.

---

# Ciclo de actualización

Toda modificación seguirá este flujo:

```text
Cambio del usuario
↓
Validación
↓
Actualización del Project Core
↓
Motor Central
↓
Actualización de módulos
↓
Guardado
```

---

# Responsabilidades

El Project Core debe:

- Conservar el estado completo del proyecto.
- Mantener la trazabilidad de cambios.
- Proveer información consistente.
- Facilitar la persistencia.
- Servir como punto único de integración.

No debe contener lógica de negocio compleja; esa responsabilidad pertenece al Motor Central y a los motores especializados.

---

# Beneficios

- Una única fuente de verdad.
- Menor riesgo de inconsistencias.
- Integración sencilla entre componentes.
- Mayor facilidad de mantenimiento.
- Escalabilidad para futuras versiones.

---

# Regla de oro

Todo dato permanente pertenece al Project Core.

Todo razonamiento pertenece al Motor Central.

Toda presentación pertenece a la interfaz.

---

# Estado

Documento de referencia para la arquitectura del Project Core dentro del Constructor MGA Pro Versión 1.0.
