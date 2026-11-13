/* Control directo de salida de comentarios · Floridablanca v1.0.14
   Diseñado para funcionar aun si el estado interno de position.js no está disponible. */
(()=>{'use strict';
const $=id=>document.getElementById(id),clean=v=>String(v??'').trim(),digits=v=>clean(v).replace(/\D/g,'');
function canvasBlob(id){return new Promise((res,rej)=>{const c=$(id);if(!c)return rej(new Error('No se encontró la tarjeta en pantalla.'));c.toBlob(b=>b?res(b):rej(new Error('No fue posible preparar la imagen.')),'image/png',.96)})}
function posData(){const f=$('positionForm');return {title:clean(f?.elements?.title?.value)||'Comentario de Marco',opinion:clean(f?.elements?.opinion?.value),scope:clean(f?.elements?.scope?.value)||'Floridablanca'}}
window.positionShareDirect=async function(){
 try{
  const d=posData(),files=typeof window.positionAllCardFiles==='function'
    ?await window.positionAllCardFiles()
    :[new File([await canvasBlob('positionCanvas')],`COMENTARIO-MARCO-${Date.now()}.png`,{type:'image/png'})];
  if(!files.length)throw new Error('No se encontraron tarjetas para compartir.');
  if(navigator.share&&(!navigator.canShare||navigator.canShare({files}))){
   try{await navigator.share({title:d.title,files});return}catch(e){if(e?.name==='AbortError')return}
  }
  if(files.length>1&&typeof window.positionDownloadAll==='function'){
   await window.positionDownloadAll();
   alert('Se guardaron todas las tarjetas en un archivo ZIP. Para publicarlas, descomprima y seleccione las imágenes en orden.');
  }else{
   const blob=files[0],url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=files[0].name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
  }
 }catch(e){alert(e.message||'No fue posible compartir la tarjeta.')}
};
window.positionWhatsAppDirect=function(){
 const d=posData();
 if(typeof window.openCardMassWhatsAppShare!=='function'){alert('El selector de destinatarios no está disponible. Presione Ctrl+F5 y vuelva a intentar.');return}
 window.openCardMassWhatsAppShare({
   title:'Enviar tarjeta · Marco Andrés comparte',
   message:`Hola {nombre}. Quiero compartir contigo un comentario sobre: ${d.title}.\n\n${d.opinion}\n\nMarco Andrés Silva López`,
   filename:`COMENTARIO-MARCO-${Date.now()}.png`,
   blob:()=>canvasBlob('positionCanvas'),
   files:typeof window.positionAllCardFiles==='function'?window.positionAllCardFiles:undefined,
   downloadAll:window.positionDownloadAll
 });
};
})();
