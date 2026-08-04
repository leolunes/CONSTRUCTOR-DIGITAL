# 04 — Motor de Flujo

## Propósito

El archivo `motor-flujo.js` será el responsable de coordinar el ciclo de vida del proyecto dentro del Constructor MGA Pro.

Su misión será garantizar que cualquier cambio realizado por el usuario se propague automáticamente a todos los componentes relacionados, manteniendo la coherencia del Project Core.

---

## Objetivo general

Automatizar el flujo de trabajo del proyecto para que el usuario no tenga que actualizar manualmente cada módulo cuando modifica un componente de la formulación.

---

## Principios

- Un cambio puede afectar varios componentes.
- Ningún módulo debe trabajar de manera aislada.
- Todo cambio debe pasar por Project Core.
- El usuario debe percibir un flujo continuo.
- El sistema debe decidir qué actualizar.

---

## Flujo general

```text
Usuario
↓
Realiza un cambio
↓
Motor de Flujo
↓
Actualiza Project Core
↓
Notifica motores afectados
↓
Actualiza módulos visuales
↓
Guarda proyecto
```

---

## Eventos principales

El Motor de Flujo deberá responder, entre otros, a los siguientes eventos:

### Idea inicial

- Crear estructura básica.
- Activar Maestro MGA.
- Consultar Motor de Conocimiento.

### Cambio de diagnóstico

Actualizar:

- Problema.
- Objetivos.
- Cadena de valor.
- Indicadores.
- Reporte Ejecutivo.

### Cambio del problema central

Actualizar:

- Objetivo general.
- Objetivos específicos.
- Causas.
- Efectos.
- Cobertura MGA.
- Inspector.
- Semáforo.

### Cambio de objetivos

Actualizar:

- Cadena de valor.
- Productos.
- Actividades.
- Indicadores.

### Cambio de productos

Actualizar:

- Actividades.
- Indicadores.
- Presupuesto.
- Riesgos.

### Cambio de actividades

Actualizar:

- Presupuesto.
- Cronograma.
- Reporte Ejecutivo.

### Cambio del presupuesto

Actualizar:

- Fuentes de financiación.
- Reporte Ejecutivo.
- Semáforo.

### Cambio de indicadores

Actualizar:

- Inspector.
- Calidad.
- Reporte Ejecutivo.

### Cambio de riesgos

Actualizar:

- Inspector.
- Calidad.
- Semáforo.

### Cambio de documentos

Actualizar:

- Cobertura.
- Exportador.
- Reporte Ejecutivo.

---

## Integración con módulos existentes

El Motor de Flujo trabajará con:

- Project Core.
- Maestro MGA.
- Cerebro MGA.
- Motor de Formulación Automática.
- Inspector MGA.
- Asesor Experto.
- Cobertura MGA Web.
- Semáforo de Radicación.
- Exportador MGA Web.
- Reporte Ejecutivo.

---

## Entradas

- Eventos del usuario.
- Cambios detectados en Project Core.
- Resultados del Maestro MGA.

---

## Salidas

- Lista de módulos que deben actualizarse.
- Proyecto actualizado.
- Historial de cambios.
- Estado del flujo.

---

## Reglas de arquitectura

El Motor de Flujo no debe generar contenido técnico.

Su responsabilidad es coordinar el orden en que trabajan los demás componentes.

Toda modificación deberá registrarse en el historial del proyecto.

---

## Beneficios esperados

- Evitar información desactualizada.
- Reducir errores por cambios parciales.
- Mantener sincronizados todos los módulos.
- Mejorar la experiencia del usuario.
- Garantizar la coherencia de la formulación.

---

## Ejemplo práctico

Si el usuario cambia el problema central:

```text
Problema
↓
Motor de Flujo
↓
Project Core
↓
Motor de Razonamiento
↓
Motor de Calidad
↓
Cobertura MGA
↓
Inspector MGA
↓
Semáforo
↓
Reporte Ejecutivo
↓
Exportador MGA
```

Todo este proceso deberá ejecutarse automáticamente.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/motor-flujo.js
```
