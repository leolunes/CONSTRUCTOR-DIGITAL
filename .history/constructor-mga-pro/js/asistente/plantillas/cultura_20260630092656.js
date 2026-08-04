// =====================================
// PLANTILLAS/CULTURA.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Cultura
// =====================================

const PlantillasCultura = (()=>{

const SECTOR = "Cultura";
const SECTOR_CODIGO = "SEC-CDA-002";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-SOC-001"],
    normasBase: ["NOR-CUL-001","NOR-CUL-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-ESP-003","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-CUL-001",
nombre:"Construcción de Casa de la Cultura",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construir infraestructura cultural para formación, circulación artística, participación comunitaria y preservación cultural.",
problemaCentral:"Insuficiente disponibilidad de infraestructura cultural adecuada para el desarrollo de procesos artísticos, formativos y comunitarios.",
objetivoGeneral:"Mejorar la disponibilidad de infraestructura cultural adecuada para el desarrollo de procesos artísticos, formativos y comunitarios.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004"],
productos:["PRO-INF-001","PRO-DOT-001","PRO-SER-001","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-PRO-020","IND-RES-002","IND-GES-001","IND-GES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Inexistencia o insuficiencia de espacios culturales adecuados.","Limitada capacidad para realizar formación, eventos y procesos culturales."],
causasIndirectas:["Baja inversión en infraestructura cultural.","Crecimiento de la demanda comunitaria por espacios de cultura y arte."],
efectosDirectos:["Baja participación en procesos culturales y artísticos.","Limitación para la circulación y formación cultural."],
efectosIndirectos:["Debilitamiento de identidad cultural y tejido social.","Pérdida de oportunidades de desarrollo artístico local."],
objetivosEspecificos:["Construir infraestructura cultural funcional y accesible.","Dotar espacios para formación, creación y circulación artística.","Promover la participación comunitaria en procesos culturales."],
beneficios:"La comunidad contará con un espacio adecuado para formación artística, eventos, participación e integración cultural.",
sostenibilidad:"Dependerá del modelo de administración, mantenimiento, programación cultural, alianzas con gestores y apropiación comunitaria.",
palabrasClave:["casa de la cultura","centro cultural","infraestructura cultural","arte","formación cultural"]
},

{
codigo:"TIP-CUL-002",
nombre:"Mejoramiento de Casa de la Cultura",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para mejorar, adecuar, rehabilitar o dotar casas de la cultura existentes.",
problemaCentral:"Deterioro o insuficiencia funcional de la infraestructura cultural existente.",
objetivoGeneral:"Mejorar las condiciones físicas y funcionales de la infraestructura cultural existente.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004"],
productos:["PRO-INF-002","PRO-DOT-001","PRO-DOT-004"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-002","IND-PRO-010","IND-PRO-013","IND-RES-003","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Espacios culturales deteriorados, inseguros o poco funcionales.","Insuficiente dotación para procesos artísticos y culturales."],
causasIndirectas:["Mantenimiento insuficiente de infraestructura cultural.","Uso intensivo de espacios sin reposición o adecuación."],
efectosDirectos:["Reducción de actividades culturales y formativas.","Riesgos para usuarios, artistas y gestores culturales."],
efectosIndirectos:["Debilitamiento de la oferta cultural municipal.","Menor apropiación comunitaria de espacios culturales."],
objetivosEspecificos:["Rehabilitar o adecuar espacios culturales deteriorados.","Dotar la casa de la cultura con elementos requeridos.","Mejorar condiciones de seguridad, accesibilidad y funcionalidad."],
beneficios:"Se recuperarán espacios culturales para formación, creación, circulación y participación ciudadana.",
sostenibilidad:"Requiere mantenimiento preventivo, inventario de dotación, programación cultural y administración responsable del espacio.",
palabrasClave:["mejoramiento casa cultura","rehabilitación cultural","dotación cultural","espacios culturales"]
},

{
codigo:"TIP-CUL-003",
nombre:"Biblioteca pública",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construcción, mejoramiento o dotación de bibliotecas públicas para acceso a lectura, información y conocimiento.",
problemaCentral:"Limitado acceso de la población a espacios y recursos de lectura, información, conocimiento y formación ciudadana.",
objetivoGeneral:"Mejorar el acceso de la población a espacios y recursos de lectura, información, conocimiento y formación ciudadana.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-DOT-004","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-013","IND-PRO-030","IND-RES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente infraestructura bibliotecaria o recursos de lectura.","Baja disponibilidad de servicios bibliotecarios y culturales."],
causasIndirectas:["Limitada actualización de colecciones y recursos tecnológicos.","Débil promoción de lectura y escritura."],
efectosDirectos:["Bajo acceso a lectura, información y conocimiento.","Menor participación en actividades educativas y culturales."],
efectosIndirectos:["Afectación de competencias lectoras y formación ciudadana.","Incremento de brechas de acceso al conocimiento."],
objetivosEspecificos:["Construir, mejorar o dotar biblioteca pública.","Ampliar servicios de lectura, información y cultura.","Promover hábitos de lectura, escritura e investigación."],
beneficios:"La población accederá a espacios de lectura, aprendizaje, consulta, cultura y participación comunitaria.",
sostenibilidad:"Dependerá de administración bibliotecaria, actualización de colecciones, programación de actividades y mantenimiento de infraestructura.",
palabrasClave:["biblioteca pública","lectura","libros","conocimiento","escritura"]
},

{
codigo:"TIP-CUL-004",
nombre:"Dotación de biblioteca",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para dotar bibliotecas con colecciones, mobiliario, equipos, tecnología y material pedagógico.",
problemaCentral:"Insuficiente dotación bibliotecaria para prestar servicios adecuados de lectura, consulta e información.",
objetivoGeneral:"Fortalecer la dotación bibliotecaria para prestar servicios adecuados de lectura, consulta e información.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004"],
productos:["PRO-DOT-001","PRO-DOT-002","PRO-DOT-004"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-010","IND-PRO-011","IND-PRO-013","IND-RES-003","IND-GES-001"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Colecciones bibliográficas insuficientes o desactualizadas.","Falta de mobiliario, equipos y recursos tecnológicos."],
causasIndirectas:["Baja reposición y actualización de material bibliotecario.","Crecimiento de demanda de servicios de información y cultura."],
efectosDirectos:["Baja calidad de servicios bibliotecarios.","Menor acceso a recursos educativos y culturales."],
efectosIndirectos:["Debilitamiento de hábitos de lectura y aprendizaje autónomo.","Mayor brecha de acceso a información."],
objetivosEspecificos:["Adquirir colecciones bibliográficas y recursos educativos.","Dotar mobiliario, equipos y tecnología bibliotecaria.","Fortalecer la prestación de servicios de lectura y consulta."],
beneficios:"La biblioteca contará con mejores recursos para lectura, consulta, investigación y actividades culturales.",
sostenibilidad:"Requiere inventario, actualización periódica de colecciones, mantenimiento de equipos y programación de servicios.",
palabrasClave:["dotación biblioteca","libros","mobiliario biblioteca","colecciones","tecnología biblioteca"]
},

{
codigo:"TIP-CUL-005",
nombre:"Escuelas de formación artística y cultural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar o fortalecer escuelas de formación en música, danza, teatro, artes plásticas y otras expresiones culturales.",
problemaCentral:"Limitado acceso de niños, jóvenes y comunidad a procesos de formación artística y cultural.",
objetivoGeneral:"Ampliar el acceso de niños, jóvenes y comunidad a procesos de formación artística y cultural.",
poblaciones:["POB-CV-002","POB-CV-003","POB-CV-004","POB-TER-003"],
productos:["PRO-FOR-001","PRO-SER-002","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-031","IND-PRO-013","IND-RES-002","IND-IMP-001","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja oferta de formación artística permanente.","Insuficiente disponibilidad de formadores, materiales e instrumentos."],
causasIndirectas:["Limitados recursos para procesos culturales continuos.","Débil articulación con instituciones educativas y gestores culturales."],
efectosDirectos:["Menor desarrollo de talentos artísticos locales.","Bajo aprovechamiento del tiempo libre en actividades culturales."],
efectosIndirectos:["Pérdida de identidad cultural y oportunidades creativas.","Debilitamiento del tejido social y cultural."],
objetivosEspecificos:["Implementar escuelas de formación artística y cultural.","Dotar materiales, instrumentos e insumos requeridos.","Fortalecer participación y continuidad de beneficiarios."],
beneficios:"La comunidad accederá a formación artística, expresión cultural, creatividad e integración social.",
sostenibilidad:"Dependerá de formadores, dotación, calendario cultural, alianzas educativas y seguimiento de estudiantes.",
palabrasClave:["formación artística","escuelas culturales","música","danza","teatro","artes"]
},

{
codigo:"TIP-CUL-006",
nombre:"Banda municipal de música",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para crear, fortalecer o dotar bandas municipales de música y procesos de formación musical.",
problemaCentral:"Limitada capacidad de formación y circulación musical de la banda municipal o procesos musicales comunitarios.",
objetivoGeneral:"Fortalecer la formación y circulación musical de la banda municipal o procesos musicales comunitarios.",
poblaciones:["POB-CV-002","POB-CV-003","POB-CV-004","POB-TER-003"],
productos:["PRO-FOR-001","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-013","IND-PRO-031","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia de instrumentos, uniformes, partituras y materiales musicales.","Baja continuidad de procesos de formación musical."],
causasIndirectas:["Limitada financiación de procesos musicales municipales.","Falta de mantenimiento y reposición de instrumentos."],
efectosDirectos:["Debilitamiento de la banda municipal y semilleros musicales.","Menor participación en eventos culturales."],
efectosIndirectos:["Pérdida de tradición musical local.","Menores oportunidades de formación artística para niños y jóvenes."],
objetivosEspecificos:["Dotar instrumentos y elementos requeridos para la banda municipal.","Fortalecer procesos de formación musical.","Promover presentaciones y circulación cultural."],
beneficios:"Niños, jóvenes y comunidad fortalecerán capacidades musicales e identidad cultural.",
sostenibilidad:"Requiere mantenimiento de instrumentos, formadores, inventario, programación de ensayos y participación en eventos.",
palabrasClave:["banda municipal","música","instrumentos","formación musical","bandas"]
},

{
codigo:"TIP-CUL-007",
nombre:"Patrimonio cultural material",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para conservar, restaurar, proteger o poner en valor bienes de patrimonio cultural material.",
problemaCentral:"Deterioro o riesgo de pérdida de bienes de patrimonio cultural material del territorio.",
objetivoGeneral:"Conservar y poner en valor bienes de patrimonio cultural material del territorio.",
poblaciones:["POB-TER-003"],
productos:["PRO-INF-002","PRO-GES-003","PRO-SER-002","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-002","IND-PRO-042","IND-PRO-031","IND-PRO-020","IND-RES-003"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Deterioro físico de bienes patrimoniales.","Insuficiente gestión, protección y mantenimiento del patrimonio."],
causasIndirectas:["Baja asignación de recursos para conservación patrimonial.","Débil apropiación ciudadana del patrimonio cultural."],
efectosDirectos:["Pérdida progresiva de bienes de valor histórico y cultural.","Reducción de oportunidades de uso educativo, cultural y turístico."],
efectosIndirectos:["Debilitamiento de identidad y memoria local.","Pérdida de potencial cultural y económico del territorio."],
objetivosEspecificos:["Realizar acciones de conservación o restauración patrimonial.","Fortalecer gestión, protección y apropiación social del patrimonio.","Promover uso cultural y educativo de los bienes patrimoniales."],
beneficios:"Se protegerá la memoria histórica, identidad cultural y potencial social del patrimonio local.",
sostenibilidad:"Dependerá de planes de manejo, mantenimiento, vigilancia, apropiación comunitaria y gestión institucional.",
palabrasClave:["patrimonio cultural","restauración","conservación","bien patrimonial","memoria"]
},

{
codigo:"TIP-CUL-008",
nombre:"Patrimonio cultural inmaterial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para salvaguardar manifestaciones, saberes, tradiciones, prácticas y expresiones culturales inmateriales.",
problemaCentral:"Riesgo de pérdida o debilitamiento de manifestaciones del patrimonio cultural inmaterial.",
objetivoGeneral:"Fortalecer la salvaguardia y transmisión de manifestaciones del patrimonio cultural inmaterial.",
poblaciones:["POB-TER-003","POB-CV-006","POB-CV-004"],
productos:["PRO-SER-002","PRO-FOR-001","PRO-GES-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-020","IND-PRO-042","IND-RES-003","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja transmisión intergeneracional de saberes y tradiciones.","Insuficiente documentación y promoción de manifestaciones culturales."],
causasIndirectas:["Cambio de prácticas sociales y pérdida de portadores de tradición.","Débil apropiación comunitaria y educativa del patrimonio inmaterial."],
efectosDirectos:["Pérdida de saberes, prácticas y expresiones tradicionales.","Menor participación de nuevas generaciones en la cultura local."],
efectosIndirectos:["Debilitamiento de identidad cultural y cohesión social.","Reducción de diversidad cultural del territorio."],
objetivosEspecificos:["Documentar y promover manifestaciones culturales inmateriales.","Fortalecer procesos de transmisión intergeneracional.","Implementar acciones de salvaguardia y apropiación comunitaria."],
beneficios:"La comunidad protegerá sus tradiciones, saberes y expresiones culturales, fortaleciendo identidad y memoria.",
sostenibilidad:"Dependerá de participación de portadores, escuelas, comunidad, documentación y continuidad de acciones de salvaguardia.",
palabrasClave:["patrimonio inmaterial","tradiciones","saberes","memoria","salvaguardia"]
},

{
codigo:"TIP-CUL-009",
nombre:"Festivales y eventos culturales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para organizar festivales, encuentros, muestras, ferias y eventos culturales comunitarios o territoriales.",
problemaCentral:"Baja oferta de espacios de circulación, encuentro y participación cultural en el territorio.",
objetivoGeneral:"Incrementar la oferta de espacios de circulación, encuentro y participación cultural en el territorio.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-SER-002","PRO-SER-003","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-032","IND-PRO-013","IND-RES-001","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente programación de eventos culturales.","Limitada logística, promoción y apoyo a artistas y gestores."],
causasIndirectas:["Débil articulación cultural institucional y comunitaria.","Limitados recursos para circulación cultural."],
efectosDirectos:["Menor participación ciudadana en actividades culturales.","Baja visibilidad de artistas y expresiones locales."],
efectosIndirectos:["Debilitamiento de identidad y economía cultural local.","Pérdida de oportunidades de integración comunitaria."],
objetivosEspecificos:["Organizar eventos, festivales o muestras culturales.","Fortalecer logística, promoción y participación de artistas.","Promover circulación cultural e integración comunitaria."],
beneficios:"La comunidad contará con más espacios de encuentro cultural, participación e identidad.",
sostenibilidad:"Dependerá de planeación anual, alianzas culturales, promoción, participación comunitaria y evaluación de eventos.",
palabrasClave:["festival","evento cultural","feria cultural","circulación artística","muestra cultural"]
},

{
codigo:"TIP-CUL-010",
nombre:"Museo o centro de memoria",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para crear, fortalecer, dotar o mejorar museos, salas de exposición o centros de memoria histórica.",
problemaCentral:"Limitado acceso de la población a espacios de memoria, exposición, investigación y valoración del patrimonio cultural.",
objetivoGeneral:"Mejorar el acceso de la población a espacios de memoria, exposición, investigación y valoración del patrimonio cultural.",
poblaciones:["POB-TER-003","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-GES-003","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-042","IND-PRO-030","IND-RES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Inexistencia o precariedad de espacios de memoria y exposición.","Baja disponibilidad de dotación, guion museográfico y conservación."],
causasIndirectas:["Débil gestión documental, patrimonial y comunitaria.","Insuficiente inversión en memoria histórica y museografía."],
efectosDirectos:["Pérdida de memoria histórica y baja apropiación patrimonial.","Menor acceso a contenidos culturales y educativos."],
efectosIndirectos:["Debilitamiento de identidad local.","Pérdida de potencial turístico, educativo y cultural."],
objetivosEspecificos:["Crear o fortalecer espacios museales y de memoria.","Dotar elementos de exhibición, conservación y mediación cultural.","Promover investigación, memoria y apropiación social del patrimonio."],
beneficios:"La población tendrá acceso a espacios de memoria, cultura, investigación y valoración patrimonial.",
sostenibilidad:"Requiere administración, conservación de colecciones, programación museal, mantenimiento y alianzas académicas o comunitarias.",
palabrasClave:["museo","centro de memoria","memoria histórica","exposición","patrimonio"]
},

{
codigo:"TIP-CUL-011",
nombre:"Lectura, escritura y oralidad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para promover lectura, escritura, oralidad, clubes de lectura, talleres y procesos comunitarios de formación lectora.",
problemaCentral:"Bajos niveles de participación en procesos de lectura, escritura y oralidad en la comunidad.",
objetivoGeneral:"Fortalecer la participación en procesos de lectura, escritura y oralidad en la comunidad.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-SER-002","PRO-FOR-001","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-020","IND-PRO-013","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente oferta de actividades de promoción de lectura y escritura.","Baja disponibilidad de materiales, mediadores y espacios de lectura."],
causasIndirectas:["Débiles hábitos lectores en hogares y comunidades.","Baja articulación entre bibliotecas, escuelas y comunidad."],
efectosDirectos:["Baja participación en prácticas lectoras y culturales.","Menor desarrollo de competencias comunicativas."],
efectosIndirectos:["Afectación de aprendizaje, creatividad y participación ciudadana.","Aumento de brechas culturales y educativas."],
objetivosEspecificos:["Implementar actividades de promoción de lectura, escritura y oralidad.","Dotar materiales y recursos de apoyo a procesos lectores.","Fortalecer mediadores, clubes y espacios comunitarios de lectura."],
beneficios:"La población fortalecerá hábitos lectores, expresión oral, escritura creativa y participación cultural.",
sostenibilidad:"Se soportará en bibliotecas, mediadores, instituciones educativas, programación continua y participación comunitaria.",
palabrasClave:["lectura","escritura","oralidad","club de lectura","promoción lectora"]
},

{
codigo:"TIP-CUL-012",
nombre:"Infraestructura cultural rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construir, mejorar o dotar espacios culturales en zonas rurales y centros poblados.",
problemaCentral:"Insuficiente disponibilidad de espacios culturales adecuados en zonas rurales.",
objetivoGeneral:"Mejorar la disponibilidad de espacios culturales adecuados en zonas rurales.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-030","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Escasez de espacios culturales rurales.","Dificultades de acceso de población rural a oferta cultural urbana."],
causasIndirectas:["Dispersión poblacional y baja inversión cultural rural.","Débil organización y dotación de procesos culturales veredales."],
efectosDirectos:["Menor participación cultural de comunidades rurales.","Baja circulación de expresiones culturales rurales."],
efectosIndirectos:["Incremento de brechas urbano-rurales en acceso a cultura.","Debilitamiento de tradiciones e identidad rural."],
objetivosEspecificos:["Construir o mejorar espacios culturales rurales.","Dotar elementos para procesos artísticos y comunitarios.","Promover actividades culturales en veredas y centros poblados."],
beneficios:"La población rural contará con espacios para cultura, formación, integración y preservación de tradiciones.",
sostenibilidad:"Dependerá de cuidado comunitario, programación rural, alianzas con gestores y mantenimiento del espacio.",
palabrasClave:["cultura rural","centro cultural rural","vereda","tradiciones rurales","espacio cultural"]
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

window.PlantillasCultura = PlantillasCultura;
