// =====================================
// PLANTILLAS/DEPORTE.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Deporte y Recreación
// =====================================

const PlantillasDeporte = (()=>{

const SECTOR = "Deporte y Recreación";
const SECTOR_CODIGO = "SEC-CDA-001";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-SOC-001"],
    normasBase: ["NOR-DEP-001","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-003"]
};

const tipologias = [

{
codigo:"TIP-DEP-001",
nombre:"Construcción de polideportivo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a la construcción de escenarios polideportivos para la práctica deportiva, recreación y aprovechamiento del tiempo libre.",
problemaCentral:"Insuficiente disponibilidad de infraestructura deportiva adecuada para la práctica deportiva y recreativa de la comunidad.",
objetivoGeneral:"Mejorar la disponibilidad de infraestructura deportiva adecuada para la práctica deportiva y recreativa de la comunidad.",
poblaciones:["POB-TER-003","POB-SEC-004","POB-CV-004","POB-CV-003"],
productos:["PRO-INF-001","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-010","IND-PRO-030","IND-RES-002","IND-GES-001","IND-GES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Escasez de escenarios deportivos adecuados y seguros.","Limitada dotación e infraestructura para la práctica deportiva comunitaria."],
causasIndirectas:["Insuficiente inversión en infraestructura deportiva.","Crecimiento de la demanda de espacios de recreación y deporte."],
efectosDirectos:["Baja participación comunitaria en actividades deportivas.","Uso de espacios inadecuados para deporte y recreación."],
efectosIndirectos:["Aumento de sedentarismo y menor cohesión social.","Reducción de oportunidades de formación deportiva."],
objetivosEspecificos:["Construir infraestructura polideportiva funcional y segura.","Dotar el escenario con elementos básicos para la práctica deportiva.","Promover el uso comunitario del escenario deportivo."],
beneficios:"La comunidad contará con un espacio adecuado para deporte, recreación, integración social y aprovechamiento del tiempo libre.",
sostenibilidad:"Dependerá de administración del escenario, mantenimiento preventivo, programación de actividades y apropiación comunitaria.",
palabrasClave:["polideportivo","cancha múltiple","deporte","recreación","escenario deportivo"]
},

{
codigo:"TIP-DEP-002",
nombre:"Mejoramiento de polideportivo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para rehabilitar, adecuar o mejorar polideportivos existentes.",
problemaCentral:"Deterioro de escenarios polideportivos que limita su uso seguro y adecuado por la comunidad.",
objetivoGeneral:"Mejorar las condiciones físicas y funcionales de escenarios polideportivos existentes.",
poblaciones:["POB-TER-003","POB-SEC-004"],
productos:["PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-002","IND-PRO-010","IND-RES-003","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Deterioro de placa deportiva, cubiertas, cerramientos, iluminación o graderías.","Insuficiente mantenimiento de escenarios deportivos."],
causasIndirectas:["Uso intensivo del escenario sin conservación adecuada.","Limitados recursos para mantenimiento periódico."],
efectosDirectos:["Riesgo de accidentes y baja calidad del servicio deportivo.","Disminución del uso comunitario del escenario."],
efectosIndirectos:["Menor participación en deporte y recreación.","Pérdida progresiva del patrimonio deportivo municipal."],
objetivosEspecificos:["Rehabilitar los componentes deteriorados del polideportivo.","Mejorar condiciones de seguridad, iluminación y funcionalidad.","Fortalecer el mantenimiento y uso adecuado del escenario."],
beneficios:"La comunidad recuperará un espacio deportivo seguro y funcional para actividades deportivas y recreativas.",
sostenibilidad:"Requiere mantenimiento, control de uso, programación comunitaria y recursos para conservación.",
palabrasClave:["mejoramiento polideportivo","rehabilitación cancha","escenario deportivo","mantenimiento deportivo"]
},

{
codigo:"TIP-DEP-003",
nombre:"Cancha múltiple",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción o adecuación de cancha múltiple para práctica de diferentes disciplinas deportivas.",
problemaCentral:"Insuficiente disponibilidad de canchas múltiples adecuadas para la práctica deportiva comunitaria.",
objetivoGeneral:"Mejorar la disponibilidad de canchas múltiples adecuadas para la práctica deportiva comunitaria.",
poblaciones:["POB-TER-003","POB-SEC-004","POB-CV-003","POB-CV-004"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Falta de espacios deportivos multifuncionales.","Limitadas condiciones de superficie, demarcación y dotación."],
causasIndirectas:["Alta demanda comunitaria de espacios deportivos.","Baja inversión en infraestructura barrial o rural."],
efectosDirectos:["Menor acceso a prácticas deportivas organizadas.","Uso de espacios improvisados o inseguros."],
efectosIndirectos:["Menor integración comunitaria y aprovechamiento del tiempo libre.","Aumento de hábitos sedentarios."],
objetivosEspecificos:["Construir o adecuar cancha múltiple.","Instalar demarcación, arcos, tableros y elementos complementarios.","Garantizar condiciones seguras y funcionales de uso."],
beneficios:"La comunidad contará con un espacio multifuncional para varias disciplinas deportivas.",
sostenibilidad:"Dependerá de mantenimiento, cuidado comunitario, programación de uso e intervención oportuna de daños.",
palabrasClave:["cancha múltiple","baloncesto","microfútbol","voleibol","placa deportiva"]
},

{
codigo:"TIP-DEP-004",
nombre:"Cancha sintética",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a la construcción, adecuación o mejoramiento de canchas sintéticas.",
problemaCentral:"Limitado acceso de la comunidad a escenarios adecuados para la práctica segura del fútbol y actividades recreativas.",
objetivoGeneral:"Mejorar el acceso de la comunidad a escenarios adecuados para la práctica segura del fútbol y actividades recreativas.",
poblaciones:["POB-TER-003","POB-SEC-004","POB-CV-004"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Escenarios de fútbol insuficientes o en mal estado.","Ausencia de superficie adecuada, cerramiento, drenaje o iluminación."],
causasIndirectas:["Alta demanda de espacios deportivos para fútbol.","Limitado mantenimiento de canchas existentes."],
efectosDirectos:["Baja calidad y seguridad en la práctica deportiva.","Restricción de actividades formativas y recreativas."],
efectosIndirectos:["Menor participación juvenil y comunitaria en deporte.","Pérdida de oportunidades de formación deportiva."],
objetivosEspecificos:["Construir o adecuar cancha sintética.","Implementar drenaje, cerramiento, iluminación y dotación complementaria.","Promover el uso organizado del escenario."],
beneficios:"La comunidad dispondrá de un escenario moderno y seguro para fútbol, recreación y formación deportiva.",
sostenibilidad:"Requiere mantenimiento especializado del césped sintético, control de uso, limpieza y reposición periódica.",
palabrasClave:["cancha sintética","fútbol","césped sintético","escenario deportivo","cancha de fútbol"]
},

{
codigo:"TIP-DEP-005",
nombre:"Coliseo cubierto",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, mejoramiento o dotación de coliseos cubiertos para eventos deportivos, recreativos y comunitarios.",
problemaCentral:"Insuficiente disponibilidad de infraestructura cubierta para actividades deportivas, recreativas y comunitarias.",
objetivoGeneral:"Mejorar la disponibilidad de infraestructura cubierta para actividades deportivas, recreativas y comunitarias.",
poblaciones:["POB-TER-003","POB-SEC-004"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001","PRO-SER-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-PRO-030","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia de escenarios cubiertos para deporte y eventos.","Deterioro o inexistencia de cubierta, graderías, iluminación y servicios complementarios."],
causasIndirectas:["Alta demanda de escenarios multipropósito.","Limitada inversión en infraestructura deportiva de mayor capacidad."],
efectosDirectos:["Restricción de actividades deportivas en condiciones climáticas adversas.","Baja capacidad para eventos deportivos y comunitarios."],
efectosIndirectos:["Menor integración comunitaria y desarrollo deportivo.","Pérdida de oportunidades para eventos y formación."],
objetivosEspecificos:["Construir o mejorar el coliseo cubierto.","Dotar espacios deportivos y complementarios.","Garantizar condiciones de seguridad, accesibilidad y funcionalidad."],
beneficios:"El municipio contará con infraestructura cubierta para deporte, recreación, eventos e integración comunitaria.",
sostenibilidad:"Dependerá del modelo de administración, mantenimiento de cubierta, iluminación, servicios y programación de uso.",
palabrasClave:["coliseo","coliseo cubierto","escenario cubierto","deporte","eventos"]
},

{
codigo:"TIP-DEP-006",
nombre:"Parque biosaludable",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, adecuación o dotación de parques biosaludables y gimnasios al aire libre.",
problemaCentral:"Limitado acceso de la población a espacios gratuitos y adecuados para actividad física y promoción de hábitos saludables.",
objetivoGeneral:"Mejorar el acceso de la población a espacios gratuitos y adecuados para actividad física y promoción de hábitos saludables.",
poblaciones:["POB-TER-003","POB-CV-006","POB-CV-004"],
productos:["PRO-INF-005","PRO-DOT-004","PRO-SER-002"],
actividades:["ACT-PLA-001","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-EJE-005","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-005","IND-PRO-013","IND-PRO-031","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia de espacios de actividad física al aire libre.","Baja disponibilidad de equipos biosaludables y orientación comunitaria."],
causasIndirectas:["Bajos hábitos de actividad física en la población.","Limitada inversión en espacios recreativos de proximidad."],
efectosDirectos:["Sedentarismo y menor práctica de actividad física.","Baja apropiación del espacio público saludable."],
efectosIndirectos:["Aumento de riesgos asociados a enfermedades crónicas.","Menor bienestar físico y social."],
objetivosEspecificos:["Instalar equipos biosaludables y adecuar espacio público.","Promover actividad física y hábitos saludables.","Garantizar accesibilidad y seguridad de los usuarios."],
beneficios:"La población contará con espacios para actividad física, recreación y bienestar, especialmente adultos mayores y comunidad general.",
sostenibilidad:"Dependerá del mantenimiento de equipos, cuidado ciudadano, inspección periódica y programación de actividades saludables.",
palabrasClave:["parque biosaludable","gimnasio al aire libre","actividad física","hábitos saludables"]
},

{
codigo:"TIP-DEP-007",
nombre:"Escuelas de formación deportiva",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer escuelas deportivas, procesos de formación, entrenadores, dotación e implementación.",
problemaCentral:"Limitado acceso de niños, niñas, adolescentes y jóvenes a procesos de formación deportiva estructurados.",
objetivoGeneral:"Fortalecer el acceso de niños, niñas, adolescentes y jóvenes a procesos de formación deportiva estructurados.",
poblaciones:["POB-CV-002","POB-CV-003","POB-CV-004","POB-SEC-004"],
productos:["PRO-SER-002","PRO-FOR-001","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-004","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-020","IND-PRO-013","IND-RES-002","IND-IMP-001","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja cobertura de escuelas deportivas.","Limitada disponibilidad de entrenadores, dotación e implementación deportiva."],
causasIndirectas:["Insuficiente continuidad presupuestal para formación deportiva.","Débil articulación con instituciones educativas y clubes."],
efectosDirectos:["Menor desarrollo de habilidades deportivas en población joven.","Pérdida de oportunidades de uso positivo del tiempo libre."],
efectosIndirectos:["Aumento de exposición a riesgos sociales.","Menor talento deportivo identificado y acompañado."],
objetivosEspecificos:["Implementar escuelas de formación deportiva.","Dotar implementos y materiales deportivos.","Fortalecer entrenadores, seguimiento y participación de beneficiarios."],
beneficios:"Niños, niñas, adolescentes y jóvenes accederán a formación deportiva, disciplina, integración y hábitos saludables.",
sostenibilidad:"Dependerá de continuidad de entrenadores, dotación, alianzas educativas, seguimiento de beneficiarios y calendario deportivo.",
palabrasClave:["escuelas deportivas","formación deportiva","entrenadores","niños","jóvenes"]
},

{
codigo:"TIP-DEP-008",
nombre:"Dotación deportiva",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para adquirir implementos, uniformes, equipos y elementos deportivos para escenarios, escuelas o programas.",
problemaCentral:"Insuficiente dotación deportiva para desarrollar programas, prácticas y eventos deportivos.",
objetivoGeneral:"Fortalecer la dotación deportiva para desarrollar programas, prácticas y eventos deportivos.",
poblaciones:["POB-SEC-004","POB-CV-002","POB-CV-003","POB-CV-004","POB-TER-003"],
productos:["PRO-DOT-001","PRO-DOT-004"],
actividades:["ACT-PLA-003","ACT-EJE-003","ACT-CTL-002","ACT-CIE-001"],
indicadores:["IND-PRO-010","IND-PRO-013","IND-RES-003","IND-GES-001"],
riesgos:["RIE-FIN-001","RIE-CON-001","RIE-CON-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia de implementos y equipos deportivos.","Desgaste u obsolescencia de dotación existente."],
causasIndirectas:["Crecimiento de beneficiarios y programas deportivos.","Baja reposición periódica de implementos."],
efectosDirectos:["Limitaciones para prácticas deportivas seguras y continuas.","Menor calidad de programas y eventos deportivos."],
efectosIndirectos:["Desmotivación de participantes y entrenadores.","Reducción de cobertura y continuidad deportiva."],
objetivosEspecificos:["Adquirir implementos y equipos deportivos requeridos.","Fortalecer programas y escenarios con dotación adecuada.","Garantizar control, inventario y uso eficiente de los bienes."],
beneficios:"Los programas deportivos contarán con implementos adecuados para prácticas, formación y eventos.",
sostenibilidad:"Requiere inventario, custodia, mantenimiento, reposición programada y control de uso de la dotación.",
palabrasClave:["dotación deportiva","implementos deportivos","uniformes","balones","equipos deportivos"]
},

{
codigo:"TIP-DEP-009",
nombre:"Eventos deportivos y recreativos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para organizar eventos deportivos, recreativos, torneos y actividades comunitarias.",
problemaCentral:"Baja oferta de eventos deportivos y recreativos que promuevan participación comunitaria y aprovechamiento del tiempo libre.",
objetivoGeneral:"Incrementar la oferta de eventos deportivos y recreativos que promuevan participación comunitaria y aprovechamiento del tiempo libre.",
poblaciones:["POB-TER-003","POB-SEC-004","POB-CV-004","POB-CV-003"],
productos:["PRO-SER-002","PRO-SER-003","PRO-DOT-004"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-003","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-032","IND-PRO-013","IND-RES-001","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiente programación de actividades deportivas y recreativas.","Limitada logística, dotación y apoyo para eventos comunitarios."],
causasIndirectas:["Baja articulación con clubes, instituciones educativas y organizaciones comunitarias.","Limitados recursos para promoción del deporte y recreación."],
efectosDirectos:["Menor participación comunitaria en deporte y recreación.","Bajo aprovechamiento del tiempo libre."],
efectosIndirectos:["Debilitamiento de integración social y hábitos saludables.","Mayor exposición de jóvenes a riesgos sociales."],
objetivosEspecificos:["Organizar eventos deportivos y recreativos comunitarios.","Fortalecer logística, implementación y participación ciudadana.","Promover hábitos saludables e integración social."],
beneficios:"La comunidad contará con mayor oferta de actividades deportivas, recreativas y de integración.",
sostenibilidad:"Dependerá de programación anual, alianzas comunitarias, apoyo institucional y seguimiento de participación.",
palabrasClave:["eventos deportivos","torneos","recreación","actividades deportivas","tiempo libre"]
},

{
codigo:"TIP-DEP-010",
nombre:"Recreación y aprovechamiento del tiempo libre",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto de programas recreativos, actividad física y uso positivo del tiempo libre para diferentes grupos poblacionales.",
problemaCentral:"Limitadas oportunidades de recreación y aprovechamiento positivo del tiempo libre para la población.",
objetivoGeneral:"Ampliar las oportunidades de recreación y aprovechamiento positivo del tiempo libre para la población.",
poblaciones:["POB-TER-003","POB-CV-002","POB-CV-003","POB-CV-004","POB-CV-006"],
productos:["PRO-SER-002","PRO-SER-003","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-009","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-032","IND-PRO-020","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja oferta de programas recreativos permanentes.","Insuficiente personal, logística y espacios para actividades recreativas."],
causasIndirectas:["Débil cultura de actividad física y recreación.","Limitada coordinación con comunidad e instituciones."],
efectosDirectos:["Sedentarismo y bajo aprovechamiento del tiempo libre.","Menor integración familiar y comunitaria."],
efectosIndirectos:["Aumento de riesgos sociales y de salud.","Debilitamiento de convivencia y bienestar comunitario."],
objetivosEspecificos:["Implementar programas recreativos y de actividad física.","Desarrollar actividades diferenciadas por grupos poblacionales.","Promover hábitos saludables, convivencia e integración."],
beneficios:"La población tendrá mayor acceso a recreación, actividad física, convivencia y bienestar.",
sostenibilidad:"Se soportará en programación continua, monitores, alianzas comunitarias e institucionales y seguimiento de beneficiarios.",
palabrasClave:["recreación","tiempo libre","actividad física","bienestar","convivencia"]
},

{
codigo:"TIP-DEP-011",
nombre:"Escenarios deportivos rurales",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, mejoramiento o dotación de escenarios deportivos en zonas rurales.",
problemaCentral:"Insuficiente disponibilidad de escenarios deportivos adecuados en zonas rurales.",
objetivoGeneral:"Mejorar la disponibilidad de escenarios deportivos adecuados en zonas rurales.",
poblaciones:["POB-TER-001","POB-TER-003","POB-SEC-004"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Escasez de escenarios deportivos en veredas o centros poblados.","Deterioro o falta de dotación de espacios deportivos rurales."],
causasIndirectas:["Dispersión poblacional y limitada inversión rural.","Dificultad de acceso a escenarios urbanos."],
efectosDirectos:["Baja participación deportiva rural.","Menor oferta de recreación y uso positivo del tiempo libre."],
efectosIndirectos:["Incremento de brechas urbano-rurales en deporte y recreación.","Menor integración comunitaria rural."],
objetivosEspecificos:["Construir o mejorar escenarios deportivos rurales.","Dotar elementos básicos para la práctica deportiva.","Promover actividades deportivas y recreativas rurales."],
beneficios:"La población rural contará con espacios adecuados para deporte, recreación e integración comunitaria.",
sostenibilidad:"Dependerá de cuidado comunitario, mantenimiento, programación de actividades y apoyo institucional.",
palabrasClave:["deporte rural","escenario rural","cancha veredal","vereda","recreación rural"]
},

{
codigo:"TIP-DEP-012",
nombre:"Pista atlética",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, mejoramiento o dotación de pistas atléticas y espacios para atletismo.",
problemaCentral:"Limitado acceso a infraestructura adecuada para la práctica del atletismo y actividad física organizada.",
objetivoGeneral:"Mejorar el acceso a infraestructura adecuada para la práctica del atletismo y actividad física organizada.",
poblaciones:["POB-SEC-004","POB-CV-004","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-DOT-001"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-010","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Inexistencia o deterioro de pistas y espacios para atletismo.","Limitada dotación e infraestructura especializada para entrenamiento."],
causasIndirectas:["Baja inversión en disciplinas deportivas especializadas.","Insuficiente planificación de escenarios deportivos."],
efectosDirectos:["Limitaciones para formación y práctica del atletismo.","Menor preparación de deportistas y comunidad usuaria."],
efectosIndirectos:["Pérdida de oportunidades de competencia y talento deportivo.","Menor promoción de actividad física saludable."],
objetivosEspecificos:["Construir o mejorar pista atlética.","Dotar elementos requeridos para práctica y entrenamiento.","Promover el uso deportivo y comunitario del escenario."],
beneficios:"Deportistas y comunidad accederán a infraestructura adecuada para atletismo y actividad física.",
sostenibilidad:"Requiere mantenimiento de superficie, control de uso, dotación y programación deportiva.",
palabrasClave:["pista atlética","atletismo","deportistas","entrenamiento","actividad física"]
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

window.PlantillasDeporte = PlantillasDeporte;
