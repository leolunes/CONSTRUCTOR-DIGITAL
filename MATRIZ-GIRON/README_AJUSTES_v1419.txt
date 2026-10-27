MATRIZ GIRÓN v1.4.19 — ALMACENAMIENTO BINARIO COMPATIBLE CON iPHONE/iPAD

Problema confirmado en Safari:
"Failed to store record in an IDBObjectStore: BlobURLs are not yet supported."

Corrección:
- Los PDF nuevos se convierten a ArrayBuffer antes de guardarse en IndexedDB.
- Al consultar un documento se reconstruye su Blob original, sin alterar el visor de la v1.4.18.
- La misma protección se aplica a fotografías y medios de empresas.
- La importación del respaldo integral convierte los binarios antiguos antes de guardarlos.
- Los documentos que ya existan como Blob siguen leyéndose; no se borra ni reescribe ningún registro anterior.

Para trasladar documentos originales del computador:
1. En la app del computador, donde los PDF sí están presentes, exportar un respaldo INTEGRAL.
2. Guardarlo en un lugar PRIVADO y comprobar que terminó la descarga.
3. En el iPhone/iPad, abrir exactamente el origen en el que ya aparecen los líderes.
4. En Configuración, seleccionar el JSON integral y pulsar Fusionar respaldo.
5. Esperar el resumen de importación. Si hay errores, conservar el JSON y NO borrar datos locales.

Nunca subir un respaldo de datos a GitHub. No desinstalar la PWA ni borrar datos de Safari.
El modo de navegación privada puede imponer límites adicionales de persistencia.

Nota: Esta corrección resuelve específicamente la serialización de Blob; el espacio de
almacenamiento disponible y los permisos del navegador siguen siendo requisitos.
