# 08 — Integración con Project Core

## Propósito

El presente documento define las reglas oficiales de integración entre el Motor Central y el Project Core del Constructor MGA Pro.

Su finalidad es garantizar que toda la plataforma trabaje sobre una única fuente de verdad, evitando estructuras duplicadas, información inconsistente o múltiples versiones del mismo proyecto.

---

## Principio fundamental

El Project Core continuará siendo el corazón del Constructor MGA Pro.

Todos los módulos existentes y futuros deberán leer y escribir la información del proyecto utilizando exclusivamente el Project Core.

El Motor Central nunca deberá crear una estructura paralela para almacenar información permanente.

---

## Arquitectura de integración

```text
Usuario
↓
Interfaz
↓
Motor Central
↓
Project Core
↓
Módulos Inteligentes
↓
Interfaz
```

El flujo siempre deberá regresar al Project Core antes de actualizar cualquier módulo visual.

---

## Project Core como fuente única de verdad

El Project Core almacenará:

- Datos básicos.
- Identificación MGA.
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
- Presupuesto.
- Cronograma.
- Fuentes de financiación.
- Documentos.
- Historial.
- Memoria inteligente.
- Estados del proyecto.

Ningún otro módulo deberá almacenar permanentemente esta información.

---

## Responsabilidades del Motor Central

El Motor Central podrá:

- Consultar Project Core.
- Analizar información.
- Coordinar motores.
- Generar recomendaciones.
- Calcular puntajes.
- Solicitar actualizaciones.
- Registrar eventos.
- Actualizar estados.

No deberá mantener una copia independiente del proyecto.

---

## Flujo recomendado

Cada proceso deberá seguir este ciclo:

1. Leer Project Core.
2. Analizar el estado del proyecto.
3. Ejecutar el motor correspondiente.
4. Consolidar los resultados.
5. Actualizar Project Core.
6. Guardar el proyecto.
7. Refrescar los módulos visuales.

---

## Integración con los módulos actuales

Todos los componentes existentes deberán conservar su responsabilidad.

### Cerebro MGA

Genera propuestas de formulación.

### Motor de Formulación Automática

Completa componentes faltantes.

### Inspector MGA

Detecta errores e inconsistencias.

### Asesor Experto

Genera recomendaciones.

### Panel de Cobertura MGA Web

Calcula el porcentaje de cobertura.

### Semáforo de Radicación

Determina el nivel de preparación.

### Reporte Ejecutivo

Presenta el resumen técnico.

### Exportador MGA Web

Prepara la información para copiar en MGA Web.

Todos estos módulos deberán consultar el mismo Project Core.

---

## Reglas de escritura

Solo el resultado consolidado deberá almacenarse en Project Core.

Los motores podrán trabajar temporalmente con estructuras auxiliares en memoria, pero el estado definitivo siempre deberá quedar registrado en el Project Core.

---

## Reglas de lectura

Antes de ejecutar cualquier análisis, el Motor Central deberá consultar la versión más reciente del proyecto almacenada en Project Core.

Esto evitará trabajar con información desactualizada.

---

## Sincronización

Cada actualización importante deberá generar:

- Actualización del historial.
- Actualización de la memoria inteligente.
- Revisión del estado del proyecto.
- Recalculo de cobertura.
- Revisión de calidad.
- Revisión del semáforo.
- Actualización del reporte ejecutivo.

---

## Beneficios

Esta integración permitirá:

- Eliminar duplicidad de datos.
- Mantener coherencia entre módulos.
- Reducir errores de sincronización.
- Facilitar el mantenimiento.
- Escalar la plataforma sin modificar la arquitectura existente.

---

## Regla de oro

Toda información permanente pertenece al Project Core.

Todo razonamiento pertenece al Motor Central.

Toda visualización pertenece a los módulos de interfaz.

---

## Estado

Documento de arquitectura para la implementación futura de la integración entre:

```text
js/motor-central/
```

y el núcleo de información:

```text
Project Core
```
