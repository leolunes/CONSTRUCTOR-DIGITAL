// =====================================
// PLANTILLAS/EDUCACION.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Educación
// =====================================

/*
  Este archivo registra tipologías especializadas del sector Educación.

  Requiere cargar antes:
  - js/asistente/motor-tipologias.js
*/

const PlantillasEducacion = (()=>{

const SECTOR = "Educación";
const SECTOR_CODIGO = "SEC-SOC-003";

const comunes = {
    riesgos: [
        "RIE-TEC-001",
        "RIE-FIN-001",
        "RIE-CON-001",
        "RIE-CON-002",
        "RIE-SOC-001"
    ],
    normasBase: [
        "NOR-EDU-001",
        "NOR-EDU-002",
        "NOR-EDU-003",
        "NOR-CON-001",
        "NOR-CON-003"
    ],
    fuentesBase: [
        "FUE-PUB-001",
        "FUE-PUB-003",
        "FUE-NAC-001",
        "FUE-NAC-003",
        "FUE-COO-002"
    ]
};

const tipologias = [

    {
        codigo: "TIP-EDU-001",
        nombre: "Construcción o mejoramiento de institución educativa",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a construcción, mejoramiento, ampliación o dotación de infraestructura educativa.",
        problemaCentral: "Limitadas condiciones físicas y funcionales para la prestación adecuada del servicio educativo.",
        objetivoGeneral: "Mejorar las condiciones físicas y funcionales para la prestación del servicio educativo.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-DOT-003"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-012","IND-RES-001","IND-GES-001","IND-GES-002"],
        riesgos: comunes.riesgos,
        normas: ["NOR-EDU-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Infraestructura educativa insuficiente, deteriorada o inadecuada.",
            "Limitada disponibilidad de dotación y ambientes de aprendizaje adecuados."
        ],
        causasIndirectas: [
            "Crecimiento de la demanda educativa.",
            "Insuficiente inversión en mantenimiento, ampliación y dotación escolar."
        ],
        efectosDirectos: [
            "Baja calidad de los ambientes escolares.",
            "Limitaciones para la cobertura, permanencia y calidad educativa."
        ],
        efectosIndirectos: [
            "Incremento de brechas educativas.",
            "Deterioro de condiciones de bienestar y aprendizaje de los estudiantes."
        ],
        objetivosEspecificos: [
            "Fortalecer la infraestructura física de la institución educativa.",
            "Dotar ambientes escolares adecuados para la prestación del servicio educativo.",
            "Mejorar las condiciones de acceso, permanencia y calidad educativa."
        ],
        beneficios: "Los estudiantes y docentes contarán con mejores ambientes educativos, mayor seguridad, funcionalidad y condiciones para el aprendizaje.",
        sostenibilidad: "La sostenibilidad dependerá del mantenimiento de infraestructura, uso adecuado de la dotación, asignación de responsables y articulación con la Secretaría de Educación.",
        palabrasClave: ["colegio","escuela","institución educativa","aulas","infraestructura educativa"]
    },

    {
        codigo: "TIP-EDU-002",
        nombre: "Construcción de aulas escolares",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construir aulas escolares que permitan ampliar cobertura y mejorar ambientes de aprendizaje.",
        problemaCentral: "Insuficiente disponibilidad de aulas escolares para atender la demanda educativa.",
        objetivoGeneral: "Aumentar la disponibilidad de aulas escolares para atender la demanda educativa.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-INF-001","PRO-DOT-003"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-012","IND-RES-001","IND-RES-004","IND-GES-001","IND-GES-002"],
        riesgos: comunes.riesgos,
        normas: ["NOR-EDU-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Déficit de aulas frente a la matrícula actual o proyectada.",
            "Hacinamiento o uso de espacios no adecuados para clases."
        ],
        causasIndirectas: [
            "Crecimiento poblacional escolar.",
            "Limitada planeación de infraestructura educativa."
        ],
        efectosDirectos: [
            "Afectación de la calidad del aprendizaje.",
            "Limitaciones para ampliar cobertura educativa."
        ],
        efectosIndirectos: [
            "Riesgo de deserción o baja permanencia escolar.",
            "Aumento de brechas en acceso educativo."
        ],
        objetivosEspecificos: [
            "Construir aulas escolares funcionales y seguras.",
            "Dotar las aulas con mobiliario escolar requerido.",
            "Mejorar la capacidad instalada de la sede educativa."
        ],
        beneficios: "Se ampliará la capacidad de atención educativa y se mejorarán las condiciones de aprendizaje de estudiantes.",
        sostenibilidad: "Dependerá del mantenimiento periódico de aulas, asignación de mobiliario y gestión administrativa de la institución.",
        palabrasClave: ["aulas","salones","colegio","escuela","capacidad escolar"]
    },

    {
        codigo: "TIP-EDU-003",
        nombre: "Mejoramiento de infraestructura educativa",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a mejorar, adecuar o rehabilitar infraestructura educativa existente.",
        problemaCentral: "Deterioro de la infraestructura educativa que afecta la prestación adecuada del servicio.",
        objetivoGeneral: "Mejorar la infraestructura educativa existente para garantizar condiciones adecuadas de prestación del servicio.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-INF-002","PRO-INF-003","PRO-DOT-003"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-003","IND-PRO-012","IND-RES-003","IND-GES-001","IND-GES-002"],
        riesgos: comunes.riesgos,
        normas: ["NOR-EDU-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Deterioro físico de aulas, baterías sanitarias, cubiertas, redes o zonas comunes.",
            "Insuficiente mantenimiento preventivo y correctivo."
        ],
        causasIndirectas: [
            "Antigüedad de la infraestructura escolar.",
            "Limitados recursos para mantenimiento educativo."
        ],
        efectosDirectos: [
            "Riesgos para la seguridad y bienestar de la comunidad educativa.",
            "Afectación de la continuidad y calidad del servicio educativo."
        ],
        efectosIndirectos: [
            "Desmotivación y baja permanencia escolar.",
            "Incremento de costos futuros por deterioro acumulado."
        ],
        objetivosEspecificos: [
            "Rehabilitar o adecuar los espacios educativos deteriorados.",
            "Mejorar condiciones de seguridad, funcionalidad y habitabilidad.",
            "Fortalecer el mantenimiento de la infraestructura educativa."
        ],
        beneficios: "La comunidad educativa contará con espacios más seguros, funcionales y adecuados para el aprendizaje.",
        sostenibilidad: "Se soportará en un plan de mantenimiento escolar, seguimiento institucional y uso responsable de la infraestructura.",
        palabrasClave: ["mejoramiento educativo","adecuación colegio","rehabilitación escuela","mantenimiento escolar"]
    },

    {
        codigo: "TIP-EDU-004",
        nombre: "Dotación escolar",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a suministrar mobiliario, equipos, material pedagógico y dotación para instituciones educativas.",
        problemaCentral: "Insuficiente dotación escolar para el desarrollo adecuado de actividades pedagógicas y administrativas.",
        objetivoGeneral: "Fortalecer la dotación escolar para el desarrollo adecuado de actividades pedagógicas y administrativas.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-DOT-001","PRO-DOT-002","PRO-DOT-003","PRO-DOT-004"],
        actividades: ["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-010","IND-PRO-011","IND-PRO-012","IND-PRO-013","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Mobiliario y equipos insuficientes u obsoletos.",
            "Limitada disponibilidad de recursos pedagógicos y administrativos."
        ],
        causasIndirectas: [
            "Crecimiento de matrícula y desgaste de dotación existente.",
            "Baja reposición periódica de mobiliario y equipos escolares."
        ],
        efectosDirectos: [
            "Ambientes de aprendizaje menos adecuados.",
            "Dificultades para desarrollar actividades pedagógicas."
        ],
        efectosIndirectos: [
            "Afectación de calidad educativa y bienestar escolar.",
            "Menor aprovechamiento de espacios educativos."
        ],
        objetivosEspecificos: [
            "Suministrar mobiliario escolar y administrativo.",
            "Adquirir equipos y material pedagógico requerido.",
            "Fortalecer las condiciones de enseñanza y aprendizaje."
        ],
        beneficios: "Estudiantes y docentes dispondrán de dotación adecuada para mejorar el proceso educativo.",
        sostenibilidad: "Dependerá del inventario, uso adecuado, mantenimiento, reposición programada y control institucional.",
        palabrasClave: ["dotación escolar","mobiliario escolar","equipos educativos","material pedagógico"]
    },

    {
        codigo: "TIP-EDU-005",
        nombre: "Restaurante escolar",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para construir, adecuar o dotar restaurantes escolares y espacios de alimentación escolar.",
        problemaCentral: "Limitadas condiciones físicas y de dotación para la prestación adecuada del servicio de alimentación escolar.",
        objetivoGeneral: "Mejorar las condiciones físicas y de dotación para la prestación adecuada del servicio de alimentación escolar.",
        poblaciones: ["POB-SEC-001","POB-CV-002","POB-CV-003"],
        productos: ["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-DOT-003"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
        indicadores: ["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-012","IND-RES-003","IND-GES-001"],
        riesgos: comunes.riesgos,
        normas: ["NOR-EDU-004",...comunes.normasBase],
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Espacios de alimentación escolar insuficientes o inadecuados.",
            "Deficiencia de dotación para preparación, distribución o consumo de alimentos."
        ],
        causasIndirectas: [
            "Crecimiento de beneficiarios del programa de alimentación.",
            "Insuficiente mantenimiento y reposición de equipos de cocina y comedor."
        ],
        efectosDirectos: [
            "Dificultades para prestar el servicio de alimentación escolar.",
            "Riesgos sanitarios y operativos en la atención alimentaria."
        ],
        efectosIndirectos: [
            "Afectación de permanencia escolar y bienestar estudiantil.",
            "Menor calidad en la prestación del servicio complementario."
        ],
        objetivosEspecificos: [
            "Construir o adecuar espacios de restaurante escolar.",
            "Dotar áreas de preparación, distribución y consumo de alimentos.",
            "Fortalecer las condiciones sanitarias y operativas del servicio."
        ],
        beneficios: "Los estudiantes accederán a mejores condiciones para recibir alimentación escolar segura y adecuada.",
        sostenibilidad: "Requiere mantenimiento, control sanitario, operación articulada con alimentación escolar y reposición de equipos.",
        palabrasClave: ["restaurante escolar","comedor escolar","alimentación escolar","PAE"]
    },

    {
        codigo: "TIP-EDU-006",
        nombre: "Laboratorios escolares",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de construcción, adecuación o dotación de laboratorios escolares para ciencias, tecnología e innovación.",
        problemaCentral: "Insuficiente disponibilidad de laboratorios escolares adecuados para fortalecer competencias científicas y tecnológicas.",
        objetivoGeneral: "Mejorar la disponibilidad de laboratorios escolares adecuados para fortalecer competencias científicas y tecnológicas.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-INF-002","PRO-DOT-001","PRO-DOT-002","PRO-DOT-004"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-EJE-003","ACT-EJE-004","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-010","IND-PRO-011","IND-PRO-013","IND-PRO-020","IND-RES-003"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Baja disponibilidad de espacios y equipos para prácticas de laboratorio.",
            "Insuficiente dotación de insumos y material experimental."
        ],
        causasIndirectas: [
            "Limitada inversión en ambientes especializados de aprendizaje.",
            "Baja formación docente para uso de laboratorios."
        ],
        efectosDirectos: [
            "Bajo desarrollo de competencias científicas y experimentales.",
            "Menor motivación hacia ciencia, tecnología e innovación."
        ],
        efectosIndirectos: [
            "Reducción de calidad educativa en áreas STEM.",
            "Menores oportunidades de innovación y aprendizaje práctico."
        ],
        objetivosEspecificos: [
            "Adecuar espacios para laboratorios escolares.",
            "Adquirir equipos, mobiliario e insumos de laboratorio.",
            "Capacitar docentes y estudiantes en uso seguro y pedagógico."
        ],
        beneficios: "Se fortalecerán competencias científicas, tecnológicas y prácticas en estudiantes.",
        sostenibilidad: "Dependerá de mantenimiento, reposición de insumos, protocolos de seguridad y formación docente continua.",
        palabrasClave: ["laboratorio escolar","ciencias","STEM","química","física","biología"]
    },

    {
        codigo: "TIP-EDU-007",
        nombre: "Biblioteca escolar",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto de construcción, adecuación o dotación de bibliotecas escolares y centros de recursos para el aprendizaje.",
        problemaCentral: "Limitado acceso de estudiantes y docentes a espacios y recursos de lectura, consulta e investigación escolar.",
        objetivoGeneral: "Mejorar el acceso de estudiantes y docentes a espacios y recursos de lectura, consulta e investigación escolar.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-INF-002","PRO-DOT-001","PRO-DOT-003","PRO-DOT-004"],
        actividades: ["ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-EJE-003","ACT-EJE-004","ACT-CTL-002","ACT-CIE-001"],
        indicadores: ["IND-PRO-002","IND-PRO-010","IND-PRO-012","IND-PRO-013","IND-PRO-020","IND-RES-002"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
        normas: comunes.normasBase,
        fuentes: comunes.fuentesBase,
        causasDirectas: [
            "Espacios de biblioteca insuficientes o inadecuados.",
            "Limitada dotación bibliográfica, tecnológica y mobiliaria."
        ],
        causasIndirectas: [
            "Baja inversión en recursos de lectura e investigación.",
            "Insuficiente promoción de hábitos de lectura."
        ],
        efectosDirectos: [
            "Bajo acceso a recursos de aprendizaje complementario.",
            "Débil fortalecimiento de competencias lectoras e investigativas."
        ],
        efectosIndirectos: [
            "Afectación del rendimiento académico.",
            "Menores oportunidades de aprendizaje autónomo."
        ],
        objetivosEspecificos: [
            "Adecuar espacios de biblioteca escolar.",
            "Dotar recursos bibliográficos, tecnológicos y mobiliarios.",
            "Promover el uso pedagógico y comunitario de la biblioteca."
        ],
        beneficios: "Se mejorará el acceso a lectura, consulta, investigación y aprendizaje autónomo.",
        sostenibilidad: "Requiere administración de inventarios, actualización bibliográfica, mantenimiento y programación de actividades de lectura.",
        palabrasClave: ["biblioteca escolar","lectura","libros","centro de recursos","consulta"]
    },

    {
        codigo: "TIP-EDU-008",
        nombre: "Conectividad educativa",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar conectividad, redes, equipos y apropiación digital en instituciones educativas.",
        problemaCentral: "Limitado acceso de la comunidad educativa a conectividad y herramientas digitales para el aprendizaje.",
        objetivoGeneral: "Mejorar el acceso de la comunidad educativa a conectividad y herramientas digitales para el aprendizaje.",
        poblaciones: ["POB-SEC-001","POB-SEC-002"],
        productos: ["PRO-TIC-001","PRO-TIC-003","PRO-DOT-002","PRO-FOR-001","PRO-FOR-002"],
        actividades: ["ACT-PLA-004","ACT-EJE-003","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-050","IND-PRO-052","IND-PRO-011","IND-PRO-020","IND-PRO-021","IND-RES-002"],
        riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001"],
        normas: ["NOR-TIC-001","NOR-TIC-002",...comunes.normasBase],
        fuentes: ["FUE-NAC-003","FUE-PUB-003","FUE-PUB-001","FUE-NAC-001"],
        causasDirectas: [
            "Insuficiente conectividad en sedes educativas.",
            "Limitada disponibilidad de equipos y plataformas educativas."
        ],
        causasIndirectas: [
            "Brechas digitales territoriales.",
            "Baja formación en apropiación pedagógica de TIC."
        ],
        efectosDirectos: [
            "Limitado acceso a recursos educativos digitales.",
            "Menor desarrollo de competencias digitales."
        ],
        efectosIndirectos: [
            "Aumento de brechas educativas y tecnológicas.",
            "Menor capacidad de innovación pedagógica."
        ],
        objetivosEspecificos: [
            "Implementar conectividad y redes en sedes educativas.",
            "Dotar equipos y herramientas digitales.",
            "Capacitar docentes y estudiantes en uso pedagógico de TIC."
        ],
        beneficios: "La comunidad educativa contará con acceso a recursos digitales, conectividad y herramientas de aprendizaje.",
        sostenibilidad: "Requiere continuidad del servicio de conectividad, soporte técnico, reposición tecnológica y capacitación permanente.",
        palabrasClave: ["conectividad","internet escolar","tic educación","computadores","aula digital"]
    },

    {
        codigo: "TIP-EDU-009",
        nombre: "Transporte escolar",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para implementar o fortalecer servicios de transporte escolar, especialmente en zonas rurales o dispersas.",
        problemaCentral: "Limitado acceso de estudiantes al servicio educativo por dificultades de transporte escolar.",
        objetivoGeneral: "Mejorar el acceso de estudiantes al servicio educativo mediante el fortalecimiento del transporte escolar.",
        poblaciones: ["POB-SEC-001","POB-TER-001"],
        productos: ["PRO-SER-001","PRO-SER-003"],
        actividades: ["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-030","IND-PRO-032","IND-RES-001","IND-GES-001","IND-GES-003"],
        riesgos: ["RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-AMB-001"],
        normas: comunes.normasBase,
        fuentes: ["FUE-PUB-003","FUE-PUB-001","FUE-NAC-003"],
        causasDirectas: [
            "Insuficiente cobertura de transporte escolar.",
            "Dificultades geográficas y económicas para el desplazamiento de estudiantes."
        ],
        causasIndirectas: [
            "Dispersión poblacional rural.",
            "Limitados recursos para financiar rutas escolares."
        ],
        efectosDirectos: [
            "Inasistencia, tardanza o deserción escolar.",
            "Aumento de barreras de acceso educativo."
        ],
        efectosIndirectos: [
            "Baja permanencia escolar.",
            "Incremento de brechas urbano-rurales."
        ],
        objetivosEspecificos: [
            "Implementar o ampliar rutas de transporte escolar.",
            "Priorizar estudiantes con mayores barreras de acceso.",
            "Fortalecer seguimiento a cobertura y permanencia."
        ],
        beneficios: "Los estudiantes tendrán mejores condiciones de acceso y permanencia en el sistema educativo.",
        sostenibilidad: "Dependerá de disponibilidad presupuestal anual, contratación oportuna, control de rutas y seguimiento de beneficiarios.",
        palabrasClave: ["transporte escolar","rutas escolares","estudiantes rurales","permanencia"]
    },

    {
        codigo: "TIP-EDU-010",
        nombre: "Permanencia escolar",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a estrategias de permanencia, prevención de deserción, acompañamiento y bienestar escolar.",
        problemaCentral: "Persisten factores que afectan la permanencia escolar de niños, niñas y adolescentes.",
        objetivoGeneral: "Fortalecer estrategias que favorezcan la permanencia escolar de niños, niñas y adolescentes.",
        poblaciones: ["POB-SEC-001","POB-CV-002","POB-CV-003"],
        productos: ["PRO-SER-002","PRO-SER-003","PRO-FOR-001","PRO-SER-004"],
        actividades: ["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-031","IND-PRO-032","IND-PRO-020","IND-PRO-033","IND-RES-001","IND-IMP-001"],
        riesgos: ["RIE-SOC-001","RIE-SOC-002","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: ["FUE-PUB-003","FUE-PUB-001","FUE-NAC-003"],
        causasDirectas: [
            "Bajo acompañamiento psicosocial y pedagógico a estudiantes en riesgo.",
            "Factores económicos, familiares y territoriales que afectan la asistencia."
        ],
        causasIndirectas: [
            "Débil seguimiento a alertas tempranas de deserción.",
            "Insuficiente articulación entre familia, escuela e institucionalidad."
        ],
        efectosDirectos: [
            "Inasistencia recurrente y riesgo de deserción.",
            "Afectación del rendimiento académico y desarrollo integral."
        ],
        efectosIndirectos: [
            "Incremento de brechas educativas.",
            "Menores oportunidades futuras para niños y jóvenes."
        ],
        objetivosEspecificos: [
            "Implementar estrategias de acompañamiento a estudiantes en riesgo.",
            "Fortalecer alertas tempranas y seguimiento institucional.",
            "Desarrollar acciones de articulación familia-escuela-comunidad."
        ],
        beneficios: "Se fortalecerá la permanencia escolar, reduciendo factores de riesgo de deserción.",
        sostenibilidad: "Se soportará en seguimiento institucional, participación familiar, articulación con orientación escolar y continuidad de programas de bienestar.",
        palabrasClave: ["permanencia escolar","deserción","bienestar escolar","acompañamiento"]
    },

    {
        codigo: "TIP-EDU-011",
        nombre: "Calidad educativa y formación docente",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto para fortalecer capacidades pedagógicas, didácticas, curriculares y de gestión educativa en docentes y directivos.",
        problemaCentral: "Limitadas capacidades pedagógicas y de gestión para mejorar la calidad educativa.",
        objetivoGeneral: "Fortalecer capacidades pedagógicas y de gestión para mejorar la calidad educativa.",
        poblaciones: ["POB-SEC-002","POB-SEC-001"],
        productos: ["PRO-FOR-002","PRO-FOR-001","PRO-SER-002"],
        actividades: ["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
        indicadores: ["IND-PRO-021","IND-PRO-020","IND-PRO-031","IND-RES-003","IND-GES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001"],
        normas: comunes.normasBase,
        fuentes: ["FUE-PUB-003","FUE-PUB-001","FUE-NAC-003"],
        causasDirectas: [
            "Insuficiente actualización pedagógica y didáctica.",
            "Limitado acompañamiento a docentes y directivos."
        ],
        causasIndirectas: [
            "Baja disponibilidad de procesos de formación continua.",
            "Débil uso de información para mejorar prácticas educativas."
        ],
        efectosDirectos: [
            "Prácticas pedagógicas poco actualizadas.",
            "Menor desempeño en procesos de aprendizaje."
        ],
        efectosIndirectos: [
            "Afectación de la calidad educativa.",
            "Persistencia de brechas en resultados académicos."
        ],
        objetivosEspecificos: [
            "Capacitar docentes y directivos en estrategias pedagógicas.",
            "Brindar acompañamiento y asistencia técnica educativa.",
            "Fortalecer procesos de gestión y evaluación de aprendizajes."
        ],
        beneficios: "Docentes y directivos fortalecerán capacidades para mejorar procesos de enseñanza y aprendizaje.",
        sostenibilidad: "Dependerá de comunidades de aprendizaje, seguimiento pedagógico, actualización permanente y liderazgo institucional.",
        palabrasClave: ["calidad educativa","formación docente","capacitación docente","pedagogía"]
    },

    {
        codigo: "TIP-EDU-012",
        nombre: "Educación inicial",
        sector: SECTOR,
        sectorCodigo: SECTOR_CODIGO,
        descripcion: "Proyecto orientado a fortalecer ambientes, dotación y procesos pedagógicos para educación inicial.",
        problemaCentral: "Limitadas condiciones de acceso y calidad en la educación inicial para niños y niñas.",
        objetivoGeneral: "Mejorar las condiciones de acceso y calidad en la educación inicial para niños y niñas.",
        poblaciones: ["POB-CV-001"],
        productos: ["PRO-INF-002","PRO-DOT-001","PRO-DOT-003","PRO-FOR-002","PRO-SER-001"],
        actividades: ["ACT-PLA-001","ACT-PLA-003","ACT-EJE-002","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003"],
        indicadores: ["IND-PRO-002","IND-PRO-010","IND-PRO-012","IND-PRO-021","IND-PRO-030","IND-RES-001"],
        riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
        normas: ["NOR-SOC-003",...comunes.normasBase],
        fuentes: ["FUE-PUB-003","FUE-PUB-001","FUE-NAC-003"],
        causasDirectas: [
            "Ambientes de educación inicial insuficientes o inadecuados.",
            "Limitada dotación pedagógica y formación de agentes educativos."
        ],
        causasIndirectas: [
            "Déficit de oferta para primera infancia.",
            "Insuficiente articulación entre educación, familia y cuidado."
        ],
        efectosDirectos: [
            "Menor acceso a experiencias pedagógicas tempranas.",
            "Afectación de condiciones de desarrollo integral."
        ],
        efectosIndirectos: [
            "Incremento de brechas desde la primera infancia.",
            "Menores oportunidades de trayectoria educativa exitosa."
        ],
        objetivosEspecificos: [
            "Adecuar ambientes pedagógicos para educación inicial.",
            "Dotar material y mobiliario apropiado para primera infancia.",
            "Capacitar agentes educativos y fortalecer acompañamiento familiar."
        ],
        beneficios: "Niños y niñas accederán a mejores ambientes y procesos de educación inicial.",
        sostenibilidad: "Requiere articulación institucional, formación permanente, mantenimiento de ambientes y reposición de material pedagógico.",
        palabrasClave: ["educación inicial","primera infancia","preescolar","ambientes pedagógicos"]
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

window.PlantillasEducacion = PlantillasEducacion;
