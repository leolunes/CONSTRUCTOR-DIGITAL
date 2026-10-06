BIBLIOTECA DIGITAL v1.4 — LA EXPERIENCIA DEL LIBRO
Leonard Moon

Base: v1.3 DOS LIBROS aprobada.
Se conservaron CONGREGADOS y EL HOMBRE DE ALTAR con su lectura, comprensión, discernimiento y progreso.

NUEVO EN v1.4
- Píldoras extraídas del contenido real de cada libro.
- Mi Colección: guarda frases, píldoras y porciones bíblicas en el navegador.
- Compartir: usa el menú nativo del dispositivo; en equipos sin compartir, copia el texto.
- Crear imagen: genera una tarjeta PNG de una píldora sin servicios externos.
- Buscador de toda la biblioteca: busca dentro de ambos libros.
- Acceso directo desde una píldora o búsqueda a la sección original.
- Todo funciona localmente, sin IA, servidor ni pagos por generación.

USO
Abrir la carpeta en VS Code y ejecutar index.html con Go Live.


## v1.5 — Mi Camino de Formación
- Panel de recorrido de todos los libros.
- Mi Cuaderno con tres preguntas personales por sección.
- Lo que estoy trabajando, basado solo en lo escrito por el lector.
- Historia de formación cronológica.
- Mantiene lectura, comprensión, discernimiento, píldoras, colección, compartir y tarjetas de v1.4.4.

## v1.7.1 — Mi Perfil y Respaldo
- Nombre local opcional del lector.
- Exportación de progreso, cuaderno, colección y formación a un archivo JSON.
- Recuperación del recorrido desde un respaldo.
- Reinicio local con doble confirmación.
- Los datos de cada lector permanecen en su propio navegador; GitHub Pages distribuye la aplicación, no comparte el localStorage entre usuarios.


## v1.7.1 — Presentación editorial
Rediseño visual de la pantalla principal según el boceto aprobado, sin alterar el motor funcional de lectura, progreso, píldoras, formación, perfil ni respaldo.


Ajuste v1.7.1: mayor altura del encabezado editorial, texto inferior con respiración y Biblia completamente visible.

## v1.9 — Motor de Enseñanzas Extraídas de los Libros
La sección Enseñanzas se alimenta automáticamente de los bloques temáticos existentes en `data/biblioteca.json`. No exige redactar una segunda base de contenidos: muestra el texto del libro, su referencia bíblica y una píldora marcada en el mismo contenido cuando existe. Incluye búsqueda, filtro por libro, guardar, compartir, crear separador e ir al libro de origen.

## v2.0 · Videoteca del Ministerio
La Videoteca está separada del motor de producción de videos. Para publicar un video terminado:
1. Copie el archivo MP4 dentro de `assets/videos/`.
2. Copie su miniatura (JPG/PNG/WebP) dentro de `assets/videos/`.
3. Agregue una ficha al archivo `data/videos.json` siguiendo este modelo:
```json
{
  "id": "video-001",
  "titulo": "Título del video",
  "descripcion": "Descripción breve.",
  "categoria": "Enseñanzas",
  "duracion": "5:12",
  "fecha": "2026-10-06",
  "archivo": "assets/videos/video-001.mp4",
  "miniatura": "assets/videos/video-001.jpg",
  "destacado": true,
  "libro": "CONGREGADOS",
  "bookId": "congregados",
  "sectionId": "capitulo-1",
  "capitulo": "Capítulo 1",
  "referencia": "",
  "versiculo": ""
}
```
El archivo puede contener muchas fichas dentro de una lista JSON. Los MP4 no se incluyen en la versión base para mantener el ZIP liviano.
