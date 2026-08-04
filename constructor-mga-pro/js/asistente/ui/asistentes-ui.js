// =====================================
// UI/ASISTENTES-UI.JS
// CONSTRUCTOR MGA PRO
// Coordinador visual de asistentes inteligentes
// =====================================

const AsistentesUI = (()=>{

let projectIdActual="";

function iniciar(config={}){

    projectIdActual =
    config.projectId || obtenerProjectId();

    iniciarBuscador(config);
    iniciarTipologias(config);
    iniciarDashboard(config);

}

function obtenerProjectId(){

    const params =
    new URLSearchParams(window.location.search);

    return params.get("projectId") || "";

}

function iniciarBuscador(config={}){

    if(!window.BuscadorUI){
        return;
    }

    const inputId =
    config.inputBuscadorId || "txtBuscarProyecto";

    const listaId =
    config.listaBuscadorId || "listaBuscarProyecto";

    const input =
    document.getElementById(inputId);

    const lista =
    document.getElementById(listaId);

    if(!input || !lista){
        return;
    }

    BuscadorUI.iniciar({
        inputId,
        listaId,
        onSelect:
        item => seleccionarResultado(item)
    });

}

function seleccionarResultado(item){

    if(!item){
        return;
    }

    if(window.HistorialBusquedas){
        HistorialBusquedas.registrar(item.titulo || "", item);
    }

    if(item.tipo === "tipologia" && item.codigo){

        seleccionarTipologia(item.codigo);

        return;

    }

    if(item.tipo === "sector" || item.tipo === "sectores"){

        seleccionarSector(item.codigo);

    }

}

function seleccionarTipologia(codigo){

    if(!window.MotorTipologias){
        return;
    }

    const tip =
    MotorTipologias.obtener(codigo);

    if(!tip){
        return;
    }

    const selSector =
    document.getElementById("iaSector");

    const selTip =
    document.getElementById("iaTipologia");

    if(selSector){

        selSector.value =
        tip.sectorCodigo || "";

        if(window.TipologiasUI){
            TipologiasUI.cargarTipologias();
        }

    }

    if(selTip){
        selTip.value = tip.codigo;
    }

    if(window.TipologiasUI){
        TipologiasUI.preview();
    }

}

function seleccionarSector(codigo){

    const selSector =
    document.getElementById("iaSector");

    if(selSector){
        selSector.value = codigo || "";

        if(window.TipologiasUI){
            TipologiasUI.cargarTipologias();
            TipologiasUI.preview();
        }
    }

}

function iniciarTipologias(config={}){

    if(!window.TipologiasUI){
        return;
    }

    const sectorId =
    config.sectorId || "iaSector";

    const tipologiaId =
    config.tipologiaId || "iaTipologia";

    if(!document.getElementById(sectorId)){
        return;
    }

    TipologiasUI.iniciar({
        sectorId,
        tipologiaId,
        resultadoId:
        config.resultadoId || "iaSectorialResultado",

        projectId:
        projectIdActual,

        onApply:
        () => {
            refrescarDashboard();
        }
    });

}

function iniciarDashboard(config={}){

    if(window.DashboardUI && document.getElementById(config.dashboardId || "dashboardInteligente")){

        DashboardUI.render(
            projectIdActual,
            config.dashboardId || "dashboardInteligente"
        );

        return;

    }

    if(window.MGADashboard && document.getElementById("mgaDashboard")){

        MGADashboard.render(
            projectIdActual,
            "mgaDashboard"
        );

    }

}

function aplicarTipologiaDesdeFormulario(){

    if(!window.TipologiasUI){
        return null;
    }

    const opciones =
    leerOpcionesFormulario();

    return TipologiasUI.aplicar(opciones);

}

function leerOpcionesFormulario(){

    return {
        projectId:
        projectIdActual,

        nombreProyecto:
        document.getElementById("iaNombreProyecto")?.value || "",

        departamento:
        document.getElementById("iaDepartamento")?.value || "",

        municipio:
        document.getElementById("iaMunicipio")?.value || ""
    };

}

function previewTipologia(){

    if(window.TipologiasUI){
        TipologiasUI.preview();
    }

}

function refrescarDashboard(){

    if(window.MGADashboard && projectIdActual){
        MGADashboard.render(projectIdActual, "mgaDashboard");
    }

    if(window.DashboardUI && projectIdActual){
        DashboardUI.render(projectIdActual, "dashboardInteligente");
    }

}

function diagnostico(){

    return {
        projectId:
        projectIdActual,

        tieneBuscador:
        !!window.MotorBuscador,

        tieneTipologias:
        !!window.MotorTipologias,

        tieneCatalogos:
        !!window.MotorCatalogos,

        tieneUIBuscador:
        !!window.BuscadorUI,

        tieneUITipologias:
        !!window.TipologiasUI,

        tieneDashboard:
        !!window.MGADashboard || !!window.DashboardUI
    };

}

return{
    iniciar,
    seleccionarResultado,
    seleccionarTipologia,
    seleccionarSector,
    aplicarTipologiaDesdeFormulario,
    previewTipologia,
    refrescarDashboard,
    diagnostico
};

})();

window.AsistentesUI = AsistentesUI;
