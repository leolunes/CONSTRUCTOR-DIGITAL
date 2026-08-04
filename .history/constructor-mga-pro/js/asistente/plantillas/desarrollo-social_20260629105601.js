// =====================================
// PLANTILLAS/DESARROLLO-SOCIAL.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Desarrollo Social
// =====================================

/*
  Este archivo registra tipologías especializadas del sector Desarrollo Social.

  Requiere cargar antes:
  - js/asistente/motor-tipologias.js
*/

const PlantillasDesarrolloSocial = (()=>{

const SECTOR = "Desarrollo Social";
const SECTOR_CODIGO = "SEC-SOC-001";

const comunes = {
    riesgos: [
        "RIE-SOC-001",
        "RIE-FIN-001",
        "RIE-CON-001",
        "RIE-CON-002"
    ],
    normasBase: [
        "NOR-GEN-002",
        "NOR-CON-001",
        "NOR-CON-003"
    ],
    fuentesBase: [
        "FUE-PUB-001",
        "FUE-NAC-001",
        "FUE-COO-003"
    ]
};

const tipologias = [

    // =====================================
    // ADULTO MAYOR
    // =====================================

    {
        codigo: "TIP-SOC-001",
        nombre: "Centro Vida",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a construcción, adecuación, dotación u operación de Centros Vida para atención integral de personas adultas mayores.",
        problemaCentral: "Insuficiente acceso de la población adulta mayor a servicios integrales de bienestar, atención, protección y desarrollo social.",
        objetivoGeneral: "Mejorar el acceso de la población adulta mayor a servicios integrales de bienestar, atención, protección y desarrollo social.",
        poblaciones: ["POB-CV-006"],
        productos: ["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-SER-003","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-RES-001","IND-GES-001","IND-GES-002"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SOC-001","NOR-SOC-002",...comunes.normasBase],
        fuentes: ["FUE-ESP-001",...comunes.fuentesBase],
        causasDirectas: [
            "Insuficiente infraestructura para la atención integral del adulto mayor.",
            "Limitada disponibilidad de servicios sociales, recreativos, nutricionales y psicosociales."
        ],
        causasIndirectas: [
            "Insuficientes recursos destinados a programas de bienestar del adulto mayor.",
            "Débil articulación institucional para la atención integral."
        ],
        efectosDirectos: [
            "Baja cobertura de atención integral a personas adultas mayores.",
            "Aumento de condiciones de vulnerabilidad, aislamiento y deterioro del bienestar."
        ],
        efectosIndirectos: [
            "Mayor presión sobre las familias y redes de cuidado.",
            "Incremento de brechas sociales en población adulta mayor."
        ],
        objetivosEspecificos: [
            "Fortalecer la infraestructura para la atención integral del adulto mayor.",
            "Implementar servicios integrales de bienestar, promoción, prevención y acompañamiento.",
            "Dotar los espacios requeridos para la prestación adecuada del servicio."
        ],
        beneficios: "La población adulta mayor contará con mejores condiciones de atención, acompañamiento, recreación, nutrición, integración social y bienestar.",
        sostenibilidad: "La sostenibilidad se soportará en la asignación de responsables institucionales, recursos de operación, uso de la estampilla para el bienestar del adulto mayor cuando aplique, seguimiento de indicadores y articulación con programas sociales.",
        palabrasClave: ["centro vida","adulto mayor","bienestar","atención integral","estampilla"]
    },

    {
        codigo: "TIP-SOC-002",
        nombre: "Centro Día",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a servicios diurnos de atención, integración y bienestar para personas adultas mayores.",
        problemaCentral: "Limitado acceso de la población adulta mayor a servicios diurnos de atención, integración y bienestar social.",
        objetivoGeneral: "Mejorar el acceso de la población adulta mayor a servicios diurnos de atención, integración y bienestar social.",
        poblaciones: ["POB-CV-006"],
        productos: ["PRO-SER-001","PRO-SER-003","PRO-DOT-001","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-003","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-030","IND-PRO-032","IND-PRO-010","IND-PRO-020","IND-RES-001","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: ["NOR-SOC-001","NOR-SOC-002",...comunes.normasBase],
        fuentes: ["FUE-ESP-001",...comunes.fuentesBase],
        causasDirectas: [
            "Insuficiente oferta de servicios diurnos para adultos mayores.",
            "Limitada disponibilidad de espacios y dotación para actividades de integración y bienestar."
        ],
        causasIndirectas: [
            "Débil financiación de programas de atención al adulto mayor.",
            "Baja articulación de redes familiares, comunitarias e institucionales."
        ],
        efectosDirectos: [
            "Aumento del aislamiento social de personas adultas mayores.",
            "Menor acceso a actividades de promoción, prevención y bienestar."
        ],
        efectosIndirectos: [
            "Deterioro progresivo de condiciones de calidad de vida.",
            "Mayor dependencia de redes familiares sin apoyo institucional."
        ],
        objetivosEspecificos: [
            "Implementar servicios diurnos de atención e integración social.",
            "Dotar los espacios requeridos para la atención de adultos mayores.",
            "Fortalecer acciones de promoción, prevención y bienestar."
        ],
        beneficios: "Los adultos mayores accederán a espacios diurnos de atención, integración, recreación y acompañamiento social.",
        sostenibilidad: "La sostenibilidad dependerá de la continuidad institucional del programa, recursos de operación, personal de atención y seguimiento de beneficiarios.",
        palabrasClave: ["centro día","adulto mayor","bienestar","atención diurna"]
    },

    {
        codigo: "TIP-SOC-003",
        nombre: "Programa Integral de Adulto Mayor",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar acciones integrales de atención, protección, participación, recreación, alimentación y bienestar para adultos mayores.",
        problemaCentral: "Insuficiente atención integral a la población adulta mayor en condición de vulnerabilidad.",
        objetivoGeneral: "Fortalecer la atención integral de la población adulta mayor en condición de vulnerabilidad.",
        poblaciones: ["POB-CV-006"],
        productos: ["PRO-SER-002","PRO-SER-003","PRO-FOR-001","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-032","IND-PRO-020","IND-RES-001","IND-IMP-001","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SOC-001","NOR-SOC-002",...comunes.normasBase],
        fuentes: ["FUE-ESP-001",...comunes.fuentesBase],
        causasDirectas: [
            "Baja cobertura de programas sociales dirigidos al adulto mayor.",
            "Limitada oferta de actividades de bienestar, recreación, cuidado y acompañamiento."
        ],
        causasIndirectas: [
            "Insuficiente caracterización de la población adulta mayor.",
            "Débil articulación entre programas sociales y redes comunitarias."
        ],
        efectosDirectos: [
            "Persistencia de condiciones de vulnerabilidad y aislamiento.",
            "Menor participación social de adultos mayores."
        ],
        efectosIndirectos: [
            "Incremento de riesgos psicosociales y familiares.",
            "Deterioro de la calidad de vida de la población adulta mayor."
        ],
        objetivosEspecificos: [
            "Ampliar la cobertura de atención integral al adulto mayor.",
            "Desarrollar actividades de bienestar, recreación, cuidado y acompañamiento.",
            "Fortalecer la caracterización y seguimiento de la población beneficiaria."
        ],
        beneficios: "Se incrementará la atención integral, participación, acompañamiento y bienestar de las personas adultas mayores.",
        sostenibilidad: "Se soportará en la inclusión del programa dentro de la oferta social municipal, asignación presupuestal anual y articulación con redes comunitarias.",
        palabrasClave: ["adulto mayor","bienestar","programa social","protección"]
    },

    // =====================================
    // DISCAPACIDAD E INCLUSIÓN
    // =====================================

    {
        codigo: "TIP-SOC-004",
        nombre: "Centro de Atención a Personas con Discapacidad",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a infraestructura, dotación y servicios de atención para personas con discapacidad.",
        problemaCentral: "Insuficiente acceso de las personas con discapacidad a servicios de atención, inclusión y apoyo integral.",
        objetivoGeneral: "Mejorar el acceso de las personas con discapacidad a servicios de atención, inclusión y apoyo integral.",
        poblaciones: ["POB-VUL-001"],
        productos: ["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-SER-003","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-RES-002","IND-IMP-002","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SOC-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente infraestructura accesible para la atención de personas con discapacidad.",
            "Limitada disponibilidad de servicios especializados de inclusión y apoyo."
        ],
        causasIndirectas: [
            "Barreras físicas, sociales e institucionales para la inclusión.",
            "Insuficiente dotación y personal capacitado."
        ],
        efectosDirectos: [
            "Bajo acceso a servicios de atención e inclusión.",
            "Persistencia de barreras para la participación social."
        ],
        efectosIndirectos: [
            "Mayor exclusión social y dependencia familiar.",
            "Reducción de oportunidades de desarrollo personal y comunitario."
        ],
        objetivosEspecificos: [
            "Adecuar o construir infraestructura accesible.",
            "Implementar servicios de atención, inclusión y apoyo integral.",
            "Capacitar beneficiarios, cuidadores y actores institucionales."
        ],
        beneficios: "Las personas con discapacidad tendrán mejores condiciones de acceso, participación e inclusión social.",
        sostenibilidad: "Dependerá de la asignación institucional de responsables, mantenimiento de infraestructura accesible, continuidad de servicios y articulación con políticas de inclusión.",
        palabrasClave: ["discapacidad","inclusión","accesibilidad","centro de atención"]
    },

    {
        codigo: "TIP-SOC-005",
        nombre: "Programa de Inclusión Social para Personas con Discapacidad",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de acompañamiento, formación, asistencia técnica e inclusión social para personas con discapacidad y sus cuidadores.",
        problemaCentral: "Limitadas oportunidades de inclusión social, participación y desarrollo para personas con discapacidad.",
        objetivoGeneral: "Fortalecer las oportunidades de inclusión social, participación y desarrollo para personas con discapacidad.",
        poblaciones: ["POB-VUL-001"],
        productos: ["PRO-SER-002","PRO-SER-003","PRO-FOR-001","PRO-FOR-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-032","IND-PRO-020","IND-PRO-023","IND-RES-002","IND-IMP-002"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: ["NOR-SOC-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja oferta de programas de inclusión y participación.",
            "Limitada formación y acompañamiento a personas con discapacidad y cuidadores."
        ],
        causasIndirectas: [
            "Débil caracterización de necesidades diferenciales.",
            "Baja sensibilización comunitaria e institucional."
        ],
        efectosDirectos: [
            "Baja participación social de personas con discapacidad.",
            "Mayor dependencia y vulnerabilidad familiar."
        ],
        efectosIndirectos: [
            "Persistencia de exclusión social.",
            "Menores oportunidades de desarrollo y autonomía."
        ],
        objetivosEspecificos: [
            "Desarrollar acciones de formación e inclusión social.",
            "Brindar asistencia técnica y acompañamiento a beneficiarios y cuidadores.",
            "Fortalecer la sensibilización comunitaria e institucional."
        ],
        beneficios: "Se fortalecerá la autonomía, participación e inclusión de las personas con discapacidad.",
        sostenibilidad: "Se soportará en la articulación con programas de discapacidad, redes de apoyo, seguimiento institucional y formación de cuidadores.",
        palabrasClave: ["discapacidad","inclusión social","cuidadores","asistencia técnica"]
    },

    // =====================================
    // VÍCTIMAS Y ATENCIÓN PSICOSOCIAL
    // =====================================

    {
        codigo: "TIP-SOC-006",
        nombre: "Centro de Atención a Víctimas",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a infraestructura, dotación o fortalecimiento de espacios de orientación, atención y acompañamiento a víctimas.",
        problemaCentral: "Insuficiente acceso de la población víctima a servicios de orientación, atención, acompañamiento y restablecimiento de derechos.",
        objetivoGeneral: "Mejorar el acceso de la población víctima a servicios de orientación, atención, acompañamiento y restablecimiento de derechos.",
        poblaciones: ["POB-VUL-002"],
        productos: ["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-SER-003","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-RES-002","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SOC-005",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Limitada capacidad institucional para atender a la población víctima.",
            "Insuficientes espacios adecuados para orientación y acompañamiento."
        ],
        causasIndirectas: [
            "Débil articulación de rutas de atención.",
            "Baja disponibilidad de personal y herramientas de seguimiento."
        ],
        efectosDirectos: [
            "Demoras en orientación, atención y acompañamiento.",
            "Mayor vulnerabilidad de hogares víctimas."
        ],
        efectosIndirectos: [
            "Persistencia de barreras para el restablecimiento de derechos.",
            "Menor confianza en la institucionalidad."
        ],
        objetivosEspecificos: [
            "Fortalecer espacios de atención y orientación a víctimas.",
            "Implementar servicios de acompañamiento y articulación institucional.",
            "Dotar y fortalecer la capacidad operativa de atención."
        ],
        beneficios: "La población víctima contará con mejor acceso a orientación, acompañamiento y rutas de atención.",
        sostenibilidad: "Dependerá de la articulación con la política de víctimas, asignación de personal, actualización de rutas y seguimiento institucional.",
        palabrasClave: ["víctimas","conflicto","atención","orientación","derechos"]
    },

    {
        codigo: "TIP-SOC-007",
        nombre: "Atención Psicosocial a Población Vulnerable",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de atención psicosocial, orientación, acompañamiento familiar y comunitario para población vulnerable.",
        problemaCentral: "Insuficiente acceso de la población vulnerable a servicios de atención psicosocial y acompañamiento integral.",
        objetivoGeneral: "Mejorar el acceso de la población vulnerable a servicios de atención psicosocial y acompañamiento integral.",
        poblaciones: ["POB-VUL-002","POB-VUL-003","POB-VUL-001","POB-TER-003"],
        productos: ["PRO-SER-001","PRO-SER-003","PRO-FOR-001","PRO-SER-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-PRO-033","IND-RES-003","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: ["NOR-SOC-005","NOR-SOC-006","NOR-SOC-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja disponibilidad de servicios psicosociales en el territorio.",
            "Limitada capacidad de acompañamiento familiar y comunitario."
        ],
        causasIndirectas: [
            "Insuficiente personal especializado.",
            "Débil identificación temprana de riesgos psicosociales."
        ],
        efectosDirectos: [
            "Aumento de problemáticas familiares, emocionales y comunitarias.",
            "Menor acceso a rutas de atención y protección."
        ],
        efectosIndirectos: [
            "Deterioro de la convivencia y bienestar social.",
            "Mayor vulnerabilidad de hogares afectados."
        ],
        objetivosEspecificos: [
            "Implementar servicios de atención y orientación psicosocial.",
            "Realizar jornadas y talleres de acompañamiento familiar y comunitario.",
            "Fortalecer rutas institucionales de atención."
        ],
        beneficios: "La población vulnerable contará con acompañamiento psicosocial, orientación y fortalecimiento familiar y comunitario.",
        sostenibilidad: "Se soportará en la continuidad de equipos psicosociales, articulación institucional y seguimiento de casos.",
        palabrasClave: ["psicosocial","víctimas","vulnerable","familia","acompañamiento"]
    },

    // =====================================
    // MUJER, FAMILIA Y JUVENTUD
    // =====================================

    {
        codigo: "TIP-SOC-008",
        nombre: "Casa de la Mujer",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de infraestructura, dotación y servicios para orientación, formación, protección y empoderamiento de mujeres.",
        problemaCentral: "Insuficiente acceso de las mujeres a servicios de orientación, formación, protección y fortalecimiento de capacidades.",
        objetivoGeneral: "Mejorar el acceso de las mujeres a servicios de orientación, formación, protección y fortalecimiento de capacidades.",
        poblaciones: ["POB-VUL-003"],
        productos: ["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-SER-003","PRO-FOR-001","PRO-FOR-003"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-PRO-022","IND-RES-002","IND-IMP-003"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SOC-006",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Limitada disponibilidad de espacios institucionales para atención a mujeres.",
            "Insuficiente oferta de orientación, protección, formación y empoderamiento."
        ],
        causasIndirectas: [
            "Débil articulación de rutas de atención y prevención de violencias.",
            "Baja disponibilidad de programas de autonomía económica y liderazgo."
        ],
        efectosDirectos: [
            "Menor acceso de mujeres a servicios de apoyo y protección.",
            "Persistencia de brechas de género y vulnerabilidad."
        ],
        efectosIndirectos: [
            "Reproducción de ciclos de violencia y dependencia económica.",
            "Menor participación social y comunitaria de mujeres."
        ],
        objetivosEspecificos: [
            "Adecuar espacios para la atención integral de mujeres.",
            "Implementar servicios de orientación, formación y protección.",
            "Fortalecer capacidades de liderazgo y autonomía económica."
        ],
        beneficios: "Las mujeres tendrán mayor acceso a servicios de orientación, protección, formación, liderazgo y autonomía.",
        sostenibilidad: "Dependerá de la articulación con la política pública de mujer, continuidad de rutas de atención, operación institucional y alianzas con organizaciones.",
        palabrasClave: ["mujer","casa de la mujer","equidad","violencia","empoderamiento"]
    },

    {
        codigo: "TIP-SOC-009",
        nombre: "Centro Juvenil",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de espacios y servicios para participación, formación, liderazgo, cultura, deporte, emprendimiento y prevención de riesgos en jóvenes.",
        problemaCentral: "Limitado acceso de la juventud a espacios de participación, formación, liderazgo y desarrollo integral.",
        objetivoGeneral: "Mejorar el acceso de la juventud a espacios de participación, formación, liderazgo y desarrollo integral.",
        poblaciones: ["POB-CV-004"],
        productos: ["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-SER-003","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-RES-002","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente oferta de espacios juveniles de encuentro y participación.",
            "Baja disponibilidad de programas de formación, liderazgo y prevención."
        ],
        causasIndirectas: [
            "Débil participación juvenil en procesos comunitarios.",
            "Limitados recursos para programas diferenciales de juventud."
        ],
        efectosDirectos: [
            "Menor participación de jóvenes en procesos sociales y comunitarios.",
            "Aumento de factores de riesgo social en población juvenil."
        ],
        efectosIndirectos: [
            "Pérdida de oportunidades de desarrollo y liderazgo.",
            "Debilitamiento del tejido social juvenil."
        ],
        objetivosEspecificos: [
            "Implementar espacios juveniles de participación y formación.",
            "Desarrollar programas de liderazgo, prevención y desarrollo integral.",
            "Fortalecer la participación juvenil en procesos comunitarios."
        ],
        beneficios: "Los jóvenes contarán con espacios de participación, formación, liderazgo y prevención de riesgos.",
        sostenibilidad: "Se soportará en la articulación con políticas de juventud, organizaciones juveniles, instituciones educativas y programas sociales.",
        palabrasClave: ["juventud","jóvenes","centro juvenil","liderazgo","participación"]
    },

    {
        codigo: "TIP-SOC-010",
        nombre: "Fortalecimiento Familiar y Comunitario",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de acompañamiento, formación y fortalecimiento de familias, redes de cuidado y comunidades.",
        problemaCentral: "Débil capacidad familiar y comunitaria para prevenir riesgos sociales y fortalecer entornos protectores.",
        objetivoGeneral: "Fortalecer la capacidad familiar y comunitaria para prevenir riesgos sociales y consolidar entornos protectores.",
        poblaciones: ["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004"],
        productos: ["PRO-SER-002","PRO-FOR-001","PRO-FOR-003","PRO-SER-004"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-020","IND-PRO-022","IND-PRO-033","IND-RES-003","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja oferta de programas de fortalecimiento familiar y comunitario.",
            "Limitada capacidad de prevención y atención temprana de riesgos sociales."
        ],
        causasIndirectas: [
            "Débil articulación entre instituciones, familias y comunidad.",
            "Insuficiente formación en convivencia, cuidado y corresponsabilidad."
        ],
        efectosDirectos: [
            "Incremento de conflictos familiares y comunitarios.",
            "Menor capacidad de protección de niños, adolescentes y población vulnerable."
        ],
        efectosIndirectos: [
            "Debilitamiento del tejido social.",
            "Mayor exposición a riesgos sociales."
        ],
        objetivosEspecificos: [
            "Desarrollar procesos de formación familiar y comunitaria.",
            "Fortalecer redes de apoyo y cuidado.",
            "Implementar acciones de prevención de riesgos sociales."
        ],
        beneficios: "Las familias y comunidades fortalecerán capacidades de cuidado, convivencia, prevención y corresponsabilidad.",
        sostenibilidad: "Dependerá de redes comunitarias activas, articulación institucional y continuidad de procesos de formación.",
        palabrasClave: ["familia","comunidad","convivencia","entornos protectores","redes de cuidado"]
    },

    // =====================================
    // PRIMERA INFANCIA Y NIÑEZ
    // =====================================

    {
        codigo: "TIP-SOC-011",
        nombre: "Centro de Desarrollo Infantil",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de infraestructura, adecuación, dotación o fortalecimiento de servicios para atención integral a primera infancia.",
        problemaCentral: "Insuficiente acceso de la primera infancia a espacios adecuados de atención integral, cuidado, nutrición y desarrollo.",
        objetivoGeneral: "Mejorar el acceso de la primera infancia a espacios adecuados de atención integral, cuidado, nutrición y desarrollo.",
        poblaciones: ["POB-CV-001"],
        productos: ["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-SER-003","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-032","IND-PRO-020","IND-RES-001","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: ["NOR-SOC-003",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente infraestructura adecuada para atención a primera infancia.",
            "Limitada disponibilidad de dotación y servicios integrales de cuidado y desarrollo."
        ],
        causasIndirectas: [
            "Déficit de cupos de atención integral.",
            "Insuficiente articulación entre familia, comunidad e instituciones."
        ],
        efectosDirectos: [
            "Baja cobertura de atención integral a primera infancia.",
            "Afectación de condiciones de cuidado, nutrición y desarrollo temprano."
        ],
        efectosIndirectos: [
            "Incremento de brechas en desarrollo infantil.",
            "Mayor presión sobre hogares cuidadores."
        ],
        objetivosEspecificos: [
            "Fortalecer la infraestructura para atención integral a primera infancia.",
            "Dotar espacios adecuados para cuidado, nutrición y desarrollo.",
            "Implementar servicios de atención integral y acompañamiento familiar."
        ],
        beneficios: "Niños y niñas de primera infancia accederán a mejores condiciones de cuidado, nutrición, atención y desarrollo integral.",
        sostenibilidad: "Se soportará en la articulación con programas de primera infancia, operación institucional, mantenimiento de infraestructura y seguimiento de beneficiarios.",
        palabrasClave: ["primera infancia","cdi","niños","desarrollo infantil","icbf"]
    },

    {
        codigo: "TIP-SOC-012",
        nombre: "Programa de Protección de Niñez y Adolescencia",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de prevención, protección, formación y acompañamiento a niños, niñas y adolescentes.",
        problemaCentral: "Limitada capacidad institucional y comunitaria para prevenir riesgos y proteger derechos de niños, niñas y adolescentes.",
        objetivoGeneral: "Fortalecer la capacidad institucional y comunitaria para prevenir riesgos y proteger derechos de niños, niñas y adolescentes.",
        poblaciones: ["POB-CV-002","POB-CV-003"],
        productos: ["PRO-SER-002","PRO-SER-003","PRO-FOR-001","PRO-SER-004"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-032","IND-PRO-020","IND-PRO-033","IND-RES-002","IND-IMP-002"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001"],
        normas: ["NOR-SOC-003",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de acciones de prevención y protección.",
            "Débil articulación de rutas de atención y protección de derechos."
        ],
        causasIndirectas: [
            "Insuficiente formación a familias y cuidadores.",
            "Limitada identificación temprana de riesgos."
        ],
        efectosDirectos: [
            "Mayor exposición de niños, niñas y adolescentes a riesgos sociales.",
            "Menor acceso a rutas de protección y acompañamiento."
        ],
        efectosIndirectos: [
            "Vulneración de derechos y afectación del desarrollo integral.",
            "Debilitamiento de entornos protectores."
        ],
        objetivosEspecificos: [
            "Implementar acciones de prevención y protección de derechos.",
            "Fortalecer rutas institucionales de atención.",
            "Desarrollar procesos de formación a familias, cuidadores y comunidad."
        ],
        beneficios: "Niños, niñas y adolescentes contarán con mejores entornos protectores y acceso a acciones de prevención y protección.",
        sostenibilidad: "Se apoyará en comités institucionales, rutas de protección, participación familiar y seguimiento permanente.",
        palabrasClave: ["niñez","adolescencia","protección","derechos","prevención"]
    },

    // =====================================
    // SEGURIDAD ALIMENTARIA Y HABITANTE DE CALLE
    // =====================================

    {
        codigo: "TIP-SOC-013",
        nombre: "Comedor Comunitario",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de implementación, dotación u operación de comedores comunitarios para población vulnerable.",
        problemaCentral: "Insuficiente acceso de la población vulnerable a servicios de apoyo alimentario y nutricional.",
        objetivoGeneral: "Mejorar el acceso de la población vulnerable a servicios de apoyo alimentario y nutricional.",
        poblaciones: ["POB-TER-003","POB-CV-006","POB-CV-001","POB-VUL-005"],
        productos: ["PRO-SER-001","PRO-SER-003","PRO-DOT-001","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-030","IND-PRO-032","IND-PRO-010","IND-PRO-013","IND-RES-001","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja disponibilidad de servicios de apoyo alimentario.",
            "Limitada capacidad operativa para atender población vulnerable."
        ],
        causasIndirectas: [
            "Insuficiente dotación y logística para prestación del servicio.",
            "Débil caracterización de población con inseguridad alimentaria."
        ],
        efectosDirectos: [
            "Persistencia de inseguridad alimentaria en población vulnerable.",
            "Deterioro de condiciones nutricionales y de bienestar."
        ],
        efectosIndirectos: [
            "Mayor vulnerabilidad social y familiar.",
            "Incremento de riesgos en salud y desarrollo humano."
        ],
        objetivosEspecificos: [
            "Implementar servicios de apoyo alimentario.",
            "Dotar espacios y equipos requeridos para la operación.",
            "Fortalecer la identificación y seguimiento de beneficiarios."
        ],
        beneficios: "La población vulnerable contará con apoyo alimentario y mejores condiciones nutricionales y de bienestar.",
        sostenibilidad: "Dependerá de recursos de operación, alianzas comunitarias, control de beneficiarios y seguimiento nutricional.",
        palabrasClave: ["comedor comunitario","seguridad alimentaria","alimentos","nutrición","población vulnerable"]
    },

    {
        codigo: "TIP-SOC-014",
        nombre: "Atención Integral a Habitantes de Calle",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para atención, orientación, alimentación, acompañamiento psicosocial y rutas de inclusión para habitantes de calle.",
        problemaCentral: "Insuficiente acceso de habitantes de calle a servicios integrales de atención, protección, orientación e inclusión social.",
        objetivoGeneral: "Mejorar el acceso de habitantes de calle a servicios integrales de atención, protección, orientación e inclusión social.",
        poblaciones: ["POB-VUL-005"],
        productos: ["PRO-SER-001","PRO-SER-003","PRO-SER-004","PRO-FOR-001","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-030","IND-PRO-032","IND-PRO-033","IND-PRO-020","IND-RES-002","IND-IMP-002"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de servicios de atención a habitantes de calle.",
            "Limitada capacidad de orientación, acompañamiento e inclusión."
        ],
        causasIndirectas: [
            "Débil articulación de rutas de salud, protección y reintegración social.",
            "Insuficiente identificación y caracterización de la población."
        ],
        efectosDirectos: [
            "Persistencia de condiciones de exclusión y vulnerabilidad extrema.",
            "Mayor exposición a riesgos de salud, seguridad y convivencia."
        ],
        efectosIndirectos: [
            "Afectación de bienestar individual y convivencia ciudadana.",
            "Mayor presión sobre servicios de emergencia y asistencia."
        ],
        objetivosEspecificos: [
            "Implementar servicios integrales de atención a habitantes de calle.",
            "Fortalecer rutas de orientación, protección e inclusión.",
            "Realizar seguimiento y caracterización de beneficiarios."
        ],
        beneficios: "Los habitantes de calle accederán a atención, orientación, acompañamiento y rutas de inclusión social.",
        sostenibilidad: "Requiere continuidad institucional, articulación intersectorial, equipos psicosociales y rutas de inclusión social.",
        palabrasClave: ["habitante de calle","calle","inclusión","vulnerabilidad extrema","atención integral"]
    },

    // =====================================
    // COMUNIDAD, EMPRENDIMIENTO E INCLUSIÓN
    // =====================================

    {
        codigo: "TIP-SOC-015",
        nombre: "Centro Comunitario",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de construcción, adecuación, dotación u operación de centros comunitarios para participación, formación y servicios sociales.",
        problemaCentral: "Limitado acceso de la comunidad a espacios adecuados de participación, formación, integración y prestación de servicios sociales.",
        objetivoGeneral: "Mejorar el acceso de la comunidad a espacios adecuados de participación, formación, integración y prestación de servicios sociales.",
        poblaciones: ["POB-TER-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-SER-001","PRO-FOR-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-030","IND-PRO-020","IND-RES-002","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Insuficiente infraestructura comunitaria disponible.",
            "Limitada oferta de servicios, formación y participación comunitaria."
        ],
        causasIndirectas: [
            "Débil organización comunitaria.",
            "Insuficiente inversión en equipamientos sociales."
        ],
        efectosDirectos: [
            "Baja participación comunitaria en procesos sociales.",
            "Menor acceso a servicios y actividades de integración."
        ],
        efectosIndirectos: [
            "Debilitamiento del tejido social.",
            "Menor capacidad comunitaria para gestionar soluciones."
        ],
        objetivosEspecificos: [
            "Fortalecer la infraestructura comunitaria.",
            "Dotar espacios para la prestación de servicios sociales y formación.",
            "Promover la participación y organización comunitaria."
        ],
        beneficios: "La comunidad contará con espacios adecuados para formación, participación, integración y acceso a servicios sociales.",
        sostenibilidad: "La sostenibilidad dependerá de administración comunitaria o institucional, mantenimiento, programación de actividades y articulación con organizaciones locales.",
        palabrasClave: ["centro comunitario","comunidad","participación","integración","servicios sociales"]
    },

    {
        codigo: "TIP-SOC-016",
        nombre: "Fortalecimiento de Organizaciones Comunitarias",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para capacitar, acompañar y fortalecer organizaciones comunitarias, juntas de acción comunal y grupos sociales.",
        problemaCentral: "Débil capacidad organizativa y de gestión de las organizaciones comunitarias.",
        objetivoGeneral: "Fortalecer la capacidad organizativa y de gestión de las organizaciones comunitarias.",
        poblaciones: ["POB-TER-003"],
        productos: ["PRO-FOR-003","PRO-FOR-004","PRO-FOR-001","PRO-SER-004"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-022","IND-PRO-023","IND-PRO-020","IND-PRO-033","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Bajo nivel de formación en gestión comunitaria.",
            "Limitado acompañamiento institucional a organizaciones sociales."
        ],
        causasIndirectas: [
            "Débil planeación y seguimiento de iniciativas comunitarias.",
            "Baja articulación entre organizaciones e instituciones."
        ],
        efectosDirectos: [
            "Menor capacidad de gestión de proyectos comunitarios.",
            "Baja incidencia de organizaciones en el desarrollo local."
        ],
        efectosIndirectos: [
            "Debilitamiento del tejido social.",
            "Menor participación ciudadana efectiva."
        ],
        objetivosEspecificos: [
            "Capacitar organizaciones comunitarias en gestión y liderazgo.",
            "Brindar asistencia técnica y acompañamiento organizativo.",
            "Fortalecer la articulación entre comunidad e institucionalidad."
        ],
        beneficios: "Las organizaciones comunitarias mejorarán su capacidad de liderazgo, gestión y participación.",
        sostenibilidad: "Se soportará en la formación de líderes, acompañamiento institucional y redes comunitarias activas.",
        palabrasClave: ["organizaciones comunitarias","junta de acción comunal","liderazgo","participación","fortalecimiento"]
    },

    {
        codigo: "TIP-SOC-017",
        nombre: "Emprendimiento Social",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para fortalecer capacidades de emprendimiento, generación de ingresos e inclusión productiva de población vulnerable.",
        problemaCentral: "Limitadas capacidades de generación de ingresos y emprendimiento en población vulnerable.",
        objetivoGeneral: "Fortalecer las capacidades de generación de ingresos y emprendimiento en población vulnerable.",
        poblaciones: ["POB-VUL-003","POB-CV-004","POB-VUL-002","POB-TER-003"],
        productos: ["PRO-FOR-001","PRO-FOR-003","PRO-FOR-004","PRO-DOT-004"],
        actividades: ["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-020","IND-PRO-022","IND-PRO-023","IND-PRO-013","IND-RES-002","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja formación en emprendimiento y habilidades productivas.",
            "Limitado acceso a asistencia técnica, insumos y acompañamiento."
        ],
        causasIndirectas: [
            "Insuficientes oportunidades de inclusión económica.",
            "Débil articulación con redes de comercialización y apoyo."
        ],
        efectosDirectos: [
            "Bajos ingresos de población vulnerable.",
            "Menor autonomía económica y social."
        ],
        efectosIndirectos: [
            "Persistencia de pobreza y dependencia económica.",
            "Aumento de brechas sociales."
        ],
        objetivosEspecificos: [
            "Capacitar población vulnerable en emprendimiento y habilidades productivas.",
            "Brindar asistencia técnica y acompañamiento a iniciativas.",
            "Apoyar la entrega de insumos o elementos productivos cuando aplique."
        ],
        beneficios: "La población vulnerable fortalecerá capacidades de emprendimiento, generación de ingresos y autonomía económica.",
        sostenibilidad: "Se apoyará en asistencia técnica, seguimiento a unidades productivas, alianzas comerciales y articulación con programas de desarrollo económico.",
        palabrasClave: ["emprendimiento social","generación de ingresos","población vulnerable","productivo","autonomía económica"]
    },

    {
        codigo: "TIP-SOC-018",
        nombre: "Inclusión Social para Población Vulnerable",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto integral para mejorar acceso a servicios, participación, formación y acompañamiento de población vulnerable.",
        problemaCentral: "Limitado acceso de la población vulnerable a oportunidades de inclusión social, participación y desarrollo.",
        objetivoGeneral: "Mejorar el acceso de la población vulnerable a oportunidades de inclusión social, participación y desarrollo.",
        poblaciones: ["POB-VUL-001","POB-VUL-002","POB-VUL-003","POB-TER-003"],
        productos: ["PRO-SER-002","PRO-SER-003","PRO-FOR-001","PRO-FOR-004","PRO-SER-004"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-032","IND-PRO-020","IND-PRO-023","IND-PRO-033","IND-RES-002","IND-IMP-002"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001"],
        normas: ["NOR-SOC-004","NOR-SOC-005","NOR-SOC-006",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja cobertura de programas de inclusión social.",
            "Limitado acceso a formación, acompañamiento y rutas institucionales."
        ],
        causasIndirectas: [
            "Débil caracterización de población vulnerable.",
            "Insuficiente articulación interinstitucional."
        ],
        efectosDirectos: [
            "Persistencia de exclusión social.",
            "Menor acceso a oportunidades de desarrollo."
        ],
        efectosIndirectos: [
            "Incremento de brechas sociales y territoriales.",
            "Mayor dependencia de asistencia temporal."
        ],
        objetivosEspecificos: [
            "Implementar programas de inclusión social.",
            "Brindar formación, orientación y acompañamiento a población vulnerable.",
            "Fortalecer rutas de acceso a servicios institucionales."
        ],
        beneficios: "La población vulnerable tendrá mayores oportunidades de inclusión, participación y desarrollo social.",
        sostenibilidad: "La sostenibilidad dependerá del seguimiento a beneficiarios, articulación de rutas institucionales y continuidad de programas sociales.",
        palabrasClave: ["inclusión social","población vulnerable","oportunidades","participación","desarrollo social"]
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

window.PlantillasDesarrolloSocial = PlantillasDesarrolloSocial;
