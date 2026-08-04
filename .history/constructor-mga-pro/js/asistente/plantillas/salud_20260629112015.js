// =====================================
// PLANTILLAS/SALUD.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Salud
// =====================================

/*
  Este archivo registra tipologías especializadas del sector Salud.

  Requiere cargar antes:
  - js/asistente/motor-tipologias.js
*/

const PlantillasSalud = (()=>{

const SECTOR = "Salud";
const SECTOR_CODIGO = "SEC-SOC-002";

const comunes = {
    riesgos: [
        "RIE-TEC-001",
        "RIE-FIN-001",
        "RIE-CON-001",
        "RIE-CON-002"
    ],
    normasBase: [
        "NOR-SAL-001",
        "NOR-SAL-002",
        "NOR-SAL-003",
        "NOR-CON-001",
        "NOR-CON-003"
    ],
    fuentesBase: [
        "FUE-PUB-001",
        "FUE-PUB-004",
        "FUE-NAC-001",
        "FUE-NAC-003",
        "FUE-ESP-002"
    ]
};

const tipologias = [

    {
        codigo: "TIP-SAL-001",
        nombre: "Centro de Salud",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a construcción, mejoramiento, adecuación o dotación de centros de salud para fortalecer la prestación de servicios básicos de salud.",
        problemaCentral: "Insuficiente acceso de la población a servicios básicos de salud en condiciones adecuadas de oportunidad, calidad y continuidad.",
        objetivoGeneral: "Mejorar el acceso de la población a servicios básicos de salud en condiciones adecuadas de oportunidad, calidad y continuidad.",
        poblaciones: ["POB-SEC-003","POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-DOT-002","PRO-SER-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-011","IND-PRO-030","IND-RES-001","IND-RES-003","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente infraestructura física para la prestación de servicios básicos de salud.",
            "Limitada dotación y capacidad operativa para la atención de usuarios."
        ],
        causasIndirectas: [
            "Déficit de inversión en infraestructura y equipamiento en salud.",
            "Crecimiento de la demanda de servicios de salud en el territorio."
        ],
        efectosDirectos: [
            "Baja oportunidad en la atención de usuarios.",
            "Deterioro de la calidad percibida y técnica del servicio."
        ],
        efectosIndirectos: [
            "Aumento de barreras de acceso a servicios de salud.",
            "Mayor presión sobre otros niveles de atención."
        ],
        objetivosEspecificos: [
            "Fortalecer la infraestructura física para la prestación de servicios básicos de salud.",
            "Dotar los espacios requeridos para la atención de usuarios.",
            "Mejorar la capacidad operativa y funcional del servicio."
        ],
        beneficios: "La población contará con mejores condiciones de acceso a servicios básicos de salud, mayor oportunidad de atención y mejor calidad del servicio.",
        sostenibilidad: "La sostenibilidad dependerá de la habilitación de servicios, disponibilidad de talento humano, mantenimiento de infraestructura, reposición de equipos y recursos de operación.",
        palabrasClave: ["centro de salud","puesto de salud","salud básica","infraestructura en salud","ips"]
    },

    {
        codigo: "TIP-SAL-002",
        nombre: "Puesto de Salud Rural",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de construcción, adecuación, mejoramiento o dotación de puestos de salud para mejorar atención básica en zona rural.",
        problemaCentral: "Limitado acceso de la población rural a servicios básicos de salud cercanos y oportunos.",
        objetivoGeneral: "Mejorar el acceso de la población rural a servicios básicos de salud cercanos y oportunos.",
        poblaciones: ["POB-TER-001","POB-SEC-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-DOT-002","PRO-SER-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-011","IND-PRO-030","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001"],
        normas: ["NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente infraestructura rural para atención básica en salud.",
            "Dificultades de acceso geográfico a servicios de salud."
        ],
        causasIndirectas: [
            "Dispersión poblacional rural.",
            "Limitada disponibilidad de recursos para operación y mantenimiento."
        ],
        efectosDirectos: [
            "Incremento de tiempos y costos de desplazamiento para atención.",
            "Baja oportunidad en detección y atención temprana."
        ],
        efectosIndirectos: [
            "Mayor riesgo de complicaciones en salud.",
            "Incremento de brechas urbano-rurales en acceso a salud."
        ],
        objetivosEspecificos: [
            "Adecuar o construir infraestructura rural para atención básica.",
            "Dotar el puesto de salud con equipos y mobiliario requeridos.",
            "Fortalecer la atención básica y la remisión oportuna."
        ],
        beneficios: "La población rural tendrá mayor cercanía y oportunidad en la atención básica en salud.",
        sostenibilidad: "Se soportará en la articulación con la red pública de salud, disponibilidad de personal, mantenimiento y provisión de insumos básicos.",
        palabrasClave: ["puesto de salud","salud rural","vereda","población rural","atención básica"]
    },

    {
        codigo: "TIP-SAL-003",
        nombre: "Hospital Local o de Primer Nivel",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a construcción, mejoramiento, ampliación o dotación de hospitales de baja complejidad.",
        problemaCentral: "Insuficiente capacidad física, tecnológica y operativa para la prestación de servicios hospitalarios de baja complejidad.",
        objetivoGeneral: "Fortalecer la capacidad física, tecnológica y operativa para la prestación de servicios hospitalarios de baja complejidad.",
        poblaciones: ["POB-SEC-003","POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-INF-004","PRO-DOT-001","PRO-DOT-002","PRO-SER-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-004","IND-PRO-010","IND-PRO-011","IND-PRO-030","IND-RES-004","IND-GES-001","IND-GES-002"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Infraestructura hospitalaria insuficiente o deteriorada.",
            "Déficit de equipos biomédicos, mobiliario y capacidad instalada."
        ],
        causasIndirectas: [
            "Crecimiento de la demanda de servicios hospitalarios.",
            "Limitaciones presupuestales para reposición y mantenimiento."
        ],
        efectosDirectos: [
            "Congestión en la atención hospitalaria.",
            "Menor calidad y oportunidad en servicios de baja complejidad."
        ],
        efectosIndirectos: [
            "Remisiones innecesarias a mayores niveles de complejidad.",
            "Aumento de barreras de acceso y costos para usuarios."
        ],
        objetivosEspecificos: [
            "Mejorar o ampliar la infraestructura hospitalaria.",
            "Dotar servicios hospitalarios con equipos y mobiliario requeridos.",
            "Fortalecer la capacidad instalada para atención de baja complejidad."
        ],
        beneficios: "Se incrementará la capacidad de atención hospitalaria y se mejorará la calidad, oportunidad y continuidad del servicio.",
        sostenibilidad: "Requiere habilitación de servicios, talento humano, plan de mantenimiento hospitalario, reposición tecnológica y financiación de operación.",
        palabrasClave: ["hospital","primer nivel","baja complejidad","hospital local","infraestructura hospitalaria"]
    },

    {
        codigo: "TIP-SAL-004",
        nombre: "Dotación Hospitalaria",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a adquisición, instalación y puesta en funcionamiento de dotación hospitalaria, mobiliario clínico y elementos de apoyo.",
        problemaCentral: "Insuficiente dotación hospitalaria para la prestación adecuada, segura y oportuna de servicios de salud.",
        objetivoGeneral: "Fortalecer la dotación hospitalaria para la prestación adecuada, segura y oportuna de servicios de salud.",
        poblaciones: ["POB-SEC-003","POB-TER-003"],
        productos: ["PRO-DOT-001","PRO-DOT-002","PRO-DOT-003"],
        actividades: ["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-010","IND-PRO-011","IND-PRO-012","IND-RES-003","IND-GES-001","IND-GES-002"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-TEC-001"],
        normas: ["NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Obsolescencia o insuficiencia de dotación hospitalaria.",
            "Limitada disponibilidad de elementos para atención segura."
        ],
        causasIndirectas: [
            "Baja reposición de equipos y mobiliario.",
            "Aumento de demanda de servicios de salud."
        ],
        efectosDirectos: [
            "Restricciones en la prestación de servicios de salud.",
            "Disminución de la calidad y seguridad de la atención."
        ],
        efectosIndirectos: [
            "Mayor riesgo operativo y clínico.",
            "Insatisfacción de usuarios y personal asistencial."
        ],
        objetivosEspecificos: [
            "Adquirir dotación hospitalaria requerida.",
            "Instalar y poner en funcionamiento equipos y mobiliario.",
            "Fortalecer las condiciones de calidad y seguridad del servicio."
        ],
        beneficios: "Los servicios de salud contarán con dotación adecuada para mejorar calidad, seguridad y oportunidad de la atención.",
        sostenibilidad: "Dependerá de inventarios, mantenimiento, capacitación en uso, garantías y reposición programada.",
        palabrasClave: ["dotación hospitalaria","equipos hospitalarios","mobiliario clínico","dotación salud"]
    },

    {
        codigo: "TIP-SAL-005",
        nombre: "Equipos Biomédicos",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para adquisición, reposición, instalación y puesta en funcionamiento de equipos biomédicos.",
        problemaCentral: "Insuficiente disponibilidad de equipos biomédicos adecuados para diagnóstico, tratamiento y atención de usuarios.",
        objetivoGeneral: "Mejorar la disponibilidad de equipos biomédicos adecuados para diagnóstico, tratamiento y atención de usuarios.",
        poblaciones: ["POB-SEC-003","POB-TER-003"],
        productos: ["PRO-DOT-002"],
        actividades: ["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-011","IND-RES-003","IND-GES-001","IND-GES-002"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
        normas: ["NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Obsolescencia tecnológica de equipos biomédicos.",
            "Insuficiente capacidad diagnóstica y terapéutica."
        ],
        causasIndirectas: [
            "Limitado mantenimiento preventivo y correctivo.",
            "Insuficiencia presupuestal para renovación tecnológica."
        ],
        efectosDirectos: [
            "Demoras en diagnóstico y tratamiento.",
            "Mayor remisión de pacientes por falta de capacidad tecnológica."
        ],
        efectosIndirectos: [
            "Deterioro en oportunidad y calidad de la atención.",
            "Incremento de costos para usuarios y red de servicios."
        ],
        objetivosEspecificos: [
            "Adquirir equipos biomédicos requeridos.",
            "Garantizar instalación, calibración y puesta en funcionamiento.",
            "Fortalecer mantenimiento y uso adecuado de la tecnología biomédica."
        ],
        beneficios: "Se mejorará la capacidad diagnóstica y terapéutica, aumentando oportunidad y calidad de atención.",
        sostenibilidad: "Requiere plan de mantenimiento, garantías, calibración, capacitación del personal y reposición tecnológica.",
        palabrasClave: ["equipos biomédicos","biomédico","tecnología médica","diagnóstico","tratamiento"]
    },

    {
        codigo: "TIP-SAL-006",
        nombre: "Ambulancia TAB",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de adquisición o reposición de ambulancia de transporte asistencial básico.",
        problemaCentral: "Limitada capacidad de transporte asistencial básico para la atención y traslado oportuno de pacientes.",
        objetivoGeneral: "Fortalecer la capacidad de transporte asistencial básico para la atención y traslado oportuno de pacientes.",
        poblaciones: ["POB-SEC-003","POB-TER-003","POB-TER-001"],
        productos: ["PRO-DOT-002"],
        actividades: ["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-011","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
        normas: ["NOR-SAL-003","NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente disponibilidad de ambulancias para transporte básico.",
            "Obsolescencia o deterioro del parque automotor asistencial."
        ],
        causasIndirectas: [
            "Incremento de demanda de traslados.",
            "Altos costos de operación y mantenimiento vehicular."
        ],
        efectosDirectos: [
            "Demoras en traslado de pacientes.",
            "Limitaciones en respuesta ante urgencias básicas."
        ],
        efectosIndirectos: [
            "Mayor riesgo de complicaciones por atención tardía.",
            "Aumento de inequidades en acceso a atención de urgencias."
        ],
        objetivosEspecificos: [
            "Adquirir ambulancia de transporte asistencial básico.",
            "Garantizar dotación y condiciones operativas del vehículo.",
            "Fortalecer la respuesta institucional para traslado de pacientes."
        ],
        beneficios: "Se mejorará la oportunidad de traslado y respuesta básica a pacientes que requieren transporte asistencial.",
        sostenibilidad: "Dependerá de recursos para combustible, mantenimiento, seguros, personal habilitado y operación continua.",
        palabrasClave: ["ambulancia TAB","transporte asistencial básico","ambulancia","urgencias"]
    },

    {
        codigo: "TIP-SAL-007",
        nombre: "Ambulancia TAM",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de adquisición o reposición de ambulancia de transporte asistencial medicalizado.",
        problemaCentral: "Limitada capacidad de transporte asistencial medicalizado para pacientes que requieren atención especializada durante el traslado.",
        objetivoGeneral: "Fortalecer la capacidad de transporte asistencial medicalizado para pacientes que requieren atención especializada durante el traslado.",
        poblaciones: ["POB-SEC-003","POB-TER-003"],
        productos: ["PRO-DOT-002"],
        actividades: ["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-011","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-TEC-001"],
        normas: ["NOR-SAL-003","NOR-SAL-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente disponibilidad de transporte medicalizado.",
            "Deterioro u obsolescencia de ambulancias medicalizadas existentes."
        ],
        causasIndirectas: [
            "Alta demanda de traslados de mayor complejidad.",
            "Limitados recursos de operación especializada."
        ],
        efectosDirectos: [
            "Demoras en traslado de pacientes críticos.",
            "Mayor riesgo clínico durante el traslado."
        ],
        efectosIndirectos: [
            "Incremento de complicaciones y eventos adversos.",
            "Mayor presión sobre la red de urgencias."
        ],
        objetivosEspecificos: [
            "Adquirir ambulancia de transporte asistencial medicalizado.",
            "Garantizar dotación médica y tecnológica requerida.",
            "Fortalecer la respuesta institucional para traslado de pacientes críticos."
        ],
        beneficios: "Se mejorará la oportunidad y seguridad en el traslado de pacientes que requieren atención medicalizada.",
        sostenibilidad: "Requiere personal entrenado, mantenimiento especializado, insumos médicos, seguros, combustible y operación permanente.",
        palabrasClave: ["ambulancia TAM","transporte medicalizado","paciente crítico","urgencias"]
    },

    {
        codigo: "TIP-SAL-008",
        nombre: "Atención Primaria en Salud",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar o fortalecer estrategias territoriales de Atención Primaria en Salud.",
        problemaCentral: "Débil implementación de estrategias de Atención Primaria en Salud para la promoción, prevención y gestión temprana del riesgo.",
        objetivoGeneral: "Fortalecer la implementación de estrategias de Atención Primaria en Salud para la promoción, prevención y gestión temprana del riesgo.",
        poblaciones: ["POB-TER-003","POB-SEC-003","POB-TER-001"],
        productos: ["PRO-SER-002","PRO-SER-003","PRO-SER-004","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-032","IND-PRO-033","IND-PRO-020","IND-RES-001","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de acciones extramurales y comunitarias en salud.",
            "Limitada identificación temprana de riesgos en la población."
        ],
        causasIndirectas: [
            "Débil articulación entre prestadores, comunidad y entidad territorial.",
            "Insuficiente formación y seguimiento de equipos territoriales."
        ],
        efectosDirectos: [
            "Mayor demanda de servicios curativos y de urgencias.",
            "Baja prevención de enfermedades y eventos evitables."
        ],
        efectosIndirectos: [
            "Incremento de costos del sistema de salud.",
            "Deterioro de condiciones de salud pública y bienestar."
        ],
        objetivosEspecificos: [
            "Implementar acciones territoriales de promoción y prevención.",
            "Realizar búsqueda activa, caracterización y gestión temprana del riesgo.",
            "Fortalecer capacidades comunitarias e institucionales en salud."
        ],
        beneficios: "La población tendrá mayor acceso a acciones preventivas, educación en salud y gestión temprana del riesgo.",
        sostenibilidad: "Se soportará en equipos territoriales, articulación con la red de salud, seguimiento de indicadores y financiación continua de salud pública.",
        palabrasClave: ["APS","atención primaria","promoción","prevención","salud comunitaria"]
    },

    {
        codigo: "TIP-SAL-009",
        nombre: "Promoción y Prevención en Salud",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para desarrollar jornadas, campañas y acciones de promoción de la salud y prevención de la enfermedad.",
        problemaCentral: "Insuficiente cobertura de acciones de promoción de la salud y prevención de la enfermedad en la población.",
        objetivoGeneral: "Ampliar la cobertura de acciones de promoción de la salud y prevención de la enfermedad en la población.",
        poblaciones: ["POB-TER-003","POB-SEC-003"],
        productos: ["PRO-SER-004","PRO-SER-003","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-033","IND-PRO-032","IND-PRO-020","IND-RES-001","IND-IMP-001","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja realización de jornadas y campañas preventivas.",
            "Insuficiente educación en hábitos saludables y autocuidado."
        ],
        causasIndirectas: [
            "Limitada capacidad operativa para acciones colectivas.",
            "Débil participación comunitaria en salud."
        ],
        efectosDirectos: [
            "Aumento de enfermedades prevenibles.",
            "Baja adherencia a prácticas de autocuidado."
        ],
        efectosIndirectos: [
            "Mayor demanda de servicios asistenciales.",
            "Deterioro de indicadores de salud pública."
        ],
        objetivosEspecificos: [
            "Realizar jornadas de promoción y prevención.",
            "Desarrollar procesos de educación en salud y autocuidado.",
            "Fortalecer la participación comunitaria en acciones preventivas."
        ],
        beneficios: "La población mejorará conocimientos y prácticas de autocuidado y prevención de enfermedades.",
        sostenibilidad: "Dependerá de programación periódica, articulación con prestadores, participación comunitaria y seguimiento de coberturas.",
        palabrasClave: ["promoción y prevención","pyp","campañas de salud","jornadas","autocuidado"]
    },

    {
        codigo: "TIP-SAL-010",
        nombre: "Salud Mental",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de prevención, atención, orientación y acompañamiento en salud mental y bienestar emocional.",
        problemaCentral: "Insuficiente acceso de la población a servicios y acciones de promoción, prevención y atención en salud mental.",
        objetivoGeneral: "Mejorar el acceso de la población a servicios y acciones de promoción, prevención y atención en salud mental.",
        poblaciones: ["POB-TER-003","POB-CV-003","POB-CV-004","POB-VUL-002"],
        productos: ["PRO-SER-001","PRO-SER-003","PRO-SER-004","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-030","IND-PRO-032","IND-PRO-033","IND-PRO-020","IND-RES-003","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja disponibilidad de acciones preventivas y de orientación en salud mental.",
            "Limitada capacidad de atención psicosocial y canalización."
        ],
        causasIndirectas: [
            "Estigma social frente a la salud mental.",
            "Insuficiente articulación de rutas de atención."
        ],
        efectosDirectos: [
            "Aumento de problemáticas emocionales, familiares y comunitarias.",
            "Baja detección temprana de riesgos en salud mental."
        ],
        efectosIndirectos: [
            "Deterioro del bienestar y convivencia social.",
            "Mayor presión sobre servicios asistenciales y de urgencias."
        ],
        objetivosEspecificos: [
            "Implementar acciones de promoción y prevención en salud mental.",
            "Brindar orientación y acompañamiento psicosocial.",
            "Fortalecer rutas de atención y canalización."
        ],
        beneficios: "La población contará con mejores herramientas de bienestar emocional, prevención, orientación y acceso a rutas de atención.",
        sostenibilidad: "Se soportará en equipos psicosociales, articulación con salud pública, seguimiento de casos y rutas institucionales.",
        palabrasClave: ["salud mental","bienestar emocional","psicosocial","prevención suicidio","orientación"]
    },

    {
        codigo: "TIP-SAL-011",
        nombre: "Telemedicina",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar o fortalecer servicios de telemedicina, telesalud o atención remota en salud.",
        problemaCentral: "Limitado acceso de la población a servicios de salud especializados y oportunos mediante herramientas de atención remota.",
        objetivoGeneral: "Mejorar el acceso de la población a servicios de salud especializados y oportunos mediante herramientas de atención remota.",
        poblaciones: ["POB-SEC-003","POB-TER-001","POB-TER-003"],
        productos: ["PRO-TIC-001","PRO-TIC-003","PRO-DOT-002","PRO-FOR-002","PRO-SER-001"],
        actividades: ["ACT-PLA-004","ACT-EJE-003","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-050","IND-PRO-052","IND-PRO-011","IND-PRO-021","IND-PRO-030","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001"],
        normas: ["NOR-TIC-001","NOR-TIC-002",...comunes.normasBase],
        fuentes: ["FUE-NAC-003","FUE-PUB-004","FUE-NAC-001","FUE-ESP-002"],
        causasDirectas: [
            "Insuficiente disponibilidad de plataformas, conectividad y equipos para atención remota.",
            "Limitada capacidad institucional para implementar modelos de telemedicina."
        ],
        causasIndirectas: [
            "Brechas digitales en zonas rurales y dispersas.",
            "Baja formación del talento humano en herramientas de telesalud."
        ],
        efectosDirectos: [
            "Demoras en acceso a consultas especializadas.",
            "Incremento de desplazamientos de usuarios hacia centros urbanos."
        ],
        efectosIndirectos: [
            "Mayor inequidad territorial en acceso a salud.",
            "Aumento de costos para pacientes y red de servicios."
        ],
        objetivosEspecificos: [
            "Implementar plataformas y equipos para telemedicina.",
            "Capacitar talento humano en uso de herramientas de telesalud.",
            "Fortalecer la atención remota y seguimiento de usuarios."
        ],
        beneficios: "Se reducirá la barrera geográfica de acceso y se mejorará la oportunidad de atención especializada.",
        sostenibilidad: "Requiere conectividad, soporte técnico, protocolos de atención, capacitación continua y mantenimiento de plataformas y equipos.",
        palabrasClave: ["telemedicina","telesalud","atención remota","salud digital","conectividad"]
    },

    {
        codigo: "TIP-SAL-012",
        nombre: "Vacunación",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para fortalecer acciones, jornadas, cadena de frío, dotación y cobertura de vacunación.",
        problemaCentral: "Insuficiente cobertura y capacidad operativa para garantizar esquemas de vacunación oportunos y seguros.",
        objetivoGeneral: "Fortalecer la cobertura y capacidad operativa para garantizar esquemas de vacunación oportunos y seguros.",
        poblaciones: ["POB-TER-003","POB-CV-001","POB-CV-002","POB-CV-006"],
        productos: ["PRO-SER-004","PRO-SER-003","PRO-DOT-002","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-033","IND-PRO-032","IND-PRO-011","IND-PRO-013","IND-RES-001","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001","RIE-TEC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de jornadas de vacunación.",
            "Limitada capacidad logística y cadena de frío."
        ],
        causasIndirectas: [
            "Dificultades de acceso territorial a población dispersa.",
            "Baja adherencia de la población a esquemas de vacunación."
        ],
        efectosDirectos: [
            "Aumento de población susceptible a enfermedades inmunoprevenibles.",
            "Riesgo de brotes o eventos en salud pública."
        ],
        efectosIndirectos: [
            "Mayor presión sobre servicios de salud.",
            "Deterioro de indicadores de salud pública."
        ],
        objetivosEspecificos: [
            "Realizar jornadas y estrategias de vacunación.",
            "Fortalecer cadena de frío y logística de vacunación.",
            "Promover adherencia a esquemas de vacunación."
        ],
        beneficios: "Se aumentará la cobertura de vacunación y se reducirán riesgos de enfermedades inmunoprevenibles.",
        sostenibilidad: "Dependerá de programación continua, cadena de frío, seguimiento de esquemas y articulación con salud pública.",
        palabrasClave: ["vacunación","vacunas","inmunización","cadena de frío","jornadas"]
    },

    {
        codigo: "TIP-SAL-013",
        nombre: "Vigilancia Epidemiológica",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para fortalecer capacidades de vigilancia epidemiológica, reporte, análisis y respuesta en salud pública.",
        problemaCentral: "Débil capacidad de vigilancia epidemiológica para detectar, analizar y responder oportunamente a eventos de interés en salud pública.",
        objetivoGeneral: "Fortalecer la capacidad de vigilancia epidemiológica para detectar, analizar y responder oportunamente a eventos de interés en salud pública.",
        poblaciones: ["POB-TER-003","POB-SEC-003"],
        productos: ["PRO-TIC-003","PRO-FOR-002","PRO-SER-001","PRO-SER-004"],
        actividades: ["ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-052","IND-PRO-021","IND-PRO-030","IND-PRO-033","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Limitada capacidad de registro, análisis y reporte epidemiológico.",
            "Insuficiente formación de talento humano en vigilancia."
        ],
        causasIndirectas: [
            "Débil integración de fuentes de información.",
            "Limitaciones tecnológicas para seguimiento de eventos."
        ],
        efectosDirectos: [
            "Demoras en detección y respuesta a eventos de salud pública.",
            "Subregistro o baja calidad de información epidemiológica."
        ],
        efectosIndirectos: [
            "Mayor riesgo de propagación de eventos.",
            "Deterioro de la capacidad de gestión del riesgo en salud pública."
        ],
        objetivosEspecificos: [
            "Fortalecer herramientas de registro y análisis epidemiológico.",
            "Capacitar talento humano en vigilancia y respuesta.",
            "Mejorar la oportunidad de reporte y seguimiento de eventos."
        ],
        beneficios: "Se mejorará la detección, análisis y respuesta frente a eventos de interés en salud pública.",
        sostenibilidad: "Requiere talento humano capacitado, sistemas de información, protocolos actualizados y coordinación institucional permanente.",
        palabrasClave: ["vigilancia epidemiológica","salud pública","eventos","brotes","epidemiología"]
    },

    {
        codigo: "TIP-SAL-014",
        nombre: "Salud Ambiental",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar acciones de salud ambiental, control de factores de riesgo y educación sanitaria.",
        problemaCentral: "Insuficiente gestión de factores ambientales que afectan la salud de la población.",
        objetivoGeneral: "Fortalecer la gestión de factores ambientales que afectan la salud de la población.",
        poblaciones: ["POB-TER-003"],
        productos: ["PRO-SER-002","PRO-SER-004","PRO-FOR-001","PRO-GES-003"],
        actividades: ["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-033","IND-PRO-020","IND-PRO-042","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-AMB-001","RIE-AMB-002","RIE-SOC-001","RIE-FIN-001"],
        normas: ["NOR-AMB-001","NOR-AMB-002",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de acciones de control y educación en salud ambiental.",
            "Limitado seguimiento de factores de riesgo ambiental."
        ],
        causasIndirectas: [
            "Débil articulación entre salud, ambiente y comunidad.",
            "Insuficiente información territorial sobre riesgos ambientales."
        ],
        efectosDirectos: [
            "Incremento de enfermedades asociadas a factores ambientales.",
            "Baja percepción y práctica de medidas de prevención."
        ],
        efectosIndirectos: [
            "Deterioro de condiciones de salud pública.",
            "Mayor vulnerabilidad frente a riesgos ambientales."
        ],
        objetivosEspecificos: [
            "Implementar acciones de control de factores de riesgo ambiental.",
            "Desarrollar educación sanitaria y comunitaria.",
            "Fortalecer seguimiento e información territorial en salud ambiental."
        ],
        beneficios: "Se reducirán riesgos ambientales que afectan la salud y se fortalecerán prácticas preventivas en la población.",
        sostenibilidad: "Dependerá de coordinación intersectorial, monitoreo territorial, participación comunitaria y continuidad de acciones de salud pública.",
        palabrasClave: ["salud ambiental","riesgo ambiental","educación sanitaria","control ambiental"]
    },

    {
        codigo: "TIP-SAL-015",
        nombre: "Nutrición y Seguridad Alimentaria en Salud",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a acciones de valoración, educación, seguimiento nutricional y apoyo a población en riesgo nutricional.",
        problemaCentral: "Insuficiente acceso de la población vulnerable a acciones de promoción, prevención y seguimiento nutricional.",
        objetivoGeneral: "Mejorar el acceso de la población vulnerable a acciones de promoción, prevención y seguimiento nutricional.",
        poblaciones: ["POB-CV-001","POB-CV-002","POB-CV-006","POB-TER-003"],
        productos: ["PRO-SER-003","PRO-SER-004","PRO-FOR-001","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-032","IND-PRO-033","IND-PRO-020","IND-PRO-013","IND-RES-003","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de valoración y seguimiento nutricional.",
            "Insuficiente educación alimentaria y nutricional."
        ],
        causasIndirectas: [
            "Limitada identificación de población en riesgo nutricional.",
            "Condiciones sociales y económicas que afectan la alimentación adecuada."
        ],
        efectosDirectos: [
            "Persistencia de riesgo de malnutrición.",
            "Deterioro de condiciones de salud y desarrollo."
        ],
        efectosIndirectos: [
            "Incremento de enfermedades asociadas a deficiencias nutricionales.",
            "Mayor vulnerabilidad de niños, adultos mayores y población vulnerable."
        ],
        objetivosEspecificos: [
            "Realizar valoración y seguimiento nutricional.",
            "Desarrollar educación alimentaria y nutricional.",
            "Fortalecer acciones de prevención de malnutrición."
        ],
        beneficios: "La población vulnerable mejorará prácticas alimentarias, seguimiento nutricional y prevención de riesgos asociados.",
        sostenibilidad: "Se soportará en seguimiento institucional, articulación con programas sociales y de salud pública, y monitoreo de indicadores nutricionales.",
        palabrasClave: ["nutrición","seguridad alimentaria","malnutrición","alimentación","seguimiento nutricional"]
    }

];

function registrar(){

    if(window.MotorTipologias){
        MotorTipologias.registrarVarias(tipologias);
    }

}

function listar(){
    return tipologias.map(x=>({...x}));
}

registrar();

return{
    listar,
    registrar
};

})();

window.PlantillasSalud = PlantillasSalud;
