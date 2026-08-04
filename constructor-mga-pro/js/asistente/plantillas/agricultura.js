// =====================================
// PLANTILLAS/AGRICULTURA.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Agricultura y Desarrollo Rural
// =====================================

const PlantillasAgricultura = (()=>{

const SECTOR = "Agricultura y Desarrollo Rural";
const SECTOR_CODIGO = "SEC-RUR-001";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-AMB-001","RIE-AMB-002"],
    normasBase: ["NOR-AGR-001","NOR-AGR-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-AGR-001",
nombre:"Fortalecimiento agrícola",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer capacidades productivas, asistencia técnica, insumos, tecnología y comercialización de productores agrícolas.",
problemaCentral:"Baja productividad y competitividad de pequeños productores agrícolas del territorio.",
objetivoGeneral:"Fortalecer la productividad y competitividad de pequeños productores agrícolas del territorio.",
poblaciones:["POB-TER-001","POB-SEC-005","POB-VUL-003"],
productos:["PRO-FOR-001","PRO-FOR-004","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-023","IND-PRO-013","IND-PRO-031","IND-RES-002","IND-IMP-001","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitado acceso a asistencia técnica, insumos y buenas prácticas agrícolas.","Baja incorporación de tecnología y procesos de comercialización."],
causasIndirectas:["Escasa capacidad organizativa de productores.","Limitado acceso a financiación, mercados y servicios de extensión agropecuaria."],
efectosDirectos:["Bajos rendimientos y menor calidad de productos agrícolas.","Menores ingresos de hogares rurales productores."],
efectosIndirectos:["Persistencia de pobreza rural y baja competitividad territorial.","Menor sostenibilidad de sistemas productivos agrícolas."],
objetivosEspecificos:["Brindar asistencia técnica y formación a productores agrícolas.","Entregar insumos o herramientas productivas cuando aplique.","Fortalecer procesos de comercialización y asociatividad."],
beneficios:"Los productores agrícolas mejorarán capacidades técnicas, productividad, calidad e ingresos.",
sostenibilidad:"Dependerá de acompañamiento técnico, adopción de buenas prácticas, asociatividad y acceso sostenido a mercados.",
palabrasClave:["agricultura","productores agrícolas","cultivos","asistencia técnica","fortalecimiento agrícola"]
},

{
codigo:"TIP-AGR-002",
nombre:"Agricultura familiar campesina",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a fortalecer sistemas de agricultura familiar, campesina y comunitaria para seguridad alimentaria e ingresos rurales.",
problemaCentral:"Baja capacidad productiva y de generación de ingresos de hogares vinculados a agricultura familiar campesina.",
objetivoGeneral:"Fortalecer la capacidad productiva y de generación de ingresos de hogares vinculados a agricultura familiar campesina.",
poblaciones:["POB-TER-001","POB-SEC-005","POB-VUL-003"],
productos:["PRO-FOR-001","PRO-DOT-004","PRO-SER-002","PRO-SER-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-013","IND-PRO-031","IND-PRO-032","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-AMB-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitada disponibilidad de insumos, herramientas y asistencia técnica.","Baja diversificación productiva y débil acceso a mercados locales."],
causasIndirectas:["Pequeña escala productiva y baja capacidad de inversión.","Débil organización comunitaria y familiar para producción y comercialización."],
efectosDirectos:["Bajos ingresos y vulnerabilidad alimentaria en hogares rurales.","Menor sostenibilidad de unidades productivas familiares."],
efectosIndirectos:["Persistencia de pobreza rural y dependencia de apoyos externos.","Pérdida de prácticas campesinas y arraigo territorial."],
objetivosEspecificos:["Fortalecer unidades de agricultura familiar campesina.","Promover diversificación productiva y seguridad alimentaria.","Brindar asistencia técnica y acompañamiento comercial."],
beneficios:"Los hogares rurales mejorarán producción, alimentación, ingresos y arraigo comunitario.",
sostenibilidad:"Se soportará en prácticas agroecológicas, asociatividad, mercados locales y acompañamiento técnico continuo.",
palabrasClave:["agricultura familiar","campesina","seguridad alimentaria","huertas","producción familiar"]
},

{
codigo:"TIP-AGR-003",
nombre:"Asistencia técnica agropecuaria",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para prestar asistencia técnica, extensión agropecuaria, acompañamiento productivo y transferencia de conocimiento.",
problemaCentral:"Insuficiente acceso de productores rurales a asistencia técnica y extensión agropecuaria pertinente y continua.",
objetivoGeneral:"Mejorar el acceso de productores rurales a asistencia técnica y extensión agropecuaria pertinente y continua.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-FOR-004","PRO-FOR-001","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-023","IND-PRO-020","IND-PRO-031","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja cobertura de servicios de extensión agropecuaria.","Limitada transferencia de tecnología y buenas prácticas productivas."],
causasIndirectas:["Insuficiente disponibilidad de profesionales técnicos.","Débil planeación y seguimiento a necesidades productivas."],
efectosDirectos:["Persistencia de prácticas productivas poco eficientes.","Bajos niveles de productividad y calidad agropecuaria."],
efectosIndirectos:["Menor competitividad rural y pérdida de oportunidades comerciales.","Mayor vulnerabilidad frente a riesgos climáticos y sanitarios."],
objetivosEspecificos:["Prestar asistencia técnica a productores priorizados.","Transferir buenas prácticas productivas, sanitarias y ambientales.","Realizar seguimiento técnico a unidades productivas."],
beneficios:"Los productores adoptarán mejores prácticas, reduciendo pérdidas y aumentando productividad y calidad.",
sostenibilidad:"Dependerá de continuidad del servicio de extensión, seguimiento, fortalecimiento institucional y apropiación por productores.",
palabrasClave:["asistencia técnica","extensión agropecuaria","extensionismo rural","productores","transferencia tecnológica"]
},

{
codigo:"TIP-AGR-004",
nombre:"Distrito de riego",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construir, rehabilitar u optimizar infraestructura de riego y drenaje para producción agropecuaria.",
problemaCentral:"Limitado acceso de productores agropecuarios a infraestructura de riego y drenaje que garantice disponibilidad hídrica productiva.",
objetivoGeneral:"Mejorar el acceso de productores agropecuarios a infraestructura de riego y drenaje para fortalecer la producción.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-002","PRO-FOR-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-011","IND-PRO-020","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001","RIE-AMB-002","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente infraestructura de riego, conducción, almacenamiento o drenaje.","Dependencia de lluvias para producción agropecuaria."],
causasIndirectas:["Variabilidad climática y baja disponibilidad hídrica en periodos secos.","Limitada inversión en adecuación de tierras."],
efectosDirectos:["Baja productividad y pérdidas por estrés hídrico.","Restricción de ciclos productivos y diversificación."],
efectosIndirectos:["Menores ingresos rurales y baja competitividad agropecuaria.","Mayor vulnerabilidad frente al cambio climático."],
objetivosEspecificos:["Construir u optimizar infraestructura de riego y drenaje.","Capacitar usuarios en operación eficiente y uso racional del agua.","Fortalecer organización de usuarios y sostenibilidad del sistema."],
beneficios:"Productores contarán con disponibilidad hídrica para mejorar productividad, calidad y continuidad de cultivos.",
sostenibilidad:"Requiere organización de usuarios, tarifas o aportes de operación, mantenimiento, gestión ambiental y uso eficiente del agua.",
palabrasClave:["distrito de riego","riego","drenaje","adecuación de tierras","agua productiva"]
},

{
codigo:"TIP-AGR-005",
nombre:"Banco de maquinaria agrícola",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para adquirir, operar o fortalecer bancos de maquinaria agrícola y equipos para preparación, siembra, cosecha o transformación.",
problemaCentral:"Limitado acceso de pequeños productores a maquinaria agrícola y equipos productivos adecuados.",
objetivoGeneral:"Mejorar el acceso de pequeños productores a maquinaria agrícola y equipos productivos adecuados.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-DOT-002","PRO-SER-001","PRO-FOR-001"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-011","IND-PRO-030","IND-PRO-020","IND-RES-002","IND-GES-001"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-TEC-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Altos costos de alquiler o adquisición de maquinaria.","Baja disponibilidad local de equipos para labores productivas."],
causasIndirectas:["Pequeña escala productiva que dificulta inversión individual.","Débil organización para uso compartido de maquinaria."],
efectosDirectos:["Baja eficiencia en preparación, siembra, cosecha o transformación.","Aumento de costos de producción y pérdidas."],
efectosIndirectos:["Menor competitividad y rentabilidad agropecuaria.","Limitación para tecnificación de pequeños productores."],
objetivosEspecificos:["Adquirir maquinaria y equipos agrícolas priorizados.","Establecer esquema de operación, mantenimiento y acceso para productores.","Capacitar usuarios en uso seguro y eficiente de equipos."],
beneficios:"Los productores reducirán costos, mejorarán eficiencia y aumentarán capacidad productiva.",
sostenibilidad:"Dependerá de reglamento de uso, operador responsable, mantenimiento preventivo, recaudo por servicio y control de inventario.",
palabrasClave:["maquinaria agrícola","banco de maquinaria","tractores","equipos agrícolas","tecnificación"]
},

{
codigo:"TIP-AGR-006",
nombre:"Centro de acopio agropecuario",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construir, adecuar, dotar u operar centros de acopio para productos agrícolas, pecuarios o agroindustriales.",
problemaCentral:"Deficientes condiciones de acopio, almacenamiento y manejo poscosecha de productos agropecuarios.",
objetivoGeneral:"Mejorar las condiciones de acopio, almacenamiento y manejo poscosecha de productos agropecuarios.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-DOT-002","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-011","IND-PRO-030","IND-RES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente infraestructura para recepción, selección, almacenamiento y despacho.","Baja capacidad de manejo poscosecha y conservación de productos."],
causasIndirectas:["Producción dispersa y débil integración comercial.","Limitada inversión en logística rural y agroindustrial."],
efectosDirectos:["Pérdidas poscosecha y reducción de calidad de productos.","Menor capacidad de negociación de productores."],
efectosIndirectos:["Bajos ingresos rurales y menor competitividad de cadenas productivas.","Mayor intermediación y pérdida de valor agregado local."],
objetivosEspecificos:["Construir o adecuar centro de acopio agropecuario.","Dotar equipos de almacenamiento, clasificación y manejo poscosecha.","Fortalecer gestión comercial y asociativa de productores."],
beneficios:"Productores mejorarán calidad, conservación, comercialización y poder de negociación de sus productos.",
sostenibilidad:"Requiere operador, mantenimiento, logística, modelo comercial, control sanitario y acuerdos de productores.",
palabrasClave:["centro de acopio","acopio agropecuario","poscosecha","almacenamiento","comercialización"]
},

{
codigo:"TIP-AGR-007",
nombre:"Comercialización agropecuaria",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer canales de comercialización, mercados campesinos, ruedas de negocio y articulación con compradores.",
problemaCentral:"Limitado acceso de productores agropecuarios a canales de comercialización estables, justos y rentables.",
objetivoGeneral:"Mejorar el acceso de productores agropecuarios a canales de comercialización estables, justos y rentables.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-SER-002","PRO-FOR-003","PRO-FOR-004","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-022","IND-PRO-023","IND-PRO-013","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Alta intermediación y baja articulación con mercados formales.","Limitadas capacidades comerciales, logísticas y asociativas."],
causasIndirectas:["Débil información de mercados y demanda.","Baja estandarización de calidad, empaque y presentación de productos."],
efectosDirectos:["Bajos precios recibidos por productores.","Pérdidas por falta de salida comercial oportuna."],
efectosIndirectos:["Menores ingresos rurales y desmotivación productiva.","Pérdida de competitividad de cadenas locales."],
objetivosEspecificos:["Fortalecer capacidades comerciales y asociativas de productores.","Promover mercados campesinos, ruedas de negocio o acuerdos comerciales.","Mejorar presentación, calidad y logística de productos."],
beneficios:"Los productores accederán a mejores mercados, precios y oportunidades de venta.",
sostenibilidad:"Dependerá de organización de productores, acuerdos comerciales, calidad constante, logística y seguimiento a mercados.",
palabrasClave:["comercialización","mercados campesinos","alianzas comerciales","ventas agropecuarias","cadenas productivas"]
},

{
codigo:"TIP-AGR-008",
nombre:"Agroindustria y transformación de productos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer procesos de transformación, valor agregado, equipos, buenas prácticas y comercialización agroindustrial.",
problemaCentral:"Baja capacidad de transformación y generación de valor agregado en productos agropecuarios locales.",
objetivoGeneral:"Fortalecer la capacidad de transformación y generación de valor agregado en productos agropecuarios locales.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-DOT-002","PRO-DOT-004","PRO-FOR-001","PRO-FOR-004","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-011","IND-PRO-013","IND-PRO-020","IND-PRO-023","IND-PRO-030","IND-RES-002"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente dotación y conocimiento para transformación agroindustrial.","Baja aplicación de buenas prácticas de manufactura y calidad."],
causasIndirectas:["Limitado acceso a tecnología, asistencia técnica y mercados de valor agregado.","Débil asociatividad para procesos agroindustriales."],
efectosDirectos:["Venta de productos primarios con bajo margen.","Pérdidas por baja conservación y transformación."],
efectosIndirectos:["Menor competitividad territorial y generación de empleo rural.","Pérdida de oportunidades de innovación y encadenamiento productivo."],
objetivosEspecificos:["Adquirir equipos e insumos para transformación agroindustrial.","Capacitar productores en calidad, BPM y valor agregado.","Fortalecer comercialización de productos transformados."],
beneficios:"Los productores aumentarán valor agregado, ingresos y oportunidades de empleo rural.",
sostenibilidad:"Requiere mantenimiento de equipos, cumplimiento sanitario, mercado estable, asociatividad y seguimiento comercial.",
palabrasClave:["agroindustria","transformación","valor agregado","BPM","productos transformados"]
},

{
codigo:"TIP-AGR-009",
nombre:"Seguridad alimentaria rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer producción de alimentos, autoconsumo, huertas, especies menores y hábitos alimentarios en comunidades rurales.",
problemaCentral:"Inseguridad alimentaria en hogares rurales vulnerables por baja producción para autoconsumo y limitados ingresos.",
objetivoGeneral:"Mejorar la seguridad alimentaria de hogares rurales vulnerables mediante producción para autoconsumo y fortalecimiento de capacidades.",
poblaciones:["POB-TER-001","POB-VUL-003","POB-CV-001","POB-CV-006"],
productos:["PRO-SER-003","PRO-DOT-004","PRO-FOR-001","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-032","IND-PRO-013","IND-PRO-020","IND-PRO-031","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja producción de alimentos para autoconsumo.","Limitado acceso a insumos, semillas, especies menores y formación nutricional."],
causasIndirectas:["Pobreza rural y dependencia de compra de alimentos.","Débil cultura de huertas familiares y producción diversificada."],
efectosDirectos:["Dietas poco diversificadas y vulnerabilidad alimentaria.","Mayor gasto familiar en alimentos."],
efectosIndirectos:["Riesgo de malnutrición y afectación de salud familiar.","Persistencia de pobreza rural."],
objetivosEspecificos:["Implementar huertas familiares o comunitarias y producción de autoconsumo.","Dotar insumos, semillas o especies menores cuando aplique.","Capacitar hogares en producción sostenible y hábitos alimentarios."],
beneficios:"Los hogares mejorarán disponibilidad de alimentos, diversidad alimentaria y capacidades productivas.",
sostenibilidad:"Dependerá del mantenimiento de huertas, semillas, prácticas agroecológicas, acompañamiento y apropiación familiar.",
palabrasClave:["seguridad alimentaria","huertas","autoconsumo","alimentos","rural"]
},

{
codigo:"TIP-AGR-010",
nombre:"Ganadería sostenible",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer ganadería bovina sostenible, buenas prácticas pecuarias, sistemas silvopastoriles y productividad.",
problemaCentral:"Baja productividad y sostenibilidad ambiental de sistemas ganaderos bovinos.",
objetivoGeneral:"Fortalecer la productividad y sostenibilidad ambiental de sistemas ganaderos bovinos.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-FOR-001","PRO-FOR-004","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-023","IND-PRO-013","IND-PRO-031","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-AMB-001","RIE-AMB-002","RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja adopción de buenas prácticas ganaderas y sistemas sostenibles.","Degradación de pasturas, suelos y recursos hídricos."],
causasIndirectas:["Limitada asistencia técnica pecuaria y ambiental.","Baja inversión en mejoramiento productivo y manejo sostenible."],
efectosDirectos:["Baja productividad de carne o leche.","Impactos ambientales por uso inadecuado del suelo y agua."],
efectosIndirectos:["Menores ingresos ganaderos y deterioro ambiental.","Mayor vulnerabilidad frente a variabilidad climática."],
objetivosEspecificos:["Capacitar productores en buenas prácticas ganaderas.","Implementar acciones de ganadería sostenible o silvopastoril.","Fortalecer productividad, sanidad y manejo ambiental del sistema."],
beneficios:"Los productores ganaderos mejorarán productividad, ingresos y sostenibilidad ambiental.",
sostenibilidad:"Requiere asistencia técnica, seguimiento sanitario, manejo de pasturas, protección hídrica y adopción de prácticas sostenibles.",
palabrasClave:["ganadería","bovina","silvopastoril","leche","carne","ganadería sostenible"]
},

{
codigo:"TIP-AGR-011",
nombre:"Especies menores",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer producción de especies menores como aves, porcinos, ovinos, caprinos, conejos o cuyes.",
problemaCentral:"Baja capacidad productiva de hogares rurales para generar alimentos e ingresos mediante especies menores.",
objetivoGeneral:"Fortalecer la capacidad productiva de hogares rurales para generar alimentos e ingresos mediante especies menores.",
poblaciones:["POB-TER-001","POB-VUL-003","POB-SEC-005"],
productos:["PRO-DOT-004","PRO-FOR-001","PRO-FOR-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-013","IND-PRO-020","IND-PRO-023","IND-PRO-031","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitado acceso a pie de cría, insumos, infraestructura y asistencia técnica.","Baja aplicación de prácticas sanitarias y productivas."],
causasIndirectas:["Pequeña escala productiva y baja capacidad de inversión familiar.","Débil articulación a mercados locales."],
efectosDirectos:["Baja producción de proteína animal e ingresos complementarios.","Riesgo sanitario y pérdidas productivas."],
efectosIndirectos:["Persistencia de inseguridad alimentaria y pobreza rural.","Menor diversificación productiva familiar."],
objetivosEspecificos:["Entregar insumos, pie de cría o elementos productivos cuando aplique.","Capacitar hogares en manejo, sanidad y comercialización.","Fortalecer producción de autoconsumo e ingresos complementarios."],
beneficios:"Los hogares rurales diversificarán producción, mejorarán alimentación e ingresos.",
sostenibilidad:"Dependerá del manejo sanitario, reproducción, alimentación, asistencia técnica y apropiación familiar.",
palabrasClave:["especies menores","avicultura","porcicultura","ovinos","caprinos","conejos","cuyes"]
},

{
codigo:"TIP-AGR-012",
nombre:"Piscicultura",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer producción piscícola mediante estanques, alevinos, alimento, asistencia técnica y comercialización.",
problemaCentral:"Baja capacidad productiva y comercial de pequeños productores piscícolas.",
objetivoGeneral:"Fortalecer la capacidad productiva y comercial de pequeños productores piscícolas.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-DOT-004","PRO-FOR-001","PRO-FOR-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-013","IND-PRO-020","IND-PRO-023","IND-PRO-031","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-AMB-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitado acceso a alevinos, alimento, infraestructura y asistencia técnica.","Bajo manejo de calidad de agua, sanidad y alimentación."],
causasIndirectas:["Baja tecnificación de la producción piscícola.","Limitado acceso a mercados y cadena de frío."],
efectosDirectos:["Bajos rendimientos y mortalidad de peces.","Menores ingresos de productores piscícolas."],
efectosIndirectos:["Pérdida de oportunidades de diversificación productiva.","Menor disponibilidad local de proteína animal."],
objetivosEspecificos:["Fortalecer infraestructura, insumos y manejo piscícola.","Capacitar productores en sanidad, alimentación y calidad de agua.","Mejorar comercialización de productos piscícolas."],
beneficios:"Los productores aumentarán producción piscícola, ingresos y disponibilidad de proteína.",
sostenibilidad:"Requiere manejo técnico del agua, alimentación, sanidad, asistencia técnica y mercado estable.",
palabrasClave:["piscicultura","peces","alevinos","estanques","tilapia"]
},

{
codigo:"TIP-AGR-013",
nombre:"Apicultura",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer producción apícola, colmenas, equipos, formación, sanidad y comercialización de miel y derivados.",
problemaCentral:"Baja capacidad productiva y comercial de pequeños productores apícolas.",
objetivoGeneral:"Fortalecer la capacidad productiva y comercial de pequeños productores apícolas.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-DOT-004","PRO-FOR-001","PRO-FOR-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-013","IND-PRO-020","IND-PRO-023","IND-PRO-031","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-AMB-001","RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Limitado acceso a colmenas, equipos e insumos apícolas.","Baja formación en manejo sanitario y productivo de apiarios."],
causasIndirectas:["Débil organización productiva y comercialización de miel.","Afectación ambiental por pérdida de flora y uso inadecuado de agroquímicos."],
efectosDirectos:["Baja producción y calidad de miel y derivados.","Pérdida de oportunidades de ingresos y polinización."],
efectosIndirectos:["Menor sostenibilidad de sistemas agroecológicos.","Reducción de biodiversidad y servicios de polinización."],
objetivosEspecificos:["Dotar colmenas, equipos e insumos apícolas.","Capacitar productores en manejo, sanidad y transformación.","Fortalecer comercialización de miel y derivados."],
beneficios:"Los productores diversificarán ingresos y contribuirán a la polinización y conservación ambiental.",
sostenibilidad:"Dependerá de manejo técnico, sanidad apícola, mercado, asociatividad y protección de flora melífera.",
palabrasClave:["apicultura","miel","abejas","colmenas","polinización"]
},

{
codigo:"TIP-AGR-014",
nombre:"Asociatividad rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer asociaciones, organizaciones campesinas, cooperativas y capacidades de gestión empresarial rural.",
problemaCentral:"Débil capacidad organizativa, administrativa y comercial de asociaciones rurales y productores agropecuarios.",
objetivoGeneral:"Fortalecer la capacidad organizativa, administrativa y comercial de asociaciones rurales y productores agropecuarios.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-FOR-003","PRO-FOR-004","PRO-SER-002","PRO-GES-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-022","IND-PRO-023","IND-PRO-031","IND-PRO-042","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja formación en administración, liderazgo y gestión asociativa.","Débil gobernanza interna y planificación comercial."],
causasIndirectas:["Historial de baja confianza y trabajo individual de productores.","Limitado acompañamiento institucional a organizaciones rurales."],
efectosDirectos:["Baja capacidad de negociación y acceso a programas.","Dificultad para sostener proyectos productivos colectivos."],
efectosIndirectos:["Menor competitividad de cadenas productivas.","Persistencia de intermediación y bajos ingresos rurales."],
objetivosEspecificos:["Capacitar organizaciones rurales en gestión administrativa y comercial.","Fortalecer gobernanza, liderazgo y planificación asociativa.","Acompañar procesos de articulación institucional y comercial."],
beneficios:"Las organizaciones rurales mejorarán gestión, negociación y sostenibilidad de iniciativas productivas.",
sostenibilidad:"Dependerá de liderazgo, reglas claras, participación, servicios a asociados y seguimiento institucional.",
palabrasClave:["asociatividad","asociaciones rurales","cooperativa","organización campesina","gestión rural"]
},

{
codigo:"TIP-AGR-015",
nombre:"Alianzas productivas",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para estructurar y fortalecer alianzas entre productores, compradores, entidades y aliados comerciales o técnicos.",
problemaCentral:"Débil articulación entre productores rurales y aliados comerciales, técnicos o institucionales para desarrollar negocios sostenibles.",
objetivoGeneral:"Fortalecer la articulación entre productores rurales y aliados comerciales, técnicos o institucionales para desarrollar negocios sostenibles.",
poblaciones:["POB-TER-001","POB-SEC-005"],
productos:["PRO-SER-002","PRO-FOR-004","PRO-GES-003","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-023","IND-PRO-042","IND-PRO-013","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja articulación con compradores y aliados de cadena.","Insuficiente estructuración técnica, financiera y comercial de negocios rurales."],
causasIndirectas:["Débil información de mercado y baja capacidad de negociación.","Limitada asociatividad y cumplimiento de estándares de calidad."],
efectosDirectos:["Baja sostenibilidad comercial de proyectos productivos.","Pérdida de oportunidades de venta y encadenamiento."],
efectosIndirectos:["Menores ingresos rurales y baja competitividad territorial.","Mayor dependencia de intermediarios."],
objetivosEspecificos:["Estructurar alianzas productivas con enfoque comercial.","Fortalecer capacidades técnicas, asociativas y comerciales.","Apoyar inversiones productivas requeridas para cumplir acuerdos."],
beneficios:"Productores accederán a mercados más estables y alianzas que mejoran ingresos y sostenibilidad.",
sostenibilidad:"Requiere acuerdos comerciales, cumplimiento de calidad, seguimiento técnico, gobernanza asociativa y mercado permanente.",
palabrasClave:["alianzas productivas","cadenas productivas","negocios rurales","compradores","comercialización"]
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

window.PlantillasAgricultura = PlantillasAgricultura;
