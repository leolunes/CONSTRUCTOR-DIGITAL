INSERT OR IGNORE INTO consecutivos(entidad,ultimo_valor,prefijo) VALUES
('obras',0,'OBR'),('bitacoras',0,'BIT'),('anotaciones',0,'ANOT');

INSERT OR IGNORE INTO configuracion(clave,valor,tipo) VALUES
('nombre_aplicacion','Bitácora de Obras','texto'),
('version_base_datos','1.0.0','texto'),
('copias_automaticas','1','booleano'),
('dias_retencion_copias','30','numero');

INSERT OR IGNORE INTO schema_migrations(version,nombre)
VALUES('001','estructura_inicial');

INSERT OR IGNORE INTO schema_migrations(version,nombre)
VALUES('002','datos_iniciales');
