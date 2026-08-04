// =====================================
// MOTOR-CONOCIMIENTO.JS
// CONSTRUCTOR MGA PRO
// Núcleo unificado de conocimiento sectorial
// =====================================

/*
  Este archivo centraliza el acceso a toda la base de conocimiento
  del Constructor MGA Pro.

  Requiere cargar antes:
  - js/asistente/motor-tipologias.js
  - js/asistente/motor-catalogos.js
  - Todas las plantillas sectoriales ya creadas
*/

const MotorConocimiento = (()=>{

// =====================================
// UTILIDADES BASE
// =====================================

function normalizar(texto){
    return String(texto || "")
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g,"")
        .trim();
}

function contiene(texto, termino){
    return normalizar(texto).includes(normalizar(termino));
}

function unico(lista){
    return [...new Set((lista || []).filter(Boolean))];
}

function clonar(obj){
    return JSON.parse(JSON.stringify(obj || null));
}

// =====================================
// TIPologías
// =====================================

function todasTipologias(){

    if(window.MotorTipologias && typeof MotorTipologias.listar === "function"){
        return MotorTipologias.listar();
    }

    if(window.MotorTipologias && typeof MotorTipologias.todas === "function"){
        return MotorTipologias.todas();
    }

    return [];
}

function obtenerTipologia(codigo){

    if(!codigo) return null;

    if(window.MotorTipologias && typeof MotorTipologias.obtener === "function"){
        return MotorTipologias.obtener(codigo);
    }

    return todasTipologias().find(t => t.codigo === codigo) || null;
}

function buscarTipologias(texto){

    const q = normalizar(texto);

    if(!q) return [];

    return todasTipologias()
        .map(t => {

            let puntaje = 0;

            const nombre = normalizar(t.nombre);
            const sector = normalizar(t.sector);
            const descripcion = normalizar(t.descripcion);
            const claves = (t.palabrasClave || []).map(normalizar);

            if(nombre === q) puntaje += 100;
            if(nombre.includes(q)) puntaje += 50;
            if(q.includes(nombre)) puntaje += 40;
            if(sector.includes(q)) puntaje += 15;
            if(descripcion.includes(q)) puntaje += 10;

            claves.forEach(k => {
                if(k === q) puntaje += 80;
                if(k.includes(q) || q.includes(k)) puntaje += 35;
            });

            return {
                ...t,
                puntaje
            };

        })
        .filter(t => t.puntaje > 0)
        .sort((a,b) => b.puntaje - a.puntaje);
}

function sugerirTipologia(texto){
    return buscarTipologias(texto)[0] || null;
}

// =====================================
// SECTORES
// =====================================

function sectores(){

    const lista = todasTipologias().map(t => ({
        codigo: t.sectorCodigo || "",
        nombre: t.sector || ""
    }));

    const mapa = {};

    lista.forEach(s => {
        if(!s.nombre) return;
        const key = s.codigo || s.nombre;
        mapa[key] = s;
    });

    return Object.values(mapa).sort((a,b)=>a.nombre.localeCompare(b.nombre));
}

function tipologiasPorSector(sectorCodigo){

    return todasTipologias()
        .filter(t =>
            t.sectorCodigo === sectorCodigo ||
            normalizar(t.sector) === normalizar(sectorCodigo)
        )
        .sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre)));
}

// =====================================
// CATÁLOGOS GENERALES
// =====================================

function catalogo(nombre){

    if(window.MotorCatalogos && typeof MotorCatalogos.obtener === "function"){
        return MotorCatalogos.obtener(nombre) || [];
    }

    if(window.MotorCatalogos && typeof MotorCatalogos.catalogo === "function"){
        return MotorCatalogos.catalogo(nombre) || [];
    }

    return [];
}

function buscarEnCatalogo(nombreCatalogo, codigos){

    const base = catalogo(nombreCatalogo);
    const set = new Set(codigos || []);

    return base.filter(x =>
        set.has(x.codigo) ||
        set.has(x.id) ||
        set.has(x.clave)
    );
}

// =====================================
// COMPONENTES DE UNA TIPOLOGÍA
// =====================================

function componentesTipologia(codigoTipologia){

    const t = obtenerTipologia(codigoTipologia);

    if(!t) return null;

    return {
        tipologia: clonar(t),
        poblaciones: buscarEnCatalogo("poblaciones", t.poblaciones),
        productos: buscarEnCatalogo("productos", t.productos),
        actividades: buscarEnCatalogo("actividades", t.actividades),
        indicadores: buscarEnCatalogo("indicadores", t.indicadores),
        riesgos: buscarEnCatalogo("riesgos", t.riesgos),
        normas: buscarEnCatalogo("normatividad", t.normas),
        fuentes: buscarEnCatalogo("fuentes", t.fuentes)
    };
}

function estructuraBase(codigoTipologia){

    const c = componentesTipologia(codigoTipologia);

    if(!c) return null;

    const t = c.tipologia;

    return {
        identificacion: {
            sector: t.sector || "",
            sectorCodigo: t.sectorCodigo || "",
            tipologia: t.nombre || "",
            tipologiaCodigo: t.codigo || "",
            descripcion: t.descripcion || ""
        },
        problema: {
            problemaCentral: t.problemaCentral || "",
            causasDirectas: t.causasDirectas || [],
            causasIndirectas: t.causasIndirectas || [],
            efectosDirectos: t.efectosDirectos || [],
            efectosIndirectos: t.efectosIndirectos || []
        },
        objetivos: {
            objetivoGeneral: t.objetivoGeneral || "",
            objetivosEspecificos: t.objetivosEspecificos || []
        },
        cadenaValor: {
            productos: c.productos.length ? c.productos : (t.productos || []),
            actividades: c.actividades.length ? c.actividades : (t.actividades || []),
            indicadores: c.indicadores.length ? c.indicadores : (t.indicadores || [])
        },
        riesgos: c.riesgos.length ? c.riesgos : (t.riesgos || []),
        normatividad: c.normas.length ? c.normas : (t.normas || []),
        fuentesFinanciacion: c.fuentes.length ? c.fuentes : (t.fuentes || []),
        poblacionObjetivo: c.poblaciones.length ? c.poblaciones : (t.poblaciones || []),
        beneficios: t.beneficios || "",
        sostenibilidad: t.sostenibilidad || "",
        palabrasClave: t.palabrasClave || []
    };
}

// =====================================
// ANÁLISIS DE TEXTO
// =====================================

function analizarIdea(texto){

    const tipologia = sugerirTipologia(texto);

    if(!tipologia){
        return {
            ok:false,
            mensaje:"No se encontró una tipología suficientemente relacionada.",
            texto,
            sugerencias: buscarTipologias(texto).slice(0,5)
        };
    }

    const estructura = estructuraBase(tipologia.codigo);

    return {
        ok:true,
        texto,
        sector: tipologia.sector,
        sectorCodigo: tipologia.sectorCodigo,
        tipologia: tipologia.nombre,
        tipologiaCodigo: tipologia.codigo,
        puntaje: tipologia.puntaje || 0,
        estructura,
        sugerencias: buscarTipologias(texto).slice(0,5)
    };
}

// =====================================
// RESUMEN EJECUTIVO DEL CONOCIMIENTO
// =====================================

function resumen(){

    const tips = todasTipologias();
    const secs = sectores();

    const porSector = secs.map(s => ({
        sector: s.nombre,
        codigo: s.codigo,
        tipologias: tipologiasPorSector(s.codigo).length
    }));

    return {
        sectores: secs.length,
        tipologias: tips.length,
        porSector
    };
}

// =====================================
// VALIDACIÓN BÁSICA DEL CONOCIMIENTO
// =====================================

function validar(){

    const errores = [];
    const tips = todasTipologias();

    tips.forEach(t => {

        if(!t.codigo) errores.push("Tipología sin código: " + (t.nombre || "sin nombre"));
        if(!t.nombre) errores.push("Tipología sin nombre: " + (t.codigo || "sin código"));
        if(!t.sector) errores.push("Tipología sin sector: " + (t.codigo || t.nombre));
        if(!t.problemaCentral) errores.push("Sin problema central: " + (t.codigo || t.nombre));
        if(!t.objetivoGeneral) errores.push("Sin objetivo general: " + (t.codigo || t.nombre));

    });

    return {
        ok: errores.length === 0,
        totalTipologias: tips.length,
        errores
    };
}

// =====================================
// API PÚBLICA
// =====================================

return {
    normalizar,
    sectores,
    todasTipologias,
    obtenerTipologia,
    buscarTipologias,
    sugerirTipologia,
    tipologiasPorSector,
    catalogo,
    buscarEnCatalogo,
    componentesTipologia,
    estructuraBase,
    analizarIdea,
    resumen,
    validar
};

})();

window.MotorConocimiento = MotorConocimiento;
