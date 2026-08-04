# 08 — Modelo de Integración

## Propósito

Este documento define el modelo funcional de integración del Constructor MGA Pro.

Su finalidad es establecer cómo interactúan todos los componentes de la plataforma para comportarse como un único sistema inteligente de formulación de proyectos de inversión pública.

La integración funcional garantiza que cada módulo conserve su responsabilidad, pero que todos trabajen coordinadamente mediante el Project Core y el Motor Central.

---

# Objetivo

Lograr una plataforma unificada donde la información fluya de manera consistente desde la captura de la idea inicial hasta la preparación del proyecto para MGA Web.

---

# Principios

- Una única fuente de verdad: Project Core.
- Un único coordinador: Motor Central.
- Módulos especializados e independientes.
- Integración antes que duplicación.
- Trazabilidad de todas las acciones.

---

# Componentes integrados

## Interfaz

Responsable de capturar la información del usuario y presentar los resultados.

---

## Project Core

Almacena el estado completo del proyecto.

Es el punto de encuentro de toda la plataforma.

---

## Motor Central

Coordina el funcionamiento de:

- Maestro MGA.
- Motor de Razonamiento.
- Motor de Conocimiento.
- Motor de Flujo.
- Motor de Calidad.
- Motor de Aprendizaje.
- Motor de Decisiones.

---

## Motores Inteligentes

Aportan capacidades especializadas para formular, analizar, revisar y recomendar.

---

## Módulos MGA

Gestionan la formulación técnica y la preparación para MGA Web.

---

## Presupuesto y APUs

Relacionan la formulación técnica con la estructuración financiera del proyecto.

---

## Reportes y Exportaciones

Consolidan la información y preparan la salida hacia documentos, PDF, Excel y MGA Web.

---

# Flujo funcional integrado

```text
Usuario
      ↓
Interfaz
      ↓
Project Core
      ↓
Motor Central
      ↓
Motores Inteligentes
      ↓
Módulos MGA
      ↓
Presupuesto y APUs
      ↓
Validación
      ↓
Reportes
      ↓
Exportación MGA Web
```

---

# Reglas de integración

Toda modificación deberá:

- actualizar el Project Core;
- registrar el historial;
- mantener la coherencia del proyecto;
- recalcular los indicadores necesarios;
- notificar a los módulos afectados.

---

# Integración con el Modelo Funcional

El Modelo Funcional define cómo piensa la plataforma.

El Motor Central ejecuta ese comportamiento.

El Project Core conserva los resultados.

Los módulos especializados presentan la información al usuario.

---

# Beneficios

- Coherencia entre todos los componentes.
- Menor duplicidad.
- Mayor mantenibilidad.
- Escalabilidad.
- Integración total entre formulación y presupuesto.

---

# Estado

Documento funcional para la implementación futura del modelo de integración del Constructor MGA Pro.
