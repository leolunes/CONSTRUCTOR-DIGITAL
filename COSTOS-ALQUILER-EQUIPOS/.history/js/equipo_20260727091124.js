"use strict";

document.addEventListener("DOMContentLoaded", iniciarFichaEquipo);

async function iniciarFichaEquipo() {
  try {
    const id = new URLSearchParams(location.search).get("id") ||
               new URLSearchParams(location.search).get("equipo");
    if (!id) throw new Error("No se indicó el equipo.");

    const indice = await fetch(`data/equipos-index.json?v=${Date.now()}`, {cache:"no-store"}).then(r=>{
      if(!r.ok) throw new Error("No se pudo cargar el índice.");
      return r.json();
    });
    const lista = Array.isArray(indice) ? indice : (indice.equipos || []);
    const registro = lista.find(x => String(x.id) === String(id));
    if (!registro) throw new Error(`No se encontró el equipo "${id}".`);

    ["EQUIPO_DATOS","DATOS_EQUIPO","EQUIPO","equipo","datosEquipo","equipoActual"]
      .forEach(n=>{ try{delete window[n];}catch{window[n]=undefined;} });

    const ruta = registro.rutaDatos || registro.ruta ||
                 `data/equipos/${registro.id}/datos.js`;
    await cargarScript(ruta);
    const datos = window.DATOS_EQUIPO || window.EQUIPO_DATOS;
    if (!datos) throw new Error("El archivo datos.js no contiene datos válidos.");

    renderizar(datos, registro);
  } catch (error) {
    console.error(error);
    const titulo=document.getElementById("tituloError");
    const desc=document.getElementById("descripcionError");
    if(titulo) titulo.textContent="No fue posible cargar el equipo";
    if(desc) desc.textContent=error.message;
    document.getElementById("estadoCarga")?.setAttribute("hidden","");
    document.getElementById("estadoError")?.removeAttribute("hidden");
  }
}

function cargarScript(ruta) {
  return new Promise((resolve,reject)=>{
    const s=document.createElement("script");
    s.src=`${ruta}?v=${Date.now()}`;
    s.onload=()=>{s.remove();resolve();};
    s.onerror=()=>reject(new Error(`No fue posible cargar ${ruta}.`));
    document.head.appendChild(s);
  });
}

function renderizar(d, i) {
  const c=d.calculados||{}, e=d.entradas||{};
  set("tituloPagina",d.nombre);
  set("nombreEquipo",d.nombre);
  set("codigoModelo",d.codigo||i.codigoModelo);
  set("estadoEquipo","ACTIVO");
  set("equipoReferencia",d.referencia||i.equipoReferencia);
  set("descripcionGeneral",d.usoRecomendado||d.referencia);
  set("familiaEquipo",d.familia);
  set("rodajeEquipo",d.rodaje);
  set("tipoCombustible",d.combustible);
  set("unidadAlquiler",d.unidadAlquiler);
  set("tarifaComercial",moneda(c.tarifaComercial ?? e.tarifaComercialObjetivo));
  set("tarifaUnidad",`por ${d.unidadAlquiler}`);
  set("costoDirectoHora",moneda(c.costoDirectoHorario));
  set("transporteHora",moneda(c.costoTransporteEquivalente));
  set("costoComercialFinal",moneda(c.costoComercialFinal));
  set("precioAdquisicion",moneda(e.precioAdquisicion));
  set("consumoCombustible",`${numero(e.consumoCombustible).toLocaleString("es-CO",{maximumFractionDigits:3})} L/h`);
  set("rendimientoReferencial",numero(e.rendimiento).toLocaleString("es-CO",{maximumFractionDigits:2}));
  set("unidadRendimiento",e.unidadRendimiento);
  set("margenAlquiler",`${porcentaje(e.margenAlquiler).toLocaleString("es-CO",{maximumFractionDigits:2})} %`);

  const img=document.getElementById("imagenEquipo");
  const fb=document.getElementById("imagenFallback");
  if(img){
    const ruta=i.imagen||`data/equipos/${d.id}/imagen.jpg`;
    img.onload=()=>{img.hidden=false;if(fb)fb.hidden=true;};
    img.onerror=()=>{img.hidden=true;if(fb)fb.hidden=false;};
    img.src=`${ruta}?v=${Date.now()}`;
  }

  document.getElementById("estadoCarga")?.setAttribute("hidden","");
  document.getElementById("estadoError")?.setAttribute("hidden","");
  document.getElementById("fichaEquipo")?.removeAttribute("hidden");
  document.title=`${d.nombre} | Costos de Alquiler`;
}
function set(id,v){const el=document.getElementById(id);if(el)el.textContent=v??"—";}
function numero(v){const n=Number(v);return Number.isFinite(n)?n:0;}
function porcentaje(v){const n=numero(v);return Math.abs(n)<=1?n*100:n;}
function moneda(v){return new Intl.NumberFormat("es-CO",{style:"currency",currency:"COP",maximumFractionDigits:2}).format(numero(v));}