// =====================================
// PLANTILLAS/VIVIENDA.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Vivienda
// =====================================

const PlantillasVivienda = (()=>{

const SECTOR = "Vivienda";
const SECTOR_CODIGO = "SEC-INF-003";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-SOC-001","RIE-AMB-001"],
    normasBase: ["NOR-VIV-001","NOR-VIV-002","NOR-CON-001","NOR-CON-003","NOR-GEN-002"],
    fuentesBase: ["FUE-PUB-001","FUE-NAC-001","FUE-NAC-003","FUE-COO-002"]
};

const tipologias = [

{
codigo:"TIP-VIV-001",
nombre:"Construcción de vivienda nueva",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construir soluciones de vivienda nueva para hogares en condición de déficit habitacional.",
problemaCentral:"Insuficiente acceso de hogares vulnerables a soluciones de vivienda digna, segura y adecuada.",
objetivoGeneral:"Mejorar el acceso de hogares vulnerables a soluciones de vivienda digna, segura y adecuada.",
poblaciones:["POB-TER-003","POB-VUL-003","POB-VUL-002"],
productos:["PRO-INF-001","PRO-SER-001","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-030","IND-PRO-020","IND-RES-001","IND-RES-002","IND-GES-001","IND-GES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Déficit cuantitativo de vivienda en hogares vulnerables.","Baja capacidad económica de los hogares para acceder a vivienda formal."],
causasIndirectas:["Limitada disponibilidad de suelo urbanizado o habilitado.","Insuficiente acceso a subsidios, financiación o programas habitacionales."],
efectosDirectos:["Hacinamiento, informalidad o permanencia en viviendas inadecuadas.","Aumento de vulnerabilidad social y riesgos habitacionales."],
efectosIndirectos:["Deterioro de la calidad de vida familiar.","Incremento de asentamientos informales y presión sobre servicios públicos."],
objetivosEspecificos:["Construir soluciones de vivienda nueva para hogares beneficiarios.","Fortalecer la gestión social y acompañamiento a hogares.","Garantizar condiciones técnicas, urbanísticas y habitacionales adecuadas."],
beneficios:"Los hogares beneficiarios accederán a vivienda digna, segura y adecuada, mejorando su calidad de vida.",
sostenibilidad:"Dependerá de la legalización, entrega formal, acceso a servicios públicos, acompañamiento social y mantenimiento de las viviendas.",
palabrasClave:["vivienda nueva","casa","solución habitacional","déficit vivienda","subsidio vivienda"]
},

{
codigo:"TIP-VIV-002",
nombre:"Mejoramiento de vivienda",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para mejorar condiciones físicas, sanitarias, estructurales o funcionales de viviendas existentes.",
problemaCentral:"Deficientes condiciones habitacionales de viviendas ocupadas por hogares vulnerables.",
objetivoGeneral:"Mejorar las condiciones habitacionales de viviendas ocupadas por hogares vulnerables.",
poblaciones:["POB-TER-003","POB-VUL-003","POB-TER-001"],
productos:["PRO-INF-002","PRO-DOT-004","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-002","IND-PRO-013","IND-PRO-030","IND-RES-003","IND-RES-001","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Deterioro físico, sanitario o funcional de viviendas.","Insuficiencia de recursos de hogares para ejecutar mejoras habitacionales."],
causasIndirectas:["Antigüedad de las viviendas y uso de materiales precarios.","Débil acceso a programas de mejoramiento habitacional."],
efectosDirectos:["Afectación de salud, seguridad y bienestar de los hogares.","Persistencia de condiciones de habitabilidad inadecuadas."],
efectosIndirectos:["Incremento de vulnerabilidad social y riesgo familiar.","Deterioro del entorno habitacional."],
objetivosEspecificos:["Ejecutar mejoras físicas, sanitarias o funcionales en viviendas.","Priorizar hogares vulnerables con condiciones habitacionales críticas.","Fortalecer acompañamiento técnico y social a beneficiarios."],
beneficios:"Los hogares beneficiarios mejorarán sus condiciones de habitabilidad, salubridad y seguridad.",
sostenibilidad:"Dependerá del uso adecuado de las mejoras, mantenimiento del hogar, acompañamiento social y control técnico de intervenciones.",
palabrasClave:["mejoramiento de vivienda","vivienda digna","habitabilidad","baños","cubierta","pisos"]
},

{
codigo:"TIP-VIV-003",
nombre:"Vivienda rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construir o mejorar viviendas rurales para hogares campesinos o población rural vulnerable.",
problemaCentral:"Deficientes condiciones de vivienda de hogares rurales que afectan su calidad de vida y bienestar.",
objetivoGeneral:"Mejorar las condiciones de vivienda de hogares rurales para fortalecer calidad de vida y bienestar.",
poblaciones:["POB-TER-001","POB-SEC-005","POB-VUL-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-030","IND-RES-001","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Viviendas rurales con materiales precarios o condiciones inadecuadas.","Dificultades de acceso a soluciones habitacionales en zonas dispersas."],
causasIndirectas:["Baja capacidad económica de hogares rurales.","Limitaciones logísticas y técnicas para intervención en zonas rurales."],
efectosDirectos:["Persistencia de déficit habitacional rural.","Afectación de salud, seguridad y bienestar de familias rurales."],
efectosIndirectos:["Incremento de brechas urbano-rurales.","Menor arraigo y calidad de vida en el campo."],
objetivosEspecificos:["Construir o mejorar soluciones de vivienda rural.","Garantizar condiciones técnicas y sanitarias apropiadas para el entorno rural.","Acompañar social y técnicamente a hogares beneficiarios."],
beneficios:"Los hogares rurales contarán con viviendas más seguras, dignas y adecuadas a su contexto territorial.",
sostenibilidad:"Dependerá de participación del hogar, mantenimiento, acceso a servicios básicos y acompañamiento institucional.",
palabrasClave:["vivienda rural","campo","campesino","mejoramiento rural","vivienda campesina"]
},

{
codigo:"TIP-VIV-004",
nombre:"Titulación y legalización de predios",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para adelantar procesos de titulación, saneamiento, legalización urbanística o regularización de predios.",
problemaCentral:"Limitada seguridad jurídica sobre la tenencia de predios y viviendas de hogares vulnerables.",
objetivoGeneral:"Fortalecer la seguridad jurídica sobre la tenencia de predios y viviendas de hogares vulnerables.",
poblaciones:["POB-TER-003","POB-VUL-003"],
productos:["PRO-GES-003","PRO-SER-001","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-042","IND-PRO-030","IND-PRO-023","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Predios o viviendas sin título formal o con situación jurídica irregular.","Débil capacidad institucional y comunitaria para procesos de formalización."],
causasIndirectas:["Crecimiento urbano informal o rural sin saneamiento predial.","Bajos recursos de hogares para adelantar trámites jurídicos y técnicos."],
efectosDirectos:["Dificultad para acceder a subsidios, créditos o mejoramientos.","Inseguridad jurídica y conflictos de tenencia."],
efectosIndirectos:["Persistencia de informalidad urbana o rural.","Limitación para inversión pública o privada en vivienda y hábitat."],
objetivosEspecificos:["Identificar y caracterizar predios susceptibles de formalización.","Acompañar procesos técnicos, jurídicos y administrativos de titulación.","Fortalecer la seguridad jurídica de hogares beneficiarios."],
beneficios:"Los hogares beneficiarios tendrán mayor seguridad jurídica sobre sus predios y viviendas.",
sostenibilidad:"Requiere actualización catastral, archivo documental, acompañamiento jurídico y coordinación institucional.",
palabrasClave:["titulación","legalización predios","saneamiento predial","formalización","escrituras"]
},

{
codigo:"TIP-VIV-005",
nombre:"Reasentamiento de hogares en riesgo",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para reasentar hogares ubicados en zonas de alto riesgo no mitigable o áreas no aptas para vivienda.",
problemaCentral:"Hogares ubicados en zonas de alto riesgo no mitigable o áreas no aptas para vivienda.",
objetivoGeneral:"Reducir la exposición de hogares ubicados en zonas de alto riesgo mediante procesos de reasentamiento seguro.",
poblaciones:["POB-VUL-003","POB-TER-003"],
productos:["PRO-INF-001","PRO-SER-001","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-PLA-003","ACT-EJE-001","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-001","IND-PRO-030","IND-PRO-023","IND-RES-002","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-AMB-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Ocupación de zonas expuestas a amenaza o riesgo no mitigable.","Insuficiente disponibilidad de soluciones habitacionales seguras."],
causasIndirectas:["Crecimiento informal y limitaciones de acceso a suelo seguro.","Débil control urbanístico y gestión preventiva del riesgo."],
efectosDirectos:["Alta exposición de hogares a eventos de desastre.","Pérdida potencial de vidas, bienes y estabilidad familiar."],
efectosIndirectos:["Incremento de costos por emergencias y atención humanitaria.","Deterioro ambiental y urbano en zonas de riesgo."],
objetivosEspecificos:["Identificar hogares en alto riesgo no mitigable.","Gestionar soluciones habitacionales seguras para reasentamiento.","Acompañar socialmente el traslado y adaptación de los hogares."],
beneficios:"Los hogares beneficiarios reducirán su exposición al riesgo y accederán a vivienda segura.",
sostenibilidad:"Dependerá de control de reocupación, acompañamiento social, legalización de nuevas soluciones y gestión del suelo liberado.",
palabrasClave:["reasentamiento","alto riesgo","reubicación","vivienda segura","riesgo no mitigable"]
},

{
codigo:"TIP-VIV-006",
nombre:"Mejoramiento integral de barrios",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para mejorar integralmente barrios mediante intervenciones de hábitat, espacio público, servicios, movilidad y gestión social.",
problemaCentral:"Deficientes condiciones urbanas, habitacionales y de entorno en barrios con vulnerabilidad social.",
objetivoGeneral:"Mejorar las condiciones urbanas, habitacionales y de entorno en barrios con vulnerabilidad social.",
poblaciones:["POB-TER-002","POB-TER-003","POB-VUL-003"],
productos:["PRO-INF-002","PRO-INF-005","PRO-SER-001","PRO-GES-003","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-PLA-004","ACT-EJE-001","ACT-EJE-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-001","ACT-CIE-003"],
indicadores:["IND-PRO-002","IND-PRO-005","IND-PRO-030","IND-PRO-042","IND-PRO-020","IND-RES-002","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Déficit de infraestructura urbana, espacio público y servicios en barrios vulnerables.","Baja calidad del entorno habitacional y comunitario."],
causasIndirectas:["Crecimiento urbano informal o no planificado.","Limitada inversión integral en hábitat y equipamientos urbanos."],
efectosDirectos:["Deterioro de calidad de vida y seguridad del entorno.","Limitado acceso a servicios, movilidad y espacios comunitarios."],
efectosIndirectos:["Incremento de segregación urbana y brechas sociales.","Debilitamiento del tejido social y la apropiación comunitaria."],
objetivosEspecificos:["Mejorar infraestructura y entorno urbano del barrio.","Fortalecer espacio público, movilidad y servicios complementarios.","Implementar acciones sociales de apropiación y convivencia."],
beneficios:"La comunidad contará con mejores condiciones de hábitat, espacio público, movilidad y bienestar barrial.",
sostenibilidad:"Requiere mantenimiento comunitario e institucional, control urbanístico, gestión social y apropiación del espacio público.",
palabrasClave:["mejoramiento integral de barrios","hábitat","barrio","espacio público","entorno urbano"]
},

{
codigo:"TIP-VIV-007",
nombre:"Subsidios de vivienda",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para otorgar, cofinanciar o gestionar subsidios de vivienda nueva, mejoramiento o arrendamiento temporal.",
problemaCentral:"Limitada capacidad económica de hogares vulnerables para acceder a soluciones de vivienda.",
objetivoGeneral:"Fortalecer el acceso de hogares vulnerables a soluciones de vivienda mediante subsidios o apoyos habitacionales.",
poblaciones:["POB-VUL-003","POB-VUL-002","POB-TER-003"],
productos:["PRO-SER-001","PRO-GES-003","PRO-FOR-004"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-005","ACT-EJE-004","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-030","IND-PRO-042","IND-PRO-023","IND-RES-001","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Hogares con ingresos insuficientes para adquirir o mejorar vivienda.","Bajo acceso a instrumentos de financiación habitacional."],
causasIndirectas:["Altos costos de vivienda formal.","Baja bancarización o capacidad de ahorro de hogares vulnerables."],
efectosDirectos:["Persistencia del déficit habitacional.","Permanencia en condiciones de vivienda inadecuadas o inestables."],
efectosIndirectos:["Aumento de vulnerabilidad social y económica.","Mayor dependencia de soluciones informales o precarias."],
objetivosEspecificos:["Identificar y priorizar hogares beneficiarios.","Gestionar y asignar subsidios o apoyos habitacionales.","Acompañar el acceso efectivo a soluciones de vivienda."],
beneficios:"Los hogares beneficiarios tendrán mayor capacidad para acceder a soluciones habitacionales dignas.",
sostenibilidad:"Dependerá de criterios transparentes, seguimiento a beneficiarios, articulación con programas nacionales y cierre financiero de las soluciones.",
palabrasClave:["subsidio vivienda","apoyo habitacional","vivienda nueva","mejoramiento","arrendamiento"]
},

{
codigo:"TIP-VIV-008",
nombre:"Vivienda saludable",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para mejorar condiciones sanitarias, ambientales y de habitabilidad dentro de viviendas vulnerables.",
problemaCentral:"Deficientes condiciones sanitarias y ambientales en viviendas que afectan la salud y bienestar de los hogares.",
objetivoGeneral:"Mejorar las condiciones sanitarias y ambientales en viviendas vulnerables para proteger la salud y bienestar de los hogares.",
poblaciones:["POB-TER-001","POB-TER-003","POB-VUL-003","POB-CV-001","POB-CV-006"],
productos:["PRO-INF-002","PRO-DOT-004","PRO-FOR-001","PRO-SER-004"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-EJE-002","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-002","IND-PRO-013","IND-PRO-020","IND-PRO-033","IND-RES-001","IND-IMP-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Viviendas con pisos, cocinas, baños, ventilación o manejo de residuos inadecuados.","Baja educación sanitaria y ambiental en el hogar."],
causasIndirectas:["Pobreza, precariedad habitacional y falta de acceso a servicios básicos.","Limitada asistencia técnica para hábitos saludables en vivienda."],
efectosDirectos:["Aumento de enfermedades respiratorias, gastrointestinales o asociadas al entorno doméstico.","Deterioro de condiciones de bienestar familiar."],
efectosIndirectos:["Mayor presión sobre servicios de salud.","Persistencia de vulnerabilidad y baja calidad de vida."],
objetivosEspecificos:["Mejorar condiciones físicas y sanitarias de viviendas.","Dotar elementos básicos de vivienda saludable cuando aplique.","Promover prácticas saludables y ambientales en el hogar."],
beneficios:"Los hogares reducirán riesgos sanitarios y mejorarán bienestar, habitabilidad y salud familiar.",
sostenibilidad:"Dependerá de educación familiar, mantenimiento de mejoras, uso adecuado de elementos y seguimiento comunitario.",
palabrasClave:["vivienda saludable","sanitario","habitabilidad","salud hogar","mejoramiento"]
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

window.PlantillasVivienda = PlantillasVivienda;
