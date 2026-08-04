// =====================================
// MOTOR-BUSCADOR.JS
// CONSTRUCTOR MGA PRO
// Coordinador del Buscador Inteligente
// =====================================

const MotorBuscador=(()=>{

const norm=v=>String(v||"").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").trim();

function agregar(tipo,lista,res){
 (lista||[]).forEach(x=>res.push({
   tipo,
   relevancia:50,
   titulo:x.nombre||x.titulo||"",
   descripcion:x.descripcion||"",
   codigo:x.codigo||x.id||"",
   data:x
 }));
}

function buscar(texto){
 const q=norm(texto);
 if(!q)return [];
 const res=[];
 if(window.MotorTipologias){
   (MotorTipologias.buscar(q)||[]).forEach(t=>res.push({
     tipo:"tipologia",
     relevancia:100,
     titulo:t.nombre,
     descripcion:t.descripcion||"",
     sector:t.sector,
     codigo:t.codigo,
     data:t
   }));
 }
 if(window.MotorCatalogos){
   agregar("sector",MotorCatalogos.buscarSector(q),res);
   agregar("producto",MotorCatalogos.buscarProducto(q),res);
   agregar("actividad",MotorCatalogos.buscarActividad(q),res);
   agregar("indicador",MotorCatalogos.buscarIndicador(q),res);
   agregar("riesgo",MotorCatalogos.buscarRiesgo(q),res);
   agregar("poblacion",MotorCatalogos.buscarPoblacion(q),res);
   agregar("norma",MotorCatalogos.buscarNorma(q),res);
 }
 return res.sort((a,b)=>b.relevancia-a.relevancia);
}

function autocompletar(texto,limite=8){
 return buscar(texto).slice(0,limite);
}

function detectarProyecto(texto){
 if(!window.MotorTipologias)return null;
 const r=MotorTipologias.detectar(texto);
 if(!r)return null;
 return {
   sector:r.sector,
   sectorCodigo:r.sectorCodigo,
   tipologia:r.codigo,
   nombre:r.nombre
 };
}

function generarDesdeBusqueda(projectId,texto,opciones={}){
 const p=detectarProyecto(texto);
 if(!p||!window.MotorTipologias)return null;
 return MotorTipologias.aplicar(projectId,p.tipologia,opciones);
}

function sugerencias(){
 if(!window.MotorTipologias)return [];
 return MotorTipologias.listar().slice(0,20).map(x=>({
   nombre:x.nombre,
   sector:x.sector,
   codigo:x.codigo
 }));
}

return{
 buscar,
 autocompletar,
 detectarProyecto,
 generarDesdeBusqueda,
 sugerencias
};

})();

window.MotorBuscador=MotorBuscador;
