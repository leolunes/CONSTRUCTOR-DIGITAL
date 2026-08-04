// =====================================
// BUSCADOR/HISTORIAL.JS
// CONSTRUCTOR MGA PRO
// Historial, recientes y favoritos
// =====================================

const HistorialBusquedas = (()=>{

const KEY="mga.historial.busquedas";
const KEYF="mga.favoritos.busquedas";
const MAX=25;

function leer(k){
 try{return JSON.parse(localStorage.getItem(k)||"[]");}
 catch{return [];}
}

function guardarLista(k,v){
 localStorage.setItem(k,JSON.stringify(v));
}

function registrar(texto,item=null){

 if(!texto)return;

 let lista=leer(KEY);

 lista=lista.filter(x=>x.texto!==texto);

 lista.unshift({
   texto,
   fecha:new Date().toISOString(),
   item
 });

 if(lista.length>MAX){
   lista=lista.slice(0,MAX);
 }

 guardarLista(KEY,lista);

}

function listar(){
 return leer(KEY);
}

function limpiar(){
 guardarLista(KEY,[]);
}

function recientes(limite=10){
 return listar().slice(0,limite);
}

function agregarFavorito(item){

 if(!item)return;

 let fav=leer(KEYF);

 const id=(item.codigo||item.titulo||"")+"|"+(item.tipo||"");

 fav=fav.filter(x=>x.id!==id);

 fav.unshift({
   id,
   fecha:new Date().toISOString(),
   item
 });

 guardarLista(KEYF,fav);

}

function favoritos(){
 return leer(KEYF);
}

function eliminarFavorito(id){

 let fav=leer(KEYF);

 fav=fav.filter(x=>x.id!==id);

 guardarLista(KEYF,fav);

}

function buscarReciente(texto){

 const q=String(texto||"").toLowerCase();

 return listar().filter(x=>
   String(x.texto).toLowerCase().includes(q)
 );

}

return{
 registrar,
 listar,
 recientes,
 limpiar,
 agregarFavorito,
 favoritos,
 eliminarFavorito,
 buscarReciente
};

})();

window.HistorialBusquedas=HistorialBusquedas;
