BITÁCORA DE OBRA
================

Aplicación de escritorio desarrollada con Electron para registrar, organizar,
consultar, imprimir y respaldar la información técnica, administrativa y
fotográfica de una obra.

------------------------------------------------------------
1. OBJETIVO
------------------------------------------------------------

La aplicación permite administrar una Bitácora de Obra digital con:

- Registro de obras.
- Registro de contratistas y participantes.
- Creación y edición de folios.
- Anotaciones técnicas y administrativas.
- Incorporación de imágenes y anexos.
- Búsqueda de información.
- Geolocalización.
- Impresión.
- Exportación a PDF.
- Exportación a Word.
- Exportación de respaldo ZIP.
- Copias de seguridad.
- Almacenamiento local.

------------------------------------------------------------
2. REQUISITOS
------------------------------------------------------------

Para ejecutar el proyecto se requiere:

- Windows 10 o Windows 11.
- Node.js instalado.
- Visual Studio Code.
- Conexión a Internet para instalar dependencias.
- Electron.
- Navegador basado en Chromium incluido con Electron.

------------------------------------------------------------
3. ESTRUCTURA GENERAL
------------------------------------------------------------

BITACORA-DE-OBRA/
│
├── package.json
├── main.js
├── preload.js
├── README.txt
│
├── app/
│   └── index.html
│
├── css/
│   ├── variables.css
│   ├── general.css
│   ├── menu.css
│   ├── bitacora.css
│   ├── editor.css
│   ├── formularios.css
│   ├── modales.css
│   ├── impresion.css
│   └── responsive.css
│
└── js/
    ├── app.js
    ├── estado.js
    ├── menu.js
    ├── editor.js
    ├── bitacora.js
    ├── folios.js
    ├── obras.js
    ├── contratistas.js
    ├── anexos.js
    ├── imagenes.js
    ├── buscador.js
    ├── validaciones.js
    ├── almacenamiento.js
    ├── base-datos.js
    ├── copias-seguridad.js
    ├── exportar-pdf.js
    ├── exportar-word.js
    ├── exportar-zip.js
    ├── imprimir.js
    ├── mapas.js
    ├── utilidades.js
    └── ipc-renderer.js

------------------------------------------------------------
4. INSTALACIÓN
------------------------------------------------------------

1. Abra Visual Studio Code.

2. Abra la carpeta:

   BITACORA-DE-OBRA

3. Abra la terminal integrada de Visual Studio Code.

4. Ejecute:

   npm install

5. Cuando termine la instalación, ejecute:

   npm start

La aplicación debe abrirse en una ventana de Electron.

------------------------------------------------------------
5. ARCHIVOS PRINCIPALES
------------------------------------------------------------

package.json
Define el nombre del proyecto, los scripts y las dependencias.

main.js
Inicia Electron y crea la ventana principal.

preload.js
Expone funciones seguras entre Electron y la interfaz.

app/index.html
Contiene la estructura visual principal de la aplicación.

------------------------------------------------------------
6. MÓDULOS JAVASCRIPT
------------------------------------------------------------

app.js
Inicializa la aplicación y coordina los módulos principales.

estado.js
Administra el estado general de la aplicación.

menu.js
Controla la navegación y las opciones del menú.

editor.js
Administra el editor de anotaciones.

bitacora.js
Gestiona la bitácora activa y su información general.

folios.js
Crea, consulta, actualiza y elimina folios.

obras.js
Administra la información de las obras.

contratistas.js
Administra contratistas y participantes.

anexos.js
Gestiona documentos anexos.

imagenes.js
Gestiona fotografías e imágenes.

buscador.js
Permite localizar folios, textos, obras y registros.

validaciones.js
Verifica datos obligatorios y formatos.

almacenamiento.js
Administra el almacenamiento local.

base-datos.js
Controla la estructura de datos de la aplicación.

copias-seguridad.js
Genera y restaura respaldos.

exportar-pdf.js
Genera documentos PDF.

exportar-word.js
Genera documentos Word.

exportar-zip.js
Genera un respaldo completo en formato ZIP.

imprimir.js
Administra la impresión.

mapas.js
Gestiona mapas y coordenadas GPS.

utilidades.js
Contiene funciones comunes para toda la aplicación.

ipc-renderer.js
Gestiona la comunicación entre la interfaz y Electron.

------------------------------------------------------------
7. FLUJO GENERAL DE USO
------------------------------------------------------------

1. Crear o seleccionar una obra.

2. Registrar el contratista y los participantes.

3. Crear un folio.

4. Registrar la fecha y la información general.

5. Escribir la anotación.

6. Adjuntar fotografías y documentos.

7. Guardar el folio.

8. Consultar, editar o imprimir el folio.

9. Exportar la información a PDF, Word o ZIP.

10. Generar una copia de seguridad.

------------------------------------------------------------
8. COPIAS DE SEGURIDAD
------------------------------------------------------------

Se recomienda crear una copia de seguridad:

- Al finalizar cada jornada.
- Antes de actualizar la aplicación.
- Antes de modificar archivos del proyecto.
- Antes de trasladar la información a otro equipo.

Los respaldos deben guardarse en una carpeta externa o en una unidad diferente.

------------------------------------------------------------
9. EXPORTACIONES
------------------------------------------------------------

PDF:
Genera una versión lista para compartir o archivar.

Word:
Genera un documento editable.

ZIP:
Agrupa datos, copias de seguridad y manifiesto del proyecto.

------------------------------------------------------------
10. GEOLOCALIZACIÓN
------------------------------------------------------------

El módulo de mapas permite:

- Mostrar la ubicación de la obra.
- Capturar coordenadas GPS.
- Centrar el mapa sobre la obra.
- Actualizar el marcador.

Para usar esta función debe permitirse el acceso a la ubicación.

------------------------------------------------------------
11. RECOMENDACIONES
------------------------------------------------------------

- No eliminar archivos de la estructura.
- No cambiar nombres de carpetas sin actualizar las rutas.
- No modificar varios archivos al mismo tiempo sin probar.
- Probar la aplicación después de cada ajuste.
- Mantener copias de seguridad.
- Guardar una copia del proyecto en GitHub.
- No eliminar package-lock.json después de instalar dependencias.

------------------------------------------------------------
12. COMPILACIÓN
------------------------------------------------------------

La aplicación puede convertirse en un instalador de Windows.

Cuando el proyecto esté completamente probado, se podrá configurar:

- electron-builder
- Nombre del instalador.
- Icono de la aplicación.
- Carpeta de instalación.
- Acceso directo en el escritorio.
- Versión del programa.
- Firma digital opcional.

------------------------------------------------------------
13. ESTADO DEL PROYECTO
------------------------------------------------------------

La estructura base del proyecto está creada.

Los siguientes pasos corresponden a:

- Integrar los módulos.
- Verificar las rutas de los archivos.
- Comprobar que todos los scripts carguen.
- Validar botones y formularios.
- Probar guardado y lectura de datos.
- Probar exportaciones.
- Corregir errores.
- Preparar el instalador final.

------------------------------------------------------------
14. AUTORÍA
------------------------------------------------------------

Proyecto:
BITÁCORA DE OBRA

Uso:
Gestión técnica, administrativa y documental de obras.

Versión inicial:
1.0.0