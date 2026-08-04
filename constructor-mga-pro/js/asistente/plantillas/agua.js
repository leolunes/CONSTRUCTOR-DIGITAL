// =====================================
// PLANTILLAS/AGUA.JS
// CONSTRUCTOR MGA PRO
// Biblioteca de tipologías sector Agua Potable y Saneamiento Básico
// =====================================

const PlantillasAgua = (()=>{

const SECTOR = "Agua Potable y Saneamiento Básico";
const SECTOR_CODIGO = "SEC-INF-002";

const comunes = {
    riesgos: ["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-CON-001","RIE-CON-002","RIE-AMB-002"],
    normasBase: ["NOR-AGU-001","NOR-AGU-002","NOR-AGU-003","NOR-CON-001","NOR-CON-003"],
    fuentesBase: ["FUE-PUB-001","FUE-PUB-005","FUE-NAC-001","FUE-NAC-003","FUE-COO-002"]
};

const tipologias = [

{
codigo:"TIP-AGU-001",
nombre:"Construcción de acueducto",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado a construir sistemas de acueducto para garantizar acceso a agua potable.",
problemaCentral:"Insuficiente acceso de la población a agua potable en condiciones de continuidad, calidad y cobertura.",
objetivoGeneral:"Mejorar el acceso de la población a agua potable en condiciones de continuidad, calidad y cobertura.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-001","PRO-DOT-002","PRO-SER-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-011","IND-PRO-030","IND-RES-001","IND-RES-002","IND-GES-001","IND-GES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Inexistencia o insuficiencia de infraestructura de captación, tratamiento, conducción y distribución.","Baja capacidad para garantizar agua apta para consumo humano."],
causasIndirectas:["Crecimiento de la demanda de agua potable.","Limitada inversión en infraestructura de servicios públicos."],
efectosDirectos:["Consumo de agua no segura o de fuentes no mejoradas.","Aumento de enfermedades asociadas al agua."],
efectosIndirectos:["Deterioro de la calidad de vida y salud pública.","Incremento de brechas territoriales en acceso a servicios básicos."],
objetivosEspecificos:["Construir infraestructura de captación, tratamiento, almacenamiento y distribución.","Fortalecer la calidad y continuidad del servicio de agua potable.","Mejorar la capacidad operativa del sistema de acueducto."],
beneficios:"La población beneficiaria accederá a agua potable segura, continua y con mejores condiciones sanitarias.",
sostenibilidad:"Dependerá de la operación del prestador, mantenimiento, control de calidad del agua, recaudo tarifario y protección de fuentes hídricas.",
palabrasClave:["acueducto","agua potable","red de agua","abastecimiento","captación"]
},

{
codigo:"TIP-AGU-002",
nombre:"Optimización de acueducto",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto de mejoramiento, rehabilitación u optimización de sistemas existentes de acueducto.",
problemaCentral:"Deficientes condiciones operativas del sistema de acueducto que afectan continuidad, calidad y cobertura.",
objetivoGeneral:"Mejorar las condiciones operativas del sistema de acueducto para fortalecer continuidad, calidad y cobertura.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-002","PRO-INF-003","PRO-DOT-002"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-002","IND-PRO-003","IND-PRO-011","IND-RES-003","IND-RES-004","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Deterioro, obsolescencia o baja capacidad de componentes del sistema.","Pérdidas de agua, fallas operativas o interrupciones del servicio."],
causasIndirectas:["Mantenimiento insuficiente del sistema.","Crecimiento de usuarios y demanda del servicio."],
efectosDirectos:["Intermitencia del servicio de agua potable.","Aumento de pérdidas técnicas y operativas."],
efectosIndirectos:["Afectación de salud pública y bienestar.","Incremento de costos de operación y mantenimiento."],
objetivosEspecificos:["Rehabilitar u optimizar componentes del sistema de acueducto.","Reducir pérdidas y mejorar eficiencia operativa.","Fortalecer la continuidad y calidad del servicio."],
beneficios:"Se mejorará la continuidad, eficiencia y confiabilidad del sistema de acueducto.",
sostenibilidad:"Requiere mantenimiento preventivo, gestión comercial, reducción de pérdidas, control de calidad y fortalecimiento del prestador.",
palabrasClave:["optimización acueducto","mejoramiento acueducto","red de agua","pérdidas","continuidad"]
},

{
codigo:"TIP-AGU-003",
nombre:"Redes de distribución de agua potable",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, reposición, ampliación o sectorización de redes de distribución de agua potable.",
problemaCentral:"Deficientes condiciones de las redes de distribución que limitan el acceso continuo y eficiente al agua potable.",
objetivoGeneral:"Mejorar las condiciones de las redes de distribución para garantizar acceso continuo y eficiente al agua potable.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-INF-004"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-004","IND-RES-001","IND-RES-004","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Redes insuficientes, deterioradas o con baja capacidad hidráulica.","Alta frecuencia de fugas, rupturas o bajas presiones."],
causasIndirectas:["Antigüedad de redes y materiales obsoletos.","Expansión urbana o rural sin infraestructura suficiente."],
efectosDirectos:["Interrupciones y baja presión en el servicio.","Pérdidas de agua y mayor riesgo de contaminación."],
efectosIndirectos:["Mayor costo de operación del sistema.","Afectación de la calidad de vida y salud pública."],
objetivosEspecificos:["Construir, reponer o ampliar redes de distribución.","Mejorar presión, continuidad y eficiencia hidráulica.","Reducir pérdidas y riesgos de contaminación."],
beneficios:"Los usuarios tendrán mejor presión, continuidad y cobertura del servicio de agua potable.",
sostenibilidad:"Dependerá de mantenimiento de redes, catastro actualizado, control de pérdidas y operación técnica del prestador.",
palabrasClave:["redes de acueducto","distribución agua","tubería","red de agua","sectorización"]
},

{
codigo:"TIP-AGU-004",
nombre:"Planta de Tratamiento de Agua Potable - PTAP",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, optimización, ampliación o dotación de plantas de tratamiento de agua potable.",
problemaCentral:"Insuficiente capacidad de tratamiento de agua para garantizar calidad apta para consumo humano.",
objetivoGeneral:"Fortalecer la capacidad de tratamiento de agua para garantizar calidad apta para consumo humano.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-INF-004","PRO-DOT-002"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-004","IND-PRO-011","IND-RES-003","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Planta inexistente, insuficiente o con procesos de tratamiento inadecuados.","Déficit de equipos, insumos o control de calidad del agua."],
causasIndirectas:["Variabilidad de la calidad de la fuente hídrica.","Limitada inversión en operación y mantenimiento."],
efectosDirectos:["Riesgo de suministro de agua no apta para consumo.","Incumplimiento de parámetros de calidad del agua."],
efectosIndirectos:["Incremento de enfermedades de origen hídrico.","Afectación de confianza ciudadana en el servicio."],
objetivosEspecificos:["Construir, optimizar o ampliar la PTAP.","Dotar equipos y sistemas de control requeridos.","Fortalecer la calidad del agua suministrada."],
beneficios:"La población recibirá agua tratada con mejores condiciones de calidad y seguridad sanitaria.",
sostenibilidad:"Requiere operador capacitado, insumos químicos, mantenimiento, monitoreo de calidad y financiación de operación.",
palabrasClave:["ptap","planta tratamiento agua potable","tratamiento agua","calidad agua","potabilización"]
},

{
codigo:"TIP-AGU-005",
nombre:"Construcción de alcantarillado sanitario",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción o ampliación de redes de alcantarillado sanitario y estructuras complementarias.",
problemaCentral:"Insuficiente acceso de la población a sistemas adecuados de recolección y transporte de aguas residuales.",
objetivoGeneral:"Mejorar el acceso de la población a sistemas adecuados de recolección y transporte de aguas residuales.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-004"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-004","IND-RES-001","IND-RES-002","IND-GES-001","IND-GES-002"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Inexistencia o insuficiencia de redes de alcantarillado sanitario.","Vertimientos domésticos sin adecuada recolección."],
causasIndirectas:["Crecimiento poblacional sin expansión de infraestructura sanitaria.","Limitada inversión en saneamiento básico."],
efectosDirectos:["Contaminación del suelo, cuerpos de agua y entorno urbano o rural.","Aumento de riesgos sanitarios y enfermedades."],
efectosIndirectos:["Deterioro ambiental y afectación de salud pública.","Reducción de calidad de vida y habitabilidad."],
objetivosEspecificos:["Construir o ampliar redes de alcantarillado sanitario.","Mejorar la recolección y transporte de aguas residuales.","Reducir vertimientos inadecuados y riesgos sanitarios."],
beneficios:"La población contará con mejores condiciones sanitarias y ambientales mediante recolección adecuada de aguas residuales.",
sostenibilidad:"Dependerá de operación del prestador, mantenimiento de redes, control de conexiones y cultura de uso del sistema.",
palabrasClave:["alcantarillado","alcantarillado sanitario","aguas residuales","red sanitaria","saneamiento"]
},

{
codigo:"TIP-AGU-006",
nombre:"Optimización de alcantarillado sanitario",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para rehabilitar, reponer, optimizar o ampliar sistemas existentes de alcantarillado sanitario.",
problemaCentral:"Deficientes condiciones del sistema de alcantarillado sanitario que afectan la recolección y transporte de aguas residuales.",
objetivoGeneral:"Mejorar las condiciones del sistema de alcantarillado sanitario para fortalecer la recolección y transporte de aguas residuales.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-002","PRO-INF-003","PRO-INF-004"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-002","IND-PRO-003","IND-PRO-004","IND-RES-003","IND-GES-001"],
riesgos:comunes.riesgos,
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Redes de alcantarillado deterioradas, colmatadas o insuficientes.","Reboses, filtraciones o fallas recurrentes del sistema."],
causasIndirectas:["Antigüedad de redes y falta de mantenimiento periódico.","Incremento de caudales por crecimiento poblacional o conexiones indebidas."],
efectosDirectos:["Afectación sanitaria por reboses y malos olores.","Riesgo de contaminación ambiental y deterioro urbano."],
efectosIndirectos:["Incremento de costos de mantenimiento correctivo.","Deterioro de salud pública y calidad de vida."],
objetivosEspecificos:["Rehabilitar o reponer redes de alcantarillado deterioradas.","Mejorar capacidad hidráulica y condiciones operativas.","Reducir reboses, filtraciones y fallas sanitarias."],
beneficios:"Se mejorará la eficiencia del sistema sanitario y se reducirán riesgos ambientales y de salud pública.",
sostenibilidad:"Requiere mantenimiento preventivo, control de conexiones erradas, limpieza periódica y fortalecimiento del prestador.",
palabrasClave:["optimización alcantarillado","rehabilitación alcantarillado","red sanitaria","colector"]
},

{
codigo:"TIP-AGU-007",
nombre:"Alcantarillado pluvial",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, ampliación u optimización de redes y estructuras de alcantarillado pluvial.",
problemaCentral:"Deficientes condiciones de manejo de aguas lluvias que generan inundaciones, deterioro vial y riesgos para la población.",
objetivoGeneral:"Mejorar las condiciones de manejo de aguas lluvias para reducir inundaciones, deterioro vial y riesgos para la población.",
poblaciones:["POB-TER-002","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-INF-004"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-002","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-004","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-CON-001","RIE-AMB-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficiencia o inexistencia de redes de drenaje pluvial.","Colmatación o baja capacidad de sumideros y colectores."],
causasIndirectas:["Crecimiento urbano sin adecuada infraestructura pluvial.","Aumento de escorrentía y eventos de lluvia intensa."],
efectosDirectos:["Inundaciones urbanas y afectación de viviendas, vías y espacio público.","Deterioro acelerado de infraestructura vial."],
efectosIndirectos:["Afectación de movilidad, salud pública y seguridad.","Incremento de costos por atención de emergencias y mantenimiento."],
objetivosEspecificos:["Construir o mejorar redes y estructuras de drenaje pluvial.","Aumentar capacidad de recolección y conducción de aguas lluvias.","Reducir puntos críticos de inundación."],
beneficios:"Se reducirán inundaciones y afectaciones a la movilidad, infraestructura y bienestar de la población.",
sostenibilidad:"Dependerá de limpieza de sumideros, mantenimiento de colectores, control de residuos y gestión urbana del drenaje.",
palabrasClave:["alcantarillado pluvial","aguas lluvias","drenaje urbano","sumideros","inundación"]
},

{
codigo:"TIP-AGU-008",
nombre:"Planta de Tratamiento de Aguas Residuales - PTAR",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para construcción, optimización o ampliación de plantas de tratamiento de aguas residuales.",
problemaCentral:"Insuficiente tratamiento de aguas residuales que genera contaminación ambiental y riesgos para la salud pública.",
objetivoGeneral:"Fortalecer el tratamiento de aguas residuales para reducir contaminación ambiental y riesgos para la salud pública.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-INF-001","PRO-INF-002","PRO-INF-004","PRO-DOT-002"],
actividades:["ACT-PLA-003","ACT-PLA-004","ACT-PLA-005","ACT-EJE-001","ACT-EJE-002","ACT-EJE-003","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-002","IND-PRO-004","IND-PRO-011","IND-RES-003","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-TEC-002","RIE-FIN-001","RIE-CON-001","RIE-AMB-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Inexistencia o baja capacidad de tratamiento de aguas residuales.","Vertimientos sin tratamiento adecuado a cuerpos de agua."],
causasIndirectas:["Crecimiento de caudales de aguas residuales.","Limitada inversión en saneamiento y operación especializada."],
efectosDirectos:["Contaminación de fuentes hídricas y ecosistemas.","Riesgos sanitarios para comunidades aguas abajo."],
efectosIndirectos:["Deterioro ambiental y pérdida de calidad de recursos hídricos.","Sanciones o incumplimientos por vertimientos."],
objetivosEspecificos:["Construir, optimizar o ampliar la PTAR.","Reducir carga contaminante de vertimientos.","Fortalecer operación, control y monitoreo del tratamiento."],
beneficios:"Se reducirá la contaminación por aguas residuales y se protegerán fuentes hídricas y salud pública.",
sostenibilidad:"Requiere operador capacitado, recursos de operación, mantenimiento, disposición de lodos, monitoreo y cumplimiento normativo.",
palabrasClave:["ptar","planta tratamiento aguas residuales","aguas residuales","saneamiento","vertimientos"]
},

{
codigo:"TIP-AGU-009",
nombre:"Saneamiento básico rural",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para soluciones rurales de saneamiento básico, unidades sanitarias, manejo de excretas y aguas residuales domésticas.",
problemaCentral:"Insuficiente acceso de la población rural a soluciones adecuadas de saneamiento básico.",
objetivoGeneral:"Mejorar el acceso de la población rural a soluciones adecuadas de saneamiento básico.",
poblaciones:["POB-TER-001","POB-TER-003"],
productos:["PRO-INF-001","PRO-DOT-004","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-003","ACT-PLA-004","ACT-EJE-001","ACT-EJE-004","ACT-CTL-001","ACT-CIE-001"],
indicadores:["IND-PRO-001","IND-PRO-013","IND-PRO-020","IND-RES-001","IND-RES-002","IND-GES-001"],
riesgos:["RIE-TEC-001","RIE-FIN-001","RIE-CON-001","RIE-SOC-001","RIE-AMB-002"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Viviendas rurales sin soluciones sanitarias adecuadas.","Manejo inadecuado de excretas y aguas residuales domésticas."],
causasIndirectas:["Dispersión poblacional y limitaciones técnicas para redes convencionales.","Baja educación sanitaria y mantenimiento de soluciones individuales."],
efectosDirectos:["Contaminación del suelo y fuentes de agua cercanas.","Aumento de enfermedades de origen hídrico y sanitario."],
efectosIndirectos:["Deterioro de calidad de vida rural.","Afectación ambiental y de salud pública."],
objetivosEspecificos:["Implementar soluciones individuales o comunitarias de saneamiento.","Fortalecer educación sanitaria y uso adecuado de soluciones.","Reducir riesgos sanitarios y ambientales en viviendas rurales."],
beneficios:"Los hogares rurales contarán con condiciones sanitarias mejoradas y menor exposición a riesgos de salud.",
sostenibilidad:"Dependerá de capacitación a hogares, mantenimiento de soluciones, seguimiento comunitario y asistencia técnica.",
palabrasClave:["saneamiento rural","unidades sanitarias","baños rurales","pozos sépticos","excretas"]
},

{
codigo:"TIP-AGU-010",
nombre:"Aseo y gestión de residuos sólidos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer recolección, transporte, aprovechamiento, disposición y gestión integral de residuos sólidos.",
problemaCentral:"Deficiente gestión de residuos sólidos que afecta la salud pública, el ambiente y la calidad del entorno.",
objetivoGeneral:"Fortalecer la gestión de residuos sólidos para mejorar la salud pública, el ambiente y la calidad del entorno.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-SER-001","PRO-SER-002","PRO-DOT-002","PRO-DOT-004","PRO-FOR-001"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-030","IND-PRO-031","IND-PRO-011","IND-PRO-013","IND-PRO-020","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-CON-001","RIE-AMB-001"],
normas:["NOR-AMB-001","NOR-AMB-002",...comunes.normasBase],
fuentes:comunes.fuentesBase,
causasDirectas:["Baja cobertura o eficiencia en recolección y manejo de residuos.","Insuficientes acciones de separación, aprovechamiento y cultura ciudadana."],
causasIndirectas:["Limitada dotación, rutas, equipos o infraestructura de apoyo.","Débil educación ambiental y control de disposición inadecuada."],
efectosDirectos:["Contaminación del entorno, malos olores y proliferación de vectores.","Baja recuperación de materiales aprovechables."],
efectosIndirectos:["Afectación ambiental y sanitaria.","Incremento de costos por manejo inadecuado y disposición final."],
objetivosEspecificos:["Fortalecer la prestación del servicio de aseo y manejo de residuos.","Implementar acciones de aprovechamiento y separación en la fuente.","Desarrollar educación ambiental y cultura ciudadana."],
beneficios:"La comunidad contará con mejores condiciones ambientales, sanitarias y de limpieza del entorno.",
sostenibilidad:"Dependerá de operación del prestador, cultura ciudadana, rutas eficientes, sostenibilidad financiera y seguimiento al PGIRS.",
palabrasClave:["residuos sólidos","aseo","basuras","reciclaje","pgirs"]
},

{
codigo:"TIP-AGU-011",
nombre:"Manejo de residuos orgánicos y compostaje",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto orientado al aprovechamiento de residuos orgánicos mediante compostaje, educación y dotación operativa.",
problemaCentral:"Bajo aprovechamiento de residuos orgánicos y alta disposición final de materiales biodegradables.",
objetivoGeneral:"Incrementar el aprovechamiento de residuos orgánicos para reducir disposición final y mejorar la gestión ambiental.",
poblaciones:["POB-TER-001","POB-TER-002","POB-TER-003"],
productos:["PRO-SER-002","PRO-DOT-004","PRO-FOR-001","PRO-FOR-003"],
actividades:["ACT-PLA-001","ACT-EJE-003","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-031","IND-PRO-013","IND-PRO-020","IND-PRO-022","IND-RES-003","IND-GES-001"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-AMB-001"],
normas:["NOR-AMB-001","NOR-AMB-002",...comunes.normasBase],
fuentes:comunes.fuentesBase,
causasDirectas:["Insuficientes procesos de separación y aprovechamiento de residuos orgánicos.","Baja disponibilidad de infraestructura o insumos para compostaje."],
causasIndirectas:["Débil cultura ciudadana en separación en la fuente.","Limitada articulación con recicladores, productores o comunidades."],
efectosDirectos:["Mayor volumen de residuos enviados a disposición final.","Pérdida de potencial de aprovechamiento y reducción de impactos."],
efectosIndirectos:["Incremento de costos del servicio de aseo.","Aumento de impactos ambientales asociados a disposición final."],
objetivosEspecificos:["Implementar procesos de aprovechamiento de residuos orgánicos.","Dotar insumos y elementos para compostaje.","Capacitar comunidad y actores involucrados en separación y aprovechamiento."],
beneficios:"Se reducirá la disposición final de residuos orgánicos y se fortalecerá la cultura ambiental.",
sostenibilidad:"Requiere participación comunitaria, operación continua, uso del compost y articulación con programas de aseo y agricultura urbana o rural.",
palabrasClave:["compostaje","residuos orgánicos","aprovechamiento","reciclaje orgánico","separación"]
},

{
codigo:"TIP-AGU-012",
nombre:"Fortalecimiento de prestadores de servicios públicos",
sector:SECTOR,
sectorCodigo:SECTOR_CODIGO,
descripcion:"Proyecto para fortalecer capacidades técnicas, operativas, administrativas y comerciales de prestadores de acueducto, alcantarillado o aseo.",
problemaCentral:"Débil capacidad técnica, operativa, administrativa y comercial de los prestadores de servicios públicos domiciliarios.",
objetivoGeneral:"Fortalecer la capacidad técnica, operativa, administrativa y comercial de los prestadores de servicios públicos domiciliarios.",
poblaciones:["POB-TER-003"],
productos:["PRO-FOR-003","PRO-FOR-004","PRO-FOR-002","PRO-GES-003","PRO-TIC-003"],
actividades:["ACT-PLA-001","ACT-PLA-002","ACT-EJE-004","ACT-EJE-005","ACT-CTL-003","ACT-CIE-003"],
indicadores:["IND-PRO-022","IND-PRO-023","IND-PRO-021","IND-PRO-042","IND-PRO-052","IND-RES-003"],
riesgos:["RIE-SOC-001","RIE-FIN-001","RIE-TEC-001"],
normas:comunes.normasBase,
fuentes:comunes.fuentesBase,
causasDirectas:["Baja capacidad de operación, mantenimiento y gestión comercial.","Débil planeación, registro de usuarios, recaudo y seguimiento técnico."],
causasIndirectas:["Insuficiente asistencia técnica a prestadores.","Limitada disponibilidad de herramientas de información y gestión."],
efectosDirectos:["Deficiencias en continuidad, calidad y sostenibilidad del servicio.","Baja eficiencia operativa y financiera del prestador."],
efectosIndirectos:["Deterioro progresivo de infraestructura y servicios.","Mayor dependencia de subsidios o apoyos externos."],
objetivosEspecificos:["Brindar asistencia técnica a prestadores de servicios públicos.","Fortalecer herramientas administrativas, comerciales y operativas.","Mejorar capacidades de planeación, seguimiento y sostenibilidad."],
beneficios:"Los prestadores mejorarán su capacidad de gestión y la población recibirá servicios más eficientes y sostenibles.",
sostenibilidad:"Se soportará en capacidades instaladas, sistemas de información, gestión comercial, mantenimiento y acompañamiento institucional.",
palabrasClave:["prestadores","servicios públicos","acueducto comunitario","fortalecimiento","gestión comercial"]
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

window.PlantillasAgua = PlantillasAgua;
