VERSIÓN 1.4.18 — PDF ARCHIVADOS EN iPHONE/iPAD

Problema: abrir un PDF con window.open después de una lectura IndexedDB puede bloquear la pestaña en Safari; las PWA instaladas tienen limitaciones para mostrar URL blob.
Solución: el botón Abrir muestra un visor local sin popups, con acciones explícitas para Compartir / Guardar en Archivos y Descargar PDF. Los botones PDF de archivos en iOS conducen al mismo visor.
Los PDF y datos no se suben a GitHub ni se borran.
El visor iframe depende del soporte PDF de Safari; si permanece en blanco, usar Compartir / Guardar en Archivos.
El navegador y la instalación como PWA pueden tener espacios de almacenamiento separados; compruebe el listado y la existencia de los PDF importados.
