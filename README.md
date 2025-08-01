# 📖 Proyecto: Enseñanzas Bíblicas Interactivas

Este proyecto es una plataforma web simple para compartir enseñanzas bíblicas estructuradas, con funcionalidades de descarga en PDF y video resumen de cada enseñanza.

---

## ✨ Características

- Presentación limpia y responsive de la enseñanza.
- Botón para **descargar el contenido en formato PDF**.
- Espacio para insertar un **video resumen** de máximo 1 minuto.
- Archivos organizados y editables.

---

## 📂 Estructura del Proyecto

├── index.html # Página principal con la enseñanza
├── estilo.css # Estilos visuales del sitio
├── script.js # Lógica de descarga y control
├── jspdf.min.js # Librería para exportar en PDF (versión local)
├── video.mp4 # Video resumen de la enseñanza (opcional)
└── README.md # Este archivo

yaml
Copiar
Editar

---

## 🛠 Cómo usar localmente

1. Abre `index.html` con tu navegador o usando extensiones como **Live Server** en Visual Studio Code.
2. Presiona el botón **"Descargar PDF"** para guardar la enseñanza.
3. Asegúrate de tener el archivo `jspdf.min.js` en la misma carpeta para que funcione correctamente.
4. Puedes reemplazar el `video.mp4` por uno propio de máximo 1 minuto.

---

## ☁️ Cómo subir a GitHub

1. Crea un repositorio nuevo en [GitHub](https://github.com/).
2. Abre tu terminal y ejecuta:

```bash
git init
git add .
git commit -m "Primer commit - Enseñanza Bíblica"
git remote add origin https://github.com/leolunes/tu-repositorio.git
git push -u origin main

