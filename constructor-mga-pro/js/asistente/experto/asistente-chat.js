// =====================================
// ASISTENTE-CHAT.JS
// CONSTRUCTOR MGA PRO
// Interfaz conversacional para el Motor Experto MGA
// =====================================

/*
  Requiere cargar antes:
  - js/asistente/experto/motor-conocimiento.js
  - js/asistente/experto/motor-analisis.js
  - js/asistente/experto/motor-generador.js
  - js/asistente/experto/motor-coherencia.js
  - js/asistente/experto/motor-financiacion.js
  - js/asistente/experto/motor-riesgos.js
  - js/asistente/experto/motor-indicadores.js
  - js/asistente/experto/motor-documentos.js
  - js/asistente/experto/motor-asistente.js
*/

const AsistenteChatMGA = (()=>{

let contenedor = null;
let historial = [];
let proyectoActual = null;

// =====================================
// CREAR INTERFAZ
// =====================================

function crear(idContenedor="asistenteMGA"){

    contenedor = document.getElementById(idContenedor);

    if(!contenedor){
        console.warn("No existe el contenedor:", idContenedor);
        return;
    }

    contenedor.innerHTML = `
        <div class="mga-chat">
            <div class="mga-chat-header">
                <h3>Asistente Experto MGA</h3>
                <p>Formule proyectos conversando con el sistema</p>
            </div>

            <div class="mga-chat-body" id="mgaChatMensajes"></div>

            <div class="mga-chat-panel" id="mgaChatPanel">
                <strong>Proyecto detectado:</strong>
                <div id="mgaChatResumen">Aún no hay información.</div>
            </div>

            <div class="mga-chat-input">
                <input id="mgaChatTexto" type="text" placeholder="Escriba aquí su respuesta..." />
                <button id="mgaChatEnviar">Enviar</button>
            </div>
        </div>
    `;

    document.getElementById("mgaChatEnviar").addEventListener("click", enviar);
    document.getElementById("mgaChatTexto").addEventListener("keydown", e=>{
        if(e.key==="Enter") enviar();
    });

    iniciar();
}

// =====================================
// MENSAJES
// =====================================

function agregarMensaje(tipo,texto){

    const zona = document.getElementById("mgaChatMensajes");
    if(!zona) return;

    const div = document.createElement("div");
    div.className = "mga-msg " + (tipo==="usuario" ? "mga-msg-user" : "mga-msg-bot");
    div.innerHTML = texto;

    zona.appendChild(div);
    zona.scrollTop = zona.scrollHeight;

    historial.push({tipo,texto});
}

function iniciar(){

    historial = [];
    proyectoActual = null;

    if(!window.MotorAsistente){
        agregarMensaje("bot","No se encontró el MotorAsistente.");
        return;
    }

    const p = MotorAsistente.iniciar();
    agregarMensaje("bot",p.texto);
}

// =====================================
// PROCESAR RESPUESTA
// =====================================

function enviar(){

    const input = document.getElementById("mgaChatTexto");
    if(!input) return;

    const texto = input.value.trim();
    if(!texto) return;

    input.value = "";

    agregarMensaje("usuario",texto);

    const respuesta = MotorAsistente.responder(texto);

    if(!respuesta.finalizado){
        agregarMensaje("bot",respuesta.pregunta.texto);
        actualizarVistaParcial();
        return;
    }

    proyectoActual = respuesta.proyecto;

    agregarMensaje("bot","He generado una estructura preliminar del proyecto MGA.");
    actualizarPanelFinal(proyectoActual);
}

// =====================================
// ACTUALIZAR PANEL LATERAL
// =====================================

function actualizarVistaParcial(){

    const panel = document.getElementById("mgaChatResumen");
    if(!panel || !window.MotorAsistente) return;

    const estado = MotorAsistente.estadoActual();

    let html = "";

    Object.entries(estado.proyecto || {}).forEach(([k,v])=>{
        html += `<div><strong>${k}:</strong> ${v}</div>`;
    });

    panel.innerHTML = html || "Aún no hay información.";
}

function actualizarPanelFinal(proyecto){

    const panel = document.getElementById("mgaChatResumen");
    if(!panel) return;

    if(!proyecto || !proyecto.ok){
        panel.innerHTML = proyecto?.mensaje || "No fue posible generar el proyecto.";
        return;
    }

    let coherencia = null;

    if(window.MotorCoherencia){
        coherencia = MotorCoherencia.validarProyecto(proyecto);
    }

    let fuentes = [];

    if(window.MotorFinanciacion){
        fuentes = MotorFinanciacion.recomendarTipologia(
            proyecto.identificacion.tipologiaCodigo
        );
    }

    let html = `
        <div><strong>Nombre:</strong> ${proyecto.nombreProyecto}</div>
        <div><strong>Sector:</strong> ${proyecto.identificacion.sector}</div>
        <div><strong>Tipología:</strong> ${proyecto.identificacion.tipologia}</div>
        <div><strong>Objetivo:</strong> ${proyecto.objetivos.objetivoGeneral}</div>
        <div><strong>Coherencia:</strong> ${coherencia ? coherencia.puntaje + "/100" : "No calculada"}</div>
        <hr>
        <div><strong>Fuentes sugeridas:</strong></div>
        <ul>
            ${fuentes.map(f=>`<li>${f}</li>`).join("")}
        </ul>
    `;

    panel.innerHTML = html;
}

// =====================================
// EXPORTAR RESULTADO
// =====================================

function obtenerProyecto(){
    return proyectoActual;
}

function obtenerHistorial(){
    return [...historial];
}

return{
    crear,
    iniciar,
    enviar,
    obtenerProyecto,
    obtenerHistorial
};

})();

window.AsistenteChatMGA = AsistenteChatMGA;
