/* Control directo de salida de tarjetas · v1.3.94
   Diseñado para funcionar aun si el estado interno de position.js no está disponible. */
(()=>{'use strict';
const $=id=>document.getElementById(id),clean=v=>String(v??'').trim(),digits=v=>clean(v).replace(/\D/g,'');
function canvasBlob(id){return new Promise((res,rej)=>{const c=$(id);if(!c)return rej(new Error('No se encontró la tarjeta en pantalla.'));c.toBlob(b=>b?res(b):rej(new Error('No fue posible preparar la imagen.')),'image/png',.96)})}
function posData(){const f=$('positionForm');return {title:clean(f?.elements?.title?.value)||'Mi posición',opinion:clean(f?.elements?.opinion?.value),scope:clean(f?.elements?.scope?.value)||'Girón'}}
window.positionShareDirect=async function(){
 try{
  const blob=await canvasBlob('positionCanvas'),d=posData(),file=new File([blob],`MI-POSICION-${Date.now()}.png`,{type:'image/png'});
  if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
   try{await navigator.share({title:d.title,files:[file]});return}catch(e){if(e?.name==='AbortError')return}
  }
  const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=file.name;a.style.display='none';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000);
 }catch(e){alert(e.message||'No fue posible compartir la tarjeta.')}
};
window.positionWhatsAppDirect=function(){
 const d=posData();
 if(typeof window.openCardMassWhatsAppShare!=='function'){alert('El selector de destinatarios no está disponible. Presione Ctrl+F5 y vuelva a intentar.');return}
 window.openCardMassWhatsAppShare({
   title:'Enviar tarjeta · Mi posición',
   message:`Hola {nombre}. Quiero compartir contigo mi posición sobre: ${d.title}.\n\n${d.opinion}\n\nIván Ortiz`,
   filename:`MI-POSICION-${Date.now()}.png`,
   blob:()=>canvasBlob('positionCanvas')
 });
};
})();
