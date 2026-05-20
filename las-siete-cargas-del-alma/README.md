# Las Siete Cargas del Alma
## Diagnóstico espiritual estructural

Aplicación web frontend-only, tipo PWA, diseñada como herramienta diagnóstica pastoral seria para identificar:

- miedo
- culpa
- ansiedad
- responsabilidad excesiva
- rechazo
- temor a la escasez
- soledad

La app traduce el resultado en una lectura estructural basada en el modelo:

- Alma = viga
- Espíritu = columna
- Cristo = cimiento

## Características

- evaluación por 7 cargas
- diagnóstico global y por sección
- pórtico espiritual SVG interactivo
- tooltips y panel contextual
- lectura guiada del diagrama
- comparación antes / después
- plan de transferencia de cargas por 7 días
- exportación TXT
- exportación PNG
- exportación PDF
- instalación como PWA
- cache offline básico

## Estructura principal

- `index.html`
- `manifest.json`
- `sw.js`
- `data/siete-cargas.json`
- `assets/css/styles.css`
- `assets/js/*.js`

## Cómo abrirla en Visual Studio Code

1. Abre la carpeta del proyecto.
2. Usa una extensión tipo **Live Server**.
3. Abre `index.html`.
4. Ejecuta la app en el navegador.

## Publicar en GitHub Pages

1. Sube toda la carpeta al repositorio.
2. Activa GitHub Pages desde la rama principal.
3. Usa la ruta pública correspondiente.

## Nota

La app guarda respuestas y medición previa en `localStorage`.