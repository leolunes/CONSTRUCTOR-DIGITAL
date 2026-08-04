// =====================================
// PLANTILLAS/TURISMO.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Turismo
// =====================================

const PlantillasTurismo = (()=>{

const SECTOR = "Turismo";
const SECTOR_CODIGO = "SEC-ECO-001";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-AMB-001"],
    normasBase: ["NOR-TUR-001","NOR-TUR-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-TUR-001",
nombre:"Infraestructura turística",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construir, mejorar o dotar infraestructura turística para fortalecer la competitividad y experiencia del visitante.",
problemaCentral:"Insuficiente infraestructura turística adecuada para atender visitantes y fortalecer la competitividad del destino.",
objetivoGeneral:"Mejorar la infraestructura turística para fortalecer la competitividad del destino y la experiencia del visitante.",
poblaciones:["POB-TER-003","POB-SEC-006"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-030","IND-RES-002","IND-GES-001","IND-GES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Escasez o deterioro de infraestructura para atención turística.","Limitada dotación y servicios complementarios para visitantes."],
causasIndirectas:["Baja inversión en equipamientos turísticos.","Débil planificación y gestión del destino turístico."],
efectosDirectos:["Baja calidad de la experiencia turística.","Menor capacidad de atracción y permanencia de visitantes."],
efectosIndirectos:["Pérdida de oportunidades económicas locales.","Menor competitividad del destino frente a otros territorios."],
objetivosEspecificos:["Construir o mejorar infraestructura turística priorizada.","Dotar espacios y servicios de apoyo al visitante.","Fortalecer la gestión y operación del atractivo o destino."],
beneficios:"El destino contará con mejores condiciones para recibir visitantes, aumentar permanencia y dinamizar economía local.",
sostenibilidad:"Dependerá de operación, mantenimiento, modelo de administración, promoción del destino y participación de actores turísticos.",
palabrasClave:["infraestructura turística","turismo","atractivo turístico","destino","visitantes"]
},

{
codigo:"TIP-TUR-002",
nombre:"Senderos ecoturísticos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construir, adecuar, señalizar o mejorar senderos ecoturísticos y rutas de naturaleza.",
problemaCentral:"Deficientes condiciones de acceso, seguridad e interpretación en senderos y rutas ecoturísticas.",
objetivoGeneral:"Mejorar las condiciones de acceso, seguridad e interpretación en senderos y rutas ecoturísticas.",
poblaciones:["POB-TER-001","POB-TER-003","POB-SEC-006"],
productos:["PRO-INF-005","PRO-INF-002","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-005","IND-PRO-002","IND-PRO-013","IND-PRO-031","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001","RIE-AMB-001","RIE-AMB-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Senderos con baja adecuación, señalización o seguridad.","Insuficiente interpretación ambiental y turística."],
causasIndirectas:["Débil manejo ambiental de atractivos naturales.","Baja organización comunitaria para operación ecoturística."],
efectosDirectos:["Riesgos para visitantes y deterioro ambiental del atractivo.","Baja calidad de la experiencia ecoturística."],
efectosIndirectos:["Menor llegada de visitantes y baja generación de ingresos locales.","Pérdida de valor ambiental y turístico del territorio."],
objetivosEspecificos:["Adecuar senderos y rutas ecoturísticas.","Instalar señalización, mobiliario e interpretación ambiental.","Fortalecer operación comunitaria y manejo sostenible del atractivo."],
beneficios:"Se mejorará la experiencia turística, la seguridad del visitante y la conservación del entorno natural.",
sostenibilidad:"Requiere mantenimiento de senderos, control de capacidad de carga, guías locales y manejo ambiental permanente.",
palabrasClave:["sendero ecoturístico","ecoturismo","naturaleza","ruta turística","senderismo"]
},

{
codigo:"TIP-TUR-003",
nombre:"Señalización turística",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar señalización turística, interpretativa, orientadora e informativa en atractivos y corredores turísticos.",
problemaCentral:"Insuficiente señalización turística que dificulta la orientación, interpretación y acceso de visitantes a los atractivos.",
objetivoGeneral:"Mejorar la señalización turística para facilitar orientación, interpretación y acceso de visitantes a los atractivos.",
poblaciones:["POB-TER-003","POB-SEC-006"],
productos:["PRO-DOT-004","PRO-INF-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-001"],
indicadores:["IND-PRO-013","IND-PRO-002","IND-PRO-030","IND-RES-003","IND-GES-001"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Atractivos turísticos sin señalización clara, suficiente o estandarizada.","Baja información interpretativa y orientadora para visitantes."],
causasIndirectas:["Débil planeación turística y de movilidad del destino.","Insuficiente mantenimiento de señales existentes."],
efectosDirectos:["Dificultad de acceso y orientación de visitantes.","Baja percepción de calidad y organización del destino."],
efectosIndirectos:["Menor permanencia y gasto turístico.","Pérdida de oportunidades de promoción del patrimonio natural y cultural."],
objetivosEspecificos:["Diseñar e instalar señalización turística priorizada.","Incluir información interpretativa, de orientación y seguridad.","Garantizar mantenimiento y actualización de señales."],
beneficios:"Los visitantes tendrán mejor orientación, información y seguridad durante su recorrido por el destino.",
sostenibilidad:"Dependerá de mantenimiento, reposición, actualización de información y articulación con actores turísticos.",
palabrasClave:["señalización turística","señales turísticas","orientación","interpretación turística","atractivos"]
},

{
codigo:"TIP-TUR-004",
nombre:"Promoción turística del destino",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer la promoción, mercadeo, marca territorial, contenidos digitales y posicionamiento turístico.",
problemaCentral:"Bajo posicionamiento y promoción del destino turístico en mercados regionales, nacionales o especializados.",
objetivoGeneral:"Fortalecer el posicionamiento y promoción del destino turístico en mercados regionales, nacionales o especializados.",
poblaciones:["POB-TER-003","POB-SEC-006"],
productos:["PRO-SER-002","PRO-TIC-003","PRO-FOR-003","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-052","IND-PRO-022","IND-PRO-013","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja difusión de atractivos, experiencias y oferta turística.","Insuficiente estrategia de marca, contenidos y canales de promoción."],
causasIndirectas:["Débil articulación de prestadores y actores del destino.","Limitado conocimiento de mercados y segmentos turísticos."],
efectosDirectos:["Bajo flujo de visitantes y baja permanencia turística.","Menor consumo de servicios turísticos locales."],
efectosIndirectos:["Menor generación de ingresos y empleo en el sector turístico.","Pérdida de competitividad del destino."],
objetivosEspecificos:["Diseñar estrategia de promoción y marca turística.","Producir contenidos y campañas de difusión turística.","Articular prestadores y actores para posicionamiento del destino."],
beneficios:"El destino aumentará visibilidad, llegada de visitantes y oportunidades económicas para actores turísticos.",
sostenibilidad:"Requiere actualización de contenidos, continuidad promocional, medición de resultados y coordinación público-privada.",
palabrasClave:["promoción turística","marca destino","mercadeo turístico","turismo digital","posicionamiento"]
},

{
codigo:"TIP-TUR-005",
nombre:"Fortalecimiento de prestadores turísticos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer capacidades de prestadores turísticos en calidad, formalización, servicio, comercialización y sostenibilidad.",
problemaCentral:"Baja capacidad empresarial, técnica y comercial de prestadores turísticos del territorio.",
objetivoGeneral:"Fortalecer la capacidad empresarial, técnica y comercial de prestadores turísticos del territorio.",
poblaciones:["POB-SEC-006","POB-TER-003"],
productos:["PRO-FOR-003","PRO-FOR-004","PRO-SER-002","PRO-GES-003"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-022","IND-PRO-023","IND-PRO-031","IND-PRO-042","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja formación en calidad, atención al cliente y gestión empresarial.","Limitada formalización y cumplimiento de estándares turísticos."],
causasIndirectas:["Débil asociatividad y articulación de la cadena turística.","Limitado acceso a asistencia técnica y mercados."],
efectosDirectos:["Servicios turísticos con baja calidad y competitividad.","Menor satisfacción del visitante y baja fidelización."],
efectosIndirectos:["Reducción de ingresos para prestadores locales.","Debilitamiento del destino turístico."],
objetivosEspecificos:["Capacitar prestadores en calidad, servicio y gestión empresarial.","Promover formalización y cumplimiento de estándares turísticos.","Fortalecer articulación comercial y asociativa del sector."],
beneficios:"Los prestadores turísticos mejorarán calidad, formalización, competitividad e ingresos.",
sostenibilidad:"Dependerá de asistencia técnica continua, cumplimiento de estándares, asociatividad y seguimiento empresarial.",
palabrasClave:["prestadores turísticos","calidad turística","formalización","hoteles","guías","operadores"]
},

{
codigo:"TIP-TUR-006",
nombre:"Turismo rural comunitario",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para desarrollar experiencias de turismo rural comunitario, alojamiento, gastronomía, guianza y rutas locales.",
problemaCentral:"Baja capacidad de comunidades rurales para desarrollar experiencias turísticas sostenibles y generar ingresos complementarios.",
objetivoGeneral:"Fortalecer la capacidad de comunidades rurales para desarrollar experiencias turísticas sostenibles y generar ingresos complementarios.",
poblaciones:["POB-TER-001","POB-SEC-006","POB-SEC-005"],
productos:["PRO-SER-002","PRO-FOR-001","PRO-FOR-003","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-020","IND-PRO-022","IND-PRO-013","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-AMB-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Comunidades rurales con baja preparación para operación turística.","Oferta turística rural poco estructurada o comercializada."],
causasIndirectas:["Débil organización comunitaria y capacidades empresariales.","Limitada infraestructura, dotación y promoción de experiencias rurales."],
efectosDirectos:["Baja generación de ingresos por turismo rural.","Riesgo de uso inadecuado de recursos naturales o culturales."],
efectosIndirectos:["Menor diversificación económica rural.","Pérdida de oportunidades de conservación y apropiación territorial."],
objetivosEspecificos:["Diseñar experiencias de turismo rural comunitario.","Capacitar comunidades en guianza, servicio, sostenibilidad y comercialización.","Dotar elementos básicos para operación turística comunitaria."],
beneficios:"Comunidades rurales diversificarán ingresos, fortalecerán identidad y promoverán conservación del territorio.",
sostenibilidad:"Requiere organización comunitaria, manejo ambiental, calidad del servicio, acuerdos comerciales y promoción continua.",
palabrasClave:["turismo rural","turismo comunitario","agroturismo","experiencias rurales","guianza"]
},

{
codigo:"TIP-TUR-007",
nombre:"Ruta turística cultural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para diseñar, señalizar, dotar y promocionar rutas turísticas culturales, históricas, religiosas o patrimoniales.",
problemaCentral:"Bajo aprovechamiento turístico del patrimonio cultural, histórico o religioso del territorio.",
objetivoGeneral:"Fortalecer el aprovechamiento turístico sostenible del patrimonio cultural, histórico o religioso del territorio.",
poblaciones:["POB-TER-003","POB-SEC-006"],
productos:["PRO-SER-002","PRO-INF-005","PRO-DOT-004","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-005","IND-PRO-013","IND-PRO-020","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Patrimonio cultural con baja interpretación, señalización o articulación turística.","Oferta de recorridos culturales poco estructurada."],
causasIndirectas:["Débil articulación entre cultura, turismo y comunidad.","Baja promoción del patrimonio como experiencia turística."],
efectosDirectos:["Menor visita a sitios patrimoniales y culturales.","Pérdida de oportunidades de ingresos para actores locales."],
efectosIndirectos:["Debilitamiento de identidad, memoria y economía cultural.","Menor competitividad del destino cultural."],
objetivosEspecificos:["Diseñar ruta turística cultural con narrativa e interpretación.","Instalar señalización y elementos de apoyo al recorrido.","Capacitar guías y actores locales para operación de la ruta."],
beneficios:"El territorio contará con una experiencia cultural estructurada que dinamiza turismo, memoria e ingresos locales.",
sostenibilidad:"Dependerá de guías capacitados, mantenimiento de señalización, promoción, protección patrimonial y articulación institucional.",
palabrasClave:["ruta turística","turismo cultural","patrimonio","historia","turismo religioso"]
},

{
codigo:"TIP-TUR-008",
nombre:"Punto de información turística",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construir, adecuar, dotar u operar puntos de información turística presencial o digital.",
problemaCentral:"Insuficiente disponibilidad de información turística confiable, oportuna y accesible para visitantes.",
objetivoGeneral:"Mejorar la disponibilidad de información turística confiable, oportuna y accesible para visitantes.",
poblaciones:["POB-TER-003","POB-SEC-006"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-TIC-003","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-003","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-052","IND-PRO-030","IND-RES-002"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Visitantes sin acceso a información clara sobre atractivos, servicios y rutas.","Ausencia de espacios o plataformas de orientación turística."],
causasIndirectas:["Débil gestión de información del destino.","Baja articulación con prestadores y operadores turísticos."],
efectosDirectos:["Desorientación de visitantes y menor consumo de oferta turística.","Baja percepción de organización del destino."],
efectosIndirectos:["Menor permanencia y gasto turístico.","Pérdida de oportunidades de promoción y fidelización."],
objetivosEspecificos:["Implementar punto de información turística físico o digital.","Consolidar información actualizada de atractivos, servicios y eventos.","Capacitar personal para orientación y atención al visitante."],
beneficios:"Los visitantes accederán a información clara, mejorando experiencia, permanencia y consumo turístico local.",
sostenibilidad:"Requiere actualización de información, operación, conectividad, mantenimiento y articulación con prestadores.",
palabrasClave:["punto de información turística","PIT","información turística","visitantes","orientación"]
},

{
codigo:"TIP-TUR-009",
nombre:"Plan de desarrollo turístico",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para formular, actualizar o implementar instrumentos de planificación y gestión turística territorial.",
problemaCentral:"Débil planificación y gestión turística que limita el desarrollo ordenado, sostenible y competitivo del destino.",
objetivoGeneral:"Fortalecer la planificación y gestión turística para impulsar el desarrollo ordenado, sostenible y competitivo del destino.",
poblaciones:["POB-TER-003","POB-SEC-006"],
productos:["PRO-GES-003","PRO-SER-002","PRO-FOR-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-PRO-022","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Ausencia o desactualización de instrumentos de planificación turística.","Baja articulación entre actores públicos, privados y comunitarios."],
causasIndirectas:["Información insuficiente sobre oferta, demanda y vocación turística.","Limitada capacidad institucional para gestionar el destino."],
efectosDirectos:["Inversiones dispersas y baja coordinación sectorial.","Crecimiento turístico desordenado o poco sostenible."],
efectosIndirectos:["Pérdida de competitividad y sostenibilidad del destino.","Conflictos por uso de atractivos y recursos."],
objetivosEspecificos:["Formular o actualizar el plan turístico territorial.","Caracterizar oferta, demanda, atractivos y actores del sector.","Definir hoja de ruta, proyectos y modelo de gestión turística."],
beneficios:"El territorio contará con una guía técnica para orientar inversiones, promoción y gestión sostenible del turismo.",
sostenibilidad:"Dependerá de adopción institucional, seguimiento, actualización y articulación con actores del destino.",
palabrasClave:["plan turístico","plan de desarrollo turístico","gestión del destino","planificación turística"]
},

{
codigo:"TIP-TUR-010",
nombre:"Turismo de naturaleza",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para desarrollar productos turísticos de naturaleza, avistamiento, interpretación ambiental y experiencias sostenibles.",
problemaCentral:"Bajo aprovechamiento sostenible del potencial de turismo de naturaleza del territorio.",
objetivoGeneral:"Fortalecer el aprovechamiento sostenible del potencial de turismo de naturaleza del territorio.",
poblaciones:["POB-TER-001","POB-TER-003","POB-SEC-006"],
productos:["PRO-SER-002","PRO-FOR-001","PRO-DOT-004","PRO-INF-005"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-020","IND-PRO-013","IND-PRO-005","IND-RES-002","IND-IMP-001"],
riesgos:["RIE-AMB-001","RIE-AMB-002","RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Productos de naturaleza poco estructurados y comercializados.","Baja capacidad local en guianza, interpretación y manejo sostenible."],
causasIndirectas:["Débil articulación entre conservación y turismo.","Limitada infraestructura liviana y dotación para experiencias de naturaleza."],
efectosDirectos:["Baja llegada de visitantes interesados en naturaleza.","Riesgo de afectación ambiental por prácticas no reguladas."],
efectosIndirectos:["Menor generación de ingresos sostenibles para comunidades.","Pérdida de oportunidades de conservación basada en turismo."],
objetivosEspecificos:["Diseñar productos turísticos de naturaleza sostenibles.","Capacitar guías y actores locales en interpretación ambiental.","Dotar elementos básicos para operación segura y responsable."],
beneficios:"El territorio diversificará su oferta turística con experiencias sostenibles que valoran biodiversidad y paisaje.",
sostenibilidad:"Requiere manejo de capacidad de carga, guías locales, monitoreo ambiental, promoción y participación comunitaria.",
palabrasClave:["turismo de naturaleza","ecoturismo","avistamiento","biodiversidad","experiencias sostenibles"]
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

window.PlantillasTurismo = PlantillasTurismo;
