// =====================================
// PLANTILLAS/TRANSPORTE.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Transporte
// =====================================

/*
  Este archivo registra tipologías especializadas del sector Transporte.

  Requiere cargar antes:
  - js/asistente/motor-tipologias.js
*/

const PlantillasTransporte = (()=>{

const SECTOR = "Transporte";
const SECTOR_CODIGO = "SEC-INF-001";

const comunes = {
    riesgos: [
        "RIE-TEC-001",
        "RIE-TEC-002",
        "RIE-FIN-001",
        "RIE-CON-001",
        "RIE-CON-002",
        "RIE-AMB-001"
    ],
    normasBase: [
        "NOR-TRA-001",
        "NOR-TRA-002",
        "NOR-TRA-003",
        "NOR-CON-001",
        "NOR-CON-003"
    ],
    fuentesBase: [
        "FUE-PUB-001",
        "FUE-NAC-001",
        "FUE-NAC-003",
        "FUE-COO-002"
    ]
};

const tipologias = [

    {
        codigo: "TIP-TRA-001",
        nombre: "Placa Huella",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado al mejoramiento de vías rurales mediante construcción de placa huella, obras de drenaje y elementos complementarios.",
        problemaCentral: "Deficientes condiciones de transitabilidad y conectividad de la población rural.",
        objetivoGeneral: "Mejorar las condiciones de transitabilidad y conectividad de la población rural.",
        poblaciones: ["POB-TER-001","POB-TER-003"],
        productos: ["PRO-INF-002","PRO-INF-003"],
        actividades: ["ACT-PLA-006","ACT-PLA-007","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-003","IND-RES-002","IND-GES-001","IND-GES-002","IND-GES-003"],
        riesgos: comunes.riesgos,
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Deterioro de la superficie de rodadura en vías rurales.",
            "Insuficientes obras de drenaje y manejo de aguas."
        ],
        causasIndirectas: [
            "Baja inversión en infraestructura vial rural.",
            "Condiciones climáticas y topográficas que aceleran el deterioro vial."
        ],
        efectosDirectos: [
            "Dificultades de movilidad de la población rural.",
            "Incremento de tiempos y costos de transporte."
        ],
        efectosIndirectos: [
            "Menor acceso a servicios sociales, mercados y oportunidades productivas.",
            "Incremento de brechas territoriales entre zona urbana y rural."
        ],
        objetivosEspecificos: [
            "Construir placa huella en tramos críticos de la vía rural.",
            "Ejecutar obras de drenaje y manejo de aguas.",
            "Mejorar la seguridad y transitabilidad de la vía."
        ],
        beneficios: "La población rural contará con mejores condiciones de acceso, menores tiempos de desplazamiento y mayor conectividad territorial.",
        sostenibilidad: "La sostenibilidad dependerá del mantenimiento rutinario, limpieza de drenajes, control de aguas, participación comunitaria y seguimiento técnico.",
        palabrasClave: ["placa huella","vía rural","camino veredal","transitabilidad","conectividad rural"]
    },

    {
        codigo: "TIP-TRA-002",
        nombre: "Pavimentación de vías urbanas",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a la construcción de pavimento en vías urbanas para mejorar movilidad, accesibilidad y condiciones de tránsito.",
        problemaCentral: "Deficientes condiciones de movilidad y accesibilidad en vías urbanas sin pavimentar o en mal estado.",
        objetivoGeneral: "Mejorar las condiciones de movilidad y accesibilidad en vías urbanas mediante la pavimentación vial.",
        poblaciones: ["POB-TER-002","POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-INF-005"],
        actividades: ["ACT-PLA-006","ACT-PLA-007","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-005","IND-RES-002","IND-GES-001","IND-GES-002"],
        riesgos: comunes.riesgos,
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Vías urbanas con superficie de rodadura inadecuada.",
            "Deficiencias en drenaje, andenes o elementos complementarios."
        ],
        causasIndirectas: [
            "Crecimiento urbano sin infraestructura vial suficiente.",
            "Insuficiente mantenimiento y reposición de la malla vial."
        ],
        efectosDirectos: [
            "Dificultades de movilidad vehicular y peatonal.",
            "Aumento de tiempos de desplazamiento y costos de operación vehicular."
        ],
        efectosIndirectos: [
            "Afectación de la calidad de vida urbana.",
            "Menor competitividad y accesibilidad del sector intervenido."
        ],
        objetivosEspecificos: [
            "Construir pavimento en el tramo urbano priorizado.",
            "Mejorar obras de drenaje y elementos complementarios.",
            "Fortalecer la seguridad vial y accesibilidad peatonal."
        ],
        beneficios: "La comunidad contará con mejores condiciones de movilidad, accesibilidad, seguridad vial y valorización del entorno urbano.",
        sostenibilidad: "Requiere mantenimiento periódico de la vía, limpieza de sumideros, control de intervenciones y seguimiento por la entidad territorial.",
        palabrasClave: ["pavimentación","vía urbana","malla vial","pavimento","movilidad urbana"]
    },

    {
        codigo: "TIP-TRA-003",
        nombre: "Mejoramiento de vías urbanas",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado al mejoramiento, rehabilitación o mantenimiento de vías urbanas existentes.",
        problemaCentral: "Deterioro de vías urbanas que afecta las condiciones de movilidad, seguridad y accesibilidad.",
        objetivoGeneral: "Mejorar las condiciones de movilidad, seguridad y accesibilidad mediante la rehabilitación de vías urbanas.",
        poblaciones: ["POB-TER-002","POB-TER-003"],
        productos: ["PRO-INF-002","PRO-INF-003","PRO-INF-005"],
        actividades: ["ACT-PLA-004","ACT-PLA-005","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-003","IND-PRO-005","IND-RES-002","IND-GES-001","IND-GES-003"],
        riesgos: comunes.riesgos,
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Deterioro superficial y estructural de la vía urbana.",
            "Deficiencias en drenaje, señalización y seguridad vial."
        ],
        causasIndirectas: [
            "Mantenimiento insuficiente de la malla vial.",
            "Alto tránsito vehicular y desgaste acumulado."
        ],
        efectosDirectos: [
            "Aumento de accidentalidad y congestión.",
            "Mayor deterioro de vehículos y costos de transporte."
        ],
        efectosIndirectos: [
            "Deterioro de la calidad de vida urbana.",
            "Reducción de accesibilidad a servicios y actividades económicas."
        ],
        objetivosEspecificos: [
            "Rehabilitar la superficie y estructura vial deteriorada.",
            "Mejorar condiciones de drenaje y señalización.",
            "Fortalecer la seguridad y funcionalidad de la vía."
        ],
        beneficios: "Se mejorarán tiempos de desplazamiento, seguridad vial y condiciones de operación de la vía urbana.",
        sostenibilidad: "Dependerá de mantenimiento preventivo, gestión de tránsito, control de cargas y programación de intervenciones periódicas.",
        palabrasClave: ["mejoramiento vial","rehabilitación vial","vías urbanas","malla vial","bacheo"]
    },

    {
        codigo: "TIP-TRA-004",
        nombre: "Vía terciaria",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de mejoramiento, rehabilitación, mantenimiento o construcción de infraestructura vial terciaria.",
        problemaCentral: "Deficientes condiciones de la red vial terciaria que limitan la conectividad rural y el acceso a servicios y mercados.",
        objetivoGeneral: "Mejorar las condiciones de la red vial terciaria para fortalecer la conectividad rural y el acceso a servicios y mercados.",
        poblaciones: ["POB-TER-001","POB-TER-003","POB-SEC-005"],
        productos: ["PRO-INF-002","PRO-INF-003","PRO-INF-004"],
        actividades: ["ACT-PLA-006","ACT-PLA-007","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-003","IND-PRO-004","IND-RES-002","IND-GES-001","IND-GES-003"],
        riesgos: comunes.riesgos,
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Deterioro de la superficie de rodadura en vías terciarias.",
            "Insuficientes obras de drenaje, contención y estabilización."
        ],
        causasIndirectas: [
            "Limitados recursos para mantenimiento vial rural.",
            "Alta exposición a lluvias, erosión y condiciones topográficas adversas."
        ],
        efectosDirectos: [
            "Dificultad para transportar personas, productos e insumos.",
            "Aislamiento temporal de comunidades rurales."
        ],
        efectosIndirectos: [
            "Pérdida de competitividad productiva rural.",
            "Aumento de brechas sociales y económicas territoriales."
        ],
        objetivosEspecificos: [
            "Mejorar la superficie de rodadura de la vía terciaria.",
            "Ejecutar obras de drenaje, contención y estabilización requeridas.",
            "Fortalecer la conectividad rural y la seguridad vial."
        ],
        beneficios: "La población rural mejorará su conectividad, acceso a servicios, comercialización de productos y condiciones de movilidad.",
        sostenibilidad: "Requiere mantenimiento rutinario y periódico, participación comunitaria, limpieza de drenajes y gestión de recursos para conservación vial.",
        palabrasClave: ["vía terciaria","red vial rural","vía rural","camino rural","conectividad"]
    },

    {
        codigo: "TIP-TRA-005",
        nombre: "Puente vehicular",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construcción, reposición, rehabilitación o mejoramiento de puentes vehiculares.",
        problemaCentral: "Deficientes condiciones de paso vehicular que limitan la conectividad y seguridad de la población.",
        objetivoGeneral: "Mejorar las condiciones de paso vehicular para fortalecer la conectividad y seguridad de la población.",
        poblaciones: ["POB-TER-001","POB-TER-002","POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-INF-003"],
        actividades: ["ACT-PLA-006","ACT-PLA-007","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-003","IND-RES-002","IND-GES-001","IND-GES-002"],
        riesgos: ["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-CON-001","RIE-AMB-001","RIE-AMB-002"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Puente inexistente, insuficiente, deteriorado o con baja capacidad.",
            "Riesgos estructurales, hidráulicos o de socavación."
        ],
        causasIndirectas: [
            "Crecimiento del tránsito y cargas vehiculares.",
            "Eventos climáticos, crecientes o falta de mantenimiento."
        ],
        efectosDirectos: [
            "Restricción o interrupción del paso vehicular.",
            "Aumento de riesgos para usuarios y comunidades."
        ],
        efectosIndirectos: [
            "Aislamiento de sectores poblados y productivos.",
            "Incremento de tiempos y costos de transporte."
        ],
        objetivosEspecificos: [
            "Construir, rehabilitar o mejorar el puente vehicular.",
            "Garantizar condiciones estructurales, hidráulicas y funcionales adecuadas.",
            "Mejorar la seguridad y continuidad del tránsito."
        ],
        beneficios: "Se garantizará el paso seguro y continuo de vehículos, mejorando la conectividad territorial.",
        sostenibilidad: "Requiere inspecciones periódicas, mantenimiento estructural, limpieza de cauces y control de cargas.",
        palabrasClave: ["puente vehicular","puente","estructura vial","paso vehicular","conectividad"]
    },

    {
        codigo: "TIP-TRA-006",
        nombre: "Puente peatonal",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construcción, mejoramiento o rehabilitación de puentes peatonales.",
        problemaCentral: "Deficientes condiciones de seguridad para el cruce peatonal en puntos críticos de movilidad.",
        objetivoGeneral: "Mejorar las condiciones de seguridad para el cruce peatonal en puntos críticos de movilidad.",
        poblaciones: ["POB-TER-002","POB-TER-003","POB-CV-002","POB-CV-006"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-INF-005"],
        actividades: ["ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-005","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Cruces peatonales inseguros o con alta exposición al tránsito vehicular.",
            "Insuficiente infraestructura peatonal accesible."
        ],
        causasIndirectas: [
            "Crecimiento del flujo vehicular y peatonal.",
            "Débil priorización de la seguridad peatonal."
        ],
        efectosDirectos: [
            "Aumento del riesgo de accidentes peatonales.",
            "Dificultades de accesibilidad para población vulnerable."
        ],
        efectosIndirectos: [
            "Deterioro de la seguridad vial y movilidad peatonal.",
            "Menor acceso seguro a servicios, educación y transporte."
        ],
        objetivosEspecificos: [
            "Construir o mejorar infraestructura de cruce peatonal.",
            "Garantizar condiciones de accesibilidad y seguridad.",
            "Reducir riesgos de accidentalidad peatonal."
        ],
        beneficios: "Peatones, estudiantes, adultos mayores y población general contarán con cruces más seguros y accesibles.",
        sostenibilidad: "Dependerá del mantenimiento estructural, iluminación, limpieza, accesibilidad y cultura ciudadana.",
        palabrasClave: ["puente peatonal","peatones","seguridad vial","cruce peatonal","accesibilidad"]
    },

    {
        codigo: "TIP-TRA-007",
        nombre: "Andenes y accesibilidad peatonal",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a construcción, mejoramiento o adecuación de andenes, senderos y accesibilidad peatonal.",
        problemaCentral: "Deficientes condiciones de accesibilidad y seguridad peatonal en el espacio público.",
        objetivoGeneral: "Mejorar las condiciones de accesibilidad y seguridad peatonal en el espacio público.",
        poblaciones: ["POB-TER-002","POB-TER-003","POB-VUL-001","POB-CV-006"],
        productos: ["PRO-INF-005","PRO-INF-002"],
        actividades: ["ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-005","IND-PRO-002","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Andenes inexistentes, deteriorados o discontinuos.",
            "Barreras físicas que dificultan la movilidad peatonal y accesible."
        ],
        causasIndirectas: [
            "Planeación urbana insuficiente con enfoque de accesibilidad universal.",
            "Bajo mantenimiento de espacio público peatonal."
        ],
        efectosDirectos: [
            "Aumento de riesgo de accidentes peatonales.",
            "Dificultad de desplazamiento para personas con discapacidad y adultos mayores."
        ],
        efectosIndirectos: [
            "Menor inclusión y accesibilidad urbana.",
            "Afectación de la calidad de vida y movilidad sostenible."
        ],
        objetivosEspecificos: [
            "Construir o mejorar andenes y senderos peatonales.",
            "Eliminar barreras físicas y fortalecer la accesibilidad universal.",
            "Mejorar la seguridad y continuidad del tránsito peatonal."
        ],
        beneficios: "La población contará con espacios peatonales seguros, accesibles y continuos.",
        sostenibilidad: "Requiere mantenimiento de andenes, control de ocupación indebida, reposición de elementos y gestión del espacio público.",
        palabrasClave: ["andenes","accesibilidad","peatonal","senderos","espacio público"]
    },

    {
        codigo: "TIP-TRA-008",
        nombre: "Cicloruta",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construcción, adecuación o mejoramiento de ciclorutas e infraestructura para movilidad activa.",
        problemaCentral: "Limitadas condiciones de infraestructura segura para la movilidad en bicicleta.",
        objetivoGeneral: "Mejorar las condiciones de infraestructura segura para la movilidad en bicicleta.",
        poblaciones: ["POB-TER-002","POB-TER-003","POB-CV-004"],
        productos: ["PRO-INF-005","PRO-INF-001","PRO-INF-002"],
        actividades: ["ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-005","IND-PRO-001","IND-PRO-002","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente infraestructura exclusiva o segura para bicicletas.",
            "Débil integración de la bicicleta al sistema de movilidad."
        ],
        causasIndirectas: [
            "Baja priorización de movilidad sostenible.",
            "Limitada cultura vial y seguridad para ciclistas."
        ],
        efectosDirectos: [
            "Mayor riesgo de siniestros viales para ciclistas.",
            "Bajo uso de modos de transporte sostenibles."
        ],
        efectosIndirectos: [
            "Aumento de congestión y emisiones contaminantes.",
            "Menor calidad de vida y salud urbana."
        ],
        objetivosEspecificos: [
            "Construir o adecuar infraestructura de cicloruta.",
            "Integrar señalización y elementos de seguridad vial.",
            "Promover la movilidad activa y sostenible."
        ],
        beneficios: "Se promoverá una movilidad segura, sostenible y saludable para usuarios de bicicleta.",
        sostenibilidad: "Dependerá del mantenimiento de la infraestructura, señalización, control vial y promoción de cultura ciudadana.",
        palabrasClave: ["cicloruta","bicicleta","movilidad sostenible","movilidad activa","carril bici"]
    },

    {
        codigo: "TIP-TRA-009",
        nombre: "Señalización vial",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar o mejorar señalización horizontal, vertical y elementos de seguridad vial.",
        problemaCentral: "Deficientes condiciones de señalización y seguridad vial en corredores o puntos críticos.",
        objetivoGeneral: "Mejorar las condiciones de señalización y seguridad vial en corredores o puntos críticos.",
        poblaciones: ["POB-TER-002","POB-TER-001","POB-TER-003"],
        productos: ["PRO-INF-002","PRO-DOT-004"],
        actividades: ["ACT-PLA-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-013","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Señalización vial inexistente, deteriorada o insuficiente.",
            "Baja implementación de dispositivos de control y seguridad vial."
        ],
        causasIndirectas: [
            "Insuficiente mantenimiento de la señalización.",
            "Crecimiento del flujo vehicular y peatonal."
        ],
        efectosDirectos: [
            "Mayor riesgo de siniestros viales.",
            "Desorden en la circulación de vehículos y peatones."
        ],
        efectosIndirectos: [
            "Afectación de la seguridad vial y movilidad.",
            "Incremento de costos sociales asociados a accidentalidad."
        ],
        objetivosEspecificos: [
            "Implementar señalización horizontal y vertical.",
            "Instalar dispositivos de seguridad vial requeridos.",
            "Promover cultura vial y control de puntos críticos."
        ],
        beneficios: "Se reducirá el riesgo de siniestros y se mejorará la orientación, control y seguridad vial.",
        sostenibilidad: "Requiere mantenimiento, reposición de señales, control de tránsito y actualización según cambios viales.",
        palabrasClave: ["señalización vial","seguridad vial","señales","demarcación","tránsito"]
    },

    {
        codigo: "TIP-TRA-010",
        nombre: "Semaforización",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para instalación, modernización o mantenimiento de sistemas semafóricos.",
        problemaCentral: "Deficientes condiciones de regulación del tránsito en intersecciones con alta conflictividad vial.",
        objetivoGeneral: "Mejorar las condiciones de regulación del tránsito en intersecciones con alta conflictividad vial.",
        poblaciones: ["POB-TER-002","POB-TER-003"],
        productos: ["PRO-DOT-002","PRO-TIC-003","PRO-INF-002"],
        actividades: ["ACT-PLA-004","ACT-EJE-003","ACT-CTL-003","ACT-CIE-001"],
        indicadores: ["IND-PRO-011","IND-PRO-052","IND-PRO-002","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Intersecciones sin control semafórico o con sistemas obsoletos.",
            "Conflictos entre flujos vehiculares y peatonales."
        ],
        causasIndirectas: [
            "Crecimiento del parque automotor y demanda vial.",
            "Insuficiente modernización tecnológica del control de tránsito."
        ],
        efectosDirectos: [
            "Congestión y demoras en intersecciones.",
            "Mayor riesgo de siniestros viales."
        ],
        efectosIndirectos: [
            "Aumento de costos de viaje y contaminación.",
            "Deterioro de la movilidad urbana."
        ],
        objetivosEspecificos: [
            "Instalar o modernizar sistemas semafóricos.",
            "Mejorar la regulación de flujos vehiculares y peatonales.",
            "Fortalecer la seguridad y eficiencia de intersecciones."
        ],
        beneficios: "Se mejorará la seguridad, regulación y fluidez del tránsito en intersecciones críticas.",
        sostenibilidad: "Requiere mantenimiento técnico, energía, calibración, soporte tecnológico y seguimiento operativo.",
        palabrasClave: ["semáforos","semaforización","intersección","tránsito","control vial"]
    },

    {
        codigo: "TIP-TRA-011",
        nombre: "Box Culvert y obras de drenaje vial",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construcción, reposición o mejoramiento de box culvert, alcantarillas y drenajes viales.",
        problemaCentral: "Deficientes condiciones de drenaje vial que afectan la transitabilidad, estabilidad y seguridad de la infraestructura.",
        objetivoGeneral: "Mejorar las condiciones de drenaje vial para fortalecer la transitabilidad, estabilidad y seguridad de la infraestructura.",
        poblaciones: ["POB-TER-001","POB-TER-002","POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-INF-003"],
        actividades: ["ACT-PLA-006","ACT-PLA-007","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-003","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-AMB-001","RIE-AMB-002"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Obras de drenaje insuficientes, inexistentes o deterioradas.",
            "Afectación de la vía por escorrentías, crecientes o socavación."
        ],
        causasIndirectas: [
            "Cambios en patrones de lluvia y manejo inadecuado de aguas.",
            "Falta de mantenimiento y limpieza de obras hidráulicas."
        ],
        efectosDirectos: [
            "Interrupciones o daños recurrentes en la vía.",
            "Riesgo para usuarios y pérdida de estabilidad vial."
        ],
        efectosIndirectos: [
            "Incremento de costos de mantenimiento y rehabilitación.",
            "Aislamiento temporal de comunidades o sectores."
        ],
        objetivosEspecificos: [
            "Construir o mejorar obras de drenaje vial.",
            "Garantizar capacidad hidráulica y estabilidad de la infraestructura.",
            "Reducir afectaciones por aguas superficiales."
        ],
        beneficios: "Se aumentará la vida útil de la vía y se reducirán interrupciones por fallas hidráulicas.",
        sostenibilidad: "Dependerá de limpieza periódica, mantenimiento preventivo, control de sedimentos y seguimiento hidráulico.",
        palabrasClave: ["box culvert","alcantarilla","drenaje vial","obra hidráulica","cunetas"]
    },

    {
        codigo: "TIP-TRA-012",
        nombre: "Muros de contención y estabilización de taludes",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construir obras de contención, estabilización, protección de taludes y mitigación de riesgo vial.",
        problemaCentral: "Inestabilidad de taludes o laderas que afecta la seguridad y continuidad de la infraestructura vial.",
        objetivoGeneral: "Mejorar la estabilidad de taludes o laderas para garantizar la seguridad y continuidad de la infraestructura vial.",
        poblaciones: ["POB-TER-001","POB-TER-002","POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-INF-003"],
        actividades: ["ACT-PLA-006","ACT-PLA-007","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-003","IND-RES-002","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-AMB-001","RIE-AMB-002"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Taludes inestables, erosión o deslizamientos en corredores viales.",
            "Insuficientes obras de contención, drenaje y protección."
        ],
        causasIndirectas: [
            "Condiciones geotécnicas y climáticas adversas.",
            "Intervenciones previas sin estabilización suficiente."
        ],
        efectosDirectos: [
            "Bloqueos, cierres o restricciones viales.",
            "Riesgos para usuarios y comunidades cercanas."
        ],
        efectosIndirectos: [
            "Aumento de costos de transporte y mantenimiento.",
            "Aislamiento de sectores y afectación económica."
        ],
        objetivosEspecificos: [
            "Construir obras de contención y estabilización.",
            "Implementar sistemas de drenaje y protección de taludes.",
            "Reducir riesgos de deslizamiento y afectación vial."
        ],
        beneficios: "Se fortalecerá la seguridad vial y se reducirá el riesgo de interrupciones por inestabilidad de taludes.",
        sostenibilidad: "Requiere monitoreo, mantenimiento de drenajes, control de vegetación y seguimiento geotécnico.",
        palabrasClave: ["muro de contención","talud","estabilización","deslizamiento","geotecnia"]
    },

    {
        codigo: "TIP-TRA-013",
        nombre: "Seguridad vial",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de implementación de acciones, infraestructura, señalización, educación y gestión para reducir siniestros viales.",
        problemaCentral: "Altos niveles de riesgo y siniestralidad vial en corredores, intersecciones o zonas críticas.",
        objetivoGeneral: "Reducir los niveles de riesgo y siniestralidad vial mediante acciones integrales de seguridad vial.",
        poblaciones: ["POB-TER-003","POB-TER-002","POB-CV-002","POB-CV-006"],
        productos: ["PRO-SER-002","PRO-SER-004","PRO-FOR-001","PRO-INF-002","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-EJE-004","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-033","IND-PRO-020","IND-PRO-002","IND-PRO-013","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Deficiencias en infraestructura, señalización y control vial.",
            "Baja cultura ciudadana y cumplimiento de normas de tránsito."
        ],
        causasIndirectas: [
            "Crecimiento del tránsito y conflictos entre modos de transporte.",
            "Limitada gestión de puntos críticos de siniestralidad."
        ],
        efectosDirectos: [
            "Incremento de accidentes, lesionados y fallecidos.",
            "Afectación de la movilidad y percepción de seguridad."
        ],
        efectosIndirectos: [
            "Altos costos sociales, económicos y de salud pública.",
            "Deterioro de la calidad de vida y seguridad ciudadana."
        ],
        objetivosEspecificos: [
            "Implementar acciones de señalización e infraestructura segura.",
            "Desarrollar campañas de educación y cultura vial.",
            "Fortalecer la gestión de puntos críticos y seguimiento de indicadores."
        ],
        beneficios: "Se reducirá el riesgo vial y se fortalecerá la cultura de movilidad segura.",
        sostenibilidad: "Dependerá de campañas permanentes, mantenimiento de señalización, control de tránsito y monitoreo de siniestralidad.",
        palabrasClave: ["seguridad vial","accidentalidad","siniestros","cultura vial","tránsito"]
    },

    {
        codigo: "TIP-TRA-014",
        nombre: "Terminal o estación de transporte",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construcción, mejoramiento, adecuación o dotación de terminales, estaciones o paraderos de transporte.",
        problemaCentral: "Limitadas condiciones de infraestructura para la organización, accesibilidad y prestación del servicio de transporte público.",
        objetivoGeneral: "Mejorar las condiciones de infraestructura para la organización, accesibilidad y prestación del servicio de transporte público.",
        poblaciones: ["POB-TER-002","POB-TER-003","POB-TER-001"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-SER-001"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-030","IND-RES-002","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Infraestructura insuficiente o inadecuada para usuarios y operadores.",
            "Desorganización en puntos de ascenso, descenso y operación del transporte."
        ],
        causasIndirectas: [
            "Crecimiento de demanda de transporte público.",
            "Débil planificación de infraestructura de movilidad."
        ],
        efectosDirectos: [
            "Incomodidad, inseguridad y baja calidad del servicio.",
            "Congestión y conflictos en la operación del transporte."
        ],
        efectosIndirectos: [
            "Menor eficiencia del sistema de transporte.",
            "Afectación de accesibilidad y movilidad urbana o intermunicipal."
        ],
        objetivosEspecificos: [
            "Construir o mejorar infraestructura para transporte público.",
            "Dotar espacios para usuarios, operación y control.",
            "Fortalecer la organización y accesibilidad del servicio."
        ],
        beneficios: "Usuarios y operadores tendrán mejores condiciones de seguridad, comodidad, accesibilidad y organización del transporte.",
        sostenibilidad: "Requiere modelo de operación, mantenimiento, administración, control de uso y recursos para conservación de la infraestructura.",
        palabrasClave: ["terminal de transporte","estación","paradero","transporte público","movilidad"]
    },

    {
        codigo: "TIP-TRA-015",
        nombre: "Gestión del tránsito y movilidad",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para fortalecer la gestión del tránsito, estudios de movilidad, control, tecnología y planificación vial.",
        problemaCentral: "Débil capacidad institucional para gestionar el tránsito y la movilidad de manera eficiente y segura.",
        objetivoGeneral: "Fortalecer la capacidad institucional para gestionar el tránsito y la movilidad de manera eficiente y segura.",
        poblaciones: ["POB-TER-002","POB-TER-003"],
        productos: ["PRO-GES-003","PRO-TIC-003","PRO-FOR-002","PRO-SER-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-002","ACT-PLA-004","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-042","IND-PRO-052","IND-PRO-021","IND-PRO-030","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente información, tecnología y herramientas para gestionar movilidad.",
            "Baja capacidad de planificación, control y seguimiento del tránsito."
        ],
        causasIndirectas: [
            "Crecimiento del parque automotor y demanda de viajes.",
            "Débil articulación institucional en movilidad."
        ],
        efectosDirectos: [
            "Congestión, desorden y baja eficiencia en la movilidad.",
            "Mayor riesgo de siniestros y conflictos viales."
        ],
        efectosIndirectos: [
            "Aumento de tiempos de viaje y costos urbanos.",
            "Deterioro de la calidad ambiental y calidad de vida."
        ],
        objetivosEspecificos: [
            "Formular o actualizar instrumentos de gestión de movilidad.",
            "Implementar herramientas tecnológicas y de información.",
            "Fortalecer capacidades institucionales de planificación y control."
        ],
        beneficios: "Se mejorará la capacidad institucional para planear, controlar y gestionar la movilidad de forma segura y eficiente.",
        sostenibilidad: "Dependerá de actualización de información, soporte tecnológico, capacitación permanente y seguimiento de indicadores de movilidad.",
        palabrasClave: ["gestión del tránsito","movilidad","plan de movilidad","tránsito","control vial"]
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

window.PlantillasTransporte = PlantillasTransporte;
