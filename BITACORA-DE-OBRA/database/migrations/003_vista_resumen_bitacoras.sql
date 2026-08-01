CREATE VIEW IF NOT EXISTS vista_bitacoras_resumen AS
SELECT b.id,b.obra_id,o.codigo AS codigo_obra,o.nombre AS nombre_obra,
b.consecutivo,b.fecha,b.estado,
COUNT(DISTINCT a.id) AS total_anotaciones,
COUNT(DISTINCT i.id) AS total_imagenes,
COUNT(DISTINCT x.id) AS total_anexos
FROM bitacoras b
JOIN obras o ON o.id=b.obra_id
LEFT JOIN anotaciones a ON a.bitacora_id=b.id
LEFT JOIN imagenes i ON i.bitacora_id=b.id
LEFT JOIN anexos x ON x.bitacora_id=b.id
GROUP BY b.id;

INSERT OR IGNORE INTO schema_migrations(version,nombre)
VALUES('003','vista_resumen_bitacoras');
