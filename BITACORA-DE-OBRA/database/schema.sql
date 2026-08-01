PRAGMA foreign_keys=ON;
PRAGMA journal_mode=WAL;

CREATE TABLE IF NOT EXISTS schema_migrations(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 version TEXT NOT NULL UNIQUE,
 nombre TEXT NOT NULL,
 aplicado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS configuracion(
 clave TEXT PRIMARY KEY,
 valor TEXT,
 tipo TEXT NOT NULL DEFAULT 'texto',
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS empresas(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre TEXT NOT NULL,
 nit TEXT,
 direccion TEXT,
 telefono TEXT,
 correo TEXT,
 ciudad TEXT,
 departamento TEXT,
 logo_ruta TEXT,
 activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN(0,1)),
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS usuarios(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre_completo TEXT NOT NULL,
 documento TEXT,
 cargo TEXT,
 correo TEXT,
 telefono TEXT,
 rol TEXT NOT NULL DEFAULT 'usuario',
 firma_ruta TEXT,
 activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN(0,1)),
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS contratistas(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre_razon_social TEXT NOT NULL,
 nit_documento TEXT,
 representante_legal TEXT,
 direccion TEXT,
 telefono TEXT,
 correo TEXT,
 ciudad TEXT,
 activo INTEGER NOT NULL DEFAULT 1 CHECK(activo IN(0,1)),
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS obras(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 codigo TEXT NOT NULL UNIQUE,
 nombre TEXT NOT NULL,
 objeto TEXT,
 contrato_numero TEXT,
 ubicacion TEXT,
 municipio TEXT,
 departamento TEXT,
 fecha_inicio TEXT,
 fecha_fin_programada TEXT,
 fecha_fin_real TEXT,
 valor_contrato REAL NOT NULL DEFAULT 0,
 plazo_dias INTEGER NOT NULL DEFAULT 0,
 empresa_id INTEGER,
 contratista_id INTEGER,
 supervisor_id INTEGER,
 interventor_id INTEGER,
 estado TEXT NOT NULL DEFAULT 'activa',
 porcentaje_avance REAL NOT NULL DEFAULT 0 CHECK(porcentaje_avance BETWEEN 0 AND 100),
 observaciones TEXT,
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(empresa_id) REFERENCES empresas(id) ON DELETE SET NULL,
 FOREIGN KEY(contratista_id) REFERENCES contratistas(id) ON DELETE SET NULL,
 FOREIGN KEY(supervisor_id) REFERENCES usuarios(id) ON DELETE SET NULL,
 FOREIGN KEY(interventor_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS bitacoras(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 obra_id INTEGER NOT NULL,
 consecutivo INTEGER NOT NULL,
 fecha TEXT NOT NULL,
 hora_inicio TEXT,
 hora_fin TEXT,
 clima_manana TEXT,
 clima_tarde TEXT,
 temperatura_min REAL,
 temperatura_max REAL,
 estado TEXT NOT NULL DEFAULT 'borrador',
 observaciones_generales TEXT,
 elaborado_por INTEGER,
 revisado_por INTEGER,
 aprobado_por INTEGER,
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
 UNIQUE(obra_id,consecutivo),
 FOREIGN KEY(obra_id) REFERENCES obras(id) ON DELETE CASCADE,
 FOREIGN KEY(elaborado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
 FOREIGN KEY(revisado_por) REFERENCES usuarios(id) ON DELETE SET NULL,
 FOREIGN KEY(aprobado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS anotaciones(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 tipo TEXT NOT NULL DEFAULT 'actividad',
 hora TEXT,
 titulo TEXT,
 descripcion TEXT NOT NULL,
 responsable TEXT,
 ubicacion TEXT,
 estado TEXT NOT NULL DEFAULT 'abierta',
 prioridad TEXT NOT NULL DEFAULT 'normal',
 creado_por INTEGER,
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE,
 FOREIGN KEY(creado_por) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS personal_obra(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 categoria TEXT NOT NULL,
 descripcion TEXT,
 cantidad INTEGER NOT NULL DEFAULT 0,
 horas_trabajadas REAL NOT NULL DEFAULT 0,
 observaciones TEXT,
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS equipos_obra(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 equipo TEXT NOT NULL,
 marca_modelo TEXT,
 placa_interno TEXT,
 cantidad INTEGER NOT NULL DEFAULT 1,
 horas_trabajadas REAL NOT NULL DEFAULT 0,
 estado TEXT NOT NULL DEFAULT 'operativo',
 observaciones TEXT,
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS actividades(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 codigo TEXT,
 descripcion TEXT NOT NULL,
 unidad TEXT,
 cantidad_ejecutada REAL NOT NULL DEFAULT 0,
 porcentaje_avance REAL NOT NULL DEFAULT 0,
 frente_trabajo TEXT,
 observaciones TEXT,
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS materiales(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 material TEXT NOT NULL,
 unidad TEXT,
 cantidad_recibida REAL NOT NULL DEFAULT 0,
 cantidad_utilizada REAL NOT NULL DEFAULT 0,
 proveedor TEXT,
 remision TEXT,
 observaciones TEXT,
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS visitas(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 nombre TEXT NOT NULL,
 entidad TEXT,
 cargo TEXT,
 hora_ingreso TEXT,
 hora_salida TEXT,
 motivo TEXT,
 observaciones TEXT,
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS imagenes(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER,
 anotacion_id INTEGER,
 obra_id INTEGER NOT NULL,
 nombre_archivo TEXT NOT NULL,
 ruta TEXT NOT NULL,
 ruta_relativa TEXT,
 descripcion TEXT,
 fecha_captura TEXT,
 latitud REAL,
 longitud REAL,
 hash_sha256 TEXT,
 tamano_bytes INTEGER,
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE,
 FOREIGN KEY(anotacion_id) REFERENCES anotaciones(id) ON DELETE CASCADE,
 FOREIGN KEY(obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS anexos(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER,
 anotacion_id INTEGER,
 obra_id INTEGER NOT NULL,
 tipo TEXT,
 nombre_original TEXT NOT NULL,
 nombre_archivo TEXT NOT NULL,
 ruta TEXT NOT NULL,
 ruta_relativa TEXT,
 extension TEXT,
 mime TEXT,
 descripcion TEXT,
 hash_sha256 TEXT,
 tamano_bytes INTEGER,
 creado_en TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE,
 FOREIGN KEY(anotacion_id) REFERENCES anotaciones(id) ON DELETE CASCADE,
 FOREIGN KEY(obra_id) REFERENCES obras(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS firmas(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 bitacora_id INTEGER NOT NULL,
 usuario_id INTEGER,
 nombre_firmante TEXT NOT NULL,
 cargo_firmante TEXT,
 tipo_firma TEXT NOT NULL DEFAULT 'digital',
 firma_ruta TEXT,
 hash_documento TEXT,
 firmado_en TEXT NOT NULL DEFAULT (datetime('now')),
 FOREIGN KEY(bitacora_id) REFERENCES bitacoras(id) ON DELETE CASCADE,
 FOREIGN KEY(usuario_id) REFERENCES usuarios(id) ON DELETE SET NULL
);

CREATE TABLE IF NOT EXISTS exportaciones(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 obra_id INTEGER,
 bitacora_id INTEGER,
 formato TEXT NOT NULL,
 nombre_archivo TEXT NOT NULL,
 ruta TEXT NOT NULL,
 hash_sha256 TEXT,
 tamano_bytes INTEGER,
 creado_por INTEGER,
 creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS copias_seguridad(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 nombre TEXT NOT NULL,
 ruta TEXT NOT NULL,
 tipo TEXT NOT NULL DEFAULT 'manual',
 hash_sha256 TEXT,
 tamano_bytes INTEGER,
 estado TEXT NOT NULL DEFAULT 'completa',
 creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS auditoria(
 id INTEGER PRIMARY KEY AUTOINCREMENT,
 usuario_id INTEGER,
 accion TEXT NOT NULL,
 entidad TEXT NOT NULL,
 entidad_id INTEGER,
 detalle TEXT,
 creado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS consecutivos(
 entidad TEXT PRIMARY KEY,
 ultimo_valor INTEGER NOT NULL DEFAULT 0,
 prefijo TEXT,
 actualizado_en TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_bitacoras_obra_fecha ON bitacoras(obra_id,fecha);
CREATE INDEX IF NOT EXISTS idx_anotaciones_bitacora ON anotaciones(bitacora_id);
CREATE INDEX IF NOT EXISTS idx_imagenes_obra ON imagenes(obra_id);
CREATE INDEX IF NOT EXISTS idx_anexos_obra ON anexos(obra_id);
