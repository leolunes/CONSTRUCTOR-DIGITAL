// =====================================
// INTEGRACION-MGA-PRESUPUESTO.JS
// CONSTRUCTOR MGA PRO
// Ajuste visual y conceptual: MGA + Presupuesto Pro integrados
// =====================================

/*
  Objetivo:
  Evitar que la app se perciba como dos sistemas separados:
  - Formulación MGA
  - Presupuesto Pro / APU

  Este archivo mejora la presentación del dashboard principal
  y deja claro que el presupuesto es parte integral de la formulación.
*/

const IntegracionMGAPresupuesto = (() => {

function qs(sel){
    return document.querySelector(sel);
}

function qsa(sel){
    return Array.from(document.querySelectorAll(sel));
}

function actualizarTitulo(){
    const titulo = qsa("h1,h2,.app-title,.brand-title,.logo-title")
        .find(el => /CONSTRUCTOR|MGA|PRESUPUESTO/i.test(el.textContent || ""));

    if(titulo){
        titulo.textContent = "CONSTRUCTOR MGA PRO";
    }

    const subtitulos = qsa("p,small,.subtitle,.app-subtitle,.brand-subtitle")
        .filter(el => /formulaci|presupuesto|inversi|pública|publica/i.test(el.textContent || ""));

    if(subtitulos[0]){
        subtitulos[0].textContent = "Formulación MGA + Presupuesto APU + Documentos Técnicos de Proyectos de Inversión Pública";
    }
}

function actualizarBotones(){

    const botones = qsa("button,a");

    botones.forEach(btn => {
        const txt = (btn.textContent || "").trim().toLowerCase();

        if(txt.includes("instalar base presupuestal") || txt.includes("base presupuestal")){
            btn.textContent = "📦 Base APU";
            btn.title = "Instalar o actualizar la base presupuestal APU";
        }

        if(txt.includes("exportar backup")){
            btn.textContent = "💾 Exportar Backup";
        }

        if(txt.includes("importar backup")){
            btn.textContent = "📥 Importar Backup";
        }

        if(txt.includes("importar proyecto")){
            btn.textContent = "📂 Importar Proyecto";
        }

        if(txt.includes("nuevo proyecto")){
            btn.textContent = "+ Nuevo Proyecto Integral";
            btn.title = "Crear un proyecto con formulación MGA, presupuesto, indicadores, riesgos y documentos";
        }
    });
}

function crearBloqueFlujo(){

    if(qs("#flujoMGAIntegrado")) return;

    const banco = qsa("section,div")
        .find(el => /Banco de Proyectos/i.test(el.textContent || ""));

    if(!banco) return;

    const bloque = document.createElement("section");
    bloque.id = "flujoMGAIntegrado";
    bloque.className = "mga-integrado-flujo";
    bloque.innerHTML = `
        <div class="mga-flujo-head">
            <div>
                <h3>Flujo Integral del Proyecto</h3>
                <p>Una sola ruta: idea, formulación MGA, presupuesto APU, riesgos, indicadores y documentos.</p>
            </div>
            <span class="mga-flujo-badge">MGA + Presupuesto</span>
        </div>

        <div class="mga-flujo-grid">
            <div class="mga-flujo-card">
                <strong>1. Idea</strong>
                <span>Asistente inteligente y datos básicos</span>
            </div>
            <div class="mga-flujo-card">
                <strong>2. Diagnóstico</strong>
                <span>Problema, causas, efectos y población</span>
            </div>
            <div class="mga-flujo-card">
                <strong>3. Presupuesto / APU</strong>
                <span>Cantidades, APUs, costos directos e indirectos</span>
            </div>
            <div class="mga-flujo-card">
                <strong>4. MGA</strong>
                <span>Cadena de valor, indicadores y riesgos</span>
            </div>
            <div class="mga-flujo-card">
                <strong>5. Documentos</strong>
                <span>PDF, especificaciones y soporte técnico</span>
            </div>
        </div>
    `;

    banco.parentNode.insertBefore(bloque, banco);
}

function crearBotonAsistente(){

    if(qs("#btnAsistenteInteligente")) return;

    const contenedorBotones = qsa("header,nav,.toolbar,.topbar,.actions")
        .find(el => el.querySelector("button,a"));

    if(!contenedorBotones) return;

    const btn = document.createElement("button");
    btn.id = "btnAsistenteInteligente";
    btn.className = "btn-asistente-inteligente";
    btn.type = "button";
    btn.textContent = "🤖 Asistente Inteligente";
    btn.title = "Analizar una idea y generar la estructura MGA + Presupuesto";

    btn.addEventListener("click", () => {
        const destino = document.querySelector("#asistenteMGA,#asistenteProyecto,#panelAsistente");
        if(destino){
            destino.scrollIntoView({behavior:"smooth", block:"start"});
        }else{
            alert("El asistente se integrará en proyecto-detalle.html para formular MGA y presupuesto desde una misma idea.");
        }
    });

    const primerBoton = contenedorBotones.querySelector("button,a");
    if(primerBoton && primerBoton.parentNode){
        primerBoton.parentNode.insertBefore(btn, primerBoton.nextSibling);
    }else{
        contenedorBotones.appendChild(btn);
    }
}

function mejorarTarjetas(){

    const textos = qsa("*").filter(el => {
        const t = (el.textContent || "").trim();
        return t === "Base Presupuestal APU";
    });

    textos.forEach(el => {
        el.textContent = "Base APU del Proyecto";
    });

    const modo = qsa("*").find(el => (el.textContent || "").trim() === "Modo");
    if(modo){
        modo.textContent = "Motor Local";
    }
}

function iniciar(){
    actualizarTitulo();
    actualizarBotones();
    crearBotonAsistente();
    crearBloqueFlujo();
    mejorarTarjetas();
}

document.addEventListener("DOMContentLoaded", iniciar);

return {
    iniciar,
    actualizarTitulo,
    actualizarBotones,
    crearBloqueFlujo,
    crearBotonAsistente
};

})();

window.IntegracionMGAPresupuesto = IntegracionMGAPresupuesto;
