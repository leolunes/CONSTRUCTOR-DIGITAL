// =====================================
// PLANTILLAS/AMBIENTE.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Ambiente
// =====================================

const PlantillasAmbiente = (()=>{

const SECTOR = "Ambiente y Desarrollo Sostenible";
const SECTOR_CODIGO = "SEC-AMB-001";

const comunes = {
    riesgos: ["RIE-AMB-001","RIE-AMB-002","RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001"],
    normasBase: ["NOR-AMB-001","NOR-AMB-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-AMB-001",
nombre:"Restauración ecológica",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a recuperar ecosistemas degradados mediante restauración ecológica, revegetalización, manejo del suelo y protección ambiental.",
problemaCentral:"Deterioro de ecosistemas estratégicos que afecta la biodiversidad, los servicios ecosistémicos y la sostenibilidad ambiental del territorio.",
objetivoGeneral:"Recuperar ecosistemas estratégicos deteriorados para fortalecer la biodiversidad, los servicios ecosistémicos y la sostenibilidad ambiental.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-SER-002","PRO-GES-003","PRO-FOR-001","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-042","IND-PRO-020","IND-PRO-013","IND-RES-003","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Pérdida de cobertura vegetal y degradación de suelos.","Baja intervención técnica para restaurar áreas ambientalmente afectadas."],
causasIndirectas:["Deforestación, expansión agropecuaria o uso inadecuado del suelo.","Débil control ambiental y baja apropiación comunitaria."],
efectosDirectos:["Reducción de biodiversidad y pérdida de servicios ecosistémicos.","Incremento de erosión, sedimentación y vulnerabilidad ambiental."],
efectosIndirectos:["Afectación de fuentes hídricas y calidad ambiental.","Mayor exposición a riesgos climáticos y ambientales."],
objetivosEspecificos:["Implementar acciones de restauración ecológica en áreas priorizadas.","Fortalecer la participación comunitaria en recuperación ambiental.","Realizar seguimiento técnico a la recuperación de cobertura y servicios ecosistémicos."],
beneficios:"Se recuperarán áreas degradadas, mejorando biodiversidad, regulación hídrica, calidad ambiental y resiliencia territorial.",
sostenibilidad:"Dependerá de mantenimiento de áreas restauradas, cercamiento, control de presiones, monitoreo ecológico y participación comunitaria.",
palabrasClave:["restauración ecológica","revegetalización","ecosistemas","recuperación ambiental","biodiversidad"]
},

{
codigo:"TIP-AMB-002",
nombre:"Reforestación",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para establecer, mantener y proteger áreas reforestadas con especies nativas o adecuadas al territorio.",
problemaCentral:"Pérdida de cobertura forestal que afecta la regulación hídrica, la biodiversidad y la estabilidad ambiental.",
objetivoGeneral:"Incrementar la cobertura forestal para fortalecer la regulación hídrica, la biodiversidad y la estabilidad ambiental.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-SER-002","PRO-DOT-004","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-013","IND-PRO-020","IND-RES-003","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Deforestación y pérdida de cobertura vegetal.","Insuficiente establecimiento y mantenimiento de especies forestales."],
causasIndirectas:["Uso inadecuado del suelo y presión sobre áreas forestales.","Baja educación ambiental y control comunitario."],
efectosDirectos:["Erosión, pérdida de hábitat y disminución de regulación hídrica.","Aumento de vulnerabilidad ante sequías e inundaciones."],
efectosIndirectos:["Deterioro de fuentes hídricas y biodiversidad.","Menor capacidad de adaptación al cambio climático."],
objetivosEspecificos:["Establecer áreas reforestadas con especies adecuadas.","Realizar mantenimiento y protección de plántulas.","Promover educación y corresponsabilidad comunitaria."],
beneficios:"Se aumentará la cobertura vegetal, mejorando protección de suelos, agua, biodiversidad y captura de carbono.",
sostenibilidad:"Requiere mantenimiento, reposición de plántulas, control de incendios, cercamiento y apropiación comunitaria.",
palabrasClave:["reforestación","árboles","cobertura vegetal","bosque","especies nativas"]
},

{
codigo:"TIP-AMB-003",
nombre:"Protección de cuencas hidrográficas",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a conservar, restaurar y gestionar cuencas abastecedoras y áreas de importancia hídrica.",
problemaCentral:"Deterioro de cuencas hidrográficas que afecta la disponibilidad, calidad y regulación del recurso hídrico.",
objetivoGeneral:"Fortalecer la protección y gestión de cuencas hidrográficas para mejorar disponibilidad, calidad y regulación del recurso hídrico.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-GES-003","PRO-SER-002","PRO-FOR-001","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-PRO-020","IND-PRO-013","IND-RES-003","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Degradación de áreas protectoras y rondas hídricas.","Contaminación, deforestación o uso inadecuado en cuencas abastecedoras."],
causasIndirectas:["Débil gobernanza del recurso hídrico.","Insuficiente articulación entre usuarios, comunidad e institucionalidad."],
efectosDirectos:["Disminución de caudales, calidad del agua y regulación hídrica.","Mayor sedimentación, erosión y conflictos por uso del agua."],
efectosIndirectos:["Riesgos para abastecimiento de agua y ecosistemas acuáticos.","Mayor vulnerabilidad territorial ante cambio climático."],
objetivosEspecificos:["Implementar acciones de conservación y restauración en cuencas priorizadas.","Fortalecer gobernanza y educación ambiental del recurso hídrico.","Realizar seguimiento a áreas protectoras y fuentes abastecedoras."],
beneficios:"Se protegerán fuentes hídricas estratégicas, fortaleciendo abastecimiento, calidad ambiental y resiliencia del territorio.",
sostenibilidad:"Dependerá de acuerdos comunitarios, monitoreo, control de usos, mantenimiento de áreas protegidas y coordinación interinstitucional.",
palabrasClave:["cuenca","recurso hídrico","ronda hídrica","fuente abastecedora","agua"]
},

{
codigo:"TIP-AMB-004",
nombre:"Compra de predios para conservación",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para adquirir predios estratégicos para conservación de fuentes hídricas, ecosistemas y áreas de interés ambiental.",
problemaCentral:"Insuficiente protección jurídica y física de predios estratégicos para la conservación ambiental y el recurso hídrico.",
objetivoGeneral:"Fortalecer la protección de predios estratégicos para la conservación ambiental y el recurso hídrico.",
poblaciones:["POB-TER-003"],
productos:["PRO-GES-003","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:["FUE-PUB-001","FUE-NAC-001","FUE-COO-002"],
causasDirectas:["Predios estratégicos sin protección o manejo ambiental.","Presión antrópica sobre áreas de recarga, bosques o fuentes hídricas."],
causasIndirectas:["Limitada disponibilidad de recursos para adquisición y manejo.","Débil identificación y priorización predial ambiental."],
efectosDirectos:["Pérdida de cobertura natural y servicios ecosistémicos.","Riesgo para abastecimiento hídrico y biodiversidad."],
efectosIndirectos:["Incremento de costos de recuperación ambiental futura.","Mayor vulnerabilidad ambiental del territorio."],
objetivosEspecificos:["Identificar y priorizar predios estratégicos de conservación.","Adquirir predios con importancia ambiental o hídrica.","Definir medidas de manejo, protección y seguimiento de los predios."],
beneficios:"Se asegurará la protección de áreas estratégicas para agua, biodiversidad y equilibrio ambiental.",
sostenibilidad:"Requiere saneamiento predial, vigilancia, administración, restauración, control de ocupación y plan de manejo.",
palabrasClave:["compra de predios","conservación","predios ambientales","fuentes hídricas","áreas estratégicas"]
},

{
codigo:"TIP-AMB-005",
nombre:"Pago por Servicios Ambientales - PSA",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar esquemas de pago por servicios ambientales orientados a conservación, restauración o uso sostenible.",
problemaCentral:"Insuficientes incentivos para que propietarios y comunidades conserven áreas estratégicas y servicios ecosistémicos.",
objetivoGeneral:"Fortalecer incentivos para la conservación de áreas estratégicas y servicios ecosistémicos mediante esquemas de pago por servicios ambientales.",
poblaciones:["POB-TER-001","POB-SEC-005","POB-TER-003"],
productos:["PRO-SER-002","PRO-GES-003","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-042","IND-PRO-023","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:["FUE-PUB-001","FUE-NAC-001","FUE-COO-002","FUE-COO-003"],
causasDirectas:["Baja compensación o incentivo a propietarios que conservan áreas ambientales.","Presión económica para transformar áreas estratégicas."],
causasIndirectas:["Limitada estructuración de esquemas PSA.","Débil seguimiento y verificación de compromisos de conservación."],
efectosDirectos:["Pérdida de coberturas naturales y servicios ecosistémicos.","Baja corresponsabilidad privada y comunitaria en conservación."],
efectosIndirectos:["Mayor deterioro de cuencas, biodiversidad y resiliencia ambiental.","Incremento de costos públicos de recuperación ambiental."],
objetivosEspecificos:["Diseñar e implementar esquemas PSA en áreas priorizadas.","Vincular propietarios o comunidades a compromisos de conservación.","Realizar seguimiento y verificación de servicios ambientales."],
beneficios:"Se incentivará la conservación privada y comunitaria de ecosistemas estratégicos.",
sostenibilidad:"Dependerá de fuentes recurrentes de financiación, monitoreo, acuerdos claros y cumplimiento de compromisos ambientales.",
palabrasClave:["pago por servicios ambientales","PSA","conservación","incentivos ambientales","servicios ecosistémicos"]
},

{
codigo:"TIP-AMB-006",
nombre:"Educación ambiental",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer cultura ambiental, participación ciudadana, PRAE, PROCEDA, campañas y procesos pedagógicos ambientales.",
problemaCentral:"Baja cultura ambiental y participación comunitaria en la protección de los recursos naturales.",
objetivoGeneral:"Fortalecer la cultura ambiental y la participación comunitaria en la protección de los recursos naturales.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004"],
productos:["PRO-FOR-001","PRO-SER-002","PRO-SER-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-031","IND-PRO-033","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja apropiación comunitaria de prácticas de protección ambiental.","Insuficiente educación ambiental en hogares, instituciones y comunidades."],
causasIndirectas:["Débil articulación de PRAE, PROCEDA y actores ambientales.","Limitados recursos para procesos educativos continuos."],
efectosDirectos:["Persistencia de prácticas inadecuadas frente a residuos, agua, fauna, flora y entorno.","Baja participación en acciones de conservación."],
efectosIndirectos:["Deterioro ambiental progresivo y conflictos por uso de recursos.","Menor sostenibilidad de inversiones ambientales."],
objetivosEspecificos:["Desarrollar procesos de formación y sensibilización ambiental.","Fortalecer participación comunitaria e institucional.","Promover prácticas sostenibles en hogares, escuelas y comunidades."],
beneficios:"La población fortalecerá hábitos sostenibles y participación activa en protección ambiental.",
sostenibilidad:"Dependerá de continuidad pedagógica, líderes ambientales, instituciones educativas y articulación comunitaria.",
palabrasClave:["educación ambiental","PRAE","PROCEDA","cultura ambiental","sensibilización"]
},

{
codigo:"TIP-AMB-007",
nombre:"Vivero forestal",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar o fortalecer viveros forestales destinados a producción de material vegetal para restauración, reforestación y ornato.",
problemaCentral:"Insuficiente disponibilidad local de material vegetal adecuado para procesos de restauración y reforestación.",
objetivoGeneral:"Fortalecer la disponibilidad local de material vegetal adecuado para procesos de restauración y reforestación.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-INF-001","PRO-DOT-004","PRO-SER-002","PRO-FOR-001"],
actividades:["ACT-PLA-003","ACT-EJE-001","ACT-EJE-003","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-001","IND-PRO-013","IND-PRO-031","IND-PRO-020","IND-RES-003"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja capacidad de producción de plántulas nativas o adaptadas.","Dependencia de proveedores externos para material vegetal."],
causasIndirectas:["Insuficiente infraestructura, insumos y personal técnico para viveros.","Débil planificación de restauración y reforestación."],
efectosDirectos:["Limitación de proyectos de reforestación y recuperación ambiental.","Mayor costo y menor disponibilidad de especies adecuadas."],
efectosIndirectos:["Menor cobertura vegetal y recuperación ecológica.","Pérdida de oportunidades de empleo y educación ambiental."],
objetivosEspecificos:["Implementar o fortalecer infraestructura de vivero forestal.","Producir material vegetal para restauración y reforestación.","Capacitar comunidad y personal en manejo de viveros."],
beneficios:"El territorio dispondrá de plántulas para recuperación ambiental, educación y proyectos de conservación.",
sostenibilidad:"Requiere operación técnica, insumos, mantenimiento, demanda de plántulas, control fitosanitario y alianzas ambientales.",
palabrasClave:["vivero forestal","plántulas","especies nativas","reforestación","material vegetal"]
},

{
codigo:"TIP-AMB-008",
nombre:"Recuperación de humedales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para conservar, recuperar, delimitar, restaurar o poner en valor humedales y ecosistemas acuáticos.",
problemaCentral:"Deterioro de humedales que afecta biodiversidad, regulación hídrica y servicios ecosistémicos.",
objetivoGeneral:"Recuperar humedales para fortalecer biodiversidad, regulación hídrica y servicios ecosistémicos.",
poblaciones:["POB-TER-003"],
productos:["PRO-SER-002","PRO-GES-003","PRO-FOR-001","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-042","IND-PRO-020","IND-PRO-013","IND-RES-003","IND-IMP-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Contaminación, relleno, invasión o pérdida de cobertura en humedales.","Débil control y manejo de áreas de humedal."],
causasIndirectas:["Expansión urbana, vertimientos o uso inadecuado del suelo.","Baja apropiación social del valor ecológico del humedal."],
efectosDirectos:["Pérdida de biodiversidad y capacidad de regulación hídrica.","Aumento de inundaciones, contaminación y degradación paisajística."],
efectosIndirectos:["Deterioro de servicios ecosistémicos y calidad ambiental urbana o rural.","Mayor vulnerabilidad ante eventos climáticos."],
objetivosEspecificos:["Restaurar áreas degradadas del humedal.","Fortalecer manejo, delimitación y protección del ecosistema.","Promover educación y apropiación comunitaria."],
beneficios:"Se recuperará un ecosistema estratégico para biodiversidad, agua, paisaje y adaptación climática.",
sostenibilidad:"Dependerá de monitoreo, control de usos, mantenimiento, educación, vigilancia y articulación institucional.",
palabrasClave:["humedal","recuperación humedal","ecosistema acuático","biodiversidad","regulación hídrica"]
},

{
codigo:"TIP-AMB-009",
nombre:"Cambio climático y adaptación",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar acciones de mitigación, adaptación, resiliencia climática y reducción de vulnerabilidad territorial.",
problemaCentral:"Alta vulnerabilidad territorial frente a los efectos del cambio climático y baja capacidad de adaptación.",
objetivoGeneral:"Fortalecer la capacidad de adaptación y resiliencia territorial frente a los efectos del cambio climático.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003","POB-VUL-003"],
productos:["PRO-GES-003","PRO-SER-002","PRO-FOR-001","PRO-SER-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-031","IND-PRO-020","IND-PRO-033","IND-RES-003","IND-IMP-001"],
riesgos:["RIE-AMB-001","RIE-AMB-002","RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:["FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"],
causasDirectas:["Débil implementación de acciones de adaptación climática.","Baja capacidad comunitaria e institucional para gestionar riesgos climáticos."],
causasIndirectas:["Insuficiente información climática territorial.","Limitada integración del cambio climático en la planificación local."],
efectosDirectos:["Mayor afectación por sequías, inundaciones, incendios o eventos extremos.","Deterioro de medios de vida y servicios ecosistémicos."],
efectosIndirectos:["Incremento de vulnerabilidad social, económica y ambiental.","Mayor costo de atención de emergencias y recuperación."],
objetivosEspecificos:["Implementar medidas de adaptación y resiliencia climática.","Fortalecer capacidades comunitarias e institucionales.","Incorporar criterios climáticos en la planificación territorial."],
beneficios:"El territorio aumentará su resiliencia frente a eventos climáticos y reducirá vulnerabilidades ambientales y sociales.",
sostenibilidad:"Requiere seguimiento climático, apropiación comunitaria, articulación institucional y actualización permanente de medidas.",
palabrasClave:["cambio climático","adaptación","resiliencia","mitigación","vulnerabilidad climática"]
},

{
codigo:"TIP-AMB-010",
nombre:"Gestión ambiental municipal",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer la capacidad institucional de gestión ambiental municipal, planificación, seguimiento, control y participación.",
problemaCentral:"Débil capacidad institucional para gestionar de manera integral los asuntos ambientales del municipio.",
objetivoGeneral:"Fortalecer la capacidad institucional para gestionar de manera integral los asuntos ambientales del municipio.",
poblaciones:["POB-TER-003"],
productos:["PRO-GES-003","PRO-FOR-002","PRO-TIC-003","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-PRO-052","IND-PRO-031","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficientes herramientas e información para la gestión ambiental.","Baja capacidad técnica para seguimiento, control y educación ambiental."],
causasIndirectas:["Limitados recursos humanos, tecnológicos y financieros.","Débil articulación con autoridades ambientales y comunidad."],
efectosDirectos:["Bajo seguimiento a problemáticas ambientales.","Dificultad para ejecutar políticas y planes ambientales."],
efectosIndirectos:["Deterioro ambiental y aumento de conflictos socioambientales.","Menor cumplimiento de metas ambientales territoriales."],
objetivosEspecificos:["Fortalecer herramientas de planificación y seguimiento ambiental.","Capacitar personal y actores comunitarios.","Mejorar articulación institucional y participación ambiental."],
beneficios:"El municipio contará con mayor capacidad para planear, gestionar y controlar asuntos ambientales.",
sostenibilidad:"Dependerá de institucionalización de procesos, sistemas de información, personal capacitado y coordinación con autoridades ambientales.",
palabrasClave:["gestión ambiental","municipio verde","autoridad ambiental","plan ambiental","seguimiento ambiental"]
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

window.PlantillasAmbiente = PlantillasAmbiente;
