// =====================================
// INDICADORES.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de indicadores MGA
// =====================================

const CatalogoIndicadores = {

    nombre:
    "Catálogo Maestro de Indicadores MGA",

    version:
    "1.0.0",

    descripcion:
    "Banco reutilizable de indicadores tipo para productos, resultados, gestión e impacto dentro de proyectos MGA.",

    categorias: {

        // =====================================
        // INDICADORES DE PRODUCTO
        // =====================================

        PRODUCTO: {

            INFRAESTRUCTURA_CONSTRUIDA: {
                id: "IND-PRO-001",
                codigo: "IND-PRO-001",
                nombre: "Infraestructura construida",
                descripcion: "Mide el número de infraestructuras nuevas construidas y puestas al servicio.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Acta de recibo final, informe de interventoría, registro fotográfico y certificado de puesta en funcionamiento.",
                frecuenciaMedicion: "Al finalizar la ejecución",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-INF-001",
                palabrasClave: ["infraestructura", "construida", "obra", "edificación"]
            },

            INFRAESTRUCTURA_MEJORADA: {
                id: "IND-PRO-002",
                codigo: "IND-PRO-002",
                nombre: "Infraestructura mejorada",
                descripcion: "Mide el número de infraestructuras existentes mejoradas, adecuadas o intervenidas.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Acta de recibo, informe de supervisión, registro fotográfico y certificación de mejora.",
                frecuenciaMedicion: "Al finalizar la ejecución",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-INF-002",
                palabrasClave: ["infraestructura", "mejorada", "adecuada", "rehabilitada"]
            },

            INFRAESTRUCTURA_REHABILITADA: {
                id: "IND-PRO-003",
                codigo: "IND-PRO-003",
                nombre: "Infraestructura rehabilitada",
                descripcion: "Mide el número de infraestructuras rehabilitadas o recuperadas funcionalmente.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Actas de recibo, informes técnicos y registro fotográfico.",
                frecuenciaMedicion: "Al finalizar la ejecución",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-INF-003",
                palabrasClave: ["rehabilitación", "recuperación", "infraestructura"]
            },

            INFRAESTRUCTURA_AMPLIADA: {
                id: "IND-PRO-004",
                codigo: "IND-PRO-004",
                nombre: "Infraestructura ampliada",
                descripcion: "Mide el número de infraestructuras ampliadas para aumentar cobertura o capacidad.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Acta de recibo, informe de supervisión y documentos técnicos.",
                frecuenciaMedicion: "Al finalizar la ejecución",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-INF-004",
                palabrasClave: ["ampliación", "capacidad", "cobertura"]
            },

            ESPACIO_PUBLICO_MEJORADO: {
                id: "IND-PRO-005",
                codigo: "IND-PRO-005",
                nombre: "Espacio público mejorado",
                descripcion: "Mide el área de espacio público mejorada o intervenida.",
                tipoIndicador: "Producto",
                unidadMedida: "Metro cuadrado",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Acta de recibo, planos, mediciones de obra y registro fotográfico.",
                frecuenciaMedicion: "Al finalizar la ejecución",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-INF-005",
                palabrasClave: ["espacio público", "parque", "andenes", "urbanismo"]
            },

            DOTACION_INSTALADA: {
                id: "IND-PRO-010",
                codigo: "IND-PRO-010",
                nombre: "Dotación instalada",
                descripcion: "Mide el número de elementos de dotación instalados y puestos en funcionamiento.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Acta de entrega, inventario, factura, registro fotográfico y certificado de instalación.",
                frecuenciaMedicion: "Al finalizar la entrega",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-DOT-001",
                palabrasClave: ["dotación", "equipamiento", "mobiliario", "instalación"]
            },

            EQUIPOS_ADQUIRIDOS: {
                id: "IND-PRO-011",
                codigo: "IND-PRO-011",
                nombre: "Equipos adquiridos",
                descripcion: "Mide el número de equipos adquiridos en el marco del proyecto.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Facturas, actas de entrega, inventario y registro de ingreso a almacén.",
                frecuenciaMedicion: "Al finalizar la adquisición",
                responsable: "Entidad ejecutora / Almacén / Supervisión",
                productoAsociado: "PRO-DOT-002",
                palabrasClave: ["equipos", "adquisición", "tecnología", "biomédico"]
            },

            MOBILIARIO_SUMINISTRADO: {
                id: "IND-PRO-012",
                codigo: "IND-PRO-012",
                nombre: "Mobiliario suministrado",
                descripcion: "Mide el número de elementos de mobiliario suministrados e instalados.",
                tipoIndicador: "Producto",
                unidadMedida: "Unidad",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Actas de entrega, inventario, registro fotográfico y comprobantes de suministro.",
                frecuenciaMedicion: "Al finalizar la entrega",
                responsable: "Entidad ejecutora / Supervisión",
                productoAsociado: "PRO-DOT-003",
                palabrasClave: ["mobiliario", "sillas", "mesas", "dotación"]
            },

            PERSONAS_CAPACITADAS: {
                id: "IND-PRO-020",
                codigo: "IND-PRO-020",
                nombre: "Personas capacitadas",
                descripcion: "Mide el número de personas capacitadas mediante jornadas, talleres o procesos formativos.",
                tipoIndicador: "Producto",
                unidadMedida: "Personas",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Listados de asistencia, certificaciones, actas y registros fotográficos.",
                frecuenciaMedicion: "Mensual / Al finalizar la capacitación",
                responsable: "Entidad ejecutora / Equipo social o técnico",
                productoAsociado: "PRO-FOR-001",
                palabrasClave: ["capacitación", "personas", "formación", "beneficiarios"]
            },

            FUNCIONARIOS_CAPACITADOS: {
                id: "IND-PRO-021",
                codigo: "IND-PRO-021",
                nombre: "Funcionarios capacitados",
                descripcion: "Mide el número de funcionarios o servidores públicos capacitados.",
                tipoIndicador: "Producto",
                unidadMedida: "Personas",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Listados de asistencia, certificaciones y reportes de capacitación.",
                frecuenciaMedicion: "Al finalizar la capacitación",
                responsable: "Entidad ejecutora",
                productoAsociado: "PRO-FOR-002",
                palabrasClave: ["funcionarios", "capacitación", "institucional"]
            },

            ORGANIZACIONES_FORTALECIDAS: {
                id: "IND-PRO-022",
                codigo: "IND-PRO-022",
                nombre: "Organizaciones fortalecidas",
                descripcion: "Mide el número de organizaciones fortalecidas mediante asistencia técnica o acompañamiento.",
                tipoIndicador: "Producto",
                unidadMedida: "Organizaciones",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Actas de asistencia técnica, informes de acompañamiento y registros de participación.",
                frecuenciaMedicion: "Trimestral / Al finalizar",
                responsable: "Entidad ejecutora / Equipo técnico",
                productoAsociado: "PRO-FOR-003",
                palabrasClave: ["organizaciones", "fortalecimiento", "asistencia técnica"]
            },

            SERVICIO_IMPLEMENTADO: {
                id: "IND-PRO-030",
                codigo: "IND-PRO-030",
                nombre: "Servicio implementado",
                descripcion: "Mide el número de servicios implementados y operando como resultado del proyecto.",
                tipoIndicador: "Producto",
                unidadMedida: "Servicio",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Informe de implementación, acta de inicio de operación y registros administrativos.",
                frecuenciaMedicion: "Al finalizar la implementación",
                responsable: "Entidad ejecutora / Operador",
                productoAsociado: "PRO-SER-001",
                palabrasClave: ["servicio", "implementado", "operación", "atención"]
            },

            PERSONAS_ATENDIDAS: {
                id: "IND-PRO-032",
                codigo: "IND-PRO-032",
                nombre: "Personas atendidas",
                descripcion: "Mide el número de personas atendidas mediante los servicios o programas del proyecto.",
                tipoIndicador: "Producto",
                unidadMedida: "Personas",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Registros de atención, bases de beneficiarios, listados de asistencia e informes.",
                frecuenciaMedicion: "Mensual / Trimestral",
                responsable: "Entidad ejecutora / Operador",
                productoAsociado: "PRO-SER-003",
                palabrasClave: ["personas", "atención", "beneficiarios", "servicio"]
            },

            JORNADAS_REALIZADAS: {
                id: "IND-PRO-033",
                codigo: "IND-PRO-033",
                nombre: "Jornadas realizadas",
                descripcion: "Mide el número de jornadas realizadas en el marco del proyecto.",
                tipoIndicador: "Producto",
                unidadMedida: "Jornadas",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Actas, listados de asistencia, informes y registros fotográficos.",
                frecuenciaMedicion: "Mensual / Al finalizar",
                responsable: "Entidad ejecutora / Equipo técnico",
                productoAsociado: "PRO-SER-004",
                palabrasClave: ["jornadas", "atención", "promoción", "prevención"]
            },

            ESTUDIOS_ELABORADOS: {
                id: "IND-PRO-040",
                codigo: "IND-PRO-040",
                nombre: "Estudios elaborados",
                descripcion: "Mide el número de estudios elaborados para soportar la formulación o ejecución del proyecto.",
                tipoIndicador: "Producto",
                unidadMedida: "Documento",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Documento final, acta de entrega y concepto técnico.",
                frecuenciaMedicion: "Al finalizar",
                responsable: "Consultor / Entidad ejecutora",
                productoAsociado: "PRO-GES-001",
                palabrasClave: ["estudios", "documentos", "soporte", "técnicos"]
            },

            DISENOS_REALIZADOS: {
                id: "IND-PRO-041",
                codigo: "IND-PRO-041",
                nombre: "Diseños realizados",
                descripcion: "Mide el número de diseños técnicos elaborados, revisados y entregados.",
                tipoIndicador: "Producto",
                unidadMedida: "Documento",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Diseños, planos, memorias, acta de entrega y concepto técnico.",
                frecuenciaMedicion: "Al finalizar",
                responsable: "Consultor / Entidad ejecutora",
                productoAsociado: "PRO-GES-002",
                palabrasClave: ["diseños", "planos", "memorias", "documentos técnicos"]
            },

            PROYECTO_FORMULADO: {
                id: "IND-PRO-043",
                codigo: "IND-PRO-043",
                nombre: "Proyecto formulado",
                descripcion: "Mide el número de proyectos formulados conforme a la metodología aplicable.",
                tipoIndicador: "Producto",
                unidadMedida: "Proyecto",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Documento MGA, ficha del proyecto, soporte de radicación o viabilidad.",
                frecuenciaMedicion: "Al finalizar",
                responsable: "Entidad formuladora",
                productoAsociado: "PRO-GES-004",
                palabrasClave: ["proyecto", "formulación", "mga", "banco de proyectos"]
            }

        },

        // =====================================
        // INDICADORES DE RESULTADO
        // =====================================

        RESULTADO: {

            COBERTURA_SERVICIO: {
                id: "IND-RES-001",
                codigo: "IND-RES-001",
                nombre: "Cobertura del servicio",
                descripcion: "Mide el porcentaje de población objetivo cubierta por el servicio, programa o infraestructura del proyecto.",
                tipoIndicador: "Resultado",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Registros administrativos, bases de beneficiarios e informes de operación.",
                frecuenciaMedicion: "Semestral / Anual",
                responsable: "Entidad responsable del servicio",
                palabrasClave: ["cobertura", "servicio", "beneficiarios", "población"]
            },

            ACCESO_MEJORADO: {
                id: "IND-RES-002",
                codigo: "IND-RES-002",
                nombre: "Acceso mejorado",
                descripcion: "Mide el mejoramiento en el acceso de la población objetivo a bienes o servicios públicos.",
                tipoIndicador: "Resultado",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Encuestas, registros de uso, informes de atención y estadísticas institucionales.",
                frecuenciaMedicion: "Semestral / Anual",
                responsable: "Entidad ejecutora / Operador",
                palabrasClave: ["acceso", "mejoramiento", "servicios", "población"]
            },

            CALIDAD_SERVICIO: {
                id: "IND-RES-003",
                codigo: "IND-RES-003",
                nombre: "Calidad del servicio mejorada",
                descripcion: "Mide la mejora en la calidad percibida o técnica del servicio entregado a la población.",
                tipoIndicador: "Resultado",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Encuestas de satisfacción, informes técnicos y registros de calidad.",
                frecuenciaMedicion: "Anual",
                responsable: "Entidad ejecutora / Operador",
                palabrasClave: ["calidad", "satisfacción", "servicio", "mejora"]
            },

            CAPACIDAD_INSTALADA: {
                id: "IND-RES-004",
                codigo: "IND-RES-004",
                nombre: "Capacidad instalada incrementada",
                descripcion: "Mide el aumento en la capacidad física, técnica u operativa generada por el proyecto.",
                tipoIndicador: "Resultado",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Informes técnicos, inventarios, actas de entrega y registros de operación.",
                frecuenciaMedicion: "Al finalizar / Anual",
                responsable: "Entidad ejecutora",
                palabrasClave: ["capacidad", "instalada", "operativa", "infraestructura"]
            }

        },

        // =====================================
        // INDICADORES DE GESTIÓN
        // =====================================

        GESTION: {

            AVANCE_FISICO: {
                id: "IND-GES-001",
                codigo: "IND-GES-001",
                nombre: "Avance físico del proyecto",
                descripcion: "Mide el porcentaje de avance físico en la ejecución de las actividades programadas.",
                tipoIndicador: "Gestión",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 100,
                fuenteVerificacion: "Informes de supervisión, actas de obra, cronograma e informes de avance.",
                frecuenciaMedicion: "Mensual",
                responsable: "Supervisor / Interventor",
                palabrasClave: ["avance", "físico", "cronograma", "ejecución"]
            },

            AVANCE_FINANCIERO: {
                id: "IND-GES-002",
                codigo: "IND-GES-002",
                nombre: "Avance financiero del proyecto",
                descripcion: "Mide el porcentaje de ejecución financiera frente al presupuesto programado.",
                tipoIndicador: "Gestión",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 100,
                fuenteVerificacion: "Informes financieros, registros presupuestales, actas de pago y reportes contables.",
                frecuenciaMedicion: "Mensual",
                responsable: "Entidad ejecutora / Supervisor",
                palabrasClave: ["avance", "financiero", "presupuesto", "pagos"]
            },

            CUMPLIMIENTO_CRONOGRAMA: {
                id: "IND-GES-003",
                codigo: "IND-GES-003",
                nombre: "Cumplimiento del cronograma",
                descripcion: "Mide el cumplimiento de los tiempos programados para la ejecución del proyecto.",
                tipoIndicador: "Gestión",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 100,
                fuenteVerificacion: "Cronograma aprobado, informes de seguimiento y actas de comité.",
                frecuenciaMedicion: "Mensual",
                responsable: "Supervisor / Interventor",
                palabrasClave: ["cronograma", "cumplimiento", "tiempo", "programación"]
            },

            CONTRATOS_SUPERVISADOS: {
                id: "IND-GES-004",
                codigo: "IND-GES-004",
                nombre: "Contratos supervisados",
                descripcion: "Mide el número de contratos con seguimiento técnico, administrativo, financiero o jurídico.",
                tipoIndicador: "Gestión",
                unidadMedida: "Contratos",
                lineaBase: 0,
                metaSugerida: 1,
                fuenteVerificacion: "Informes de supervisión, actas de comité y expedientes contractuales.",
                frecuenciaMedicion: "Mensual / Trimestral",
                responsable: "Supervisor / Entidad ejecutora",
                palabrasClave: ["contratos", "supervisión", "seguimiento"]
            }

        },

        // =====================================
        // INDICADORES DE IMPACTO
        // =====================================

        IMPACTO: {

            BIENESTAR_MEJORADO: {
                id: "IND-IMP-001",
                codigo: "IND-IMP-001",
                nombre: "Mejoramiento de condiciones de bienestar",
                descripcion: "Mide la contribución del proyecto al mejoramiento de las condiciones de bienestar de la población objetivo.",
                tipoIndicador: "Impacto",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Encuestas, evaluaciones posteriores, registros administrativos e informes de impacto.",
                frecuenciaMedicion: "Anual / Ex post",
                responsable: "Entidad responsable del programa",
                palabrasClave: ["bienestar", "impacto", "condiciones", "población"]
            },

            VULNERABILIDAD_REDUCIDA: {
                id: "IND-IMP-002",
                codigo: "IND-IMP-002",
                nombre: "Reducción de vulnerabilidad",
                descripcion: "Mide la reducción de condiciones de vulnerabilidad asociadas al problema intervenido.",
                tipoIndicador: "Impacto",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Caracterizaciones, encuestas, registros administrativos e informes sectoriales.",
                frecuenciaMedicion: "Anual / Ex post",
                responsable: "Entidad territorial / Operador",
                palabrasClave: ["vulnerabilidad", "reducción", "social", "población"]
            },

            SATISFACCION_USUARIOS: {
                id: "IND-IMP-003",
                codigo: "IND-IMP-003",
                nombre: "Satisfacción de usuarios",
                descripcion: "Mide el nivel de satisfacción de los usuarios o beneficiarios frente a los bienes o servicios entregados.",
                tipoIndicador: "Impacto",
                unidadMedida: "Porcentaje",
                lineaBase: 0,
                metaSugerida: 0,
                fuenteVerificacion: "Encuestas de satisfacción, buzones de atención e informes de evaluación.",
                frecuenciaMedicion: "Anual",
                responsable: "Entidad ejecutora / Operador",
                palabrasClave: ["satisfacción", "usuarios", "beneficiarios", "servicio"]
            }

        }

    }

};

// Registrar catálogo si existe el administrador central
if(window.CatalogoMGA){
    CatalogoMGA.registrar("indicadores", CatalogoIndicadores);
}

window.CatalogoIndicadores = CatalogoIndicadores;
