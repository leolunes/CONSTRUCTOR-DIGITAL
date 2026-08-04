# 01 — Maestro MGA

## Propósito

El archivo `maestro-mga.js` será el coordinador principal del Motor Central del Constructor MGA Pro.

Su función no será reemplazar los módulos existentes, sino dirigirlos.

El Maestro MGA será el componente encargado de recibir una solicitud, revisar el estado completo del proyecto y decidir qué motores deben actuar para avanzar la formulación.

---

## Rol dentro de la plataforma

El Maestro MGA será la puerta de entrada de la inteligencia central.

Cuando el usuario escriba una idea, modifique un dato o solicite completar la MGA, el Maestro deberá coordinar la respuesta.

El flujo será:

```text
Usuario
↓
Interfaz
↓
Maestro MGA
↓
Project Core
↓
Motores especializados
↓
Módulos visuales
```

---

## Responsabilidades principales

El Maestro MGA deberá:

1. Leer el proyecto desde Project Core.
2. Identificar el estado actual del proyecto.
3. Decidir qué motor debe actuar.
4. Coordinar los motores especializados.
5. Actualizar la información del proyecto.
6. Recalcular cobertura MGA Web.
7. Activar el Inspector MGA.
8. Activar el Asesor Experto MGA.
9. Actualizar el Semáforo de Radicación.
10. Actualizar el Exportador MGA Web.
11. Actualizar el Reporte Ejecutivo.
12. Registrar historial.
13. Actualizar memoria inteligente.
14. Guardar el proyecto.

---

## Qué NO debe hacer

El Maestro MGA no debe convertirse en un archivo gigante que haga todo.

No debe:

- redactar todos los textos;
- validar toda la calidad;
- decidir todos los indicadores;
- manejar directamente todos los catálogos;
- reemplazar el Project Core;
- reemplazar los módulos actuales.

Su función es coordinar.

---

## Motores que coordina

El Maestro MGA podrá coordinar:

```text
motor-razonamiento.js
motor-conocimiento.js
motor-flujo.js
motor-calidad.js
motor-aprendizaje.js
motor-decisiones.js
```

También podrá interactuar con módulos ya existentes:

```text
ProjectCoreMGA
CerebroMGA
MotorFormulacionAutomaticaMGA
PanelCoberturaMGAWeb
InspectorMGAWeb
AsesorExpertoMGA
ExportadorMGAWeb
SemaforoRadicacionMGA
ReporteEjecutivoMGA
```

---

## Entradas esperadas

El Maestro MGA podrá recibir:

### 1. Una idea inicial

Ejemplo:

```text
Construcción de un Centro Vida para 300 adultos mayores en Floridablanca.
```

### 2. Un evento de cambio

Ejemplo:

```text
El usuario modificó el problema central.
```

### 3. Una solicitud directa

Ejemplo:

```text
Completar automáticamente la MGA.
```

### 4. Una revisión

Ejemplo:

```text
Revisar si el proyecto está listo para MGA Web.
```

### 5. Un proyecto existente

Ejemplo:

```text
Project Core cargado desde IndexedDB o LocalStorage.
```

---

## Salidas esperadas

El Maestro MGA deberá producir una respuesta estructurada.

Ejemplo:

```text
{
  ok: true,
  accionEjecutada: "FORMULACION_AUTOMATICA",
  estadoProyecto: "FORMULACION_EN_PROCESO",
  cobertura: 86,
  calidad: 78,
  semaforo: "AMARILLO",
  siguienteAccion: "Completar fuentes de financiación",
  proyectoActualizado: {...}
}
```

---

## Estados del proyecto

El Maestro MGA deberá reconocer estos estados:

```text
IDEA_INICIAL
IDENTIFICADO
FORMULACION_EN_PROCESO
FORMULACION_COMPLETA
REQUIERE_AJUSTES
LISTO_REVISION_FINAL
LISTO_MGA_WEB
```

---

## Reglas de decisión inicial

### Si el proyecto solo tiene una idea

Debe activar:

```text
Motor de Conocimiento
Cerebro MGA
Motor de Formulación Automática
```

### Si el proyecto tiene diagnóstico, pero no objetivos

Debe activar:

```text
Motor de Razonamiento
Motor de Flujo
Motor de Formulación Automática
```

### Si el proyecto tiene formulación, pero baja cobertura

Debe activar:

```text
Panel de Cobertura
Asesor Experto
Motor de Decisiones
```

### Si el proyecto tiene cobertura alta, pero errores críticos

Debe activar:

```text
Inspector MGA
Motor de Calidad
Motor de Razonamiento
```

### Si el proyecto tiene cobertura alta y sin errores

Debe activar:

```text
Semáforo de Radicación
Exportador MGA Web
Reporte Ejecutivo
```

---

## Integración con Project Core

El Maestro MGA debe trabajar siempre sobre Project Core.

No debe crear estructuras paralelas.

Toda acción importante debe terminar así:

```text
Maestro MGA
↓
Actualiza Project Core
↓
Guarda proyecto
↓
Actualiza módulos visuales
```

---

## Relación con el usuario

El usuario no debería ver el Maestro MGA directamente.

El usuario verá sus efectos a través de:

- Cerebro MGA.
- Asesor Experto.
- Inspector MGA.
- Semáforo.
- Exportador.
- Reporte Ejecutivo.

El Maestro MGA será el cerebro invisible que coordina todo.

---

## Ciclo de ejecución recomendado

Cada vez que el Maestro MGA actúe, debería seguir este ciclo:

```text
1. Cargar Project Core.
2. Analizar estado.
3. Identificar faltantes.
4. Seleccionar motores.
5. Ejecutar acciones.
6. Validar resultados.
7. Recalcular cobertura.
8. Recalcular calidad.
9. Recalcular semáforo.
10. Actualizar exportador.
11. Actualizar reporte.
12. Guardar historial.
13. Guardar memoria.
14. Devolver respuesta.
```

---

## Ejemplo de flujo completo

Usuario escribe:

```text
Construcción de una placa huella en una vereda.
```

El Maestro MGA debería:

1. Consultar Motor de Conocimiento.
2. Identificar sector Transporte.
3. Identificar tipología Placa Huella.
4. Activar Cerebro MGA.
5. Generar diagnóstico.
6. Generar problema.
7. Generar objetivos.
8. Generar cadena de valor.
9. Generar indicadores.
10. Generar riesgos.
11. Generar cronograma preliminar.
12. Activar Inspector.
13. Medir cobertura.
14. Activar Semáforo.
15. Generar Reporte Ejecutivo.
16. Indicar lo que falta.

---

## Principio de diseño

El Maestro MGA debe ser:

- pequeño;
- claro;
- coordinador;
- reutilizable;
- conectado con Project Core;
- independiente de la interfaz;
- compatible con todos los módulos existentes.

---

## Riesgo a evitar

El principal riesgo es que el Maestro MGA se convierta en un archivo demasiado grande.

Para evitarlo:

- El razonamiento debe vivir en `motor-razonamiento.js`.
- El conocimiento debe vivir en `motor-conocimiento.js`.
- Las decisiones deben vivir en `motor-decisiones.js`.
- La calidad debe vivir en `motor-calidad.js`.
- El flujo debe vivir en `motor-flujo.js`.
- El aprendizaje debe vivir en `motor-aprendizaje.js`.

---

## Resultado esperado

Cuando este componente esté implementado, el Constructor MGA Pro podrá actuar como una plataforma unificada.

El usuario no tendrá que decidir qué módulo usar.

El sistema decidirá el siguiente paso lógico de formulación.

---

## Estado

Documento de arquitectura para la implementación futura de:

```text
js/motor-central/maestro-mga.js
```
