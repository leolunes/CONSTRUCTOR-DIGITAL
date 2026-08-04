// =====================================
// FUENTES-FINANCIACION.JS
// CONSTRUCTOR MGA PRO
// Catálogo maestro de fuentes de financiación
// =====================================

const CatalogoFuentesFinanciacion = {

    nombre:
    "Catálogo Maestro de Fuentes de Financiación",

    version:
    "1.0.0",

    descripcion:
    "Banco reutilizable de fuentes de financiación para estructurar proyectos de inversión pública.",

    categorias: {

        PUBLICAS_TERRITORIALES: {

            RECURSOS_PROPIOS: {
                id: "FUE-PUB-001",
                codigo: "FUE-PUB-001",
                nombre: "Recursos propios",
                descripcion: "Recursos del presupuesto propio de la entidad territorial o entidad pública ejecutora.",
                tipo: "Pública",
                nivel: "Territorial",
                aplicaA: ["municipios", "departamentos", "entidades descentralizadas"],
                requiereCofinanciacion: false,
                palabrasClave: ["recursos propios", "municipio", "departamento", "presupuesto"]
            },

            SGP_PROPOSITO_GENERAL: {
                id: "FUE-PUB-002",
                codigo: "FUE-PUB-002",
                nombre: "Sistema General de Participaciones - Propósito General",
                descripcion: "Recursos del SGP destinados a competencias territoriales de propósito general conforme a la normatividad aplicable.",
                tipo: "Pública",
                nivel: "Nacional-Territorial",
                aplicaA: ["municipios", "departamentos"],
                requiereCofinanciacion: false,
                palabrasClave: ["sgp", "propósito general", "participaciones"]
            },

            SGP_EDUCACION: {
                id: "FUE-PUB-003",
                codigo: "FUE-PUB-003",
                nombre: "Sistema General de Participaciones - Educación",
                descripcion: "Recursos del SGP orientados al sector educación, conforme a competencias y destinación aplicable.",
                tipo: "Pública",
                nivel: "Nacional-Territorial",
                aplicaA: ["educación", "instituciones educativas"],
                requiereCofinanciacion: false,
                sectoresFrecuentes: ["SEC-SOC-003"],
                palabrasClave: ["sgp", "educación", "colegios", "escuelas"]
            },

            SGP_SALUD: {
                id: "FUE-PUB-004",
                codigo: "FUE-PUB-004",
                nombre: "Sistema General de Participaciones - Salud",
                descripcion: "Recursos del SGP orientados al sector salud conforme a la normatividad aplicable.",
                tipo: "Pública",
                nivel: "Nacional-Territorial",
                aplicaA: ["salud", "servicios de salud"],
                requiereCofinanciacion: false,
                sectoresFrecuentes: ["SEC-SOC-002"],
                palabrasClave: ["sgp", "salud", "recursos salud"]
            },

            SGP_AGUA_POTABLE: {
                id: "FUE-PUB-005",
                codigo: "FUE-PUB-005",
                nombre: "Sistema General de Participaciones - Agua Potable y Saneamiento Básico",
                descripcion: "Recursos del SGP destinados a agua potable y saneamiento básico.",
                tipo: "Pública",
                nivel: "Nacional-Territorial",
                aplicaA: ["acueducto", "alcantarillado", "saneamiento"],
                requiereCofinanciacion: false,
                sectoresFrecuentes: ["SEC-INF-002"],
                palabrasClave: ["sgp", "agua potable", "saneamiento", "acueducto"]
            }

        },

        NACIONALES: {

            SGR: {
                id: "FUE-NAC-001",
                codigo: "FUE-NAC-001",
                nombre: "Sistema General de Regalías",
                descripcion: "Recursos del Sistema General de Regalías para financiar proyectos de inversión pública conforme a requisitos de viabilidad, priorización y aprobación.",
                tipo: "Pública",
                nivel: "Nacional-Territorial",
                aplicaA: ["proyectos de inversión", "infraestructura", "desarrollo territorial"],
                requiereCofinanciacion: false,
                requiereMGA: true,
                palabrasClave: ["sgr", "regalías", "ocad", "inversión pública"]
            },

            PRESUPUESTO_GENERAL_NACION: {
                id: "FUE-NAC-002",
                codigo: "FUE-NAC-002",
                nombre: "Presupuesto General de la Nación",
                descripcion: "Recursos asignados desde entidades del orden nacional para financiar proyectos, programas o convenios.",
                tipo: "Pública",
                nivel: "Nacional",
                aplicaA: ["ministerios", "departamentos administrativos", "entidades nacionales"],
                requiereCofinanciacion: true,
                requiereMGA: true,
                palabrasClave: ["pgn", "nación", "ministerio", "recursos nacionales"]
            },

            COFINANCIACION_MINISTERIAL: {
                id: "FUE-NAC-003",
                codigo: "FUE-NAC-003",
                nombre: "Cofinanciación ministerial",
                descripcion: "Recursos de programas o convocatorias sectoriales de ministerios o entidades nacionales.",
                tipo: "Pública",
                nivel: "Nacional",
                aplicaA: ["salud", "educación", "deporte", "cultura", "agua", "transporte"],
                requiereCofinanciacion: true,
                requiereMGA: true,
                palabrasClave: ["ministerio", "cofinanciación", "convocatoria", "programa nacional"]
            }

        },

        CREDITO_Y_PRIVADAS: {

            CREDITO_PUBLICO: {
                id: "FUE-CRE-001",
                codigo: "FUE-CRE-001",
                nombre: "Crédito público",
                descripcion: "Recursos provenientes de operaciones de crédito interno o externo, sujetos a capacidad de endeudamiento y autorizaciones aplicables.",
                tipo: "Crédito",
                nivel: "Territorial/Nacional",
                aplicaA: ["infraestructura", "inversión pública", "programas estratégicos"],
                requiereCofinanciacion: false,
                requiereMGA: true,
                palabrasClave: ["crédito", "endeudamiento", "financiación"]
            },

            ALIANZA_PUBLICO_PRIVADA: {
                id: "FUE-CRE-002",
                codigo: "FUE-CRE-002",
                nombre: "Alianza Público Privada - APP",
                descripcion: "Esquema de vinculación de capital privado para provisión de infraestructura o servicios públicos conforme a la normatividad aplicable.",
                tipo: "Mixta",
                nivel: "Nacional/Territorial",
                aplicaA: ["infraestructura", "servicios", "operación"],
                requiereCofinanciacion: true,
                requiereMGA: false,
                palabrasClave: ["app", "alianza público privada", "privado", "concesión"]
            },

            APORTES_PRIVADOS: {
                id: "FUE-CRE-003",
                codigo: "FUE-CRE-003",
                nombre: "Aportes privados",
                descripcion: "Recursos aportados por personas jurídicas o naturales privadas para cofinanciar proyectos de interés público.",
                tipo: "Privada",
                nivel: "Privado",
                aplicaA: ["cofinanciación", "responsabilidad social", "alianzas"],
                requiereCofinanciacion: true,
                requiereMGA: false,
                palabrasClave: ["privado", "aportes", "donación", "alianza"]
            }

        },

        COOPERACION_Y_OTRAS: {

            COOPERACION_INTERNACIONAL: {
                id: "FUE-COO-001",
                codigo: "FUE-COO-001",
                nombre: "Cooperación internacional",
                descripcion: "Recursos técnicos o financieros provenientes de organismos internacionales, agencias de cooperación o gobiernos extranjeros.",
                tipo: "Cooperación",
                nivel: "Internacional",
                aplicaA: ["social", "ambiente", "rural", "salud", "educación", "paz"],
                requiereCofinanciacion: true,
                requiereMGA: false,
                palabrasClave: ["cooperación", "internacional", "agencia", "donante"]
            },

            OBRAS_POR_IMPUESTOS: {
                id: "FUE-COO-002",
                codigo: "FUE-COO-002",
                nombre: "Obras por Impuestos",
                descripcion: "Mecanismo mediante el cual contribuyentes pueden ejecutar proyectos de inversión pública en territorios y condiciones habilitadas.",
                tipo: "Mixta",
                nivel: "Nacional-Territorial",
                aplicaA: ["infraestructura", "educación", "salud", "agua", "vías"],
                requiereCofinanciacion: false,
                requiereMGA: true,
                palabrasClave: ["obras por impuestos", "contribuyentes", "zomac"]
            },

            CONVENIOS_ASOCIACION: {
                id: "FUE-COO-003",
                codigo: "FUE-COO-003",
                nombre: "Convenios de asociación",
                descripcion: "Esquema de asociación entre entidades públicas y entidades sin ánimo de lucro para impulsar programas o actividades de interés público.",
                tipo: "Asociativa",
                nivel: "Territorial/Nacional",
                aplicaA: ["social", "cultura", "deporte", "salud", "educación"],
                requiereCofinanciacion: true,
                requiereMGA: false,
                palabrasClave: ["convenio", "asociación", "esal", "interés público"]
            },

            DONACIONES: {
                id: "FUE-COO-004",
                codigo: "FUE-COO-004",
                nombre: "Donaciones",
                descripcion: "Recursos o bienes entregados sin contraprestación para apoyar la ejecución de proyectos o programas.",
                tipo: "Donación",
                nivel: "Privado/Internacional",
                aplicaA: ["social", "educación", "salud", "ambiente"],
                requiereCofinanciacion: false,
                requiereMGA: false,
                palabrasClave: ["donación", "aporte", "benefactor"]
            }

        },

        ESPECIALES: {

            ESTAMPILLA_ADULTO_MAYOR: {
                id: "FUE-ESP-001",
                codigo: "FUE-ESP-001",
                nombre: "Estampilla para el bienestar del adulto mayor",
                descripcion: "Fuente orientada a la financiación de programas y servicios para el bienestar de la población adulta mayor, conforme a la normatividad aplicable.",
                tipo: "Especial",
                nivel: "Territorial",
                aplicaA: ["adulto mayor", "centro vida", "centro día"],
                requiereCofinanciacion: false,
                sectoresFrecuentes: ["SEC-SOC-001"],
                normasRelacionadas: ["NOR-SOC-001", "NOR-SOC-002"],
                palabrasClave: ["estampilla", "adulto mayor", "centro vida"]
            },

            RECURSOS_SALUD_PUBLICA: {
                id: "FUE-ESP-002",
                codigo: "FUE-ESP-002",
                nombre: "Recursos de salud pública",
                descripcion: "Recursos destinados a acciones de salud pública, promoción, prevención, vigilancia y gestión del riesgo en salud.",
                tipo: "Especial",
                nivel: "Territorial/Nacional",
                aplicaA: ["salud pública", "promoción", "prevención"],
                requiereCofinanciacion: false,
                sectoresFrecuentes: ["SEC-SOC-002"],
                normasRelacionadas: ["NOR-SAL-001", "NOR-SAL-002", "NOR-SAL-003"],
                palabrasClave: ["salud pública", "promoción", "prevención"]
            },

            RECURSOS_CULTURA: {
                id: "FUE-ESP-003",
                codigo: "FUE-ESP-003",
                nombre: "Recursos sector cultura",
                descripcion: "Recursos destinados al fomento, infraestructura, patrimonio, formación y circulación cultural.",
                tipo: "Especial",
                nivel: "Territorial/Nacional",
                aplicaA: ["cultura", "biblioteca", "patrimonio", "casa de cultura"],
                requiereCofinanciacion: true,
                sectoresFrecuentes: ["SEC-CDA-002"],
                normasRelacionadas: ["NOR-CUL-001", "NOR-CUL-002"],
                palabrasClave: ["cultura", "patrimonio", "biblioteca"]
            }

        }

    }

};

if(window.CatalogoMGA){
    CatalogoMGA.registrar("fuentes-financiacion", CatalogoFuentesFinanciacion);
    CatalogoMGA.registrar("fuentes.financiacion", CatalogoFuentesFinanciacion);
    CatalogoMGA.registrar("fuentes", CatalogoFuentesFinanciacion);
}

window.CatalogoFuentesFinanciacion = CatalogoFuentesFinanciacion;
