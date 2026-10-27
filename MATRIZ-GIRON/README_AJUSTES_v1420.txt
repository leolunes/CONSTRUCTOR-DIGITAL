MATRIZ MAESTRA GIRON v1.4.20 - PAGINACION DEL DERECHO DE PETICION
Fecha: 27 de octubre de 2026

CAMBIO PRINCIPAL
- Los numerales de hechos y peticiones se mantienen unidos en la misma hoja
  cuando el texto completo cabe. Los bloques realmente extensos continúan
  en otra hoja por líneas, sin invadir el pie de pagina.
- Los titulos se mantienen junto al inicio de su contenido.
- Los datos del destinatario, asunto, telefono, correo y radicado admiten
  varias lineas si el texto es largo y respetan los margenes laterales.
- Cada fotografia conserva su cabecera, imagen, fecha y nota dentro de una
  tarjeta sin superponerse con el apartado siguiente.
- La seccion de notificaciones busca quedar junto con la firma y la
  referencia final, evitando firmas aisladas en paginas casi vacias.
- Se preservan encabezado institucional, numeracion de hojas y pie.

COMPATIBILIDAD Y DATOS
- Se conservan las correcciones de PDF para iPhone e iPad de v1.4.19.
- No se ha cambiado app.js, territorial-db.js, las bases de lideres ni el
  formato del respaldo integral. GitHub no sincroniza datos privados.
- Los PDF ya generados no se reemplazan automaticamente: la correccion
  funciona al generar un documento nuevo.

PARA ACTUALIZAR GITHUB
1. Conservar un respaldo integral privado del computador y los dispositivos.
2. Descomprimir el ZIP de correccion; cargar SOLO sus archivos sueltos en la
   carpeta MATRIZ-GIRON del repositorio. No subir el ZIP, un JSON de respaldo,
   PDF privados ni la carpeta de pruebas.
3. Confirmar el resultado verde de GitHub Pages en Actions.
4. Reabrir la app en iPad e iPhone y comprobar que los lideres continuan.
5. Generar un NUEVO Derecho de Peticion con fotografias y comprobar la
   continuidad del texto y la firma en todas las paginas.

VALIDACION LOCAL
- Sintaxis JavaScript validada con node --check.
- Prueba PDF A4 con varias paginas, datos ficticios y evidencia simulada.
- Inspeccion visual de las paginas, margenes y saltos.
