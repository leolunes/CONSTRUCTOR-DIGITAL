/* v4.6.35 — Píldoras de Recursos PDF. No modifica los PDF ni los libros. */
(function(){
'use strict';
const escHtml=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const KEY='lm_resource_pills_v1_';
let activeId='', activeTitle='', current=[];
const getR=id=>(typeof ministryResources!=='undefined'?ministryResources:[]).find(r=>String(r.id)===String(id));
function cached(id){try{return JSON.parse(localStorage.getItem(KEY+id)||'[]')}catch{return []}}
function save(id,items){try{localStorage.setItem(KEY+id,JSON.stringify(items));return true}catch(e){alert('No se pudieron guardar las píldoras. El espacio local podría estar lleno. Puede seguir usándolas en esta sesión.');return false}}
const origRender=window.renderResources;
window.renderResources=function(){origRender();const host=document.getElementById('resourceResults');if(!host)return;
 const cards=host.querySelectorAll('.resourceFeatured article,.resourceCard');
 const q=(document.getElementById('resourceSearch')?.value||'').toLowerCase();const filt=typeof resourceFilter!=='undefined'?resourceFilter:'todos';
 const rows=(typeof ministryResources!=='undefined'?ministryResources:[]).filter(r=>(filt==='todos'||r.categoria===filt)&&(!q||`${r.titulo||''} ${r.descripcion||''} ${r.libro||''}`.toLowerCase().includes(q)));
 const featured=rows.find(r=>r.destacado)||rows[0],ordered=featured?[featured,...rows.filter(r=>r.id!==featured.id)]:[];
 cards.forEach((card,i)=>{const r=ordered[i];if(!r)return;const actions=card.querySelector('.resourceActions,.resourceCardActions');if(!actions||actions.querySelector('.resourcePillsBtn'))return;const b=document.createElement('button');b.className='btn secondary resourcePillsBtn';b.textContent='💡 Píldoras';b.onclick=()=>window.resourcePills(String(r.id));actions.appendChild(b)});
};
function view(){const host=document.getElementById('app');if(!host)return;host.innerHTML=`<section class="card resourcePillWorkshop"><button class="btn secondary" onclick="resourcesPage()">← Volver a Recursos</button><span class="badge">💡 PÍLDORAS DE ENSEÑANZAS</span><h1>${escHtml(activeTitle)}</h1><p>Las píldoras se extraen del texto de esta enseñanza. Se exige una referencia y un versículo presentes en el mismo PDF; no se inventan Escrituras.</p><div class="row"><button class="btn" id="rpExtract">📄 Analizar PDF</button><button class="btn secondary" id="rpPaste">✍ Pegar texto de la enseñanza</button></div><p id="rpStatus" class="muted"></p><div id="rpResults"></div></section>`;
 document.getElementById('rpExtract').onclick=extract;document.getElementById('rpPaste').onclick=manual;
 renderPills();}
window.resourcePills=id=>{const r=getR(id);if(!r)return alert('No se encontró el recurso.');activeId=id;activeTitle=r.titulo||'Enseñanza';current=cached(id);view()};
function status(s){const el=document.getElementById('rpStatus');if(el)el.textContent=s}
function renderPills(){const host=document.getElementById('rpResults');if(!host)return;host.innerHTML=current.length?`<h2>${current.length} píldora${current.length===1?'':'s'} de esta enseñanza</h2>`+current.map((p,i)=>`<article class="card resourcePillCard"><small>💡 PÍLDORA ${i+1}</small><h3>“${escHtml(p.text)}”</h3><b>📖 ${escHtml(p.reference)}</b><p>${escHtml(p.verse)}</p><p>${escHtml(p.explanation)}</p><div class="row"><button class="btn secondary" data-action="image" data-index="${i}">🖼 Crear imagen</button><button class="btn secondary" data-action="share" data-index="${i}">Compartir</button><button class="btn secondary" data-action="edit" data-index="${i}">Editar</button></div></article>`).join(''):'<p class="muted">Todavía no hay píldoras extraídas de esta enseñanza.</p>';
 host.querySelectorAll('button[data-action]').forEach(b=>b.onclick=()=>{const p=current[+b.dataset.index];if(b.dataset.action==='image')window.downloadCard(cleanImageText(p.text),activeTitle,'Enseñanza independiente',p.reference,cleanImageText(p.verse),cleanImageText(p.explanation));if(b.dataset.action==='share')window.sharePill({...p,book:activeTitle,section:'Enseñanza independiente'});if(b.dataset.action==='edit')edit(+b.dataset.index)});}
function cleanImageText(s){return String(s||'').replace(/\b(CUAN)\s+(DO)\b/giu,'CUANDO').replace(/\s+/g,' ').trim()}
function edit(i){const p=current[i],host=document.getElementById('rpResults');host.innerHTML=`<div class="card"><h2>Revisar píldora</h2><label>Pensamiento<textarea id="rpText" rows="3">${escHtml(p.text)}</textarea></label><label>Referencia bíblica<input id="rpRef" value="${escHtml(p.reference)}"></label><label>Texto bíblico literal<input id="rpVerse" value="${escHtml(p.verse)}"></label><label>Reflexión<textarea id="rpReflection" rows="6">${escHtml(p.explanation)}</textarea></label><button class="btn" id="rpSave">Guardar revisión</button><button class="btn secondary" id="rpCancel">Cancelar</button></div>`;document.getElementById('rpCancel').onclick=renderPills;document.getElementById('rpSave').onclick=()=>{const next={text:document.getElementById('rpText').value.trim(),reference:document.getElementById('rpRef').value.trim(),verse:document.getElementById('rpVerse').value.trim(),explanation:document.getElementById('rpReflection').value.trim()};if(!next.text||!next.reference||!next.verse||!next.explanation)return alert('Complete todos los campos.');if(typeof validBibleReference==='function'&&!validBibleReference(next.reference))return alert('La referencia bíblica no tiene un formato válido.');current[i]=next;save(activeId,current);renderPills()}}
async function getBlob(r){const indexed=window.getIndexedResourcePDF?.(r.id);if(indexed instanceof Blob)return indexed;if(r.pdf instanceof Blob)return r.pdf;if(r.archivo){const response=await fetch(r.archivo);return await response.blob()}if(r.url){const response=await fetch(r.url);if(!response.ok)throw Error('No se pudo abrir el PDF publicado');return await response.blob()}return null}
let pdfPromise=null;
async function pdfLib(){if(window.pdfjsLib)return window.pdfjsLib;if(pdfPromise)return pdfPromise;pdfPromise=new Promise((resolve,reject)=>{const s=document.createElement('script');s.src='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';s.onload=()=>{if(!window.pdfjsLib)return reject(Error('PDF.js no disponible'));window.pdfjsLib.GlobalWorkerOptions.workerSrc='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';resolve(window.pdfjsLib)};s.onerror=()=>reject(Error('No se pudo cargar el lector PDF. Compruebe internet o use «Pegar texto».'));document.head.appendChild(s)});try{return await pdfPromise}catch(e){pdfPromise=null;throw e}}
async function extract(){const r=getR(activeId);status('Leyendo el PDF; espere un momento…');try{const blob=await getBlob(r);if(!blob)throw Error('No hay archivo PDF accesible para este recurso.');const lib=await pdfLib();const bytes=new Uint8Array(await blob.arrayBuffer());const doc=await lib.getDocument({data:bytes}).promise;let pages=[];for(let i=1;i<=doc.numPages;i++){const pg=await doc.getPage(i),tc=await pg.getTextContent();pages.push(pdfTextLines(tc.items));if(i%10===0)status(`Leyendo página ${i} de ${doc.numPages}…`)}const text=pages.join('\n');if(text.replace(/\s/g,'').length<150)throw Error('Este PDF parece escaneado o no tiene texto seleccionable. Use un PDF con texto o «Pegar texto».');processText(text)}catch(e){console.error(e);status('No se pudo extraer el texto: '+e.message+' Puede utilizar «Pegar texto de la enseñanza».')}}
function manual(){const host=document.getElementById('rpResults');host.innerHTML=`<div class="card"><h2>Pegar texto de la enseñanza</h2><p>Copie del PDF el pensamiento, su cita bíblica literal y el desarrollo cercano. No se inventarán textos ausentes.</p><textarea id="rpInput" rows="14" style="width:100%" placeholder="Pegue aquí el contenido de la enseñanza..."></textarea><div class="row"><button class="btn" id="rpProcess">Extraer píldoras</button><button class="btn secondary" id="rpCancel">Cancelar</button></div></div>`;document.getElementById('rpCancel').onclick=renderPills;document.getElementById('rpProcess').onclick=()=>processText(document.getElementById('rpInput').value)}
// Reconstruct visual lines from PDF.js instead of joining every text item with spaces.
function pdfTextLines(items){
 // PDF.js fragments may split one word into multiple glyph runs. Use their
 // actual horizontal coordinates rather than adding a space after each run.
 const rows=[];let row=[],lastY=null;
 function flush(){if(!row.length)return;let line='',right=null;
  for(const it of row){const str=String(it.str||'');if(!str)continue;
   const x=Number(it.transform?.[4]);const font=Number(it.height)||Math.abs(Number(it.transform?.[3]))||12;
   const gap=right===null||!Number.isFinite(x)?0:x-right;
   if(line&&gap>Math.max(1.8,font*.18)&&!(/\s$/.test(line)||/^\s/.test(str)))line+=' ';
   line+=str;right=Number.isFinite(x)?x+(Number(it.width)||0):null;
  }
  line=line.replace(/\s+/g,' ').trim();if(line)rows.push(line);row=[];
 }
 for(const it of items){const y=it.transform?.[5];if(lastY!==null&&typeof y==='number'&&Math.abs(y-lastY)>2.5)flush();
  if(it.str)row.push(it);if(it.hasEOL){flush();lastY=null}else if(typeof y==='number')lastY=y;
 }
 flush();return rows.join('\n');
}
function normalizeTeachingText(source){
 return String(source||'').replace(/\r/g,'\n').replace(/\f/g,'\n\n')
  .replace(/[\u00ad\u200b]/g,'').replace(/\s*\n\s*/g,'\n')
  .replace(/([a-záéíóúñ,;])\n(?=[a-záéíóúñ])/giu,'$1 ');
}
function cleanSpan(s){return String(s||'').replace(/\s+/g,' ').replace(/^[«“"\s]+|[»”"\s]+$/g,'').trim()}
function scriptureCandidates(source){
 const out=[];
 const lines=[...source.matchAll(/[^\n]+/gu)];
 const refRx=/^((?:(?:[1-3]|I{1,3})[ \t]*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:[ \t]+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}[ \t]+\d{1,3}:\d{1,3}(?:[ \t]*[-–][ \t]*\d{1,3})?)(?:[ \t]*[—–-][ \t]*RVR1960)?[ \t]*$/u;
 for(const line of lines){
  const m=line[0].trim().match(refRx);if(!m)continue;
  const reference=cleanSpan(m[1]);
  if(typeof validBibleReference==='function'&&!validBibleReference(reference))continue;
  const after=source.slice(line.index+line[0].length,line.index+line[0].length+1500);
  const quoted=after.match(/^\s*[«“"]([\s\S]{12,1100}?)[»”"]/u);
  if(!quoted)continue;
  const verse=cleanSpan(quoted[1]);
  if(verse.length<15||/\b(?:PRINCIPIO ESPIRITUAL|PREGUNTAS|ORACIÓN FINAL)\b/iu.test(verse))continue;
  out.push({reference,verse,at:line.index});
 }
 return out;
}
function teachingThoughts(source){
 const out=[];
 function add(t,at,kind){t=cleanSpan(t);if(t.length<45||t.length>380)return;
  if(/^(?:preguntas|oración|reflexión final|introducción|conclusión|lectura bíblica)/iu.test(t))return;
  if(out.some(p=>p.text.toLocaleLowerCase('es')===t.toLocaleLowerCase('es')))return;
  out.push({text:t,at,kind});
 }
 const headers=/^[ \t]*(?:[✨💡📌✝️\uFE0F]\s*)*(?:(?:PRIMER|SEGUNDO|TERCER|CUARTO|QUINTO|SEXTO|SÉPTIMO|OCTAVO|NOVENO|DÉCIMO)\s+PRINCIPIO\s+ESPIRITUAL|PRINCIPIO\s+FINAL|FRASE\s+RECTORA|CITA\s+CLAVE|FRASE\s+DE\s+CIERRE|VERDAD\s+CENTRAL|ENSEÑANZA\s+CENTRAL|PRINCIPIO\s+ESPIRITUAL)\s*:?\s*$/gmi;
 for(const m of source.matchAll(headers)){
  const after=source.slice(m.index+m[0].length).replace(/^\s+/,'');
  const quote=after.match(/^[«“"]([\s\S]{20,900}?)[»”"]/u);
  if(quote)add(quote[1],m.index,'principio');
  else {const lines=after.split('\n').map(cleanSpan).filter(Boolean);if(lines[0])add(lines[0],m.index,'principio')}
 }
 // Also discover self-contained maxims in quotations or paragraph sentences.
 // Never turn quoted Scripture itself into a thought.
 for(const m of source.matchAll(/[«“"]([^«»“”"\n]{55,310})[»”"]/gu)){
  const text=cleanSpan(m[1]);if(/^(?:Y |Entonces |Porque |Jehová |Jesús |Dios dijo|He aquí)/iu.test(text))continue;
  add(text,m.index,'frase destacada');
 }
 const lines=source.split('\n');let offset=0;
 for(const line of lines){
  const t=cleanSpan(line);
  if(t.length>=70&&t.length<=230&&/[.!?]$/.test(t)&&!/^\d|^(?:Salmo|Juan|Mateo|Lucas|Romanos|Proverbios|Samuel|Corintios|Efesios|Génesis|Éxodo)\b/iu.test(t)
    && /\b(?:Dios|Cristo|Señor|corazón|fe|gracia|obediencia|discernimiento|espiritual|comunión|pecado|misericordia|Palabra|verdad|oración)\b/iu.test(t))add(t,offset,'pensamiento del desarrollo');
  offset+=line.length+1;
 }
 return out.sort((a,b)=>a.at-b.at);
}
function reflectionFor(source,thought,scriptures){
 const previous=source.slice(Math.max(0,thought.at-1400),thought.at);
 // Skip the quoted Scripture and choose explanation paragraphs, not the verse.
 const paragraphs=previous.split(/\n\s*\n|(?<=[.!?])\s*\n/u)
  .map(cleanSpan).filter(t=>t.length>=65&&t.length<650&&!/^(?:[1-3]\s*)?(?:Samuel|Salmo|Mateo|Juan|Romanos|Proverbios)\s+\d+:\d+/iu.test(t)&&!t.startsWith('«'));
 let chosen=paragraphs.slice(-3).filter(t=>!/[«»]/.test(t));
 let explanation=cleanSpan(chosen.join(' ')).slice(0,750);
 if(explanation.length<60){
  const compact=previous.replace(/«[\s\S]*?»/gu,' ').replace(/\s+/g,' ');
  explanation=compact.slice(-650).trim();
 }
 return explanation;
}
function processText(raw){
 const source=normalizeTeachingText(raw);
 if(source.replace(/\s/g,'').length<150){status('No hay texto suficiente para analizar.');return}
 const scriptures=scriptureCandidates(source), thoughts=teachingThoughts(source), out=[];
 for(const thought of thoughts){
  if(out.length>=18)break;
  const earlier=scriptures.filter(s=>s.at<thought.at);
  const nearby=scriptures.filter(s=>Math.abs(s.at-thought.at)<4800).sort((a,b)=>Math.abs(a.at-thought.at)-Math.abs(b.at-thought.at));
  const pair=nearby[0];
  if(!pair)continue;
  const explanation=reflectionFor(source,thought,scriptures);
  if(explanation.length<55)continue;
  if(/^(?:preguntas|oración|reflexión final)/iu.test(explanation))continue;
  if(out.some(p=>p.text===thought.text||p.text.includes(thought.text)||thought.text.includes(p.text)))continue;
  if(out.some(p=>p.reference===pair.reference&&p.text.slice(0,65)===thought.text.slice(0,65)))continue;
  out.push({text:thought.text,reference:pair.reference,verse:pair.verse,explanation});
 }
 if(!out.length){status(`Se leyó el texto, pero no se encontraron principios con versículos completos. Referencias detectadas: ${scriptures.length}; pensamientos identificados: ${thoughts.length}. Pruebe pegar el texto o revisar el PDF.`);renderPills();return}
 current=out;save(activeId,current);
 status(`Se prepararon ${out.length} píldoras candidatas (la cantidad depende del texto y las citas disponibles) a partir de ${thoughts.length} principios y ${scriptures.length} textos bíblicos del PDF. Revise especialmente la relación entre pensamiento, versículo y reflexión antes de compartir.`);
 renderPills();
}
})();
