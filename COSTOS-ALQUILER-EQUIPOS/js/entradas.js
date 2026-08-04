"use strict";

const RUTA_INDICE_EQUIPOS = "data/equipos-index.json";
const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_ENTRADAS = "costos_alquiler_entradas";

const CAMPOS_ENTRADA = [
  "precioAdquisicion","valorRescate","vidaUtilHoras","horasAnio","tasaInteres",
  "seguroAnual","mantenimientoFijoAnual","consumoCombustible","precioCombustible",
  "factorLubricantes","costoRodaje","vidaRodajeHoras","operadorMes",
  "horasOperadorMes","margenAlquiler","rendimiento","unidadRendimiento",
  "unidadAlquiler","horasPorUnidadAlquiler","tarifaComercialObjetivo",
  "movilizacion","desmovilizacion","horasAmortizacion"
];

let equiposDisponibles = [];
let equipoSeleccionado = null;
let datosOriginalesEquipo = null;

document.addEventListener("DOMContentLoaded", iniciarEntradas);

async function iniciarEntradas() {
  configurarInterfazGeneral();
  configurarEventos();
  try {
    equiposDisponibles = await cargarIndiceEquipos();
    if (!equiposDisponibles.length) throw new Error("No hay equipos disponibles.");
    llenarSelectorEquipos(equiposDisponibles);

    const parametros = new URLSearchParams(location.search);
    const idUrl = parametros.get("equipo") || parametros.get("id");
    const guardado = obtenerEquipoGuardado();
    const idInicial = idUrl || guardado?.id || equiposDisponibles[0].id;

    await seleccionarEquipo(idInicial);
    actualizarEstado("Base disponible", `${equiposDisponibles.length} equipo(s) cargado(s)`, true);
  } catch (error) {
    mostrarError(error);
    actualizarEstado("Error de carga","Revise la base de equipos",false);
  }
}

function configurarInterfazGeneral() {
  const footerYear=document.getElementById("footerYear");
  if(footerYear) footerYear.textContent=new Date().getFullYear();
  const btnMenu=document.getElementById("btnMenu");
  const sidebar=document.getElementById("sidebar");
  if(btnMenu&&sidebar){
    btnMenu.addEventListener("click",()=>{
      const abierto=sidebar.classList.toggle("open");
      btnMenu.setAttribute("aria-expanded",String(abierto));
    });
  }
}

function configurarEventos() {
  document.getElementById("selectEquipo")?.addEventListener("change", async e => {
    if(e.target.value) await seleccionarEquipo(e.target.value);
  });
  document.getElementById("btnGuardarEntradas")?.addEventListener("click", guardarEntradas);
  document.getElementById("btnRestablecer")?.addEventListener("click", restablecerEntradas);
  document.getElementById("unidadRendimiento")?.addEventListener("input", actualizarUnidadRendimiento);
  CAMPOS_ENTRADA.forEach(id => {
    document.getElementById(id)?.addEventListener("input", e => e.target.classList.remove("input-error"));
  });
}

async function cargarIndiceEquipos() {
  const r=await fetch(`${RUTA_INDICE_EQUIPOS}?v=${Date.now()}`,{cache:"no-store"});
  if(!r.ok) throw new Error(`No se pudo abrir ${RUTA_INDICE_EQUIPOS}. HTTP ${r.status}.`);
  const c=await r.json();
  if(Array.isArray(c)) return c;
  if(Array.isArray(c.equipos)) return c.equipos;
  if(Array.isArray(c.modelos)) return c.modelos;
  throw new Error("equipos-index.json no tiene un arreglo válido.");
}

function llenarSelectorEquipos(equipos) {
  const select=document.getElementById("selectEquipo");
  if(!select) return;
  select.innerHTML="";
  equipos.forEach((equipo,i)=>{
    const op=document.createElement("option");
    op.value=obtenerIdEquipo(equipo,i);
    op.textContent=construirNombreEquipo(equipo);
    select.appendChild(op);
  });
}

async function seleccionarEquipo(idEquipo) {
  const indice=buscarEquipoEnIndice(idEquipo);
  if(!indice) throw new Error(`No se encontró el equipo "${idEquipo}".`);
  actualizarEstado("Cargando equipo",construirNombreEquipo(indice),true);

  const datos=await cargarDatosEquipo(indice);
  equipoSeleccionado=normalizarEquipo(indice,datos);
  datosOriginalesEquipo=copiarObjeto(equipoSeleccionado);

  const guardadas=obtenerEntradasGuardadas(equipoSeleccionado.id);
  if(guardadas && guardadas.versionDatos===equipoSeleccionado.versionDatos){
    equipoSeleccionado.entradas={
      ...equipoSeleccionado.entradas,
      ...(guardadas.entradas||{})
    };
  } else if(guardadas) {
    eliminarEntradasGuardadas(equipoSeleccionado.id);
  }

  mostrarEquipo(equipoSeleccionado);
  guardarEquipoActual(equipoSeleccionado);
  const select=document.getElementById("selectEquipo");
  if(select) select.value=equipoSeleccionado.id;
  actualizarEstado("Equipo seleccionado",equipoSeleccionado.codigo||equipoSeleccionado.nombre,true);
  ocultarError();
}

async function cargarDatosEquipo(indice) {
  if(indice.datos && typeof indice.datos==="object") return indice.datos;
  const carpeta=indice.carpeta||indice.slug||indice.id||"plantilla";
  const ruta=indice.rutaDatos||indice.ruta||indice.archivoDatos||`data/equipos/${carpeta}/datos.js`;

  ["EQUIPO_DATOS","DATOS_EQUIPO","EQUIPO","equipo","datosEquipo","equipoActual"]
    .forEach(nombre=>{ try{ delete window[nombre]; }catch{ window[nombre]=undefined; } });

  await cargarScriptDinamico(ruta);
  const dato=window.DATOS_EQUIPO||window.EQUIPO_DATOS||window.EQUIPO||
             window.equipo||window.datosEquipo||window.equipoActual;
  if(!dato || typeof dato!=="object") throw new Error(`El archivo ${ruta} no expuso datos válidos.`);
  return dato;
}

function cargarScriptDinamico(ruta) {
  return new Promise((resolve,reject)=>{
    document.querySelector('script[data-equipo-dinamico="true"]')?.remove();
    const s=document.createElement("script");
    s.src=`${ruta}${ruta.includes("?")?"&":"?"}v=${Date.now()}`;
    s.async=true; s.dataset.equipoDinamico="true";
    s.onload=resolve;
    s.onerror=()=>reject(new Error(`No fue posible cargar ${ruta}.`));
    document.body.appendChild(s);
  });
}

function normalizarEquipo(indice,datos) {
  const f={...indice,...datos};
  const e=f.entradas||{};
  const id=obtenerIdEquipo(f);
  return {
    ...f,
    id,
    carpeta:f.carpeta||f.slug||id,
    versionDatos:String(f.versionDatos||indice.versionDatos||"sin-version"),
    codigo:primer(f.codigo,f.codigoModelo,f.codigoEquipo,id),
    familia:primer(f.familia,f.tipo,f.categoria,"Sin familia"),
    marca:primer(f.marca,""),
    modelo:primer(f.modelo,f.nombreModelo,""),
    nombre:primer(f.nombre,f.nombreEquipo,f.equipo,f.descripcion,construirNombreEquipo(f)),
    referencia:primer(f.referencia,f.equipoReferencia,[f.marca,f.modelo].filter(Boolean).join(" "),f.codigo,""),
    rodaje:primer(f.rodaje,f.tipoRodaje,"No especificado"),
    combustible:primer(f.combustible,f.tipoCombustible,"No aplica"),
    unidadAlquiler:primer(f.unidadAlquiler,e.unidadAlquiler,f.unidad,"Hr"),
    horasPorUnidadAlquiler:numero(primer(f.horasPorUnidadAlquiler,e.horasPorUnidadAlquiler,
      String(primer(f.unidadAlquiler,e.unidadAlquiler,"Hr")).toLowerCase().startsWith("d")?8:1)),
    imagen:resolverRutaImagen(f),
    entradas:{
      precioAdquisicion:numero(e.precioAdquisicion),
      valorRescate:porcentajeVisible(e.valorRescate),
      vidaUtilHoras:numero(e.vidaUtilHoras),
      horasAnio:numero(e.horasAnio),
      tasaInteres:porcentajeVisible(e.tasaInteres),
      seguroAnual:porcentajeVisible(e.seguroAnual),
      mantenimientoFijoAnual:numero(e.mantenimientoFijoAnual),
      consumoCombustible:numero(e.consumoCombustible),
      precioCombustible:numero(e.precioCombustible),
      factorLubricantes:porcentajeVisible(e.factorLubricantes),
      costoRodaje:numero(e.costoRodaje),
      vidaRodajeHoras:numero(e.vidaRodajeHoras),
      operadorMes:numero(e.operadorMes),
      horasOperadorMes:numero(e.horasOperadorMes),
      margenAlquiler:porcentajeVisible(e.margenAlquiler),
      rendimiento:numero(e.rendimiento),
      unidadRendimiento:primer(e.unidadRendimiento,"unidad/h"),
      unidadCostoProduccion:primer(e.unidadCostoProduccion,"COP/unidad"),
      unidadAlquiler:primer(e.unidadAlquiler,f.unidadAlquiler,"Hr"),
      horasPorUnidadAlquiler:numero(primer(e.horasPorUnidadAlquiler,f.horasPorUnidadAlquiler,
        String(primer(e.unidadAlquiler,f.unidadAlquiler,"Hr")).toLowerCase().startsWith("d")?8:1)),
      tarifaComercialObjetivo:numero(primer(e.tarifaComercialObjetivo,f.tarifaComercial,0)),
      movilizacion:numero(e.movilizacion),
      desmovilizacion:numero(e.desmovilizacion),
      horasAmortizacion:numero(e.horasAmortizacion)
    }
  };
}

function mostrarEquipo(equipo) {
  asignarTexto("campoCodigo",equipo.codigo);
  asignarTexto("campoFamilia",equipo.familia);
  asignarTexto("datoNombre",equipo.nombre);
  asignarTexto("datoReferencia",equipo.referencia||equipo.codigo);
  asignarTexto("datoRodaje",`Rodaje: ${equipo.rodaje}`);
  asignarTexto("datoCombustible",`Combustible: ${equipo.combustible}`);
  asignarTexto("datoUnidadAlquiler",`Unidad: ${equipo.unidadAlquiler}`);
  CAMPOS_ENTRADA.forEach(id=>{
    const campo=document.getElementById(id);
    if(campo) campo.value=equipo.entradas[id]??"";
  });
  mostrarImagenEquipo(equipo.imagen,equipo.nombre);
  actualizarUnidadRendimiento();
}

function guardarEntradas() {
  if(!equipoSeleccionado) return mostrarToast("Primero seleccione un equipo.","error");
  const entradas=leerFormularioEntradas();
  if(!validarEntradas(entradas)) return mostrarToast("Revise los campos marcados.","error");
  equipoSeleccionado.entradas=entradas;
  guardarEquipoActual(equipoSeleccionado);
  guardarEntradasPorEquipo(equipoSeleccionado.id,equipoSeleccionado.versionDatos,entradas);
  localStorage.removeItem("costos_alquiler_resultados_calculo");
  mostrarToast("Las entradas fueron guardadas correctamente.","success");
  actualizarEstado("Entradas guardadas",equipoSeleccionado.codigo,true);
}

function restablecerEntradas() {
  if(!datosOriginalesEquipo) return;
  equipoSeleccionado=copiarObjeto(datosOriginalesEquipo);
  eliminarEntradasGuardadas(equipoSeleccionado.id);
  localStorage.removeItem("costos_alquiler_resultados_calculo");
  guardarEquipoActual(equipoSeleccionado);
  mostrarEquipo(equipoSeleccionado);
  mostrarToast("Se restablecieron los datos oficiales de la base.","success");
}

function leerFormularioEntradas() {
  const e={};
  CAMPOS_ENTRADA.forEach(id=>{
    const campo=document.getElementById(id);
    if(campo) e[id]=campo.type==="number"?numero(campo.value):String(campo.value||"").trim();
  });
  return e;
}

function validarEntradas(e) {
  let ok=true;
  CAMPOS_ENTRADA.forEach(id=>document.getElementById(id)?.classList.remove("input-error"));
  ["vidaUtilHoras","horasAnio","vidaRodajeHoras","horasOperadorMes","horasAmortizacion",
   "horasPorUnidadAlquiler"].forEach(id=>{
    if(!Number.isFinite(e[id])||e[id]<=0){
      ok=false; document.getElementById(id)?.classList.add("input-error");
    }
  });
  ["precioAdquisicion","precioCombustible","tarifaComercialObjetivo"].forEach(id=>{
    if(!Number.isFinite(e[id])||e[id]<0){
      ok=false; document.getElementById(id)?.classList.add("input-error");
    }
  });
  return ok;
}

function guardarEquipoActual(e){ localStorage.setItem(CLAVE_EQUIPO_ACTUAL,JSON.stringify(e)); }
function obtenerEquipoGuardado(){ try{const c=localStorage.getItem(CLAVE_EQUIPO_ACTUAL);return c?JSON.parse(c):null;}catch{return null;} }
function guardarEntradasPorEquipo(id,version,entradas){
  const base=obtenerBaseEntradasGuardadas();
  base[id]={versionDatos:version,entradas};
  localStorage.setItem(CLAVE_ENTRADAS,JSON.stringify(base));
}
function obtenerEntradasGuardadas(id){ return obtenerBaseEntradasGuardadas()[id]||null; }
function eliminarEntradasGuardadas(id){
  const base=obtenerBaseEntradasGuardadas(); delete base[id];
  localStorage.setItem(CLAVE_ENTRADAS,JSON.stringify(base));
}
function obtenerBaseEntradasGuardadas(){ try{const c=localStorage.getItem(CLAVE_ENTRADAS);return c?JSON.parse(c):{};}catch{return{};} }
function buscarEquipoEnIndice(id){ return equiposDisponibles.find((e,i)=>obtenerIdEquipo(e,i)===id); }
function obtenerIdEquipo(e,i=0){ return String(e.id||e.slug||e.carpeta||e.codigo||e.codigoModelo||`equipo-${i+1}`); }
function construirNombreEquipo(e){
  return [...new Set([e.codigo||e.codigoModelo,e.familia||e.tipo,e.marca,e.modelo||e.equipoReferencia,e.nombre||e.nombreEquipo].filter(Boolean))].join(" - ")||"Equipo sin nombre";
}
function resolverRutaImagen(f){
  if(f.imagen&&String(f.imagen).includes("/")) return f.imagen;
  const carpeta=f.carpeta||f.slug||f.id||"plantilla";
  return `data/equipos/${carpeta}/${f.imagen||f.foto||"imagen.jpg"}`;
}
function primer(...v){ return v.find(x=>x!==undefined&&x!==null&&String(x).trim()!==""); }
function numero(v){
  if(typeof v==="number") return Number.isFinite(v)?v:0;
  const t=String(v??"").trim().replace(/\s/g,"").replace(/\$/g,"");
  if(!t)return 0;
  if(t.includes(",")&&t.includes(".")){const n=Number(t.replace(/\./g,"").replace(",","."));return Number.isFinite(n)?n:0;}
  if(t.includes(",")){const n=Number(t.replace(",","."));return Number.isFinite(n)?n:0;}
  const n=Number(t);return Number.isFinite(n)?n:0;
}
function porcentajeVisible(v){const n=numero(v);return n>0&&n<=1?n*100:n;}
function asignarTexto(id,v){const el=document.getElementById(id);if(!el)return;if("value"in el)el.value=v??"";else el.textContent=v??"—";}
function actualizarUnidadRendimiento(){const c=document.getElementById("unidadRendimiento");const t=document.getElementById("unidadRendimientoTexto");if(t)t.textContent=c?.value?.trim()||"—";}
function actualizarEstado(t,d,ok){asignarTexto("statusTitle",t);asignarTexto("statusDescription",d);const p=document.getElementById("statusDot");if(p){p.classList.toggle("success",!!ok);p.classList.toggle("error",!ok);}}
function mostrarImagenEquipo(ruta,nombre){
  const img=document.getElementById("imagenEquipo"),fb=document.getElementById("imagenFallback");
  if(!img||!fb)return;img.hidden=true;fb.hidden=false;if(!ruta)return;
  img.onload=()=>{img.hidden=false;fb.hidden=true;};img.onerror=()=>{img.hidden=true;fb.hidden=false;};
  img.alt=`Imagen de ${nombre}`;img.src=`${ruta}?v=${Date.now()}`;
}
function mostrarToast(m,tipo="success"){
  const c=document.getElementById("toastContainer");if(!c)return alert(m);
  const x=document.createElement("div");x.className=`toast toast-${tipo}`;x.textContent=m;c.appendChild(x);
  setTimeout(()=>x.classList.add("show"),20);setTimeout(()=>{x.classList.remove("show");setTimeout(()=>x.remove(),250);},3000);
}
function mostrarError(e){const p=document.getElementById("panelError"),m=document.getElementById("mensajeError");if(p)p.hidden=false;if(m)m.textContent=e instanceof Error?e.message:String(e);console.error(e);}
function ocultarError(){const p=document.getElementById("panelError");if(p)p.hidden=true;}
function copiarObjeto(o){return JSON.parse(JSON.stringify(o));}