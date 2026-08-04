# 08-Motor-Central — Cerebro Inteligente del Constructor MGA Pro

## Propósito

La carpeta `08-Motor-Central` documenta la nueva capa superior de inteligencia del Constructor MGA Pro.

Esta capa no reemplaza las carpetas, archivos ni motores que ya existen en la aplicación. Su propósito es organizar, coordinar y hacer que todos los componentes actuales trabajen como un solo sistema inteligente.

El Motor Central será el cerebro que permitirá que la plataforma avance hacia el objetivo principal:

> Construir una plataforma que formule proyectos de inversión pública de manera inteligente y los deje listos para MGA Web.

---

## Principio fundamental

El Constructor MGA Pro ya tiene una arquitectura robusta.

Actualmente existen módulos como:

- Project Core.
- Asistente Inteligente Integral.
- Copiloto Orquestador.
- Cerebro MGA.
- Motor de Formulación Automática.
- Panel de Cobertura MGA Web.
- Inspector MGA.
- Asesor Experto MGA.
- Exportador MGA Web.
- Semáforo de Radicación MGA.
- Reporte Ejecutivo MGA.
- Presupuesto.
- APUs.
- Documentos.
- Plantillas sectoriales.
- Catálogos.
- Motores expertos.

El Motor Central no elimina ninguno de ellos.

Su función será coordinar estos componentes para que dejen de funcionar como herramientas separadas y comiencen a operar como una sola inteligencia de formulación.

---

## Problema que resuelve

Hasta este momento, la aplicación ya tiene muchos módulos inteligentes, pero varios de ellos actúan de manera independiente.

Por ejemplo:

- El Inspector revisa.
- El Semáforo evalúa.
- El Exportador prepara textos.
- El Reporte resume.
- El Asesor recomienda.
- El Cerebro genera.
- El Project Core almacena.

El Motor Central permitirá que todos estos módulos trabajen bajo una misma lógica.

---

## Arquitectura conceptual

El flujo esperado será:

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
MGA Web
```

Esto significa que el usuario no tendrá que decidir qué motor usar en cada momento.

El sistema deberá interpretar el estado del proyecto y decidir automáticamente cuál es el siguiente paso técnico.

---

## Estructura propuesta de documentación

Dentro de esta carpeta se documentarán los siguientes componentes:

```text
docs/
└── 08-Motor-Central/
    ├── README.md
    ├── 01-maestro-mga.md
    ├── 02-motor-razonamiento.md
    ├── 03-motor-conocimiento.md
    ├── 04-motor-flujo.md
    ├── 05-motor-calidad.md
    ├── 06-motor-aprendizaje.md
    ├── 07-motor-decisiones.md
    ├── 08-integracion-project-core.md
    ├── 09-ciclo-de-vida-del-proyecto.md
    └── 10-hoja-de-ruta-v1.md
```

---

## Estructura futura de código

Más adelante, cuando pasemos de documentación a implementación, la carpeta de código será:

```text
js/
└── motor-central/
    ├── maestro-mga.js
    ├── motor-razonamiento.js
    ├── motor-conocimiento.js
    ├── motor-flujo.js
    ├── motor-calidad.js
    ├── motor-aprendizaje.js
    └── motor-decisiones.js
```

---

## Función de cada componente

### Maestro MGA

Será el coordinador principal. Recibirá una solicitud, revisará el estado del proyecto y decidirá qué motores deben actuar.

### Motor de Razonamiento

Analizará la coherencia técnica entre problema, objetivos, productos, actividades, indicadores, riesgos, presupuesto y documentos.

### Motor de Conocimiento

Consultará catálogos, plantillas, sectores, tipologías, productos MGA, indicadores, riesgos y normativa.

### Motor de Flujo

Coordinará los cambios del proyecto. Si se modifica un componente, determinará qué otros componentes deben actualizarse.

### Motor de Calidad

Evaluará la calidad profesional del proyecto, no solo si los campos están completos.

### Motor de Aprendizaje

Registrará patrones de uso, correcciones frecuentes y preferencias del formulador.

### Motor de Decisiones

Determinará el estado del proyecto: si está incompleto, en formulación, requiere ajustes, está listo para revisión o está listo para MGA Web.

---

## Relación con Project Core

Project Core continuará siendo la fuente única de verdad.

El Motor Central no debe crear una base paralela de información.

Todo lo que el Motor Central genere, corrija, evalúe o recomiende deberá estar conectado con Project Core.

El principio será:

```text
Todo dato importante vive en Project Core.
Todo razonamiento pasa por el Motor Central.
Todo resultado se muestra en los módulos existentes.
```

---

## Relación con los módulos actuales

Los módulos actuales seguirán existiendo.

La diferencia será la siguiente:

Antes:

```text
Módulo
↓
Analiza por su cuenta
↓
Muestra resultado
```

Después:

```text
Módulo
↓
Consulta al Motor Central
↓
Recibe análisis
↓
Muestra resultado
```

Esto permitirá mayor coherencia y evitará duplicidad de lógica.

---

## Objetivo funcional

El usuario debería poder escribir una idea como:

```text
Construcción de un Centro Vida para 300 adultos mayores en Floridablanca.
```

Y el Constructor MGA Pro debería ser capaz de:

1. Identificar el sector.
2. Identificar la tipología.
3. Sugerir producto MGA.
4. Generar diagnóstico.
5. Formular problema central.
6. Formular causas y efectos.
7. Formular objetivo general.
8. Formular objetivos específicos.
9. Generar participantes.
10. Definir población afectada y objetivo.
11. Proponer alternativas.
12. Construir cadena de valor.
13. Generar productos.
14. Generar actividades.
15. Sugerir indicadores.
16. Sugerir riesgos.
17. Integrar presupuesto.
18. Revisar fuentes de financiación.
19. Generar cronograma.
20. Generar sostenibilidad.
21. Preparar documentos.
22. Medir cobertura MGA Web.
23. Evaluar calidad técnica.
24. Activar semáforo.
25. Preparar textos para copiar en MGA Web.
26. Generar reporte ejecutivo.

---

## Indicadores de éxito

El Motor Central será exitoso si logra que la aplicación cumpla estos objetivos:

- Formular automáticamente la mayor parte de una MGA Web.
- Mantener coherencia técnica entre todos los componentes.
- Reducir errores de formulación.
- Reducir observaciones antes de radicar.
- Facilitar el trabajo de usuarios no expertos.
- Aprovechar todo el presupuesto y APUs ya construidos.
- Generar información reutilizable para MGA Web.
- Mantener el proyecto organizado bajo Project Core.

---

## Regla de oro

No se debe crear una nueva funcionalidad si ya existe un módulo que puede cumplirla.

Primero se debe reutilizar.

Después integrar.

Solo al final crear.

---

## Alcance de esta carpeta

Esta carpeta no contiene código de ejecución.

Contiene la arquitectura conceptual y técnica del Motor Central.

Su función es servir como referencia oficial antes de programar los archivos JavaScript correspondientes.

---

## Estado

Documento base para la consolidación de la versión 1.0 del Constructor MGA Pro.
