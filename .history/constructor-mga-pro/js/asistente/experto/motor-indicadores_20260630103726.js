// =====================================
// MOTOR-INDICADORES.JS
// CONSTRUCTOR MGA PRO
// Selección inteligente de indicadores
// =====================================

const MotorIndicadores = (()=>{

function clonar(x){
  return JSON.parse(JSON.stringify(x));
}

function indicadoresTipologia(codigoTipologia){

  if(!window.MotorConocimiento){
    return [];
  }

  const comp = MotorConocimiento.componentesTipologia(codigoTipologia);

  if(!comp) return [];

  const lista = [];

  (comp.indicadores || []).forEach((ind,i)=>{

    lista.push({
      codigo: ind.codigo || ind.id || "",
      nombre: ind.nombre || ind.descripcion || `Indicador ${i+1}`,
      tipo: i===0 ? "Producto" : (i===1 ? "Resultado" : "Gestión"),
      lineaBase: 0,
      meta: 1,
      unidad: ind.unidad || "Unidad",
      frecuencia: "Trimestral",
      fuenteVerificacion: "Informes de seguimiento"
    });

  });

  return lista;
}

function desdeTexto(texto){

  if(!window.MotorAnalisis){
    return [];
  }

  const analisis = MotorAnalisis.analizar(texto);

  if(!analisis.ok){
    return [];
  }

  return indicadoresTipologia(analisis.tipologiaCodigo);
}

function matriz(texto){

  const indicadores = desdeTexto(texto);

  return {
    proyecto: texto,
    total: indicadores.length,
    indicadores
  };

}

function validar(indicadores){

  const errores=[];

  (indicadores||[]).forEach((i,idx)=>{

    if(!i.nombre) errores.push(`Indicador ${idx+1}: falta nombre.`);
    if(i.meta===undefined || i.meta===null) errores.push(`Indicador ${idx+1}: falta meta.`);
    if(!i.unidad) errores.push(`Indicador ${idx+1}: falta unidad.`);
    if(!i.frecuencia) errores.push(`Indicador ${idx+1}: falta frecuencia.`);

  });

  return{
    ok:errores.length===0,
    errores
  };

}

return{
  indicadoresTipologia,
  desdeTexto,
  matriz,
  validar
};

})();

window.MotorIndicadores = MotorIndicadores;
