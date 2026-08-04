// =====================================
// MOTOR-TIPOLOGIAS.JS
// CONSTRUCTOR MGA PRO
// Administrador inteligente de tipologías de proyectos
// =====================================

/*
  Este motor administra tipologías especializadas de proyectos.

  Su función es conectar:

  Sector
      ↓
  Tipología
      ↓
  Catálogos maestros
      ↓
  Modelo MGA generado

  Requiere cargar antes:
  - CatalogoMGA
  - MotorCatalogos
  - MotorPlantillas
  - archivos de plantillas sectoriales cuando existan
*/

const MotorTipologias = (() => {

    const REGISTRO = {};

    // =====================================
    // REGISTRO
    // =====================================

    function registrar(tipologia){

        if(!tipologia){
            return false;
        }

        const codigo =
        normalizarClave(
            tipologia.codigo ||
            tipologia.id ||
            tipologia.nombre
        );

        if(!codigo){
            return false;
        }

        REGISTRO[codigo] =
        normalizarTipologia(tipologia, codigo);

        return true;

    }

    function registrarVarias(lista = []){

        lista.forEach(t => registrar(t));

        return estadisticas();

    }

    function normalizarTipologia(t, codigo){

        return {
            id:
            t.id || codigo,

            codigo:
            t.codigo || codigo,

            nombre:
            t.nombre || codigo,

            sector:
            t.sector || "",

            sectorCodigo:
            t.sectorCodigo || "",

            descripcion:
            t.descripcion || "",

            problemaCentral:
            t.problemaCentral || "",

            objetivoGeneral:
            t.objetivoGeneral || "",

            poblaciones:
            t.poblaciones || [],

            productos:
            t.productos || [],

            actividades:
            t.actividades || [],

            indicadores:
            t.indicadores || [],

            riesgos:
            t.riesgos || [],

            normas:
            t.normas || [],

            fuentes:
            t.fuentes || [],

            causasDirectas:
            t.causasDirectas || [],

            causasIndirectas:
            t.causasIndirectas || [],

            efectosDirectos:
            t.efectosDirectos || [],

            efectosIndirectos:
            t.efectosIndirectos || [],

            objetivosEspecificos:
            t.objetivosEspecificos || [],

            beneficios:
            t.beneficios || "",

            sostenibilidad:
            t.sostenibilidad || "",

            palabrasClave:
            t.palabrasClave || [],

            preguntas:
            t.preguntas || [],

            cronogramaBase:
            t.cronogramaBase || [],

            presupuestoBase:
            t.presupuestoBase || []
        };

    }

    // =====================================
    // CONSULTA
    // =====================================

    function listar(){

        return Object.values(REGISTRO)
        .sort((a, b) =>
            String(a.nombre).localeCompare(String(b.nombre))
        );

    }

    function obtener(codigo){

        const key =
        normalizarClave(codigo);

        const t =
        REGISTRO[key];

        return t
        ? clonar(t)
        : null;

    }

    function existe(codigo){

        return !!REGISTRO[normalizarClave(codigo)];

    }

    function porSector(sector){

        const key =
        normalizarClave(sector);

        return listar().filter(t =>
            normalizarClave(t.sector) === key ||
            normalizarClave(t.sectorCodigo) === key
        );

    }

    function buscar(texto){

        const q =
        normalizarTexto(texto);

        if(!q){
            return listar();
        }

        return listar().filter(t => {

            const base =
            [
                t.codigo,
                t.nombre,
                t.sector,
                t.sectorCodigo,
                t.descripcion,
                t.problemaCentral,
                t.objetivoGeneral,
                ...(t.palabrasClave || [])
            ]
            .filter(Boolean)
            .join(" ");

            return normalizarTexto(base).includes(q);

        });

    }

    function detectar(texto){

        const resultados =
        buscar(texto);

        return resultados.length
        ? resultados[0]
        : null;

    }

    // =====================================
    // RESOLVER TIPOLOGÍA
    // =====================================

    function resolver(codigo){

        const t =
        obtener(codigo);

        if(!t){
            return null;
        }

        const sector =
        window.MotorCatalogos
        ? (
            MotorCatalogos.getSector(t.sectorCodigo) ||
            MotorCatalogos.getSector(t.sector) ||
            null
          )
        : null;

        const productos =
        resolverLista("productos", t.productos);

        const actividades =
        resolverLista("actividades", t.actividades);

        const indicadores =
        resolverLista("indicadores", t.indicadores);

        const riesgos =
        resolverLista("riesgos", t.riesgos);

        const poblaciones =
        resolverLista("poblaciones", t.poblaciones);

        const normas =
        resolverLista("normatividad", t.normas);

        const fuentes =
        resolverLista("fuentes-financiacion", t.fuentes);

        return {
            tipologia:
            t,

            sector,

            productos,
            actividades,
            indicadores,
            riesgos,
            poblaciones,
            normas,
            fuentes
        };

    }

    function resolverLista(catalogo, codigos = []){

        if(!window.MotorCatalogos){
            return [];
        }

        return (codigos || [])
        .map(c => MotorCatalogos.get(catalogo, c))
        .filter(Boolean);

    }

    // =====================================
    // CONSTRUIR MODELO MGA
    // =====================================

    function construirModelo(codigoTipologia, opciones = {}){

        const r =
        resolver(codigoTipologia);

        if(!r){
            return null;
        }

        const t =
        r.tipologia;

        const nombreProyecto =
        opciones.nombreProyecto ||
        t.nombre ||
        "Proyecto de inversión pública";

        const departamento =
        opciones.departamento || "";

        const municipio =
        opciones.municipio || "";

        const problema =
        opciones.problemaCentral ||
        t.problemaCentral ||
        `Insuficiente acceso de la población objetivo a bienes o servicios asociados a ${t.nombre}.`;

        const objetivo =
        opciones.objetivoGeneral ||
        t.objetivoGeneral ||
        `Mejorar el acceso de la población objetivo a bienes o servicios asociados a ${t.nombre}.`;

        const objetivosEspecificos =
        construirObjetivosEspecificos(t, r);

        const productos =
        construirProductos(r.productos, objetivosEspecificos);

        const actividades =
        construirActividades(r.actividades, productos);

        const indicadores =
        construirIndicadores(r.indicadores);

        const riesgos =
        construirRiesgos(r.riesgos);

        const poblacionPrincipal =
        r.poblaciones[0] || null;

        return {
            diagnostico: {
                sector:
                r.sector?.nombre || t.sector || "",

                departamento,
                municipio,

                situacionActual:
                opciones.situacionActual ||
                `En ${municipio || "el territorio"} se identifican necesidades relacionadas con ${t.nombre}, que limitan el acceso de la población objetivo a bienes, servicios o condiciones adecuadas.`,

                problemaCentral:
                problema,

                magnitudProblema:
                opciones.magnitudProblema ||
                "La magnitud del problema deberá complementarse con datos de población afectada, cobertura, déficit, demanda insatisfecha o registros administrativos disponibles.",

                antecedentes:
                opciones.antecedentes ||
                "El proyecto se fundamenta en la necesidad territorial identificada y en los antecedentes institucionales relacionados con la prestación del servicio o atención de la población objetivo.",

                justificacion:
                opciones.justificacion ||
                `El proyecto "${nombreProyecto}" se justifica por la necesidad de atender la problemática identificada, fortalecer la capacidad institucional y mejorar las condiciones de bienestar de la población beneficiaria.`,

                poblacionAfectada:
                opciones.poblacionAfectada ||
                poblacionPrincipal?.descripcion ||
                "Población del área de influencia que presenta la necesidad identificada.",

                poblacionObjetivo:
                opciones.poblacionObjetivo ||
                poblacionPrincipal?.nombre ||
                "Población objetivo del proyecto.",

                analisisTerritorial:
                opciones.analisisTerritorial ||
                `El proyecto se localiza en ${municipio || "el municipio"}, ${departamento || "el departamento"}, y debe considerar condiciones territoriales, sociales, institucionales y de accesibilidad.`,

                ofertaActual:
                opciones.ofertaActual ||
                "La oferta actual resulta insuficiente frente a la demanda y necesidades de la población objetivo.",

                demandaActual:
                opciones.demandaActual ||
                "La demanda actual corresponde a la población que requiere acceder a bienes, servicios o infraestructura adecuada.",

                brecha:
                opciones.brecha ||
                "Existe una brecha entre la oferta disponible y la demanda de la población beneficiaria."
            },

            arbolProblemas: {
                problemaCentral:
                problema,

                causasDirectas:
                t.causasDirectas.length
                ? t.causasDirectas
                : [
                    "Limitada capacidad institucional para atender la necesidad identificada.",
                    "Insuficiente disponibilidad de bienes, servicios, infraestructura o programas."
                ],

                causasIndirectas:
                t.causasIndirectas.length
                ? t.causasIndirectas
                : [
                    "Restricciones técnicas y presupuestales.",
                    "Débil articulación institucional y comunitaria."
                ],

                efectosDirectos:
                t.efectosDirectos.length
                ? t.efectosDirectos
                : [
                    "Bajo acceso de la población objetivo a bienes o servicios.",
                    "Deterioro de condiciones de bienestar de la población beneficiaria."
                ],

                efectosIndirectos:
                t.efectosIndirectos.length
                ? t.efectosIndirectos
                : [
                    "Incremento de brechas sociales y territoriales.",
                    "Menor capacidad de respuesta institucional."
                ]
            },

            arbolObjetivos: {
                objetivoGeneral:
                objetivo,

                mediosDirectos: [
                    "Fortalecida capacidad institucional de atención.",
                    "Mejorada disponibilidad de bienes, servicios, infraestructura o programas."
                ],

                mediosIndirectos: [
                    "Gestión eficiente de recursos técnicos y financieros.",
                    "Mayor articulación institucional y comunitaria."
                ],

                finesDirectos: [
                    "Mayor acceso de la población beneficiaria.",
                    "Mejoramiento de condiciones de bienestar."
                ],

                finesIndirectos: [
                    "Reducción de brechas sociales y territoriales.",
                    "Fortalecimiento del desarrollo territorial."
                ]
            },

            cadenaValor: {
                objetivoGeneral:
                objetivo,

                objetivosEspecificos,
                productos,
                actividades
            },

            indicadores,
            riesgos,

            cronograma: {
                actividades:
                construirCronograma(actividades)
            },

            documentosMGA: {
                descripcionProblema:
                problema,

                justificacion:
                `El proyecto "${nombreProyecto}" contribuye a solucionar la problemática identificada mediante una intervención orientada a ${t.nombre}, articulando productos, actividades, indicadores y gestión de riesgos.`,

                objetivoGeneral:
                objetivo,

                alternativas:
                "Se evaluaron alternativas de intervención. La alternativa seleccionada permite atender de manera integral la problemática, optimizando recursos públicos y maximizando beneficios para la población objetivo.",

                beneficios:
                t.beneficios ||
                "Se espera mejorar el acceso, cobertura, calidad, atención y condiciones de bienestar de la población beneficiaria.",

                sostenibilidad:
                t.sostenibilidad ||
                "La sostenibilidad dependerá de la asignación de responsables institucionales, recursos de operación y mantenimiento, seguimiento a indicadores y gestión permanente de riesgos."
            },

            catalogosUsados: {
                tipologia:
                t.codigo,

                sector:
                t.sectorCodigo || t.sector,

                productos:
                t.productos,

                actividades:
                t.actividades,

                indicadores:
                t.indicadores,

                riesgos:
                t.riesgos,

                poblaciones:
                t.poblaciones,

                normas:
                t.normas,

                fuentes:
                t.fuentes
            }
        };

    }

    function construirObjetivosEspecificos(t, r){

        if(t.objetivosEspecificos && t.objetivosEspecificos.length){

            return t.objetivosEspecificos.map(texto => ({
                id:
                uid("obj"),

                texto
            }));

        }

        return [
            {
                id:
                uid("obj"),

                texto:
                "Fortalecer la capacidad de atención y prestación del servicio."
            },
            {
                id:
                uid("obj"),

                texto:
                "Mejorar las condiciones de acceso de la población beneficiaria."
            }
        ];

    }

    function construirProductos(lista, objetivos){

        return (lista || []).map((p, i) => ({
            id:
            uid("prod"),

            catalogoId:
            p.codigo || p.id,

            nombre:
            p.nombre,

            descripcion:
            p.descripcion,

            unidadMedida:
            p.unidadMedida || "Unidad",

            meta:
            i === 0 ? 1 : 0,

            objetivoEspecificoId:
            objetivos[
                Math.min(i, objetivos.length - 1)
            ]?.id || ""
        }));

    }

    function construirActividades(lista, productos){

        return (lista || []).map((a, i) => ({
            id:
            uid("act"),

            catalogoId:
            a.codigo || a.id,

            nombre:
            a.nombre,

            descripcion:
            a.descripcion,

            duracionMeses:
            a.duracionSugerida || 1,

            valor:
            0,

            productoId:
            productos.length
            ? productos[Math.min(i, productos.length - 1)].id
            : ""
        }));

    }

    function construirIndicadores(lista){

        const base =
        {
            producto: [],
            resultado: [],
            gestion: [],
            impacto: []
        };

        (lista || []).forEach(ind => {

            const tipo =
            normalizarTexto(ind.tipoIndicador || "producto");

            const obj =
            {
                id:
                uid("ind"),

                catalogoId:
                ind.codigo || ind.id,

                tipo:
                ind.tipoIndicador || "Producto",

                nombre:
                ind.nombre,

                descripcion:
                ind.descripcion,

                unidadMedida:
                ind.unidadMedida || "",

                lineaBase:
                ind.lineaBase || 0,

                meta:
                ind.metaSugerida || 0,

                fuenteVerificacion:
                ind.fuenteVerificacion || "",

                frecuenciaMedicion:
                ind.frecuenciaMedicion || "",

                responsable:
                ind.responsable || ""
            };

            if(tipo.includes("resultado")){
                base.resultado.push(obj);
            }else if(tipo.includes("gestion")){
                base.gestion.push(obj);
            }else if(tipo.includes("impacto")){
                base.impacto.push(obj);
            }else{
                base.producto.push(obj);
            }

        });

        return base;

    }

    function construirRiesgos(lista){

        return (lista || []).map(r => ({
            id:
            uid("rie"),

            catalogoId:
            r.codigo || r.id,

            tipo:
            r.categoria || "General",

            descripcion:
            r.descripcion || r.nombre || "",

            probabilidad:
            r.probabilidad || "Media",

            impacto:
            r.impacto || "Medio",

            nivel:
            r.nivel || "Medio",

            medidaMitigacion:
            r.tratamiento || "",

            responsable:
            "Entidad ejecutora / Supervisión"
        }));

    }

    function construirCronograma(actividades){

        let mes =
        1;

        return (actividades || []).map(a => {

            const dur =
            Math.max(1, Number(a.duracionMeses || 1));

            const item =
            {
                id:
                uid("cron"),

                actividadId:
                a.id,

                nombre:
                a.nombre,

                mesInicio:
                mes,

                mesFin:
                mes + dur - 1,

                valorProgramado:
                Number(a.valor || 0),

                estado:
                "Pendiente"
            };

            mes =
            item.mesFin + 1;

            return item;

        });

    }

    function aplicar(projectId, codigoTipologia, opciones = {}){

        if(!window.MGA || typeof MGA.updateModel !== "function"){
            alert("MGA.updateModel no está disponible.");
            return null;
        }

        const modelo =
        construirModelo(codigoTipologia, opciones);

        if(!modelo){
            alert("No fue posible construir el modelo de la tipología seleccionada.");
            return null;
        }

        return MGA.updateModel(projectId, modelo);

    }

    // =====================================
    // TIPOLOGÍAS INICIALES
    // =====================================

    function registrarIniciales(){

        registrarVarias([

            {
                codigo:
                "TIP-SOC-001",

                nombre:
                "Centro Vida",

                sector:
                "Desarrollo Social",

                sectorCodigo:
                "SEC-SOC-001",

                descripcion:
                "Proyecto orientado a construcción, adecuación, dotación u operación de centros vida para atención integral de personas adultas mayores.",

                problemaCentral:
                "Insuficiente acceso de la población adulta mayor a servicios integrales de bienestar, atención, protección y desarrollo social.",

                objetivoGeneral:
                "Mejorar el acceso de la población adulta mayor a servicios integrales de bienestar, atención, protección y desarrollo social.",

                poblaciones:
                ["POB-CV-006"],

                productos:
                ["PRO-INF-001", "PRO-DOT-001", "PRO-SER-001", "PRO-SER-003", "PRO-FOR-001"],

                actividades:
                ["ACT-PLA-001", "ACT-PLA-003", "ACT-PLA-004", "ACT-PLA-005", "ACT-EJE-001", "ACT-EJE-003", "ACT-EJE-005", "ACT-CTL-001", "ACT-CIE-001"],

                indicadores:
                ["IND-PRO-001", "IND-PRO-010", "IND-PRO-030", "IND-PRO-032", "IND-PRO-020", "IND-RES-001", "IND-GES-001", "IND-GES-002"],

                riesgos:
                ["RIE-TEC-001", "RIE-FIN-001", "RIE-CON-001", "RIE-CON-002", "RIE-SOC-001"],

                normas:
                ["NOR-SOC-001", "NOR-SOC-002", "NOR-GEN-002", "NOR-CON-001", "NOR-CON-003"],

                fuentes:
                ["FUE-ESP-001", "FUE-PUB-001", "FUE-NAC-001", "FUE-COO-003"],

                causasDirectas:
                [
                    "Insuficiente infraestructura para la atención integral del adulto mayor.",
                    "Limitada disponibilidad de servicios sociales, recreativos, nutricionales y psicosociales."
                ],

                causasIndirectas:
                [
                    "Insuficientes recursos destinados a programas de bienestar del adulto mayor.",
                    "Débil articulación institucional para la atención integral."
                ],

                efectosDirectos:
                [
                    "Baja cobertura de atención integral a personas adultas mayores.",
                    "Aumento de condiciones de vulnerabilidad, aislamiento y deterioro del bienestar."
                ],

                efectosIndirectos:
                [
                    "Mayor presión sobre las familias y redes de cuidado.",
                    "Incremento de brechas sociales en población adulta mayor."
                ],

                objetivosEspecificos:
                [
                    "Fortalecer la infraestructura para la atención integral del adulto mayor.",
                    "Implementar servicios integrales de bienestar, promoción, prevención y acompañamiento.",
                    "Dotar los espacios requeridos para la prestación adecuada del servicio."
                ],

                beneficios:
                "La población adulta mayor contará con mejores condiciones de atención, acompañamiento, recreación, nutrición, integración social y bienestar.",

                sostenibilidad:
                "La sostenibilidad se soportará en la asignación de responsables institucionales, recursos de operación, uso de la estampilla para el bienestar del adulto mayor cuando aplique, seguimiento de indicadores y articulación con programas sociales.",

                palabrasClave:
                ["centro vida", "adulto mayor", "bienestar", "atención integral", "estampilla"]
            },

            {
                codigo:
                "TIP-TRA-001",

                nombre:
                "Placa Huella",

                sector:
                "Transporte",

                sectorCodigo:
                "SEC-INF-001",

                descripcion:
                "Proyecto orientado al mejoramiento de vías rurales mediante construcción de placa huella, obras de drenaje y elementos complementarios.",

                problemaCentral:
                "Deficientes condiciones de transitabilidad y conectividad de la población rural.",

                objetivoGeneral:
                "Mejorar las condiciones de transitabilidad y conectividad de la población rural.",

                poblaciones:
                ["POB-TER-001", "POB-TER-003"],

                productos:
                ["PRO-INF-002", "PRO-INF-003"],

                actividades:
                ["ACT-PLA-006", "ACT-PLA-007", "ACT-PLA-004", "ACT-PLA-005", "ACT-EJE-001", "ACT-CTL-001", "ACT-CIE-001"],

                indicadores:
                ["IND-PRO-002", "IND-PRO-003", "IND-RES-002", "IND-GES-001", "IND-GES-002", "IND-GES-003"],

                riesgos:
                ["RIE-TEC-001", "RIE-TEC-002", "RIE-FIN-001", "RIE-AMB-001", "RIE-CON-002"],

                normas:
                ["NOR-TRA-001", "NOR-TRA-002", "NOR-TRA-003", "NOR-CON-001", "NOR-CON-003"],

                fuentes:
                ["FUE-NAC-001", "FUE-PUB-001", "FUE-NAC-003", "FUE-COO-002"],

                palabrasClave:
                ["placa huella", "vía rural", "conectividad", "transitabilidad", "vereda"]
            },

            {
                codigo:
                "TIP-EDU-001",

                nombre:
                "Construcción o mejoramiento de institución educativa",

                sector:
                "Educación",

                sectorCodigo:
                "SEC-SOC-003",

                descripcion:
                "Proyecto orientado a construcción, mejoramiento, ampliación o dotación de infraestructura educativa.",

                problemaCentral:
                "Limitadas condiciones físicas y funcionales para la prestación adecuada del servicio educativo.",

                objetivoGeneral:
                "Mejorar las condiciones físicas y funcionales para la prestación del servicio educativo.",

                poblaciones:
                ["POB-SEC-001", "POB-SEC-002"],

                productos:
                ["PRO-INF-001", "PRO-INF-002", "PRO-DOT-001", "PRO-DOT-003"],

                actividades:
                ["ACT-PLA-003", "ACT-PLA-004", "ACT-PLA-005", "ACT-EJE-001", "ACT-EJE-003", "ACT-CTL-001", "ACT-CIE-001"],

                indicadores:
                ["IND-PRO-001", "IND-PRO-002", "IND-PRO-010", "IND-PRO-012", "IND-RES-001", "IND-GES-001", "IND-GES-002"],

                riesgos:
                ["RIE-TEC-001", "RIE-FIN-001", "RIE-CON-001", "RIE-SOC-001"],

                normas:
                ["NOR-EDU-001", "NOR-EDU-002", "NOR-EDU-003", "NOR-EDU-004"],

                fuentes:
                ["FUE-PUB-003", "FUE-NAC-001", "FUE-NAC-003", "FUE-COO-002"],

                palabrasClave:
                ["colegio", "escuela", "educación", "aula", "institución educativa"]
            }

        ]);

    }

    // =====================================
    // ESTADÍSTICAS
    // =====================================

    function estadisticas(){

        const lista =
        listar();

        const porSector =
        {};

        lista.forEach(t => {

            const key =
            t.sector || t.sectorCodigo || "Sin sector";

            porSector[key] =
            (porSector[key] || 0) + 1;

        });

        return {
            total:
            lista.length,

            porSector
        };

    }

    // =====================================
    // HELPERS
    // =====================================

    function uid(prefix){

        if(window.MGA && typeof MGA.uid === "function"){
            return MGA.uid(prefix);
        }

        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    }

    function normalizarClave(value){

        return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/\s+/g, "-")
        .replace(/_/g, "-")
        .trim();

    }

    function normalizarTexto(value){

        return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    }

    function clonar(obj){

        try{

            if(typeof structuredClone === "function"){
                return structuredClone(obj);
            }

        }catch(_){}

        return JSON.parse(JSON.stringify(obj));

    }

    // =====================================
    // API PÚBLICA
    // =====================================

    registrarIniciales();

    return {
        registrar,
        registrarVarias,
        listar,
        obtener,
        existe,
        porSector,
        buscar,
        detectar,
        resolver,
        construirModelo,
        aplicar,
        estadisticas
    };

})();

window.MotorTipologias = MotorTipologias;
