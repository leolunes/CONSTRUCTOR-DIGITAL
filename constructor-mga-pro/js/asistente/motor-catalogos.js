// =====================================
// MOTOR-CATALOGOS.JS
// CONSTRUCTOR MGA PRO
// Motor experto de consulta y resolución de catálogos
// =====================================

/*
  Este motor centraliza el uso de los catálogos maestros:

  Requiere cargar antes:
  - js/asistente/catalogos/catalogo.js
  - js/asistente/catalogos/actividades.js
  - js/asistente/catalogos/productos.js
  - js/asistente/catalogos/indicadores.js
  - js/asistente/catalogos/riesgos.js
  - js/asistente/catalogos/poblaciones.js
  - js/asistente/catalogos/normatividad.js
  - js/asistente/catalogos/sectores.js
  - js/asistente/catalogos/fuentes-financiacion.js
*/

const MotorCatalogos = (() => {

    // =====================================
    // VALIDACIÓN BASE
    // =====================================

    function disponible(){

        return !!window.CatalogoMGA;

    }

    function asegurar(){

        if(!disponible()){

            console.warn(
                "[MotorCatalogos] CatalogoMGA no está disponible. Revise el orden de carga de scripts."
            );

            return false;

        }

        return true;

    }

    // =====================================
    // ACCESO DIRECTO
    // =====================================

    function get(catalogo, codigo){

        if(!asegurar()){
            return null;
        }

        return CatalogoMGA.clonarElemento(
            catalogo,
            codigo
        );

    }

    function listar(catalogo){

        if(!asegurar()){
            return [];
        }

        return CatalogoMGA.listar(catalogo);

    }

    function buscar(catalogo, texto){

        if(!asegurar()){
            return [];
        }

        return CatalogoMGA.buscar(catalogo, texto);

    }

    function buscarGlobal(texto){

        if(!asegurar()){
            return [];
        }

        return CatalogoMGA.buscarGlobal(texto);

    }

    // =====================================
    // GETTERS ESPECIALIZADOS
    // =====================================

    function getSector(codigo){
        return get("sectores", codigo);
    }

    function getFuente(codigo){
        return get("fuentes-financiacion", codigo) ||
               get("fuentes", codigo) ||
               get("fuentes.financiacion", codigo);
    }

    function getProducto(codigo){
        return get("productos", codigo);
    }

    function getIndicador(codigo){
        return get("indicadores", codigo);
    }

    function getRiesgo(codigo){
        return get("riesgos", codigo);
    }

    function getPoblacion(codigo){
        return get("poblaciones", codigo);
    }

    function getNorma(codigo){
        return get("normatividad", codigo);
    }

    function getActividad(codigo){
        return get("actividades", codigo);
    }

    // =====================================
    // BÚSQUEDAS ESPECIALIZADAS
    // =====================================

    function buscarSector(texto){
        return buscar("sectores", texto);
    }

    function buscarFuente(texto){
        return buscar("fuentes-financiacion", texto);
    }

    function buscarProducto(texto){
        return buscar("productos", texto);
    }

    function buscarIndicador(texto){
        return buscar("indicadores", texto);
    }

    function buscarRiesgo(texto){
        return buscar("riesgos", texto);
    }

    function buscarPoblacion(texto){
        return buscar("poblaciones", texto);
    }

    function buscarNorma(texto){
        return buscar("normatividad", texto);
    }

    function buscarActividad(texto){
        return buscar("actividades", texto);
    }

    // =====================================
    // RESOLVER RELACIONES DE PRODUCTOS
    // =====================================

    function resolverProducto(codigoProducto){

        const producto =
        getProducto(codigoProducto);

        if(!producto){
            return null;
        }

        const indicador =
        producto.indicadorSugerido
        ? getIndicador(producto.indicadorSugerido)
        : null;

        const actividades =
        (producto.actividades || [])
        .map(c => getActividad(c))
        .filter(Boolean);

        return {
            producto,
            indicador,
            actividades
        };

    }

    function resolverProductos(codigos = []){

        return codigos
        .map(codigo => resolverProducto(codigo))
        .filter(Boolean);

    }

    // =====================================
    // RESOLVER SECTOR
    // =====================================

    function resolverSector(codigoSector){

        const sector =
        getSector(codigoSector);

        if(!sector){
            return null;
        }

        const productos =
        (sector.productosFrecuentes || [])
        .map(c => getProducto(c))
        .filter(Boolean);

        const riesgos =
        (sector.riesgosFrecuentes || [])
        .map(c => getRiesgo(c))
        .filter(Boolean);

        const poblaciones =
        (sector.poblacionesFrecuentes || [])
        .map(c => getPoblacion(c))
        .filter(Boolean);

        const normas =
        (sector.normasFrecuentes || [])
        .map(c => getNorma(c))
        .filter(Boolean);

        return {
            sector,
            productos,
            riesgos,
            poblaciones,
            normas
        };

    }

    function detectarSectorPorTexto(texto){

        const resultados =
        buscarSector(texto);

        return resultados.length
        ? resultados[0]
        : null;

    }

    // =====================================
    // SUGERENCIAS
    // =====================================

    function sugerirPorTexto(texto){

        const sector =
        detectarSectorPorTexto(texto);

        const productos =
        buscarProducto(texto)
        .slice(0, 10);

        const actividades =
        buscarActividad(texto)
        .slice(0, 10);

        const indicadores =
        buscarIndicador(texto)
        .slice(0, 10);

        const riesgos =
        buscarRiesgo(texto)
        .slice(0, 10);

        const poblaciones =
        buscarPoblacion(texto)
        .slice(0, 10);

        const normas =
        buscarNorma(texto)
        .slice(0, 10);

        return {
            sector,
            productos,
            actividades,
            indicadores,
            riesgos,
            poblaciones,
            normas
        };

    }

    function sugerirParaSector(codigoSector){

        const res =
        resolverSector(codigoSector);

        if(!res){
            return null;
        }

        const productosResueltos =
        resolverProductos(
            res.sector.productosFrecuentes || []
        );

        const indicadores =
        productosResueltos
        .map(x => x.indicador)
        .filter(Boolean);

        const actividades =
        uniqueByCodigo(
            productosResueltos
            .flatMap(x => x.actividades || [])
        );

        return {
            sector:
            res.sector,

            productos:
            res.productos,

            indicadores,

            actividades,

            riesgos:
            res.riesgos,

            poblaciones:
            res.poblaciones,

            normas:
            res.normas
        };

    }

    // =====================================
    // CONSTRUIR MODELO BASE MGA
    // =====================================

    function construirModeloBaseDesdeSector(codigoSector, opciones = {}){

        const s =
        sugerirParaSector(codigoSector);

        if(!s){
            return null;
        }

        const nombreProyecto =
        opciones.nombreProyecto || "Proyecto de inversión pública";

        const municipio =
        opciones.municipio || "";

        const departamento =
        opciones.departamento || "";

        const poblacionPrincipal =
        s.poblaciones[0];

        const problema =
        opciones.problemaCentral ||
        `Insuficiente acceso de la población objetivo a bienes o servicios asociados al sector ${s.sector.nombre}.`;

        const objetivo =
        opciones.objetivoGeneral ||
        `Mejorar el acceso de la población objetivo a bienes o servicios asociados al sector ${s.sector.nombre}.`;

        const objetivosEspecificos =
        [
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

        const productos =
        s.productos.map((p, i) => ({
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
            objetivosEspecificos[
                Math.min(i, objetivosEspecificos.length - 1)
            ].id
        }));

        const actividades =
        s.actividades.map((a, i) => ({
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

        const indicadores =
        prepararIndicadores(s.indicadores);

        const riesgos =
        prepararRiesgos(s.riesgos);

        return {
            diagnostico: {
                sector:
                s.sector.nombre,

                departamento,

                municipio,

                situacionActual:
                `En ${municipio || "el territorio"} se identifican necesidades asociadas al sector ${s.sector.nombre}, que afectan la calidad de vida, el acceso a servicios y el bienestar de la población objetivo.`,

                problemaCentral:
                problema,

                poblacionAfectada:
                poblacionPrincipal
                ? poblacionPrincipal.descripcion
                : "Población del área de influencia del proyecto.",

                poblacionObjetivo:
                poblacionPrincipal
                ? poblacionPrincipal.nombre
                : "Población objetivo del proyecto.",

                justificacion:
                `El proyecto "${nombreProyecto}" se justifica por la necesidad de atender la problemática identificada, fortalecer la capacidad institucional y mejorar las condiciones de acceso de la población beneficiaria.`,

                ofertaActual:
                "La oferta actual resulta insuficiente frente a la demanda identificada.",

                demandaActual:
                "La demanda corresponde a la población objetivo que requiere acceder a bienes o servicios adecuados.",

                brecha:
                "Existe una brecha entre la oferta institucional disponible y la demanda de la población beneficiaria."
            },

            arbolProblemas: {
                problemaCentral:
                problema,

                causasDirectas: [
                    "Limitada capacidad institucional para atender la necesidad identificada.",
                    "Insuficiente disponibilidad de infraestructura, dotación, servicios o programas."
                ],

                causasIndirectas: [
                    "Restricciones presupuestales y técnicas.",
                    "Débil articulación de acciones sectoriales."
                ],

                efectosDirectos: [
                    "Bajo acceso de la población objetivo a bienes o servicios.",
                    "Deterioro de condiciones de bienestar de la población beneficiaria."
                ],

                efectosIndirectos: [
                    "Incremento de brechas sociales y territoriales.",
                    "Menor capacidad de respuesta institucional."
                ]
            },

            arbolObjetivos: {
                objetivoGeneral:
                objetivo,

                mediosDirectos: [
                    "Fortalecida capacidad institucional de atención.",
                    "Mejorada disponibilidad de bienes, servicios o programas."
                ],

                mediosIndirectos: [
                    "Gestión eficiente de recursos.",
                    "Mayor articulación sectorial e institucional."
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

            documentosMGA: {
                descripcionProblema:
                problema,

                justificacion:
                `El proyecto "${nombreProyecto}" contribuye al mejoramiento de las condiciones de vida de la población objetivo mediante una intervención orientada al sector ${s.sector.nombre}.`,

                objetivoGeneral:
                objetivo,

                beneficios:
                "Se espera mejorar el acceso, la cobertura, la calidad del servicio y las condiciones de bienestar de la población beneficiaria.",

                sostenibilidad:
                "La sostenibilidad dependerá de la asignación de responsables institucionales, recursos de operación, mantenimiento, seguimiento de indicadores y gestión de riesgos."
            },

            catalogosUsados: {
                sector:
                s.sector.codigo || s.sector.id,

                productos:
                s.productos.map(x => x.codigo || x.id),

                indicadores:
                s.indicadores.map(x => x.codigo || x.id),

                actividades:
                s.actividades.map(x => x.codigo || x.id),

                riesgos:
                s.riesgos.map(x => x.codigo || x.id),

                poblaciones:
                s.poblaciones.map(x => x.codigo || x.id),

                normas:
                s.normas.map(x => x.codigo || x.id)
            }
        };

    }

    function aplicarModeloBase(projectId, codigoSector, opciones = {}){

        if(!window.MGA || typeof MGA.updateModel !== "function"){
            alert("MGA.updateModel no está disponible.");
            return null;
        }

        const modelo =
        construirModeloBaseDesdeSector(codigoSector, opciones);

        if(!modelo){
            alert("No fue posible construir el modelo base del sector.");
            return null;
        }

        return MGA.updateModel(projectId, modelo);

    }

    // =====================================
    // PREPARADORES
    // =====================================

    function prepararIndicadores(lista = []){

        const base =
        {
            producto: [],
            resultado: [],
            gestion: [],
            impacto: []
        };

        lista.forEach(ind => {

            const tipo =
            normalizar(ind.tipoIndicador || "producto");

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

    function prepararRiesgos(lista = []){

        return lista.map(r => ({
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

    // =====================================
    // ESTADÍSTICAS Y DIAGNÓSTICO
    // =====================================

    function estadisticas(){

        if(!asegurar()){
            return null;
        }

        return CatalogoMGA.estadisticas();

    }

    function diagnosticar(){

        const req =
        [
            "actividades",
            "productos",
            "indicadores",
            "riesgos",
            "poblaciones",
            "normatividad",
            "sectores",
            "fuentes-financiacion"
        ];

        const faltantes =
        req.filter(x =>
            !CatalogoMGA.existe(x)
        );

        return {
            disponible:
            disponible(),

            faltantes,

            completo:
            faltantes.length === 0,

            estadisticas:
            disponible()
            ? CatalogoMGA.estadisticas()
            : null
        };

    }

    // =====================================
    // HELPERS
    // =====================================

    function uniqueByCodigo(lista){

        const map =
        new Map();

        (lista || []).forEach(item => {

            const key =
            item.codigo || item.id || item.nombre;

            if(!map.has(key)){
                map.set(key, item);
            }

        });

        return Array.from(map.values());

    }

    function uid(prefix){

        if(window.MGA && typeof MGA.uid === "function"){
            return MGA.uid(prefix);
        }

        return `${prefix}_${Date.now()}_${Math.random().toString(16).slice(2)}`;

    }

    function normalizar(value){

        return String(value || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .trim();

    }

    // =====================================
    // API PÚBLICA
    // =====================================

    return {
        disponible,
        diagnosticar,
        estadisticas,

        get,
        listar,
        buscar,
        buscarGlobal,

        getSector,
        getFuente,
        getProducto,
        getIndicador,
        getRiesgo,
        getPoblacion,
        getNorma,
        getActividad,

        buscarSector,
        buscarFuente,
        buscarProducto,
        buscarIndicador,
        buscarRiesgo,
        buscarPoblacion,
        buscarNorma,
        buscarActividad,

        resolverProducto,
        resolverProductos,
        resolverSector,
        detectarSectorPorTexto,

        sugerirPorTexto,
        sugerirParaSector,

        construirModeloBaseDesdeSector,
        aplicarModeloBase
    };

})();

window.MotorCatalogos = MotorCatalogos;
