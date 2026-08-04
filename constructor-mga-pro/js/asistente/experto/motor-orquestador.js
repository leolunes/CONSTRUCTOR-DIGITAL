// =====================================
// MOTOR-ORQUESTADOR.JS
// CONSTRUCTOR MGA PRO
// Cerebro central: coordina MGA + Presupuesto + Documentos
// =====================================

const MotorOrquestador = (()=>{

function clonar(obj){
    return JSON.parse(JSON.stringify(obj || null));
}

function ahoraISO(){
    return new Date().toISOString();
}

function disponible(nombre){
    return !!window[nombre];
}

function estadoInicial(){
    return {
        fecha: ahoraISO(),
        ok:false,
        pasos:[],
        alertas:[],
        errores:[],
        resultado:null
    };
}

function agregarPaso(ctx, nombre, ok, detalle){
    ctx.pasos.push({
        nombre,
        ok: !!ok,
        detalle: detalle || "",
        fecha: ahoraISO()
    });
}

function agregarAlerta(ctx, texto){
    ctx.alertas.push(texto);
}

function agregarError(ctx, texto){
    ctx.errores.push(texto);
}

function analizarIdea(ctx, idea){

    if(!disponible("MotorAnalisis")){
        agregarError(ctx, "MotorAnalisis no está disponible.");
        agregarPaso(ctx, "Análisis de idea", false, "Motor no cargado.");
        return null;
    }

    const analisis = MotorAnalisis.analizar(idea);

    agregarPaso(
        ctx,
        "Análisis de idea",
        analisis.ok,
        analisis.ok
            ? `Sector: ${analisis.sector}. Tipología: ${analisis.tipologia}.`
            : (analisis.mensaje || "No se logró analizar la idea.")
    );

    return analisis;
}

function generarProyecto(ctx, analisis, datos = {}){

    if(!disponible("MotorGenerador")){
        agregarError(ctx, "MotorGenerador no está disponible.");
        agregarPaso(ctx, "Generación MGA", false, "Motor no cargado.");
        return null;
    }

    if(!analisis || !analisis.ok){
        agregarPaso(ctx, "Generación MGA", false, "No existe análisis válido.");
        return null;
    }

    const generado = MotorGenerador.generar(
        analisis.tipologiaCodigo,
        {
            nombreProyecto: datos.nombreProyecto || datos.idea || analisis.textoOriginal || "",
            ubicacion: datos.ubicacion || analisis.datosDetectados?.lugar || "",
            beneficiarios: datos.beneficiarios || (
                analisis.datosDetectados?.beneficiarios
                    ? `${analisis.datosDetectados.beneficiarios.cantidad} ${analisis.datosDetectados.beneficiarios.tipo}`
                    : ""
            ),
            alcance: datos.alcance || (
                analisis.datosDetectados?.longitud
                    ? `${analisis.datosDetectados.longitud.valor} ${analisis.datosDetectados.longitud.unidad}`
                    : ""
            ),
            tipoIntervencion: datos.tipoIntervencion || analisis.datosDetectados?.tipoIntervencion || ""
        }
    );

    agregarPaso(
        ctx,
        "Generación MGA",
        generado.ok,
        generado.ok ? "Estructura MGA base generada." : (generado.mensaje || "No se logró generar.")
    );

    return generado;
}

function generarFinanciacion(ctx, analisis){

    if(!disponible("MotorFinanciacion")){
        agregarAlerta(ctx, "MotorFinanciacion no está disponible.");
        agregarPaso(ctx, "Fuentes de financiación", false, "Motor no cargado.");
        return [];
    }

    const fuentes = MotorFinanciacion.recomendarTipologia(analisis.tipologiaCodigo);

    agregarPaso(ctx, "Fuentes de financiación", true, `${fuentes.length} fuente(s) sugerida(s).`);

    return fuentes;
}

function generarRiesgos(ctx, analisis){

    if(!disponible("MotorRiesgos")){
        agregarAlerta(ctx, "MotorRiesgos no está disponible.");
        agregarPaso(ctx, "Matriz de riesgos", false, "Motor no cargado.");
        return [];
    }

    const riesgos = MotorRiesgos.obtenerPorTipologia(analisis.tipologiaCodigo);

    agregarPaso(ctx, "Matriz de riesgos", true, `${riesgos.length} riesgo(s) generado(s).`);

    return riesgos;
}

function generarIndicadores(ctx, analisis){

    if(!disponible("MotorIndicadores")){
        agregarAlerta(ctx, "MotorIndicadores no está disponible.");
        agregarPaso(ctx, "Indicadores", false, "Motor no cargado.");
        return [];
    }

    const indicadores = MotorIndicadores.indicadoresTipologia(analisis.tipologiaCodigo);

    agregarPaso(ctx, "Indicadores", true, `${indicadores.length} indicador(es) generado(s).`);

    return indicadores;
}

function generarDocumentos(ctx, idea){

    if(!disponible("MotorDocumentos")){
        agregarAlerta(ctx, "MotorDocumentos no está disponible.");
        agregarPaso(ctx, "Documentos técnicos", false, "Motor no cargado.");
        return null;
    }

    const documentos = MotorDocumentos.generar(idea);

    agregarPaso(
        ctx,
        "Documentos técnicos",
        documentos.ok,
        documentos.ok ? "Diagnóstico, resumen, árboles y marco lógico generados." : (documentos.mensaje || "No se generaron documentos.")
    );

    return documentos.ok ? documentos.documentos : null;
}

function validarCoherencia(ctx, proyecto){

    if(!disponible("MotorCoherencia")){
        agregarAlerta(ctx, "MotorCoherencia no está disponible.");
        agregarPaso(ctx, "Validación de coherencia", false, "Motor no cargado.");
        return null;
    }

    const validacion = MotorCoherencia.validarProyecto(proyecto);

    agregarPaso(ctx, "Validación de coherencia", validacion.ok, `Puntaje: ${validacion.puntaje}/100.`);

    return validacion;
}

function generarPresupuestoPreliminar(ctx, analisis, datos = {}){

    const presupuesto = {
        modo:"preliminar",
        origen:"Motor Orquestador",
        sector: analisis.sector,
        tipologia: analisis.tipologia,
        alcance: datos.alcance || "",
        capitulosSugeridos: [],
        observacion:"Presupuesto preliminar. Debe ajustarse con base APU, cantidades reales y análisis técnico."
    };

    const t = String(analisis.tipologia || "").toLowerCase();

    if(t.includes("placa") || t.includes("vía") || t.includes("via") || t.includes("paviment")){
        presupuesto.capitulosSugeridos = [
            "Preliminares",
            "Movimiento de tierras",
            "Estructura de pavimento / placa huella",
            "Drenajes",
            "Señalización",
            "Obras complementarias"
        ];
    }else if(t.includes("edificio") || t.includes("centro") || t.includes("casa") || t.includes("infraestructura")){
        presupuesto.capitulosSugeridos = [
            "Preliminares",
            "Cimentación",
            "Estructura",
            "Mampostería y pañetes",
            "Instalaciones hidrosanitarias",
            "Instalaciones eléctricas",
            "Acabados",
            "Dotación"
        ];
    }else{
        presupuesto.capitulosSugeridos = [
            "Preliminares",
            "Actividades principales",
            "Dotación o suministros",
            "Gestión social",
            "Cierre y seguimiento"
        ];
    }

    agregarPaso(ctx, "Presupuesto preliminar", true, `${presupuesto.capitulosSugeridos.length} capítulo(s) sugerido(s).`);

    return presupuesto;
}

function orquestarDesdeIdea(idea, datos = {}){

    const ctx = estadoInicial();

    if(!idea || !String(idea).trim()){
        agregarError(ctx, "La idea del proyecto está vacía.");
        return ctx;
    }

    const analisis = analizarIdea(ctx, idea);

    if(!analisis || !analisis.ok){
        ctx.ok = false;
        ctx.resultado = {
            idea,
            analisis,
            siguienteAccion:"Ajuste la idea del proyecto o seleccione una tipología manualmente."
        };
        return ctx;
    }

    const proyecto = generarProyecto(ctx, analisis, {
        ...datos,
        idea
    });

    if(!proyecto || !proyecto.ok){
        ctx.ok = false;
        ctx.resultado = {
            idea,
            analisis,
            siguienteAccion:"Revise la tipología seleccionada y vuelva a generar."
        };
        return ctx;
    }

    const financiacion = generarFinanciacion(ctx, analisis);
    const riesgos = generarRiesgos(ctx, analisis);
    const indicadores = generarIndicadores(ctx, analisis);
    const documentos = generarDocumentos(ctx, idea);
    const presupuesto = generarPresupuestoPreliminar(ctx, analisis, datos);
    const coherencia = validarCoherencia(ctx, proyecto);

    ctx.ok = true;

    ctx.resultado = {
        idea,
        analisis,
        proyecto,
        financiacion,
        riesgos,
        indicadores,
        documentos,
        presupuesto,
        coherencia,
        siguienteAccion: coherencia && coherencia.puntaje >= 80
            ? "Revise el presupuesto preliminar y complete cantidades/APUs."
            : "Revise las alertas de coherencia antes de avanzar."
    };

    return ctx;
}

async function guardarEnProyecto(projectId, paquete){

    if(!projectId){
        return {
            ok:false,
            mensaje:"No se recibió projectId."
        };
    }

    const data = {
        projectId,
        fecha: ahoraISO(),
        paquete: clonar(paquete)
    };

    try{

        if(window.AppStorage && typeof AppStorage.updateProject === "function"){
            await AppStorage.updateProject(projectId, {
                asistenteIntegral: data
            });
            return {ok:true, modo:"AppStorage.updateProject"};
        }

        if(window.StorageApp && typeof StorageApp.updateProject === "function"){
            await StorageApp.updateProject(projectId, {
                asistenteIntegral: data
            });
            return {ok:true, modo:"StorageApp.updateProject"};
        }

        const key = "mga_orquestador_" + projectId;
        localStorage.setItem(key, JSON.stringify(data));

        return {
            ok:true,
            modo:"localStorage",
            key
        };

    }catch(err){
        return {
            ok:false,
            mensaje: err.message || String(err)
        };
    }
}

function resumenEstado(ctx){

    if(!ctx) return null;

    const pasosOk = (ctx.pasos || []).filter(p=>p.ok).length;
    const total = (ctx.pasos || []).length;

    return {
        ok:ctx.ok,
        avance: total ? Math.round((pasosOk / total) * 100) : 0,
        pasosOk,
        totalPasos:total,
        errores:ctx.errores || [],
        alertas:ctx.alertas || [],
        siguienteAccion:ctx.resultado?.siguienteAccion || ""
    };
}

return {
    orquestarDesdeIdea,
    guardarEnProyecto,
    resumenEstado
};

})();

window.MotorOrquestador = MotorOrquestador;
