// =====================================
// BUSCADOR/SINONIMOS.JS
// CONSTRUCTOR MGA PRO
// Diccionario de sinónimos y equivalencias
// =====================================

const SinonimosBusquedas = (()=>{

const DICCIONARIO = {

"centro vida":[
"adulto mayor",
"hogar geriatrico",
"hogar gerontologico",
"centro de bienestar",
"centro dia"
],

"institucion educativa":[
"escuela",
"colegio",
"aulas",
"sede educativa"
],

"placa huella":[
"via rural",
"camino veredal",
"mejoramiento vial"
],

"centro de salud":[
"puesto de salud",
"hospital local",
"ips"
],

"acueducto":[
"agua potable",
"red de agua",
"abastecimiento de agua"
],

"alcantarillado":[
"red sanitaria",
"aguas residuales",
"colector"
],

"polideportivo":[
"escenario deportivo",
"cancha multiple",
"coliseo"
],

"parque":[
"parque infantil",
"espacio publico",
"zona verde"
]

};

function norm(v){
 return String(v||"")
 .toLowerCase()
 .normalize("NFD")
 .replace(/[\u0300-\u036f]/g,"")
 .trim();
}

function expandir(texto){

 const q=norm(texto);
 const salida=new Set([q]);

 Object.entries(DICCIONARIO).forEach(([k,vals])=>{

   const clave=norm(k);
   const lista=vals.map(norm);

   if(clave===q || lista.includes(q)){
      salida.add(clave);
      lista.forEach(x=>salida.add(x));
   }

 });

 return [...salida];

}

function registrar(clave,sinonimos=[]){

 DICCIONARIO[clave]=[
   ...(DICCIONARIO[clave]||[]),
   ...sinonimos
 ];

}

function listar(){
 return structuredClone
   ? structuredClone(DICCIONARIO)
   : JSON.parse(JSON.stringify(DICCIONARIO));
}

return{
 expandir,
 registrar,
 listar
};

})();

window.SinonimosBusquedas=SinonimosBusquedas;
