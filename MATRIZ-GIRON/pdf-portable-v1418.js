/* v1.4.18 — Acceso local a PDF archivados para Safari/iPhone/iPad.
   No se publica el documento ni se toca IndexedDB: se recibe únicamente su Blob.
   El visor incrustado depende del motor PDF del navegador; Compartir/Guardar es
   una alternativa explícita para dispositivos iOS y PWA. */
(()=>{
 'use strict';
 let current=null, currentUrl='', previousUrls=[];
 const isAppleMobile=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||
   (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
 const html=`<div id="matrizPdfViewer" class="matriz-pdf-overlay" hidden role="dialog" aria-modal="true" aria-label="Consultar PDF archivado">
   <div class="matriz-pdf-shell">
     <header class="matriz-pdf-header"><div><strong>📄 Documento PDF archivado</strong><small id="matrizPdfFilename"></small></div><button type="button" id="matrizPdfClose" class="secondary" aria-label="Cerrar visor">✕ Cerrar</button></header>
     <div class="matriz-pdf-actions">
       <button type="button" id="matrizPdfShare" class="primary">📤 Compartir / Guardar en Archivos</button>
       <button type="button" id="matrizPdfDownload" class="secondary">⬇ Descargar PDF</button>
       <a id="matrizPdfNewTab" class="secondary" href="#" target="_blank" rel="noopener">↗ Abrir en otra pestaña</a>
     </div>
     <p class="matriz-pdf-hint" id="matrizPdfHint"></p>
     <iframe id="matrizPdfFrame" title="Vista del PDF archivado" class="matriz-pdf-frame"></iframe>
     <p class="matriz-pdf-status" id="matrizPdfStatus" role="status" aria-live="polite"></p>
   </div>
 </div>`;
 function el(id){return document.getElementById(id)}
 function display(msg,error=false){const box=el('matrizPdfStatus');if(box){box.textContent=msg;box.classList.toggle('error',error)}}
 function ensure(){
   if(el('matrizPdfViewer'))return;
   document.body.insertAdjacentHTML('beforeend',html);
   el('matrizPdfClose').addEventListener('click',close);
   el('matrizPdfViewer').addEventListener('click',e=>{if(e.target===el('matrizPdfViewer'))close()});
   el('matrizPdfShare').addEventListener('click',share);
   el('matrizPdfDownload').addEventListener('click',download);
   document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!el('matrizPdfViewer').hidden)close()});
 }
 function safeName(name){
   const str=String(name||'Documento-archivado.pdf').replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').trim()||'Documento-archivado.pdf';
   return /\.pdf$/i.test(str)?str:str+'.pdf';
 }
 function preparePdf(blob){
   if(!(blob instanceof Blob)||blob.size===0)throw new Error('El registro no contiene un archivo PDF válido. Compruebe el respaldo integral original.');
   return blob.type==='application/pdf'?blob:new Blob([blob],{type:'application/pdf'});
 }
 function open(blob,name){
   ensure();
   try{
     const pdf=preparePdf(blob);
     const filename=safeName(name);
     if(currentUrl){previousUrls.push(currentUrl);if(previousUrls.length>4)URL.revokeObjectURL(previousUrls.shift())}
     currentUrl=URL.createObjectURL(pdf);
     current={blob:pdf,filename};
     el('matrizPdfFilename').textContent=filename;
     el('matrizPdfNewTab').href=currentUrl;
     el('matrizPdfFrame').src=currentUrl+'#toolbar=1&navpanes=0';
     el('matrizPdfHint').textContent=isAppleMobile()?
       'En iPhone o iPad la vista incrustada puede no mostrar todas las páginas. Si queda en blanco, pulse «Compartir / Guardar en Archivos», luego «Guardar en Archivos» o abra el PDF con la app Archivos.':
       'Si la vista aparece en blanco, pruebe «Abrir en otra pestaña» o «Descargar PDF». El documento continúa archivado en su dispositivo.';
     display('Documento localizado en el archivo local. Puede visualizarlo, compartirlo o guardarlo sin modificar el original.');
     el('matrizPdfViewer').hidden=false;
     document.body.classList.add('matriz-pdf-active');
     return true;
   }catch(err){display('No se pudo preparar el PDF: '+err.message,true);alert('No fue posible recuperar el archivo PDF. '+err.message);return false}
 }
 function close(){
   ensure();el('matrizPdfViewer').hidden=true;
   document.body.classList.remove('matriz-pdf-active');
   el('matrizPdfFrame').removeAttribute('src');
   // Revoke after the native viewer / iOS share flow finishes, never in the same tap.
   if(currentUrl){previousUrls.push(currentUrl);currentUrl=''}
   while(previousUrls.length>4)URL.revokeObjectURL(previousUrls.shift());
   current=null;
 }
 function download(){
   if(!current)return;
   const url=currentUrl||URL.createObjectURL(current.blob);
   const a=document.createElement('a');a.href=url;a.download=current.filename;document.body.appendChild(a);a.click();a.remove();
   display('Se solicitó la descarga. En iPhone/iPad consulte Descargas de Safari o utilice «Compartir / Guardar en Archivos».');
   if(url!==currentUrl)setTimeout(()=>URL.revokeObjectURL(url),120000);
 }
 async function share(){
   if(!current)return;
   const file=new File([current.blob],current.filename,{type:'application/pdf'});
   if(navigator.share && (!navigator.canShare || navigator.canShare({files:[file]}))){
     try{
       await navigator.share({files:[file],title:current.filename});
       display('Se abrió o se completó el menú de compartir. El archivo original permanece guardado en la Matriz.');return;
     }catch(err){
       if(err.name==='AbortError'){display('Operación de compartir cancelada; el PDF sigue archivado.');return}
       display('No fue posible compartir directamente: '+err.message+'. Puede usar «Descargar PDF».',true);
       return;
     }
   }
   // Cuando la API de compartir archivos no existe, mantener opción de descarga.
   download();
 }
 window.GironPdfPortable={open,download,close,isAppleMobile};
})();
