// =====================================
// PLANTILLAS/TIC.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector TIC
// =====================================

const PlantillasTIC = (()=>{

const SECTOR = "Tecnologías de la Información y las Comunicaciones";
const SECTOR_CODIGO = "SEC-TIC-001";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-SOC-001"],
    normasBase: ["NOR-TIC-001","NOR-TIC-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-TIC-001",
nombre:"Conectividad rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a ampliar el acceso a internet y servicios digitales en zonas rurales o dispersas.",
problemaCentral:"Limitado acceso de la población rural a conectividad, internet y servicios digitales.",
objetivoGeneral:"Mejorar el acceso de la población rural a conectividad, internet y servicios digitales.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-TIC-001","PRO-TIC-003","PRO-SER-001","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-050","IND-PRO-052","IND-PRO-030","IND-PRO-020","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente infraestructura de conectividad en zonas rurales.","Baja disponibilidad de equipos, redes o servicios de acceso a internet."],
causasIndirectas:["Dispersión poblacional y altos costos de despliegue tecnológico.","Limitada capacidad institucional y comunitaria para sostenibilidad del servicio."],
efectosDirectos:["Dificultades de acceso a educación, salud, trámites y mercados digitales.","Brecha digital entre zonas urbanas y rurales."],
efectosIndirectos:["Menores oportunidades de desarrollo económico y social rural.","Aumento de desigualdades territoriales."],
objetivosEspecificos:["Implementar infraestructura o soluciones de conectividad rural.","Fortalecer capacidades digitales de usuarios y comunidades.","Garantizar operación, mantenimiento y apropiación del servicio."],
beneficios:"La población rural tendrá mejor acceso a internet, servicios digitales, educación, salud, información y oportunidades productivas.",
sostenibilidad:"Dependerá de operador, mantenimiento, energía, modelo de operación, apropiación comunitaria y recursos para continuidad del servicio.",
palabrasClave:["conectividad rural","internet rural","última milla","wifi rural","brecha digital"]
},

{
codigo:"TIP-TIC-002",
nombre:"Zonas WiFi gratuitas",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar zonas WiFi públicas o puntos gratuitos de acceso a internet en espacios comunitarios.",
problemaCentral:"Limitado acceso público y gratuito a internet en espacios comunitarios y zonas de alta demanda social.",
objetivoGeneral:"Ampliar el acceso público y gratuito a internet en espacios comunitarios y zonas de alta demanda social.",
poblaciones:["POB-TER-002","POB-TER-003","POB-CV-003","POB-CV-004"],
productos:["PRO-TIC-001","PRO-TIC-003","PRO-SER-001"],
actividades:["ACT-PLA-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-050","IND-PRO-052","IND-PRO-030","IND-RES-001","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja disponibilidad de puntos públicos de acceso a internet.","Insuficiente infraestructura inalámbrica en espacios comunitarios."],
causasIndirectas:["Limitada inversión en conectividad pública.","Alta demanda de servicios digitales por parte de estudiantes, jóvenes y comunidad."],
efectosDirectos:["Menor acceso ciudadano a información, trámites, educación y comunicación digital.","Persistencia de brechas digitales en población vulnerable."],
efectosIndirectos:["Reducción de oportunidades educativas, laborales y de participación digital.","Mayor exclusión tecnológica."],
objetivosEspecificos:["Instalar zonas WiFi públicas en puntos priorizados.","Garantizar conectividad, seguridad y disponibilidad del servicio.","Promover el uso responsable y productivo de internet."],
beneficios:"La ciudadanía contará con acceso gratuito a internet en espacios públicos estratégicos.",
sostenibilidad:"Requiere contrato de conectividad, soporte técnico, mantenimiento de equipos, seguridad de red y seguimiento de uso.",
palabrasClave:["zona wifi","wifi gratis","internet público","punto digital","conectividad pública"]
},

{
codigo:"TIP-TIC-003",
nombre:"Centros digitales comunitarios",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar o fortalecer centros digitales con equipos, conectividad, formación y servicios TIC comunitarios.",
problemaCentral:"Limitado acceso de la comunidad a espacios adecuados para uso de tecnologías, formación digital y servicios en línea.",
objetivoGeneral:"Mejorar el acceso de la comunidad a espacios adecuados para uso de tecnologías, formación digital y servicios en línea.",
poblaciones:["POB-TER-003","POB-TER-001","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-TIC-001","PRO-TIC-003","PRO-DOT-002","PRO-FOR-001","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-050","IND-PRO-052","IND-PRO-011","IND-PRO-020","IND-PRO-030","IND-RES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia de equipos, conectividad y espacios digitales comunitarios.","Baja oferta de formación y acompañamiento en uso de TIC."],
causasIndirectas:["Brechas digitales por edad, ingresos, ruralidad o nivel educativo.","Limitado acceso de población vulnerable a dispositivos y servicios digitales."],
efectosDirectos:["Menor uso de trámites, educación y oportunidades digitales.","Baja apropiación tecnológica comunitaria."],
efectosIndirectos:["Persistencia de exclusión digital y menor competitividad social.","Menor participación ciudadana en servicios digitales."],
objetivosEspecificos:["Implementar centros digitales con conectividad y equipos.","Desarrollar formación y acompañamiento en competencias digitales.","Facilitar acceso ciudadano a trámites y servicios en línea."],
beneficios:"La comunidad contará con espacios tecnológicos para formación, acceso a servicios, comunicación y desarrollo de capacidades.",
sostenibilidad:"Dependerá de administración del centro, mantenimiento de equipos, conectividad, monitores y programación continua.",
palabrasClave:["centro digital","kiosco digital","sala TIC","centro comunitario digital","punto vive digital"]
},

{
codigo:"TIP-TIC-004",
nombre:"Dotación tecnológica",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para adquirir equipos tecnológicos, computadores, tabletas, periféricos, software y elementos TIC.",
problemaCentral:"Insuficiente disponibilidad de equipos tecnológicos para apoyar procesos educativos, administrativos, comunitarios o institucionales.",
objetivoGeneral:"Fortalecer la disponibilidad de equipos tecnológicos para apoyar procesos educativos, administrativos, comunitarios o institucionales.",
poblaciones:["POB-TER-003","POB-SEC-001","POB-SEC-002"],
productos:["PRO-DOT-002","PRO-TIC-003","PRO-FOR-001"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-EJE-004","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-011","IND-PRO-052","IND-PRO-020","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Equipos tecnológicos insuficientes, obsoletos o deteriorados.","Baja disponibilidad de software, periféricos y elementos complementarios."],
causasIndirectas:["Limitada reposición tecnológica y mantenimiento preventivo.","Creciente demanda de procesos digitales e institucionales."],
efectosDirectos:["Dificultad para desarrollar actividades digitales y trámites en línea.","Baja eficiencia administrativa, educativa o comunitaria."],
efectosIndirectos:["Aumento de brechas digitales y pérdida de productividad.","Menor calidad en prestación de servicios apoyados en TIC."],
objetivosEspecificos:["Adquirir equipos tecnológicos y elementos TIC requeridos.","Garantizar instalación, configuración y entrega operativa.","Capacitar usuarios en uso adecuado y cuidado de equipos."],
beneficios:"Se fortalecerá la capacidad tecnológica para educación, gestión, servicios digitales y apropiación TIC.",
sostenibilidad:"Requiere inventario, mantenimiento, seguridad, reposición tecnológica y capacitación de usuarios.",
palabrasClave:["dotación tecnológica","computadores","tabletas","equipos TIC","hardware"]
},

{
codigo:"TIP-TIC-005",
nombre:"Gobierno Digital",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar políticas, herramientas y capacidades de Gobierno Digital en entidades públicas territoriales.",
problemaCentral:"Débil implementación de Gobierno Digital que limita la eficiencia institucional, transparencia y acceso ciudadano a servicios en línea.",
objetivoGeneral:"Fortalecer la implementación de Gobierno Digital para mejorar eficiencia institucional, transparencia y acceso ciudadano a servicios en línea.",
poblaciones:["POB-TER-003"],
productos:["PRO-GES-003","PRO-TIC-003","PRO-FOR-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-052","IND-PRO-021","IND-PRO-030","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja madurez digital institucional.","Insuficientes plataformas, procesos y capacidades para servicios digitales."],
causasIndirectas:["Limitada planificación de transformación digital.","Débil cultura institucional de datos, seguridad y servicio ciudadano."],
efectosDirectos:["Trámites presenciales, lentos o poco transparentes.","Baja eficiencia administrativa y satisfacción ciudadana."],
efectosIndirectos:["Menor confianza ciudadana y mayor costo de gestión pública.","Rezago institucional frente a estándares de Gobierno Digital."],
objetivosEspecificos:["Implementar herramientas y procesos de Gobierno Digital.","Capacitar servidores públicos en transformación digital.","Fortalecer servicios digitales, transparencia y gestión de datos."],
beneficios:"La entidad mejorará eficiencia, transparencia, acceso ciudadano y calidad de servicios digitales.",
sostenibilidad:"Dependerá de liderazgo institucional, actualización tecnológica, seguridad de información, mantenimiento y formación continua.",
palabrasClave:["gobierno digital","transformación digital","trámites en línea","servicios digitales","entidad pública"]
},

{
codigo:"TIP-TIC-006",
nombre:"Transformación digital institucional",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para modernizar procesos, sistemas, servicios y capacidades digitales de entidades públicas.",
problemaCentral:"Baja capacidad institucional para transformar procesos y servicios mediante tecnologías digitales.",
objetivoGeneral:"Fortalecer la capacidad institucional para transformar procesos y servicios mediante tecnologías digitales.",
poblaciones:["POB-TER-003"],
productos:["PRO-GES-003","PRO-TIC-003","PRO-TIC-001","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-PLA-004","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-052","IND-PRO-050","IND-PRO-021","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Procesos institucionales manuales, fragmentados o desactualizados.","Insuficiente integración de sistemas y uso de herramientas digitales."],
causasIndirectas:["Baja inversión en modernización tecnológica.","Resistencia al cambio y limitada formación del talento humano."],
efectosDirectos:["Ineficiencia en la gestión institucional y atención ciudadana.","Duplicidad de información y baja trazabilidad de procesos."],
efectosIndirectos:["Mayor costo administrativo y menor calidad del servicio público.","Rezago institucional en innovación y gestión por datos."],
objetivosEspecificos:["Diagnosticar y rediseñar procesos priorizados.","Implementar herramientas digitales para gestión institucional.","Capacitar talento humano y fortalecer cultura digital."],
beneficios:"La entidad mejorará productividad, trazabilidad, gestión de información y atención ciudadana.",
sostenibilidad:"Requiere gobernanza digital, soporte técnico, actualización, formación y mejora continua de procesos.",
palabrasClave:["transformación digital","modernización institucional","digitalización","procesos digitales","innovación pública"]
},

{
codigo:"TIP-TIC-007",
nombre:"Gestión documental electrónica",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar sistemas de gestión documental electrónica, archivo digital, expedientes y flujos de trámite.",
problemaCentral:"Deficiente gestión documental que limita la organización, trazabilidad, conservación y acceso a la información institucional.",
objetivoGeneral:"Mejorar la gestión documental para fortalecer organización, trazabilidad, conservación y acceso a la información institucional.",
poblaciones:["POB-TER-003"],
productos:["PRO-TIC-003","PRO-GES-003","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-052","IND-PRO-042","IND-PRO-021","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Archivos físicos desorganizados o procesos documentales manuales.","Ausencia o debilidad de herramientas de expediente electrónico."],
causasIndirectas:["Baja cultura archivística y digital.","Limitado cumplimiento de lineamientos de gestión documental."],
efectosDirectos:["Dificultad para consultar, conservar y responder información.","Pérdida de trazabilidad y mayores tiempos de trámite."],
efectosIndirectos:["Riesgos legales, administrativos y de transparencia.","Menor eficiencia institucional y confianza ciudadana."],
objetivosEspecificos:["Implementar herramientas de gestión documental electrónica.","Organizar procesos de archivo, trámite y expediente digital.","Capacitar servidores en gestión documental y uso del sistema."],
beneficios:"La entidad mejorará trazabilidad, conservación, consulta y eficiencia de la gestión documental.",
sostenibilidad:"Dependerá de administración del sistema, actualización normativa, capacitación, respaldo de información y seguridad digital.",
palabrasClave:["gestión documental","expediente electrónico","archivo digital","documentos","trámites"]
},

{
codigo:"TIP-TIC-008",
nombre:"Datos abiertos e interoperabilidad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer publicación de datos abiertos, interoperabilidad, integración de sistemas y analítica pública.",
problemaCentral:"Baja disponibilidad, integración y aprovechamiento de datos públicos para la toma de decisiones y transparencia.",
objetivoGeneral:"Fortalecer la disponibilidad, integración y aprovechamiento de datos públicos para la toma de decisiones y transparencia.",
poblaciones:["POB-TER-003"],
productos:["PRO-GES-003","PRO-TIC-003","PRO-FOR-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-052","IND-PRO-021","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Información institucional dispersa, no estandarizada o poco reutilizable.","Baja interoperabilidad entre sistemas y entidades."],
causasIndirectas:["Débil gobernanza de datos y capacidades de análisis.","Limitada cultura de transparencia activa y uso de datos."],
efectosDirectos:["Decisiones con información incompleta o desactualizada.","Menor transparencia y participación ciudadana basada en datos."],
efectosIndirectos:["Ineficiencia institucional y duplicidad de registros.","Menor innovación pública y control social."],
objetivosEspecificos:["Estandarizar y publicar conjuntos de datos abiertos priorizados.","Fortalecer interoperabilidad entre sistemas de información.","Capacitar servidores en gobernanza, calidad y uso de datos."],
beneficios:"La entidad mejorará transparencia, toma de decisiones, integración de información e innovación pública.",
sostenibilidad:"Requiere política de datos, responsables, actualización periódica, seguridad y calidad de información.",
palabrasClave:["datos abiertos","interoperabilidad","gobernanza de datos","analítica","transparencia"]
},

{
codigo:"TIP-TIC-009",
nombre:"Seguridad digital y ciberseguridad",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer seguridad digital, protección de información, continuidad tecnológica y cultura de ciberseguridad.",
problemaCentral:"Alta vulnerabilidad de sistemas e información institucional frente a riesgos de seguridad digital.",
objetivoGeneral:"Reducir la vulnerabilidad de sistemas e información institucional frente a riesgos de seguridad digital.",
poblaciones:["POB-TER-003"],
productos:["PRO-TIC-003","PRO-DOT-002","PRO-FOR-002","PRO-GES-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-003","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-052","IND-PRO-011","IND-PRO-021","IND-PRO-042","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficientes controles de seguridad, respaldo y protección de datos.","Baja formación de usuarios en prevención de riesgos digitales."],
causasIndirectas:["Aumento de amenazas cibernéticas y dependencia tecnológica.","Limitada inversión en herramientas y políticas de seguridad."],
efectosDirectos:["Riesgo de pérdida, fuga o alteración de información.","Interrupción de servicios digitales institucionales."],
efectosIndirectos:["Pérdida de confianza, daños reputacionales y riesgos legales.","Aumento de costos de recuperación tecnológica."],
objetivosEspecificos:["Implementar controles, herramientas y protocolos de seguridad digital.","Capacitar usuarios en buenas prácticas de ciberseguridad.","Fortalecer respaldo, continuidad y respuesta ante incidentes."],
beneficios:"La entidad protegerá mejor sus datos, sistemas y servicios digitales frente a amenazas.",
sostenibilidad:"Dependerá de actualización continua, monitoreo, políticas de seguridad, formación y pruebas periódicas.",
palabrasClave:["ciberseguridad","seguridad digital","seguridad informática","datos","protección de información"]
},

{
codigo:"TIP-TIC-010",
nombre:"Alfabetización y competencias digitales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para formar ciudadanos, estudiantes, adultos mayores, emprendedores o servidores públicos en habilidades digitales.",
problemaCentral:"Bajas competencias digitales de la población para aprovechar tecnologías, servicios en línea y oportunidades digitales.",
objetivoGeneral:"Fortalecer las competencias digitales de la población para aprovechar tecnologías, servicios en línea y oportunidades digitales.",
poblaciones:["POB-TER-003","POB-CV-004","POB-CV-006","POB-VUL-003"],
productos:["PRO-FOR-001","PRO-SER-002","PRO-SER-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-031","IND-PRO-032","IND-RES-001","IND-IMP-001","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Bajo conocimiento en uso de herramientas digitales básicas.","Limitada oferta de formación TIC para población vulnerable o general."],
causasIndirectas:["Brechas generacionales, económicas y territoriales en acceso y uso de TIC.","Baja apropiación de servicios digitales y trámites en línea."],
efectosDirectos:["Exclusión digital y baja participación en servicios en línea.","Menor acceso a oportunidades educativas, laborales y productivas."],
efectosIndirectos:["Persistencia de brechas sociales y económicas.","Baja productividad y ciudadanía digital."],
objetivosEspecificos:["Desarrollar procesos de alfabetización y formación digital.","Promover uso seguro y productivo de tecnologías.","Fortalecer habilidades para trámites, educación, empleo y emprendimiento digital."],
beneficios:"La población fortalecerá habilidades digitales para mejorar acceso a servicios, educación, empleo y participación.",
sostenibilidad:"Se soportará en programas continuos, centros digitales, formadores, contenidos actualizados y seguimiento a beneficiarios.",
palabrasClave:["alfabetización digital","competencias digitales","formación TIC","ciudadanía digital","capacitación digital"]
},

{
codigo:"TIP-TIC-011",
nombre:"Ciudad inteligente",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar soluciones tecnológicas de ciudad inteligente en movilidad, seguridad, ambiente, servicios o gestión urbana.",
problemaCentral:"Limitada capacidad del territorio para gestionar servicios urbanos mediante información, tecnología e innovación.",
objetivoGeneral:"Fortalecer la capacidad del territorio para gestionar servicios urbanos mediante información, tecnología e innovación.",
poblaciones:["POB-TER-002","POB-TER-003"],
productos:["PRO-TIC-003","PRO-GES-003","PRO-DOT-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-PLA-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-052","IND-PRO-042","IND-PRO-011","IND-PRO-030","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja integración de tecnologías para gestión de servicios urbanos.","Insuficiente información en tiempo real para toma de decisiones."],
causasIndirectas:["Débil planeación de transformación urbana digital.","Limitada interoperabilidad entre sistemas y sectores."],
efectosDirectos:["Menor eficiencia en gestión urbana y servicios públicos.","Baja capacidad de respuesta ante problemas de movilidad, seguridad o ambiente."],
efectosIndirectos:["Mayor costo de gestión territorial y menor calidad de vida urbana.","Rezago del municipio en innovación y competitividad."],
objetivosEspecificos:["Implementar soluciones tecnológicas priorizadas de ciudad inteligente.","Integrar información para mejorar toma de decisiones.","Fortalecer capacidades institucionales y ciudadanas para uso de datos."],
beneficios:"El territorio contará con herramientas tecnológicas para mejorar gestión urbana, servicios y calidad de vida.",
sostenibilidad:"Requiere operación, mantenimiento, interoperabilidad, actualización tecnológica y gobernanza de datos.",
palabrasClave:["ciudad inteligente","smart city","sensores","innovación urbana","tecnología urbana"]
},

{
codigo:"TIP-TIC-012",
nombre:"Centro de datos y modernización tecnológica",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para modernizar infraestructura tecnológica institucional, servidores, redes, almacenamiento, respaldo y centro de datos.",
problemaCentral:"Obsolescencia o insuficiencia de infraestructura tecnológica institucional para soportar servicios digitales y operación administrativa.",
objetivoGeneral:"Fortalecer la infraestructura tecnológica institucional para soportar servicios digitales y operación administrativa.",
poblaciones:["POB-TER-003"],
productos:["PRO-DOT-002","PRO-TIC-003","PRO-GES-003","PRO-FOR-002"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-003","ACT-EJE-004","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-011","IND-PRO-052","IND-PRO-042","IND-PRO-021","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Servidores, redes o almacenamiento obsoletos o insuficientes.","Baja capacidad de respaldo, disponibilidad y continuidad tecnológica."],
causasIndirectas:["Crecimiento de servicios digitales y volumen de información.","Insuficiente renovación y mantenimiento de infraestructura TIC."],
efectosDirectos:["Interrupciones de servicios, lentitud o pérdida de información.","Riesgos de seguridad y baja eficiencia tecnológica."],
efectosIndirectos:["Afectación de la atención ciudadana y operación institucional.","Incremento de costos por fallas y recuperación tecnológica."],
objetivosEspecificos:["Adquirir o modernizar infraestructura tecnológica institucional.","Implementar respaldo, almacenamiento y continuidad operativa.","Capacitar personal en administración y soporte tecnológico."],
beneficios:"La entidad contará con infraestructura TIC más segura, estable y eficiente para prestar servicios digitales.",
sostenibilidad:"Dependerá de mantenimiento, licencias, soporte, seguridad, actualización y personal técnico responsable.",
palabrasClave:["centro de datos","servidores","modernización tecnológica","infraestructura TIC","datacenter"]
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

window.PlantillasTIC = PlantillasTIC;
