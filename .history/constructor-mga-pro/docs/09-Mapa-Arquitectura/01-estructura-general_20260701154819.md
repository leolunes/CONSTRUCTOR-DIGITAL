# 01 — Estructura General del Constructor MGA Pro

## Propósito

Este documento presenta la estructura general de la aplicación y explica cómo está organizada actualmente.

Su objetivo es servir como mapa de navegación para cualquier desarrollador o formulador que participe en la evolución del Constructor MGA Pro.

---

# Filosofía de la arquitectura

La plataforma está organizada por responsabilidades.

Cada carpeta tiene un propósito específico y evita mezclar lógica de negocio, interfaz, datos y documentación.

La arquitectura busca que los componentes puedan evolucionar sin afectar el resto del sistema.

---

# Estructura principal

```text
Constructor MGA Pro
│
├── css/
├── data/
├── docs/
├── fonts/
├── img/
├── js/
├── pwa/
├── pages/
├── index.html
├── proyectos.html
├── proyecto-detalle.html
└── demás archivos principales
```

---

# Descripción de las carpetas

## css/

Contiene las hojas de estilo de toda la aplicación.

Incluye estilos generales y estilos específicos para los módulos MGA, presupuesto, asistentes, paneles y reportes.

---

## data/

Almacena información estructurada utilizada por la plataforma.

Ejemplos:

- catálogos
- configuraciones
- plantillas
- parámetros
- archivos JSON

Esta carpeta será una de las principales fuentes del Motor de Conocimiento.

---

## docs/

Contiene toda la documentación técnica del proyecto.

Actualmente incluye la arquitectura, los motores inteligentes, la integración con MGA y el mapa de arquitectura.

Es la referencia oficial para la evolución del sistema.

---

## fonts/

Fuentes tipográficas utilizadas por la interfaz.

---

## img/

Recursos gráficos, iconografía, logotipos e imágenes utilizadas por la aplicación.

---

## js/

Es el núcleo funcional de la plataforma.

Aquí se encuentran:

- Project Core
- módulos MGA
- asistentes
- presupuesto
- APUs
- exportadores
- motores inteligentes
- integración
- PWA
- utilidades

En esta carpeta también se incorporará el futuro:

```text
motor-central/
```

---

## pwa/

Archivos relacionados con la aplicación progresiva.

Incluye manifest, service worker y recursos necesarios para instalación y funcionamiento sin conexión cuando aplique.

---

## pages/

Páginas auxiliares y componentes de navegación de la aplicación.

---

# Archivos HTML principales

## index.html

Punto de entrada principal.

---

## proyectos.html

Administración de proyectos.

---

## proyecto-detalle.html

Principal centro de trabajo del Constructor MGA Pro.

Desde este archivo se integran la mayoría de los motores y módulos inteligentes.

---

# Organización funcional

La aplicación puede entenderse en cinco grandes capas.

```text
Interfaz

↓

Project Core

↓

Motores Inteligentes

↓

Presupuesto y APUs

↓

Datos y Documentación
```

---

# Principios de organización

- Una responsabilidad por módulo.
- Un único Project Core.
- Reutilización de componentes.
- Integración antes que duplicación.
- Documentación permanente.

---

# Evolución

La estructura actual constituye la base oficial de la Versión 1.0.

Las nuevas funcionalidades deberán integrarse respetando esta organización.

No se crearán estructuras paralelas cuando ya exista un componente que cumpla la misma responsabilidad.

---

# Estado

Documento base para comprender la organización general del Constructor MGA Pro.
