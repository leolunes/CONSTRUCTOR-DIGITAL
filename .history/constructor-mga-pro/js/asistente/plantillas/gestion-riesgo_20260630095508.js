// =====================================
// PLANTILLAS/GESTION-RIESGO.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Gestión del Riesgo
// =====================================

const PlantillasGestionRiesgo = (()=>{

const SECTOR = "Gestión del Riesgo de Desastres";
const SECTOR_CODIGO = "SEC-GRD-001";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-AMB-001","RIE-AMB-002"],
    normasBase: ["NOR-GRD-001","NOR-GRD-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-GRD-001",
nombre:"Obras de mitigación del riesgo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construir obras de mitigación para reducir condiciones de amenaza, vulnerabilidad o riesgo en zonas críticas.",
problemaCentral:"Alta exposición de población e infraestructura a condiciones de riesgo por amenazas naturales o socio-naturales.",
objetivoGeneral:"Reducir la exposición de población e infraestructura a condiciones de riesgo mediante obras de mitigación.",
poblaciones:["POB-TER-003","POB-VUL-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-030","IND-RES-002","IND-RES-003","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia de obras de protección, estabilización, drenaje o control.","Presencia de población, viviendas o infraestructura en zonas amenazadas."],
causasIndirectas:["Ocupación inadecuada del territorio y debilidad en planificación preventiva.","Eventos climáticos, geológicos o hidrometeorológicos recurrentes."],
efectosDirectos:["Pérdida potencial de vidas, viviendas, infraestructura y medios de vida.","Afectación de la movilidad, servicios públicos y actividades económicas."],
efectosIndirectos:["Incremento de costos por emergencias, recuperación y reconstrucción.","Mayor vulnerabilidad social y territorial."],
objetivosEspecificos:["Diseñar y ejecutar obras de mitigación en zonas priorizadas.","Reducir condiciones de amenaza y vulnerabilidad de población e infraestructura.","Fortalecer seguimiento técnico y mantenimiento de las obras."],
beneficios:"La población beneficiaria tendrá menor exposición a eventos de desastre y mejores condiciones de seguridad territorial.",
sostenibilidad:"Dependerá del mantenimiento de obras, monitoreo, control de ocupación, actualización de estudios y apropiación comunitaria.",
palabrasClave:["mitigación del riesgo","obras de mitigación","riesgo","amenaza","vulnerabilidad"]
},

{
codigo:"TIP-GRD-002",
nombre:"Estabilización de taludes y laderas",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para estabilizar taludes, laderas o zonas inestables mediante obras geotécnicas, drenajes y protección.",
problemaCentral:"Inestabilidad de taludes o laderas que genera riesgo para población, viviendas, vías o infraestructura.",
objetivoGeneral:"Reducir el riesgo asociado a inestabilidad de taludes o laderas mediante obras de estabilización y control.",
poblaciones:["POB-TER-003","POB-VUL-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-INF-003"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-003","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Taludes o laderas con procesos de erosión, deslizamiento o pérdida de estabilidad.","Insuficientes obras de drenaje, contención o protección superficial."],
causasIndirectas:["Condiciones geológicas, hidrológicas o climáticas adversas.","Intervenciones antrópicas sin manejo técnico del suelo."],
efectosDirectos:["Riesgo de afectación a viviendas, vías, equipamientos o población.","Restricciones de movilidad y daños recurrentes en infraestructura."],
efectosIndirectos:["Aumento de costos de atención, reparación y reconstrucción.","Pérdida de seguridad y estabilidad territorial."],
objetivosEspecificos:["Construir obras de estabilización geotécnica.","Implementar drenajes y manejo de aguas superficiales y subsuperficiales.","Realizar seguimiento y mantenimiento de áreas intervenidas."],
beneficios:"Se reducirán deslizamientos, erosión y afectaciones sobre población e infraestructura.",
sostenibilidad:"Requiere mantenimiento de drenajes, monitoreo geotécnico, control de aguas, revegetalización y control de ocupación.",
palabrasClave:["taludes","laderas","estabilización","deslizamiento","geotecnia"]
},

{
codigo:"TIP-GRD-003",
nombre:"Canalización y control de cauces",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para ejecutar obras de canalización, protección de cauces, jarillones, muros o manejo hidráulico en zonas de amenaza por inundación o socavación.",
problemaCentral:"Alta exposición de población e infraestructura a inundaciones, socavación o desbordamientos de cauces.",
objetivoGeneral:"Reducir la exposición de población e infraestructura a inundaciones, socavación o desbordamientos de cauces.",
poblaciones:["POB-TER-003","POB-VUL-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-INF-004"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-004","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-CON-001","RIE-AMB-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Cauces con capacidad insuficiente, erosión lateral o puntos críticos de desbordamiento.","Ocupación o infraestructura expuesta en zonas cercanas a rondas hídricas."],
causasIndirectas:["Eventos de lluvia intensa, sedimentación y cambios en dinámica hidráulica.","Débil control urbanístico y manejo ambiental de rondas."],
efectosDirectos:["Inundación de viviendas, vías, cultivos o equipamientos.","Pérdida de bienes, afectación de salud pública y seguridad."],
efectosIndirectos:["Mayor costo por emergencias y recuperación.","Deterioro ambiental y social en zonas ribereñas."],
objetivosEspecificos:["Construir obras hidráulicas de control y protección de cauces.","Reducir puntos críticos de inundación o socavación.","Fortalecer mantenimiento, limpieza y seguimiento del cauce."],
beneficios:"Se reducirá la probabilidad de afectaciones por inundaciones y socavación en zonas priorizadas.",
sostenibilidad:"Dependerá de limpieza periódica, control de residuos, mantenimiento hidráulico, monitoreo y protección de rondas.",
palabrasClave:["canalización","cauces","inundación","jarillón","socavación","río","quebrada"]
},

{
codigo:"TIP-GRD-004",
nombre:"Sistema de alerta temprana",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para implementar sistemas de alerta temprana con monitoreo, sensores, comunicaciones, protocolos y capacitación comunitaria.",
problemaCentral:"Insuficiente capacidad de monitoreo, alerta y respuesta temprana frente a amenazas naturales o socio-naturales.",
objetivoGeneral:"Fortalecer la capacidad de monitoreo, alerta y respuesta temprana frente a amenazas naturales o socio-naturales.",
poblaciones:["POB-TER-003","POB-VUL-003"],
productos:["PRO-TIC-003","PRO-DOT-002","PRO-FOR-001","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-PLA-004","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-052","IND-PRO-011","IND-PRO-020","IND-PRO-031","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-SOC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Ausencia o debilidad de equipos de monitoreo y comunicación.","Protocolos de alerta y evacuación insuficientes o poco apropiados por la comunidad."],
causasIndirectas:["Limitada información sobre amenazas y puntos críticos.","Baja capacitación comunitaria e institucional para la respuesta temprana."],
efectosDirectos:["Demoras en evacuación y respuesta ante eventos amenazantes.","Mayor exposición de población a pérdidas humanas y materiales."],
efectosIndirectos:["Aumento de impactos por desastres y emergencias.","Menor confianza comunitaria en la gestión institucional del riesgo."],
objetivosEspecificos:["Instalar equipos y herramientas de monitoreo y alerta.","Definir protocolos de comunicación, evacuación y respuesta.","Capacitar comunidades e instituciones en uso del sistema."],
beneficios:"La población contará con mayor capacidad de anticipación, evacuación y respuesta ante amenazas.",
sostenibilidad:"Requiere mantenimiento de equipos, pruebas periódicas, actualización de protocolos, responsables definidos y ejercicios comunitarios.",
palabrasClave:["alerta temprana","monitoreo","sensores","sirenas","evacuación"]
},

{
codigo:"TIP-GRD-005",
nombre:"Fortalecimiento de organismos de socorro",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para dotar, capacitar y fortalecer cuerpos de bomberos, defensa civil, cruz roja u organismos de respuesta.",
problemaCentral:"Débil capacidad operativa de organismos de socorro para atender emergencias y desastres.",
objetivoGeneral:"Fortalecer la capacidad operativa de organismos de socorro para atender emergencias y desastres.",
poblaciones:["POB-TER-003"],
productos:["PRO-DOT-002","PRO-DOT-004","PRO-FOR-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-001"],
indicadores:["IND-PRO-011","IND-PRO-013","IND-PRO-021","IND-PRO-030","IND-RES-003","IND-GES-001"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente dotación, equipos, vehículos o elementos de protección.","Baja capacitación especializada para atención de emergencias."],
causasIndirectas:["Limitados recursos para operación y mantenimiento de organismos de socorro.","Creciente demanda de atención por emergencias recurrentes."],
efectosDirectos:["Respuesta lenta o insuficiente ante emergencias.","Mayor riesgo para población afectada y personal respondiente."],
efectosIndirectos:["Incremento de pérdidas humanas, materiales y ambientales.","Menor resiliencia institucional y comunitaria."],
objetivosEspecificos:["Dotar equipos, herramientas y elementos de protección requeridos.","Capacitar personal de organismos de socorro.","Fortalecer capacidad de coordinación y respuesta operativa."],
beneficios:"El territorio contará con organismos de respuesta mejor equipados y capacitados para proteger vidas y bienes.",
sostenibilidad:"Dependerá de mantenimiento de equipos, entrenamiento continuo, presupuesto operativo y articulación con el sistema de gestión del riesgo.",
palabrasClave:["bomberos","defensa civil","socorro","emergencias","dotación"]
},

{
codigo:"TIP-GRD-006",
nombre:"Plan municipal de gestión del riesgo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para formular, actualizar o implementar instrumentos de planificación de gestión del riesgo de desastres.",
problemaCentral:"Débil planificación territorial para conocer, reducir y manejar el riesgo de desastres.",
objetivoGeneral:"Fortalecer la planificación territorial para conocer, reducir y manejar el riesgo de desastres.",
poblaciones:["POB-TER-003"],
productos:["PRO-GES-003","PRO-FOR-002","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-021","IND-PRO-031","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Instrumentos de gestión del riesgo inexistentes, desactualizados o poco implementados.","Baja articulación entre planificación territorial, conocimiento del riesgo y respuesta."],
causasIndirectas:["Información insuficiente sobre amenazas, vulnerabilidades y capacidades.","Limitada capacidad institucional para gestión integral del riesgo."],
efectosDirectos:["Intervenciones reactivas y poco coordinadas frente a emergencias.","Baja priorización de medidas de reducción del riesgo."],
efectosIndirectos:["Mayor exposición de población e infraestructura a eventos adversos.","Incremento de costos por atención y recuperación."],
objetivosEspecificos:["Formular o actualizar instrumentos de gestión del riesgo.","Caracterizar amenazas, vulnerabilidades, capacidades y escenarios de riesgo.","Definir medidas, proyectos y protocolos para reducción y manejo del riesgo."],
beneficios:"El municipio contará con una hoja de ruta técnica para gestionar riesgos y orientar inversiones preventivas.",
sostenibilidad:"Dependerá de adopción institucional, actualización periódica, presupuesto, seguimiento y articulación con el ordenamiento territorial.",
palabrasClave:["PMGRD","plan gestión riesgo","plan municipal","riesgo de desastres","planeación"]
},

{
codigo:"TIP-GRD-007",
nombre:"Educación comunitaria en gestión del riesgo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para capacitar comunidades, instituciones educativas y actores locales en prevención, preparación y respuesta ante emergencias.",
problemaCentral:"Baja cultura de prevención y preparación comunitaria frente a emergencias y desastres.",
objetivoGeneral:"Fortalecer la cultura de prevención y preparación comunitaria frente a emergencias y desastres.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-FOR-001","PRO-SER-002","PRO-SER-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-020","IND-PRO-031","IND-PRO-033","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Bajo conocimiento comunitario sobre amenazas, rutas de evacuación y autoprotección.","Insuficientes ejercicios, simulacros y formación preventiva."],
causasIndirectas:["Débil comunicación del riesgo y participación comunitaria.","Baja integración de instituciones educativas, barrios y veredas en procesos de preparación."],
efectosDirectos:["Respuesta desorganizada o tardía ante emergencias.","Mayor exposición de población vulnerable durante eventos adversos."],
efectosIndirectos:["Incremento de afectaciones humanas y materiales.","Menor resiliencia comunitaria."],
objetivosEspecificos:["Capacitar comunidades en prevención, autoprotección y respuesta.","Realizar simulacros y ejercicios comunitarios.","Fortalecer redes comunitarias de gestión del riesgo."],
beneficios:"La comunidad estará mejor preparada para prevenir, responder y recuperarse ante emergencias.",
sostenibilidad:"Se soportará en líderes comunitarios, simulacros periódicos, rutas actualizadas y articulación con organismos de socorro.",
palabrasClave:["educación riesgo","prevención","simulacros","comunidad","preparación"]
},

{
codigo:"TIP-GRD-008",
nombre:"Equipamiento para atención de emergencias",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para adquirir equipos, herramientas, kits, comunicaciones, vehículos o elementos logísticos para atención de emergencias.",
problemaCentral:"Insuficiente equipamiento institucional para atender emergencias de manera oportuna y segura.",
objetivoGeneral:"Fortalecer el equipamiento institucional para atender emergencias de manera oportuna y segura.",
poblaciones:["POB-TER-003"],
productos:["PRO-DOT-002","PRO-DOT-004","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-011","IND-PRO-013","IND-PRO-030","IND-RES-003","IND-GES-001"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Equipos, herramientas o elementos logísticos insuficientes u obsoletos.","Baja capacidad de comunicaciones, rescate, atención o apoyo humanitario."],
causasIndirectas:["Limitada inversión en preparación y respuesta.","Crecimiento de emergencias por eventos climáticos o antrópicos."],
efectosDirectos:["Atención tardía, limitada o insegura de emergencias.","Mayor exposición de población y respondientes."],
efectosIndirectos:["Incremento de pérdidas y costos de recuperación.","Debilitamiento de la capacidad institucional de respuesta."],
objetivosEspecificos:["Adquirir equipos y elementos prioritarios para atención de emergencias.","Garantizar inventario, capacitación y uso adecuado de equipos.","Fortalecer capacidad logística y operativa de respuesta."],
beneficios:"El municipio tendrá mejores herramientas para proteger vidas, bienes e infraestructura durante emergencias.",
sostenibilidad:"Requiere mantenimiento, inventario, almacenamiento, capacitación y reposición programada.",
palabrasClave:["equipamiento emergencias","kits emergencia","rescate","comunicaciones","herramientas"]
},

{
codigo:"TIP-GRD-009",
nombre:"Reubicación preventiva por riesgo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para gestionar reubicación o reasentamiento preventivo de hogares expuestos a riesgo alto no mitigable.",
problemaCentral:"Hogares ubicados en zonas de riesgo alto no mitigable con alta exposición a desastres.",
objetivoGeneral:"Reducir la exposición de hogares ubicados en zonas de riesgo alto no mitigable mediante reubicación preventiva.",
poblaciones:["POB-VUL-003","POB-TER-003"],
productos:["PRO-SER-001","PRO-GES-003","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-030","IND-PRO-042","IND-PRO-023","IND-RES-002","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Viviendas localizadas en zonas de amenaza alta o riesgo no mitigable.","Dificultad para acceder a soluciones habitacionales seguras."],
causasIndirectas:["Ocupación informal de zonas no aptas.","Débil control territorial y limitaciones socioeconómicas de los hogares."],
efectosDirectos:["Riesgo de pérdida de vidas, viviendas y bienes.","Afectación psicológica y económica de hogares expuestos."],
efectosIndirectos:["Altos costos de atención humanitaria y recuperación.","Reocupación de zonas de riesgo y reproducción de vulnerabilidad."],
objetivosEspecificos:["Identificar hogares ubicados en riesgo alto no mitigable.","Gestionar soluciones de reubicación o reasentamiento preventivo.","Acompañar socialmente el proceso y prevenir reocupación."],
beneficios:"Los hogares beneficiarios reducirán su exposición al riesgo y mejorarán condiciones de seguridad.",
sostenibilidad:"Dependerá de control de reocupación, acompañamiento social, legalización de soluciones y gestión del suelo liberado.",
palabrasClave:["reubicación","reasentamiento","alto riesgo","riesgo no mitigable","hogares"]
},

{
codigo:"TIP-GRD-010",
nombre:"Prevención y control de incendios forestales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para prevenir, monitorear y controlar incendios forestales mediante dotación, capacitación, vigilancia y restauración preventiva.",
problemaCentral:"Alta vulnerabilidad de ecosistemas y comunidades frente a incendios forestales.",
objetivoGeneral:"Reducir la vulnerabilidad de ecosistemas y comunidades frente a incendios forestales.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-DOT-002","PRO-FOR-001","PRO-SER-002","PRO-SER-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-011","IND-PRO-020","IND-PRO-031","IND-PRO-033","IND-RES-003","IND-IMP-001"],
riesgos:["RIE-AMB-001","RIE-AMB-002","RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficientes acciones de prevención, vigilancia y control de incendios forestales.","Baja dotación y capacitación comunitaria e institucional."],
causasIndirectas:["Prácticas inadecuadas de quema, sequías y variabilidad climática.","Baja cultura ambiental y control en zonas de cobertura vegetal."],
efectosDirectos:["Pérdida de cobertura vegetal, fauna, suelos y biodiversidad.","Riesgo para viviendas, cultivos y salud de la población."],
efectosIndirectos:["Deterioro de servicios ecosistémicos y aumento de emisiones.","Mayor vulnerabilidad frente a erosión, sequía e inundaciones."],
objetivosEspecificos:["Implementar acciones de prevención y vigilancia de incendios forestales.","Dotar y capacitar brigadas comunitarias e institucionales.","Fortalecer comunicación, respuesta y restauración preventiva."],
beneficios:"Se reducirá la ocurrencia e impacto de incendios forestales sobre ecosistemas y comunidades.",
sostenibilidad:"Dependerá de brigadas activas, mantenimiento de equipos, educación ambiental, monitoreo y control de quemas.",
palabrasClave:["incendios forestales","brigadas","prevención incendios","quemas","bosques"]
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

window.PlantillasGestionRiesgo = PlantillasGestionRiesgo;
