// =====================================
// PLANTILLAS/DESARROLLO-ECONOMICO.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Desarrollo Económico
// =====================================

const PlantillasDesarrolloEconomico = (()=>{

const SECTOR = "Desarrollo Económico";
const SECTOR_CODIGO = "SEC-ECO-002";

const comunes = {
    riesgos: ["RIE-SOC-001","RIE-FIN-001","RIE-CON-001","RIE-TEC-001"],
    normasBase: ["NOR-ECO-001","NOR-ECO-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-ECO-001",
nombre:"Fortalecimiento de emprendimientos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a fortalecer emprendimientos mediante formación, asistencia técnica, capital semilla, acompañamiento y acceso a mercados.",
problemaCentral:"Baja capacidad de los emprendimientos locales para consolidarse, crecer y generar ingresos sostenibles.",
objetivoGeneral:"Fortalecer la capacidad de los emprendimientos locales para consolidarse, crecer y generar ingresos sostenibles.",
poblaciones:["POB-TER-003","POB-VUL-003","POB-CV-004"],
productos:["PRO-FOR-001","PRO-FOR-003","PRO-FOR-004","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-022","IND-PRO-023","IND-PRO-013","IND-PRO-031","IND-RES-002","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitado acceso a formación empresarial, asistencia técnica y capital de trabajo.","Baja capacidad comercial, financiera y administrativa de los emprendedores."],
causasIndirectas:["Débil ecosistema local de emprendimiento.","Limitado acceso a redes de apoyo, financiación y mercados."],
efectosDirectos:["Alta mortalidad de emprendimientos y baja generación de ingresos.","Menor creación de empleo e innovación local."],
efectosIndirectos:["Persistencia de desempleo, informalidad y dependencia económica.","Baja competitividad del tejido empresarial local."],
objetivosEspecificos:["Capacitar emprendedores en gestión empresarial y comercial.","Brindar asistencia técnica y acompañamiento a iniciativas priorizadas.","Apoyar capital semilla, insumos o herramientas cuando aplique."],
beneficios:"Los emprendedores mejorarán capacidades, sostenibilidad, ventas e ingresos.",
sostenibilidad:"Dependerá de seguimiento empresarial, acceso a mercados, acompañamiento continuo, redes de apoyo y corresponsabilidad de beneficiarios.",
palabrasClave:["emprendimiento","emprendedores","capital semilla","negocios","empresa"]
},

{
codigo:"TIP-ECO-002",
nombre:"Capital semilla",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para entregar recursos, insumos, equipos o apoyos iniciales a emprendimientos con potencial de sostenibilidad.",
problemaCentral:"Limitado acceso de emprendedores a recursos iniciales para poner en marcha o fortalecer sus unidades productivas.",
objetivoGeneral:"Mejorar el acceso de emprendedores a recursos iniciales para poner en marcha o fortalecer sus unidades productivas.",
poblaciones:["POB-TER-003","POB-VUL-003","POB-CV-004"],
productos:["PRO-DOT-004","PRO-FOR-003","PRO-FOR-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-013","IND-PRO-022","IND-PRO-023","IND-PRO-031","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Falta de recursos para inversión inicial, equipos o insumos.","Baja capacidad de emprendedores para acceder a crédito formal."],
causasIndirectas:["Informalidad, bajo historial financiero y baja capacidad de ahorro.","Débil estructuración de planes de negocio."],
efectosDirectos:["Dificultad para iniciar o escalar negocios.","Baja productividad y sostenibilidad de emprendimientos."],
efectosIndirectos:["Menor generación de ingresos y empleo local.","Aumento de informalidad económica."],
objetivosEspecificos:["Seleccionar emprendimientos con criterios técnicos y sociales.","Entregar capital semilla o apoyo productivo priorizado.","Acompañar la ejecución y sostenibilidad de los planes de negocio."],
beneficios:"Los emprendimientos tendrán recursos iniciales para mejorar operación, productividad y generación de ingresos.",
sostenibilidad:"Requiere acompañamiento, plan de inversión, seguimiento, corresponsabilidad y evaluación de resultados.",
palabrasClave:["capital semilla","apoyo productivo","insumos","equipos","emprendimiento"]
},

{
codigo:"TIP-ECO-003",
nombre:"Fortalecimiento MIPYME",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer micro, pequeñas y medianas empresas en gestión, productividad, formalización, innovación y comercialización.",
problemaCentral:"Baja productividad, formalización y competitividad de micro, pequeñas y medianas empresas locales.",
objetivoGeneral:"Fortalecer la productividad, formalización y competitividad de micro, pequeñas y medianas empresas locales.",
poblaciones:["POB-SEC-007","POB-TER-003"],
productos:["PRO-FOR-003","PRO-FOR-004","PRO-SER-002","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-022","IND-PRO-023","IND-PRO-031","IND-PRO-052","IND-RES-003","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitadas capacidades gerenciales, financieras y comerciales.","Baja adopción de tecnología, innovación y procesos de calidad."],
causasIndirectas:["Débil acceso a asistencia técnica y servicios empresariales.","Mercados competitivos y baja asociatividad empresarial."],
efectosDirectos:["Baja productividad y crecimiento empresarial.","Menor capacidad de generación de empleo formal."],
efectosIndirectos:["Debilitamiento del tejido empresarial local.","Menor competitividad territorial y recaudo económico."],
objetivosEspecificos:["Brindar asistencia técnica empresarial a MIPYMES.","Fortalecer formalización, productividad, calidad y comercialización.","Promover innovación, digitalización y acceso a mercados."],
beneficios:"Las MIPYMES mejorarán gestión, productividad, ventas, formalización y competitividad.",
sostenibilidad:"Dependerá de adopción empresarial, seguimiento, redes comerciales y continuidad de servicios de desarrollo empresarial.",
palabrasClave:["mipymes","microempresas","pequeñas empresas","fortalecimiento empresarial","productividad"]
},

{
codigo:"TIP-ECO-004",
nombre:"Formalización empresarial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para promover la formalización de unidades productivas, comercios y emprendimientos mediante asesoría, trámites y acompañamiento.",
problemaCentral:"Alta informalidad empresarial que limita acceso a mercados, financiación, protección social y crecimiento económico.",
objetivoGeneral:"Reducir la informalidad empresarial mediante asesoría, acompañamiento y acceso a rutas de formalización.",
poblaciones:["POB-SEC-007","POB-TER-003"],
productos:["PRO-FOR-004","PRO-SER-002","PRO-GES-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-023","IND-PRO-031","IND-PRO-042","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Bajo conocimiento de requisitos y beneficios de formalización.","Costos, trámites o barreras percibidas por unidades productivas."],
causasIndirectas:["Débil cultura empresarial y tributaria.","Baja articulación entre entidades de apoyo empresarial."],
efectosDirectos:["Dificultad para acceder a crédito, contratos y mercados formales.","Baja protección laboral y empresarial."],
efectosIndirectos:["Menor competitividad y recaudo local.","Persistencia de empleo informal y baja productividad."],
objetivosEspecificos:["Identificar unidades productivas informales.","Brindar asesoría y acompañamiento en rutas de formalización.","Articular servicios institucionales para sostenibilidad empresarial."],
beneficios:"Las unidades productivas accederán a beneficios de formalidad, mercados, financiación y crecimiento.",
sostenibilidad:"Dependerá de acompañamiento posterior, simplificación de trámites, incentivos y articulación con cámaras de comercio y entidades.",
palabrasClave:["formalización","empresa formal","comercio","cámara de comercio","negocios informales"]
},

{
codigo:"TIP-ECO-005",
nombre:"Empleabilidad y formación para el trabajo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para mejorar competencias laborales, orientación ocupacional, certificación y vinculación laboral de población desempleada o vulnerable.",
problemaCentral:"Limitadas competencias laborales y oportunidades de vinculación formal de la población desempleada o vulnerable.",
objetivoGeneral:"Fortalecer competencias laborales y oportunidades de vinculación formal de la población desempleada o vulnerable.",
poblaciones:["POB-TER-003","POB-VUL-003","POB-CV-004","POB-VUL-002"],
productos:["PRO-FOR-001","PRO-FOR-004","PRO-SER-002","PRO-SER-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-023","IND-PRO-031","IND-PRO-032","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Brecha entre competencias laborales de la población y demanda empresarial.","Bajo acceso a formación pertinente y orientación ocupacional."],
causasIndirectas:["Limitada articulación entre sector productivo, formación y empleo.","Barreras de acceso laboral para jóvenes, mujeres o población vulnerable."],
efectosDirectos:["Desempleo, informalidad y subempleo.","Menores ingresos y autonomía económica de los hogares."],
efectosIndirectos:["Aumento de pobreza y vulnerabilidad social.","Pérdida de potencial productivo del territorio."],
objetivosEspecificos:["Formar población en competencias laborales pertinentes.","Brindar orientación ocupacional y acompañamiento a la inserción laboral.","Articular empresas, entidades de formación y servicios de empleo."],
beneficios:"La población beneficiaria mejorará capacidades laborales y oportunidades de empleo formal.",
sostenibilidad:"Dependerá de pertinencia de formación, alianzas empresariales, seguimiento a empleabilidad y actualización de perfiles laborales.",
palabrasClave:["empleabilidad","formación para el trabajo","empleo","capacitación laboral","inserción laboral"]
},

{
codigo:"TIP-ECO-006",
nombre:"Bolsa de empleo territorial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar o fortalecer mecanismos territoriales de intermediación laboral, orientación y conexión entre oferta y demanda.",
problemaCentral:"Débil intermediación laboral entre población buscadora de empleo y empresas con demanda de talento humano.",
objetivoGeneral:"Fortalecer la intermediación laboral entre población buscadora de empleo y empresas con demanda de talento humano.",
poblaciones:["POB-TER-003","POB-CV-004","POB-VUL-003"],
productos:["PRO-SER-001","PRO-SER-002","PRO-TIC-003","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-030","IND-PRO-031","IND-PRO-052","IND-PRO-023","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-TEC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja disponibilidad de servicios locales de orientación e intermediación laboral.","Información dispersa sobre vacantes y perfiles de buscadores de empleo."],
causasIndirectas:["Débil articulación con empresas y agencias públicas de empleo.","Baja digitalización de procesos de registro, orientación y seguimiento."],
efectosDirectos:["Dificultad de acceso a oportunidades laborales.","Baja eficiencia en la conexión entre oferta y demanda laboral."],
efectosIndirectos:["Persistencia de desempleo e informalidad.","Menor productividad empresarial por vacantes no cubiertas."],
objetivosEspecificos:["Implementar servicios de orientación e intermediación laboral.","Registrar perfiles, vacantes y necesidades empresariales.","Articular alianzas con empresas y entidades de empleo."],
beneficios:"La población tendrá mayor acceso a vacantes y las empresas a talento humano pertinente.",
sostenibilidad:"Requiere actualización de vacantes, alianzas empresariales, plataforma o sistema de información y seguimiento de colocaciones.",
palabrasClave:["bolsa de empleo","intermediación laboral","vacantes","agencia de empleo","empleo local"]
},

{
codigo:"TIP-ECO-007",
nombre:"Ferias empresariales y comerciales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para organizar ferias, ruedas de negocios, vitrinas comerciales y espacios de promoción de productos y servicios locales.",
problemaCentral:"Limitados espacios de promoción, comercialización y conexión empresarial para unidades productivas locales.",
objetivoGeneral:"Ampliar espacios de promoción, comercialización y conexión empresarial para unidades productivas locales.",
poblaciones:["POB-SEC-007","POB-TER-003","POB-SEC-005"],
productos:["PRO-SER-002","PRO-SER-003","PRO-DOT-004","PRO-FOR-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-003","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-032","IND-PRO-013","IND-PRO-022","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja visibilidad de productos y servicios locales.","Escasez de espacios de encuentro entre productores, compradores y consumidores."],
causasIndirectas:["Débil promoción comercial y asociatividad empresarial.","Limitado acceso a estrategias de mercadeo y ventas."],
efectosDirectos:["Bajas ventas y baja expansión comercial de unidades productivas.","Pérdida de oportunidades de encadenamiento y nuevos clientes."],
efectosIndirectos:["Menor dinamismo económico local.","Debilitamiento de emprendimientos y microempresas."],
objetivosEspecificos:["Organizar ferias, vitrinas o ruedas de negocio.","Fortalecer capacidades de mercadeo y presentación comercial.","Articular compradores, empresas, productores y comunidad."],
beneficios:"Las unidades productivas tendrán mayor visibilidad, ventas y oportunidades de conexión comercial.",
sostenibilidad:"Dependerá de calendario comercial, alianzas, promoción, medición de ventas y continuidad de espacios de mercado.",
palabrasClave:["feria empresarial","rueda de negocios","vitrina comercial","ventas","mercadeo"]
},

{
codigo:"TIP-ECO-008",
nombre:"Digitalización empresarial y comercio electrónico",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para digitalizar MIPYMES, implementar comercio electrónico, marketing digital, pagos digitales y presencia en línea.",
problemaCentral:"Baja adopción de herramientas digitales y comercio electrónico en empresas y emprendimientos locales.",
objetivoGeneral:"Fortalecer la adopción de herramientas digitales y comercio electrónico en empresas y emprendimientos locales.",
poblaciones:["POB-SEC-007","POB-TER-003"],
productos:["PRO-TIC-003","PRO-FOR-002","PRO-FOR-003","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-052","IND-PRO-021","IND-PRO-022","IND-PRO-031","IND-RES-003","IND-IMP-001"],
riesgos:["RIE-TEC-001","RIE-SOC-001","RIE-FIN-001"],
normas:["NOR-TIC-001","NOR-TIC-002",...comunes.normasBase],
fuentes:comunes.fuentesBase,
causasDirectas:["Bajo uso de plataformas digitales para ventas, promoción y gestión.","Limitadas competencias digitales empresariales."],
causasIndirectas:["Baja inversión en tecnología empresarial.","Desconocimiento de herramientas de comercio electrónico y marketing digital."],
efectosDirectos:["Menor alcance de clientes y mercados.","Baja productividad comercial y administrativa."],
efectosIndirectos:["Pérdida de competitividad frente a empresas digitalizadas.","Menor resiliencia ante cambios de mercado."],
objetivosEspecificos:["Capacitar empresas en comercio electrónico y marketing digital.","Acompañar implementación de herramientas digitales empresariales.","Promover pagos digitales, catálogos y canales de venta en línea."],
beneficios:"Las empresas aumentarán visibilidad, ventas, productividad y adaptación al mercado digital.",
sostenibilidad:"Requiere apropiación empresarial, actualización de contenidos, soporte, medición de ventas y continuidad en canales digitales.",
palabrasClave:["digitalización empresarial","comercio electrónico","marketing digital","ventas online","mipymes digitales"]
},

{
codigo:"TIP-ECO-009",
nombre:"Innovación y competitividad empresarial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer innovación, productividad, calidad, desarrollo de productos y competitividad de empresas locales.",
problemaCentral:"Baja capacidad de innovación, productividad y diferenciación de empresas locales.",
objetivoGeneral:"Fortalecer la capacidad de innovación, productividad y diferenciación de empresas locales.",
poblaciones:["POB-SEC-007","POB-TER-003"],
productos:["PRO-FOR-003","PRO-FOR-004","PRO-SER-002","PRO-GES-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-022","IND-PRO-023","IND-PRO-031","IND-PRO-042","IND-RES-003","IND-IMP-001"],
riesgos:["RIE-TEC-001","RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja adopción de procesos de innovación y mejora productiva.","Limitada capacidad de diferenciación, calidad y desarrollo de nuevos productos."],
causasIndirectas:["Débil conexión con centros de conocimiento, tecnología y mercados.","Limitada inversión empresarial en innovación."],
efectosDirectos:["Baja productividad y competitividad empresarial.","Productos o servicios con bajo valor agregado."],
efectosIndirectos:["Menor crecimiento económico local.","Pérdida de oportunidades de empleo y mercado."],
objetivosEspecificos:["Brindar asistencia técnica en innovación y productividad.","Acompañar desarrollo o mejora de productos y procesos.","Fortalecer capacidades de calidad, diferenciación y gestión empresarial."],
beneficios:"Las empresas mejorarán productividad, innovación, valor agregado y competitividad.",
sostenibilidad:"Dependerá de adopción empresarial, alianzas con entidades de conocimiento, seguimiento y cultura de mejora continua.",
palabrasClave:["innovación empresarial","competitividad","productividad","valor agregado","calidad"]
},

{
codigo:"TIP-ECO-010",
nombre:"Economía popular",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer unidades de economía popular, vendedores, oficios, pequeños negocios y formas comunitarias de producción e intercambio.",
problemaCentral:"Baja capacidad productiva, comercial y organizativa de unidades de economía popular.",
objetivoGeneral:"Fortalecer la capacidad productiva, comercial y organizativa de unidades de economía popular.",
poblaciones:["POB-VUL-003","POB-TER-003","POB-CV-004"],
productos:["PRO-FOR-001","PRO-FOR-003","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-022","IND-PRO-013","IND-PRO-031","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Unidades productivas con baja tecnificación, formalización y acceso a mercados.","Limitado acceso a formación, insumos y acompañamiento."],
causasIndirectas:["Alta informalidad económica y baja inclusión financiera.","Vulnerabilidad social de hogares dependientes de pequeños negocios."],
efectosDirectos:["Ingresos bajos e inestables.","Baja capacidad de crecimiento y sostenibilidad de negocios populares."],
efectosIndirectos:["Persistencia de pobreza urbana o rural.","Menor inclusión económica y social."],
objetivosEspecificos:["Caracterizar y acompañar unidades de economía popular.","Fortalecer capacidades productivas, comerciales y financieras.","Apoyar insumos, herramientas o espacios de comercialización cuando aplique."],
beneficios:"Las unidades de economía popular mejorarán ingresos, organización y sostenibilidad.",
sostenibilidad:"Requiere acompañamiento cercano, redes de apoyo, acceso a mercados, educación financiera y corresponsabilidad de beneficiarios.",
palabrasClave:["economía popular","vendedores","oficios","pequeños negocios","informalidad"]
},

{
codigo:"TIP-ECO-011",
nombre:"Clúster y encadenamientos productivos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer clústeres, cadenas de valor y encadenamientos productivos locales o regionales.",
problemaCentral:"Débil articulación de actores económicos en cadenas de valor y encadenamientos productivos del territorio.",
objetivoGeneral:"Fortalecer la articulación de actores económicos en cadenas de valor y encadenamientos productivos del territorio.",
poblaciones:["POB-SEC-007","POB-SEC-005","POB-TER-003"],
productos:["PRO-GES-003","PRO-FOR-003","PRO-SER-002","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-022","IND-PRO-031","IND-PRO-023","IND-RES-003","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja coordinación entre productores, proveedores, transformadores y compradores.","Débil identificación de oportunidades de encadenamiento y valor agregado."],
causasIndirectas:["Información limitada sobre cadenas productivas y mercados.","Baja confianza, asociatividad y gobernanza sectorial."],
efectosDirectos:["Pérdida de eficiencia y oportunidades comerciales.","Bajo valor agregado local y alta intermediación."],
efectosIndirectos:["Menor competitividad territorial.","Limitada generación de empleo y crecimiento empresarial."],
objetivosEspecificos:["Caracterizar cadenas productivas y actores económicos.","Promover acuerdos, mesas y proyectos de encadenamiento.","Fortalecer capacidades de calidad, innovación y comercialización."],
beneficios:"Los actores económicos mejorarán articulación, competitividad, valor agregado y acceso a mercados.",
sostenibilidad:"Dependerá de gobernanza del clúster, confianza entre actores, mercado, seguimiento y agenda común de competitividad.",
palabrasClave:["clúster","cadena productiva","encadenamientos","valor agregado","competitividad territorial"]
},

{
codigo:"TIP-ECO-012",
nombre:"Desarrollo económico local",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto integral para fortalecer capacidades institucionales, empresariales y territoriales de desarrollo económico local.",
problemaCentral:"Débil capacidad territorial para impulsar desarrollo económico, empleo, emprendimiento e inversión local.",
objetivoGeneral:"Fortalecer la capacidad territorial para impulsar desarrollo económico, empleo, emprendimiento e inversión local.",
poblaciones:["POB-TER-003","POB-SEC-007","POB-SEC-005"],
productos:["PRO-GES-003","PRO-SER-002","PRO-FOR-003","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-PRO-022","IND-PRO-023","IND-RES-003","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja articulación entre sector público, empresas, academia y comunidad.","Insuficiente planificación y servicios de apoyo al desarrollo económico."],
causasIndirectas:["Limitada información económica territorial.","Débil capacidad institucional para gestionar empleo, emprendimiento e inversión."],
efectosDirectos:["Bajo dinamismo empresarial y generación de empleo.","Oportunidades económicas dispersas y poco sostenibles."],
efectosIndirectos:["Menor competitividad territorial y mayor vulnerabilidad económica.","Migración laboral y pérdida de talento local."],
objetivosEspecificos:["Diseñar e implementar agenda de desarrollo económico local.","Fortalecer servicios de apoyo a empresas, emprendedores y empleo.","Articular actores para promover inversión, productividad y mercados."],
beneficios:"El territorio contará con mejores capacidades para dinamizar economía, empleo, emprendimiento y competitividad.",
sostenibilidad:"Dependerá de gobernanza económica local, información actualizada, alianzas público-privadas y continuidad institucional.",
palabrasClave:["desarrollo económico","economía local","competitividad territorial","empleo","emprendimiento"]
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

window.PlantillasDesarrolloEconomico = PlantillasDesarrolloEconomico;
