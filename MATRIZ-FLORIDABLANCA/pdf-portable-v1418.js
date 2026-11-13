/* Nuestra Floridablanca v1.0.35 — Lector de PDF del archivo local.
   Mantiene intacto IndexedDB y los PDF originales. Si la Matriz guardó las
   páginas como imágenes JPEG dentro del PDF, las muestra directamente, sin
   depender del plugin PDF del navegador. De lo contrario ofrece visor nativo
   y descarga, siempre con acciones visibles. */
(()=>{
  'use strict';
  let current=null, objectUrls=[], sequence=0;
  const isAppleMobile=()=>/iPad|iPhone|iPod/.test(navigator.userAgent)||
    (navigator.platform==='MacIntel'&&navigator.maxTouchPoints>1);
  const $=id=>document.getElementById(id);
  const html=`<section id="matrizPdfViewer" class="matriz-pdf-overlay" hidden role="dialog" aria-modal="true" aria-label="Consultar PDF guardado">
    <div class="matriz-pdf-shell">
      <header class="matriz-pdf-header"><div><strong>📄 PDF guardado — Nuestra Floridablanca</strong><small id="matrizPdfFilename"></small></div><button type="button" id="matrizPdfClose" class="secondary">✕ Cerrar y volver al archivo</button></header>
      <div class="matriz-pdf-actions">
        <button type="button" id="matrizPdfPages" class="primary">👁 Ver páginas aquí</button>
        <button type="button" id="matrizPdfNative" class="secondary">📑 Visor del navegador</button>
        <button type="button" id="matrizPdfDownload" class="secondary">⬇ Descargar original</button>
        <button type="button" id="matrizPdfShare" class="secondary">📤 Compartir</button>
        <a id="matrizPdfNewTab" class="secondary" href="#" target="_blank" rel="noopener">↗ Otra pestaña</a>
      </div>
      <p class="matriz-pdf-hint" id="matrizPdfHint">El documento archivado permanece intacto. La lectura aquí no lo modifica ni lo firma nuevamente.</p>
      <div class="matriz-pdf-page-scroll" id="matrizPdfPageScroll" aria-label="Páginas del PDF guardado"></div>
      <iframe id="matrizPdfFrame" title="Vista alternativa del PDF" class="matriz-pdf-frame" hidden></iframe>
      <p class="matriz-pdf-status" id="matrizPdfStatus" role="status" aria-live="polite"></p>
    </div>
  </section>`;
  function ensure(){
    if($('matrizPdfViewer'))return;
    document.body.insertAdjacentHTML('beforeend',html);
    $('matrizPdfClose').addEventListener('click',close);
    $('matrizPdfViewer').addEventListener('click',e=>{if(e.target===$('matrizPdfViewer'))close()});
    $('matrizPdfPages').addEventListener('click',()=>showPages());
    $('matrizPdfNative').addEventListener('click',()=>showNative());
    $('matrizPdfDownload').addEventListener('click',download);
    $('matrizPdfShare').addEventListener('click',share);
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('matrizPdfViewer').hidden)close()});
  }
  function status(message,error=false){const node=$('matrizPdfStatus');if(node){node.textContent=message;node.classList.toggle('error',error)}}
  function safeName(name){const n=String(name||'Derecho-de-Peticion.pdf').replace(/[\\/:*?"<>|\x00-\x1f]/g,'-').trim()||'Derecho-de-Peticion.pdf';return /\.pdf$/i.test(n)?n:n+'.pdf'}
  function makePdf(blob){
    if(!(blob instanceof Blob)||!blob.size)throw new Error('No hay un PDF disponible en este registro. Compruebe el respaldo.');
    return blob.type==='application/pdf'?blob:new Blob([blob],{type:'application/pdf'});
  }
  function revokeUrls(){for(const url of objectUrls){URL.revokeObjectURL(url)}objectUrls=[]}
  function ownUrl(blob){const url=URL.createObjectURL(blob);objectUrls.push(url);return url}
  function setActive(kind){
    $('matrizPdfPages').classList.toggle('primary',kind==='pages');$('matrizPdfNative').classList.toggle('primary',kind==='native');
    $('matrizPdfPages').classList.toggle('secondary',kind!=='pages');$('matrizPdfNative').classList.toggle('secondary',kind!=='native');
  }
  function showNative(){
    if(!current)return;
    $('matrizPdfPageScroll').hidden=true;
    $('matrizPdfFrame').hidden=false;
    if(!$('matrizPdfFrame').src || $('matrizPdfFrame').getAttribute('src')==='about:blank')$('matrizPdfFrame').src=current.url+'#toolbar=1&navpanes=0';
    setActive('native');
    status('Se abrió el visor del navegador. Si muestra una página blanca, pulse «Ver páginas aquí» o «Descargar original».');
  }
  function showPages(){
    $('matrizPdfPageScroll').hidden=false;
    $('matrizPdfFrame').hidden=true;
    setActive('pages');
    if(current&&current.pages.length)status(`${current.pages.length} página(s) recuperada(s) del PDF guardado. El archivo original permanece intacto.`);
  }
  // Los PDF emitidos por la Matriz contienen una imagen JPEG de cada página.
  // Leerlas directamente evita que un iframe o plugin PDF deje la pantalla en blanco.
  // No hay OCR, redimensionamiento ni cambios en los documentos archivados.
  async function getJpegPages(blob){
    if(blob.size>65*1024*1024)return [];
    const bytes=new Uint8Array(await blob.arrayBuffer());
    const view=new TextDecoder('latin1').decode(bytes);
    if(!view.startsWith('%PDF'))throw new Error('El archivo guardado no tiene la cabecera de un PDF válido.');
    const regex=/\/Subtype\s*\/Image\b[^>]*?\/Width\s+(\d+)[^>]*?\/Height\s+(\d+)[^>]*?\/Length\s+(\d+)\s*>>\s*stream\r?\n/g;
    const pages=[];let m;
    while((m=regex.exec(view))&&pages.length<80){
      const w=Number(m[1]),h=Number(m[2]),len=Number(m[3]);
      const offset=regex.lastIndex;
      if(len>=128&&len<=50e6&&w>=200&&h>=200&&offset+len<=bytes.length&&bytes[offset]===0xff&&bytes[offset+1]===0xd8){
        pages.push(new Blob([bytes.slice(offset,offset+len)],{type:'image/jpeg'}));
        regex.lastIndex=offset+len;
      }
    }
    return pages;
  }
  async function renderImages(seq){
    try{
      const pages=await getJpegPages(current.blob);
      if(seq!==sequence || !current)return;
      current.pages=pages;
      const list=$('matrizPdfPageScroll');list.replaceChildren();
      if(!pages.length){
        const note=document.createElement('p');note.className='matriz-pdf-fallback';
        note.textContent='Este PDF no tiene páginas JPEG reconocibles. Puede abrirlo en otra pestaña, utilizar el visor del navegador o descargar el original. Ningún documento fue eliminado.';
        list.appendChild(note);
        status('No se pudo crear la vista directa de este formato de PDF. Use las opciones de apertura o descarga.',true);
        return;
      }
      pages.forEach((page,i)=>{
        const figure=document.createElement('figure');figure.className='matriz-pdf-page';
        const img=document.createElement('img');img.className='matriz-pdf-page-img';img.alt=`Página ${i+1} del documento guardado`;
        img.decoding='async';img.loading=i<2?'eager':'lazy';img.src=ownUrl(page);
        img.onerror=()=>{figure.classList.add('matriz-pdf-page-error');img.alt='Esta página no pudo mostrarse; descargue el PDF original.'};
        const cap=document.createElement('figcaption');cap.textContent=`Página ${i+1} de ${pages.length}`;
        figure.append(img,cap);list.appendChild(figure);
      });
      showPages();
    }catch(err){
      if(seq!==sequence)return;
      $('matrizPdfPageScroll').innerHTML='<p class="matriz-pdf-fallback">La vista directa no está disponible para este documento. El PDF original sigue archivado. Use «Descargar original» o «Visor del navegador».</p>';
      status('No se pudo preparar la vista de páginas: '+err.message,true);
    }
  }
  function open(blob,name){
    ensure();
    try{
      const pdf=makePdf(blob), filename=safeName(name);
      sequence++;
      revokeUrls();
      current={blob:pdf,filename,url:ownUrl(pdf),pages:[]};
      $('matrizPdfFilename').textContent=filename;
      $('matrizPdfNewTab').href=current.url;
      $('matrizPdfFrame').setAttribute('src','about:blank');$('matrizPdfFrame').hidden=true;
      $('matrizPdfPageScroll').hidden=false;
      $('matrizPdfPageScroll').innerHTML='<div class="matriz-pdf-loading">Preparando páginas del documento guardado…</div>';
      $('matrizPdfHint').textContent='Ver páginas aquí funciona sin el visor PDF del navegador. Si no se muestran, utilice «Descargar original» o «Abrir en otra pestaña». Su archivo sigue guardado.';
      $('matrizPdfViewer').hidden=false;
      document.body.classList.add('matriz-pdf-active');
      setActive('pages');status('Localizando las páginas…');
      void renderImages(sequence);
      return true;
    }catch(err){alert('No fue posible abrir este PDF guardado: '+err.message);status(err.message,true);return false}
  }
  function close(){
    ensure();sequence++;
    $('matrizPdfViewer').hidden=true;document.body.classList.remove('matriz-pdf-active');
    $('matrizPdfFrame').setAttribute('src','about:blank');
    $('matrizPdfPageScroll').replaceChildren();current=null;
    // Los URL ya no son usados por las páginas; se liberan al cerrar.
    revokeUrls();
  }
  function download(){
    if(!current)return;
    const a=document.createElement('a');a.href=current.url;a.download=current.filename;document.body.appendChild(a);a.click();a.remove();
    status('Se solicitó la descarga del PDF original. El archivo archivado no se modificó.');
  }
  async function share(){
    if(!current)return;
    const file=new File([current.blob],current.filename,{type:'application/pdf'});
    if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){
      try{await navigator.share({files:[file],title:current.filename});status('Se abrió la opción de compartir. El documento original permanece archivado.');return}
      catch(err){if(err.name==='AbortError')return;status('No se pudo compartir directamente: '+err.message,true)}
    } else download();
  }
  window.GironPdfPortable={open,download,close,isAppleMobile};
})();
