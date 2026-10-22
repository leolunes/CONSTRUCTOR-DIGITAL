const app=document.querySelector("#app"), $=s=>document.querySelector(s);
let books=[],book=null,current=null,state=null;
const esc=s=>(s??"").toString().replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const stateKey=id=>`bd_${id}_full`, collectionKey="bd_coleccion_v14", journalKey="bd_cuaderno_v15";
function loadState(id){const legacy=id==="congregados"?localStorage.getItem("bd_congregados_full"):null;return JSON.parse(localStorage.getItem(stateKey(id))||legacy||'{"done":{},"read":{},"test":{},"disc":{},"last":""}');}
function save(){if(book&&state)localStorage.setItem(stateKey(book.id),JSON.stringify(state))}
function loadCollection(){try{return JSON.parse(localStorage.getItem(collectionKey)||"[]")}catch{return []}}
function saveCollection(x){localStorage.setItem(collectionKey,JSON.stringify(x))}
function loadJournal(){try{return JSON.parse(localStorage.getItem(journalKey)||"[]")}catch{return []}}
function saveJournal(x){localStorage.setItem(journalKey,JSON.stringify(x))}
function sectionLabel(b,sid){let q=b.secciones.find(x=>x.id===sid);return q?`${q.tipo} · ${q.titulo}`:sid}
function lastDoneDate(){let j=loadJournal();return j.length?j[0].date:null}
const ADMIN_MODE_KEY='ministerio_admin_mode_v23';
function isAdminMode(){return localStorage.getItem(ADMIN_MODE_KEY)==='1'}
window.toggleAdminMode=()=>{if(isAdminMode()){localStorage.removeItem(ADMIN_MODE_KEY);syncAdminUI();alert('Modo visitante activado.');ministryHome()}else{openAdminAccess()}}
window.openAdminAccess=()=>{document.getElementById('adminAccessModal')?.remove();let box=document.createElement('div');box.id='adminAccessModal';box.className='adminAccessOverlay';box.innerHTML=`<div class="adminAccessCard"><button class="adminClose" onclick="closeAdminAccess()">×</button><span class="badge">🔐 ADMINISTRACIÓN</span><h2>Acceso de administración</h2><p>Ingrese su clave para administrar Videos y Recursos.</p><input id="adminPin" type="password" inputmode="numeric" placeholder="Clave de administración" onkeydown="if(event.key==='Enter')confirmAdminAccess()"><button class="btn adminEnter" onclick="confirmAdminAccess()">Entrar</button><small>La vista pública permanece en modo visitante.</small></div>`;document.body.appendChild(box);setTimeout(()=>document.getElementById('adminPin')?.focus(),30)}
window.closeAdminAccess=()=>document.getElementById('adminAccessModal')?.remove()
window.confirmAdminAccess=()=>{let pin=document.getElementById('adminPin')?.value||'';if(pin==='2026'){localStorage.setItem(ADMIN_MODE_KEY,'1');closeAdminAccess();syncAdminUI();ministryHome()}else{alert('Clave incorrecta.');document.getElementById('adminPin')?.select()}}

function enforceVisitorPermissions(){
 if(isAdminMode())return;
 document.querySelectorAll('.videoAddBtn,.resourceAddBtn,.resourceDelete').forEach(e=>e.remove());
 document.querySelectorAll('button').forEach(b=>{
   const t=(b.textContent||'').toLowerCase();
   if(t.includes('agregar video')||t.includes('agregar recurso')||t.includes('eliminar video')||t.trim()==='🗑 eliminar') b.remove();
 });
}
window.syncAdminUI=()=>{let b=document.getElementById('adminTopBtn');if(!b)return;if(isAdminMode()){b.textContent='⚙ Administrador · Salir';b.classList.add('active')}else{b.textContent='🔐 Administrar';b.classList.remove('active')}}
async function initializePublicLibrary(){
 try{
  let r=await fetch("data/catalogo-publico.json");
  if(!r.ok)throw new Error("Catálogo público no disponible");
  let pkg=await r.json(),published=Array.isArray(pkg)?pkg:(pkg.books||[]);
  let local=await initializeImportedBooksStorage();
  local=await recoverMissingWaterFirePills(local);local=await recoverReinoMapas(local);
  books=[...published,...local.filter(x=>!published.some(b=>b.id===x.id))];
  ministryHome();
 }catch(e){
  console.warn("No fue posible abrir el catálogo público v4.0; se intentará el catálogo base.",e);
  fetch("data/biblioteca.json").then(r=>r.json()).then(async d=>{let local=await initializeImportedBooksStorage();local=await recoverMissingWaterFirePills(local);local=await recoverReinoMapas(local);books=[...d,...local.filter(x=>!d.some(b=>b.id===x.id))];ministryHome()}).catch(()=>app.innerHTML='<div class="card">Abra la aplicación con <b>Go Live</b>.</div>');
 }
}
initializePublicLibrary();

function visitorJourneySnapshot(){
 let active=[];
 books.forEach(b=>{let st=loadState(b.id),pct=bookPercent(b);if(pct>0||st.last)active.push({b,st,pct})});
 active.sort((a,b)=>b.pct-a.pct);
 let savedRoute=null;try{savedRoute=JSON.parse(localStorage.getItem(FORMATION_ROUTE_KEY)||'null')}catch(e){}
 return {active,latest:active.find(x=>x.st.last)||active[0]||null,savedRoute,returning:active.length>0||!!savedRoute||loadJournal().length>0||loadCollection().length>0};
}
window.visitorStartReading=()=>library();
window.visitorNeedHelp=()=>formation();
window.visitorFindAnswer=()=>searchLibrary();
window.continueVisitorReading=(bid,sid)=>{let b=books.find(x=>x.id===bid);if(!b)return library();book=b;state=loadState(b.id);if(sid&&b.secciones.some(x=>x.id===sid))openSection(sid);else home()};
function ministryHome(){
 book=null;current=null;syncAdminUI();
 const name=profileName();
 const first=books[0], second=books[1], journey=visitorJourneySnapshot();
 app.innerHTML=`
 <section class="minHero">
  <div class="minGlow"></div><div class="minMountains"></div>
  <div class="minHeroCopy"><div class="minEyebrow">UNA BIBLIOTECA PARA</div><h1>VIVIR LA PALABRA</h1><div class="minSteps">Lee <i></i> Comprende <i></i> Enseña <i></i> Vive</div><p>Enseñanzas, libros, recursos y herramientas para profundizar en la Palabra, examinar la vida y formar una generación que conozca y viva a Cristo.</p><div class="minCtas"><button class="btn minPrimary" onclick="library()">▣ Entrar a la Biblioteca ›</button><button class="btn minSecondary" onclick="teachings()">▷ Ver enseñanza ›</button></div></div>
  <div class="minVerse"><em>“Toda la Escritura es inspirada por Dios<br>y útil para enseñar, para redargüir, para corregir,<br>para instruir en justicia.”</em><b>▣ 2 Timoteo 3:16</b></div><div class="minBible">SANTA<br>BIBLIA</div>
 </section>
 <section class="visitorGateway"><div class="visitorGatewayHead"><span>COMIENZA AQUÍ</span><h2>${journey.returning?'Continúa tu camino':'¿Cómo quieres comenzar?'}</h2><p>${journey.returning?'Tu recorrido sigue guardado en este navegador. Puedes retomarlo o explorar algo nuevo.':'No necesitas conocer nuestros libros para comenzar. Elige lo que más se parece a lo que necesitas hoy.'}</p></div><div class="visitorGatewayGrid">${journey.latest&&journey.latest.st.last?`<button class="visitorChoice continue" onclick="continueVisitorReading('${journey.latest.b.id}','${journey.latest.st.last}')"><b>↗</b><span><strong>Continuar donde quedé</strong><small>${esc(journey.latest.b.titulo)} · ${esc(sectionLabel(journey.latest.b,journey.latest.st.last))}</small></span></button>`:''}<button class="visitorChoice" onclick="visitorStartReading()"><b>📖</b><span><strong>Quiero leer</strong><small>Descubrir los libros y comenzar por uno.</small></span></button><button class="visitorChoice" onclick="visitorNeedHelp()"><b>🌱</b><span><strong>Necesito fortalecer un área de mi vida</strong><small>Encontrar una ruta de formación según mi necesidad.</small></span></button><button class="visitorChoice" onclick="visitorFindAnswer()"><b>🔎</b><span><strong>Estoy buscando respuesta a algo que estoy viviendo</strong><small>Buscar dentro del contenido real de la Biblioteca.</small></span></button></div></section>
 <section class="minNavGrid"><button onclick="teachings()"><b>▣</b><span><strong>Enseñanzas</strong><small>Temas para la vida</small></span></button><button onclick="library()"><b>▤</b><span><strong>Biblioteca</strong><small>Todos los libros</small></span></button><button onclick="dailyPill()"><b>💡</b><span><strong>Píldoras</strong><small>Verdades en breve</small></span></button><button onclick="videosPage()"><b>▷</b><span><strong>Videos</strong><small>Mensajes y recursos</small></span></button><button onclick="resourcesPage()"><b>▧</b><span><strong>Recursos</strong><small>Herramientas prácticas</small></span></button><button onclick="contactPage()"><b>♟</b><span><strong>Contacto</strong><small>Conversemos</small></span></button></section>
 <section class="formationEntryHome"><div class="formationEntryIcon">🌱</div><div class="formationEntryCopy"><span>RUTA PERSONAL DE FORMACIÓN</span><h2>MI CAMINO DE FORMACIÓN</h2><p>¿Qué necesitas fortalecer hoy? Encuentra un recorrido basado únicamente en las enseñanzas reales de esta Biblioteca.</p></div><button class="btn formationEntryBtn" onclick="formation()">Comenzar mi ruta ›</button></section>
 <section class="minFeatureGrid">
  <article class="featureCard teachingFeature"><div><span>Enseñanza<br>destacada</span><i></i><h2>Dios no comenzó<br>con un templo</h2><p>Enseñanza extraída de CONGREGADOS: Dios comenzó formando una relación.</p><button onclick="teachings()">Ver enseñanza ›</button></div></article>
  <article class="featureCard pillFeature"><div class="featureText"><div class="featureTitle">🌱 <b>Píldora de hoy</b></div><small>CONGREGADOS</small><p>La verdadera congregación comienza con un corazón que reconoce a Cristo.</p><b>Mateo 18:20</b><button onclick="dailyPill()">Ver píldora ›</button></div><div class="prayerVisual">🙏</div></article>
  <article class="featureCard booksFeature"><h2>Nuestros libros</h2><p>Enseñanzas para vivir la Palabra</p><div class="miniCovers">${first?`<img src="${first.portada}" alt="${esc(first.titulo)}">`:''}${second?`<img src="${second.portada}" alt="${esc(second.titulo)}">`:''}<div class="coming">PRÓXIMAMENTE</div></div><button onclick="library()">Ver todos los libros ›</button></article>
  <article class="featureCard smallFeature"><b>↗</b><div><h2>Mi camino de formación</h2><p>Elige qué necesitas fortalecer y continúa tu recorrido personal por la Biblioteca.</p><button onclick="formation()">Comenzar mi ruta ›</button></div></article>
  <article class="featureCard smallFeature"><b>▷</b><div><h2>Videos</h2><p>Mensajes, enseñanzas y recursos en video para tu crecimiento.</p><button onclick="videosPage()">Ver videos ›</button></div></article>
  <article class="featureCard smallFeature"><b>▧</b><div><h2>Recursos prácticos</h2><p>Guías, formatos y herramientas para aplicar la Palabra.</p><button onclick="resourcesPage()">Ver recursos ›</button></div></article>
 </section>
 <div class="minMotto"><span></span><em>“La verdad de la Palabra, aplicada en la vida, transforma generaciones.”</em><span></span><b>Leonard Moon</b></div>${isAdminMode()?`<section class="importerEntry"><div><span class="badge">⚙ ADMINISTRACIÓN DE LA BIBLIOTECA</span><h2>Importador inteligente de libros</h2><p>Cargue un DOCX y su portada. El sistema detecta la estructura y permite revisarla antes de incorporar el libro.</p></div><div class="row"><button class="btn" onclick="bookImporter()">＋ Nuevo libro</button><button class="btn secondary" onclick="scalabilityAudit()">✓ Auditoría de escalabilidad</button><button class="btn secondary" onclick="exportPublicCatalogBridge()">⇩ Preparar catálogo público</button></div></section>`:''}<div class="adminModeEntry"><button onclick="toggleAdminMode()">${isAdminMode()?'⚙ Salir de administración':'⚙ Administración'}</button><small>${isAdminMode()?'Modo administrador activo':'Vista pública del Ministerio'}</small></div>`;
}
window.ministryHome=ministryHome;
function simpleMinistryPage(icon,title,subtitle,body){app.innerHTML=`<section class="ministryPage"><button class="btn secondary" onclick="ministryHome()">← Inicio</button><div class="pageIcon">${icon}</div><h1>${title}</h1><p class="lead">${subtitle}</p>${body}</section>`}
// v1.9: teachings se define al final desde el contenido real de los libros.
let globalPillBookFilter='todos';
function globalPillCatalog(){let out=[];books.forEach(b=>getPills(b).forEach((p,i)=>out.push({...p,pillIndex:i})));return out}
function globalPillBooks(){let seen=new Set();return globalPillCatalog().map(p=>({id:p.bookId,title:p.book})).filter(x=>!seen.has(x.id)&&seen.add(x.id))}
window.dailyPill=()=>{globalPillBookFilter='todos';globalPillsPage()};
window.globalPillsPage=()=>{let rows=globalPillCatalog(),available=globalPillBooks();if(globalPillBookFilter!=='todos'&&!available.some(x=>x.id===globalPillBookFilter))globalPillBookFilter='todos';app.innerHTML=`<section class="teachingsHero"><span class="badge">💡 PÍLDORAS DE LA BIBLIOTECA</span><h1>Verdades en breve para volver a la Palabra</h1><p class="muted">Cada píldora conserva su libro y sección de origen. Explore toda la Biblioteca o filtre por un libro.</p></section><section class="globalPillTools"><div class="librarySearchBox"><span>⌕</span><input id="globalPillSearch" placeholder="Buscar una píldora, tema o texto bíblico…" oninput="renderGlobalPills()"></div><div id="globalPillFilters" class="libraryCategoryRow"></div><small id="globalPillCount"></small></section><section id="globalPillResults" class="globalPillGrid"></section>`;renderGlobalPills()};
window.setGlobalPillBook=(id)=>{globalPillBookFilter=id;renderGlobalPills()};
window.renderGlobalPills=()=>{let all=globalPillCatalog(),available=globalPillBooks(),q=(document.getElementById('globalPillSearch')?.value||'').trim().toLowerCase();let rows=all.filter(p=>(globalPillBookFilter==='todos'||p.bookId===globalPillBookFilter)&&(!q||`${p.text||''} ${p.book||''} ${p.section||''} ${p.reference||''} ${p.verse||''} ${p.explanation||''}`.toLowerCase().includes(q)));let f=document.getElementById('globalPillFilters');if(f)f.innerHTML=`<button class="libraryCategoryBtn ${globalPillBookFilter==='todos'?'active':''}" onclick="setGlobalPillBook('todos')">Todas <small>${all.length}</small></button>`+available.map(b=>{let n=all.filter(p=>p.bookId===b.id).length;return `<button class="libraryCategoryBtn ${globalPillBookFilter===b.id?'active':''}" onclick='setGlobalPillBook(${JSON.stringify(b.id)})'>${esc(b.title)} <small>${n}</small></button>`}).join('');let c=document.getElementById('globalPillCount');if(c)c.textContent=`${rows.length} píldora${rows.length===1?'':'s'} encontrada${rows.length===1?'':'s'}`;let h=document.getElementById('globalPillResults');if(!h)return;h.innerHTML=rows.length?rows.map(p=>`<article class="globalPillCard"><span class="badge">${esc(p.book)}</span><h3>“${esc(p.text)}”</h3>${p.reference?`<div class="globalPillRef">📖 ${esc(p.reference)}</div>`:''}<p>${esc(p.section)}</p><div class="row"><button class="btn" onclick="pills('${String(p.bookId).replace(/'/g,"\\'")}',null,${p.pillIndex})">Ver píldora →</button><button class="btn secondary" onclick="goToSection('${String(p.bookId).replace(/'/g,"\\'")}','${String(p.sectionId).replace(/'/g,"\\'")}')">Ver en el libro</button></div></article>`).join(''):`<div class="libraryNoResults"><b>No encontramos píldoras con este criterio.</b><span>Pruebe otro libro o una búsqueda diferente.</span></div>`};
window.videosPage=()=>simpleMinistryPage('▷','Videos','Mensajes y enseñanzas en video.',`<div class="emptyMinistry"><h2>Próximamente</h2><p>Este espacio queda preparado para incorporar los videos del ministerio sin alterar la Biblioteca Digital.</p></div>`);
window.resourcesPage=()=>{resourceFilter='todos';ministryResources=[...publicResources,...loadLocalResources().filter(l=>!publicResources.some(p=>p.id===l.id))];app.innerHTML=`<section class="resourceHero"><div><span class="badge">📄 RECURSOS</span><h1>Herramientas para profundizar y llevar la enseñanza a la vida.</h1><p>Guías, estudios, plantillas y materiales prácticos para crecer, enseñar y aplicar la Palabra en la vida diaria.</p>${isAdminMode()?`<button class="btn resourceAddBtn" onclick="openResourceUploader()">＋ Agregar recurso</button>`:''}</div></section><section class="resourceToolbar"><input id="resourceSearch" placeholder="Buscar recursos..." oninput="renderResources()"><div id="resourceFilters"></div></section><div id="resourceResults"></div>`;renderResources();enforceVisitorPermissions()}
window.setResourceFilter=(el,c)=>{resourceFilter=c;renderResources();enforceVisitorPermissions()}
window.renderResources=()=>{let filters=document.getElementById('resourceFilters');if(filters)filters.innerHTML=resourceCats().map(c=>`<button class="resourceFilter ${resourceFilter===c?'active':''}" onclick="setResourceFilter(this,'${String(c).replace(/'/g,"\\'")}')">${c==='todos'?'Todos':esc(c)}</button>`).join('');let q=(document.getElementById('resourceSearch')?.value||'').trim().toLowerCase();let rows=ministryResources.filter(r=>(resourceFilter==='todos'||r.categoria===resourceFilter)&&(!q||`${r.titulo||''} ${r.descripcion||''} ${r.libro||''}`.toLowerCase().includes(q)));let host=document.getElementById('resourceResults');if(!host)return;if(!ministryResources.length){host.innerHTML=`<section class="resourceEmpty"><div class="resourceEmptyIcon">📄</div><h2>La Biblioteca de Recursos está lista</h2><p>Aquí puede incorporar los PDF que quiera poner a disposición de quienes visiten el Ministerio.</p><button class="btn" onclick="openResourceUploader()">＋ Agregar mi primer recurso</button></section>`;return}let featured=rows.find(r=>r.destacado)||rows[0],rest=rows.filter(r=>!featured||r.id!==featured.id);host.innerHTML=`${featured?`<section class="resourceFeatured"><h2>☆ Recurso destacado</h2><article><div class="resourceCover">📄<b>PDF</b></div><div class="resourceInfo"><span class="resourceTag">${esc(featured.categoria||'Recurso')}</span><h3>${esc(featured.titulo)}</h3>${featured.libro?`<small>Relacionado con: ${esc(featured.libro)}</small>`:''}<p>${esc(featured.descripcion||'')}</p><div class="resourceMeta">${featured.fecha?`📅 ${esc(featured.fecha)}`:''}${featured.tamano?` <span>·</span> 📄 ${esc(featured.tamano)}`:''}</div></div><div class="resourceActions"><button class="btn" onclick="viewResource('${featured.id}')">👁 Ver en línea</button><button class="btn secondary" onclick="downloadResource('${featured.id}')">⇩ Descargar</button>${isAdminMode()?`<button class="btn danger" onclick="deleteResource('${featured.id}')">🗑 Eliminar</button>`:''}</div></article></section>`:''}<section class="resourceList"><div class="resourceListHead"><h2>▣ Más recursos</h2><span>${rows.length} recurso${rows.length===1?'':'s'}</span></div><div class="resourceGrid">${rest.map(r=>`<article class="resourceCard"><div class="resourceCardTop"><span>📄</span><b>PDF</b></div><span class="resourceTag">${esc(r.categoria||'Recurso')}</span><h3>${esc(r.titulo)}</h3>${r.libro?`<small>Relacionado con:<br>${esc(r.libro)}</small>`:''}<p>${esc(r.descripcion||'')}</p><div class="resourceCardActions"><button class="btn secondary" onclick="viewResource('${r.id}')">👁 Ver</button><button class="btn secondary" onclick="downloadResource('${r.id}')">⇩ Descargar</button><button class="resourceDelete" onclick="deleteResource('${r.id}')">🗑</button></div></article>`).join('')}</div></section>`}
window.openResourceUploader=()=>{if(!isAdminMode()){alert('Esta función está disponible únicamente en modo administrador.');return}app.innerHTML=`<section class="resourceUploadPage"><button class="btn secondary" onclick="resourcesPage()">← Volver a Recursos</button><div class="resourceUploadCard"><span class="badge">📄 NUEVO RECURSO</span><h1>Agregar recurso PDF</h1><p>Seleccione el material terminado y complete sus datos.</p><label>Archivo PDF<input id="ruFile" type="file" accept="application/pdf,.pdf"></label><label>Título<input id="ruTitle" placeholder="Título del recurso"></label><div class="resourceFormGrid"><label>Categoría<select id="ruCat"><option>Guía</option><option>Estudio</option><option>Familia</option><option>Finanzas</option><option>Formación</option><option>Plantilla</option><option>Otro</option></select></label><label>Libro relacionado (opcional)<input id="ruBook"></label></div><label>Descripción<textarea id="ruDesc" rows="4"></textarea></label><div class="resourceFormGrid"><label>Fecha<input id="ruDate" type="date"></label><label class="checkLine"><input id="ruFeatured" type="checkbox"> Marcar como recurso destacado</label></div><div class="resourceUploadNotice"><b>Prueba local:</b> el PDF queda guardado en este navegador/equipo.</div><button class="btn" onclick="saveUploadedResource()">Guardar recurso</button></div></section>`}
window.saveUploadedResource=()=>{let file=document.getElementById('ruFile')?.files?.[0],title=(document.getElementById('ruTitle')?.value||'').trim();if(!file)return alert('Seleccione primero un archivo PDF.');if(!title)return alert('Escriba el título del recurso.');if(file.size>4.5*1024*1024)return alert('Para esta prueba local use un PDF de hasta 4,5 MB.');let rd=new FileReader();rd.onload=()=>{let r={id:'res-'+Date.now(),titulo:title,categoria:document.getElementById('ruCat').value,libro:document.getElementById('ruBook').value,descripcion:document.getElementById('ruDesc').value,fecha:document.getElementById('ruDate').value,destacado:document.getElementById('ruFeatured').checked,tamano:(file.size/1024/1024).toFixed(2)+' MB',archivo:rd.result,nombre:file.name};let all=loadLocalResources();if(r.destacado)all.forEach(x=>x.destacado=false);all.push(r);ministryResources=all;try{saveLocalResources();resourcesPage()}catch(e){alert('El navegador no tiene espacio suficiente para guardar este PDF.')}};rd.readAsDataURL(file)}
function findResourceById(id){return ministryResources.find(x=>x.id===id)||publicResources.find(x=>x.id===id)||loadLocalResources().find(x=>x.id===id)}
window.viewResource=id=>{let r=findResourceById(id);if(!r)return alert('El recurso no está disponible.');let source=r.archivo||r.url;if(!source)return alert('El archivo no está disponible.');window.open(source,'_blank')}
window.downloadResource=id=>{let r=findResourceById(id);if(!r)return alert('El recurso no está disponible.');let source=r.archivo||r.url;if(!source)return alert('El archivo no está disponible.');let a=document.createElement('a');a.href=source;a.download=r.nombre||((r.titulo||'recurso')+'.pdf');a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}
window.deleteResource=id=>{if(!isAdminMode()){alert('Esta función está disponible únicamente en modo administrador.');return}if(!confirm('¿Eliminar este recurso?'))return;ministryResources=loadLocalResources().filter(x=>x.id!==id);saveLocalResources();resourcesPage()}
window.contactPage=()=>{app.innerHTML=`<section class="contactHero"><div><span class="badge">💬 CONTACTO</span><h1>Conversemos</h1><h2>La Palabra también nos lleva a caminar acompañados.</h2><p>Si una enseñanza te ayudó, tienes una inquietud o deseas comunicarte con nosotros, este espacio está para escucharte.</p></div><div class="contactVerse"><em>“Llevad los unos las cargas de los otros, y cumplid así la ley de Cristo.”</em><b>Gálatas 6:2</b></div></section><section class="contactPaths"><button onclick="focusContact('Mensaje general')">💬 <b>Quiero escribirles</b><small>Para enviar un mensaje al Ministerio.</small></button><button onclick="focusContact('Petición de oración')">🙏 <b>Quiero compartir una petición de oración</b><small>Puedes contarnos tu necesidad.</small></button><button onclick="focusContact('Pregunta sobre una enseñanza')">📖 <b>Tengo una pregunta sobre una enseñanza</b><small>Cuéntanos tu inquietud.</small></button><button onclick="focusContact('Quiero mantenerme conectado')">👥 <b>Quiero mantenerme conectado</b><small>Para recibir nuevos contenidos.</small></button></section><section class="contactMain"><div class="contactFormCard"><h2>✉ Envíanos tu mensaje</h2><label>Nombre (opcional)<input id="ctName"></label><label>¿Sobre qué deseas escribirnos?<select id="ctTopic"><option>Mensaje general</option><option>Petición de oración</option><option>Pregunta sobre una enseñanza</option><option>Quiero mantenerme conectado</option></select></label><label>Medio de contacto (opcional)<input id="ctValue" placeholder="WhatsApp o correo"></label><label>Mensaje<textarea id="ctMessage" rows="7"></textarea></label><div class="contactButtons"><button class="btn" onclick="prepareContactMessage()">➤ Preparar mensaje</button><button class="btn secondary" onclick="clearContactForm()">↻ Limpiar</button></div><p id="ctStatus"></p></div><aside class="contactAside"><div class="contactBox"><h2>💬 Canales de contacto</h2><p>WhatsApp, correo y redes se configurarán antes de publicar el Portal.</p></div><div class="contactPrayer"><h2>🤎 Un espacio para orar juntos</h2><p>Las peticiones de oración serán tratadas con respeto y confidencialidad.</p></div><div class="contactPrivacy"><h2>🛡 Tu información merece cuidado</h2><p>Solo utilizaremos la información compartida para responder a la comunicación solicitada.</p></div></aside></section>`}
window.focusContact=topic=>{let t=document.getElementById('ctTopic');if(t)t.value=topic;document.getElementById('ctMessage')?.focus();document.querySelector('.contactFormCard')?.scrollIntoView({behavior:'smooth'})}
window.clearContactForm=()=>{['ctName','ctValue','ctMessage'].forEach(id=>{let e=document.getElementById(id);if(e)e.value=''});let st=document.getElementById('ctStatus');if(st)st.textContent=''}
window.prepareContactMessage=()=>{let msg=(document.getElementById('ctMessage')?.value||'').trim();if(!msg)return alert('Escribe primero tu mensaje.');let topic=document.getElementById('ctTopic')?.value||'Mensaje general',name=(document.getElementById('ctName')?.value||'').trim(),value=(document.getElementById('ctValue')?.value||'').trim();let text=`MINISTERIO DIGITAL — ${topic}\n\n${name?'Nombre: '+name+'\n':''}${value?'Contacto: '+value+'\n':''}\n${msg}`;navigator.clipboard?.writeText(text);let st=document.getElementById('ctStatus');if(st)st.textContent='✓ Mensaje preparado. Los canales oficiales se conectarán antes de publicar.'}

function bookPercent(b){
 let s=loadState(b.id), total=b.secciones.length||1;
 // El avance principal mide lectura real. Una sección totalmente terminada también cuenta como leída.
 let read=b.secciones.filter(sec=>(s.read&&s.read[sec.id])||(s.done&&s.done[sec.id])).length;
 return Math.round(read/total*100)
}
function percent(){return bookPercent(book)}
let libraryCatalogQuery='',libraryCatalogCategory='inicio';
const spiritualTopics=[
 {id:'sanidad',icon:'💗',title:'Sanidad interior',desc:'Heridas, cargas y restauración',words:['sanidad','herida','carga','alma','restaur','quiebra','dolor','perdón','perdon','emocion']},
 {id:'mente',icon:'🧠',title:'Mente y pensamientos',desc:'Discernimiento y gobierno interior',words:['mente','pensamiento','mental','discern','ansiedad','temor','emocion','gobernada']},
 {id:'fe',icon:'📖',title:'Fe y vida espiritual',desc:'Confianza, oración y obediencia',words:['fe','confianza','confiar','oración','oracion','obedien','presencia','espíritu','espiritu','dios']},
 {id:'familia',icon:'🏠',title:'Familia y hogar',desc:'Matrimonio, crianza y relaciones',words:['familia','hogar','casa','padre','madre','espos','hijo','matrimonio','varón','varon']},
 {id:'reino',icon:'👑',title:'Reino y propósito',desc:'Identidad, llamado y dirección',words:['reino','propósito','proposito','identidad','llamado','destino','añadidura','fuente','fruto']},
 {id:'iglesia',icon:'⛪',title:'Iglesia y liderazgo',desc:'Congregación, servicio y ministerio',words:['iglesia','congreg','pastor','lider','líder','ministerio','altar','servicio']},
 {id:'mayordomia',icon:'🌾',title:'Mayordomía y provisión',desc:'Economía y principios del Reino',words:['provisión','provision','finanza','dinero','econom','mayordom','inversión','inversion','recurso','administr']},
 {id:'madurez',icon:'🌱',title:'Crecimiento y madurez',desc:'Carácter, procesos y transformación',words:['madurez','crecim','transform','formaci','carácter','caracter','proceso','disciplina','gracia','sistema']}
];
function bookTopics(b){
 const main=[b.titulo,b.subtitulo,b.categoria].filter(Boolean).join(' ').toLocaleLowerCase('es');
 const secondary=String(b.descripcion||'').toLocaleLowerCase('es');
 const hits=spiritualTopics.map(t=>({id:t.id,score:t.words.reduce((n,w)=>n+(main.includes(w)?3:0)+(secondary.includes(w)?1:0),0)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score);
 return hits.length?hits.slice(0,2).map(x=>x.id):['otros'];
}
function libraryTopicList(){return [...spiritualTopics,{id:'otros',icon:'📚',title:'Otras enseñanzas',desc:'Libros por explorar y clasificar',words:[]}]}
function renderLibraryTopicLanding(){
 const host=document.getElementById('libraryTopics');if(!host)return;
 host.innerHTML=`<div class="themeIntro"><span>EXPLORA POR ÁREAS DE FORMACIÓN</span><h2>¿Qué deseas fortalecer hoy?</h2><p>Elige un tema para descubrir las enseñanzas disponibles. Un libro puede aparecer en más de un área sin duplicarse.</p></div><div class="themeGrid">${libraryTopicList().map(t=>{const n=books.filter(b=>bookTopics(b).includes(t.id)).length;return `<button class="themeTile" onclick='openLibraryTopic(${JSON.stringify(t.id)})'><span class="themeIcon">${t.icon}</span><strong>${esc(t.title)}</strong><small>${esc(t.desc)}</small><em>${n} libro${n===1?'':'s'} →</em></button>`}).join('')}</div><div class="themeAll"><button class="btn secondary" onclick="showAllLibraryBooks()">📚 Ver los ${books.length} libros de la Biblioteca</button></div>`;
}
window.openLibraryTopic=id=>{libraryCatalogCategory=id;libraryCatalogQuery='';document.getElementById('libraryCatalogSearch').value='';updateLibraryThemeView()};
window.showAllLibraryBooks=()=>{libraryCatalogCategory='todos';libraryCatalogQuery='';document.getElementById('libraryCatalogSearch').value='';updateLibraryThemeView()};
window.backToLibraryTopics=()=>{libraryCatalogCategory='inicio';libraryCatalogQuery='';document.getElementById('libraryCatalogSearch').value='';updateLibraryThemeView()};
function updateLibraryThemeView(){const landing=document.getElementById('libraryTopics'),results=document.getElementById('libraryResults'),heading=document.getElementById('themeResultHeading');if(!landing||!results)return;const landingMode=libraryCatalogCategory==='inicio'&&!libraryCatalogQuery.trim();landing.hidden=!landingMode;results.hidden=landingMode;if(landingMode){renderLibraryTopicLanding();return}const t=libraryTopicList().find(x=>x.id===libraryCatalogCategory);heading.innerHTML=`<button class="themeBack" onclick="backToLibraryTopics()">← Volver a los temas</button><h2>${t?esc(t.title):libraryCatalogQuery?'Resultados de búsqueda':'Todos los libros'}</h2><p>${t?esc(t.desc):'Explore el catálogo completo o busque una enseñanza.'}</p>`;renderLibraryCatalog()}

function libraryCategories(){return ['todos',...new Set(books.flatMap(b=>(b.categoria||'').split('·').map(x=>x.trim())).filter(Boolean))]}
function renderLibraryCatalog(){
 const host=document.getElementById('libraryCatalog'); if(!host)return;
 const q=(libraryCatalogQuery||'').trim().toLowerCase();
 const rows=books.filter(b=>{const cats=(b.categoria||'').split('·').map(x=>x.trim());const ok=libraryCatalogCategory==='todos'||bookTopics(b).includes(libraryCatalogCategory);const hay=`${b.titulo||''} ${b.subtitulo||''} ${b.autor||''} ${b.categoria||''} ${b.descripcion||''}`.toLowerCase();return ok&&(!q||hay.includes(q))});
 const tags=b=>(b.categoria||"").split("·").map(x=>x.trim()).filter(Boolean).map(x=>`<span>${esc(x)}</span>`).join("");
 host.innerHTML=rows.length?rows.map(b=>{const pct=bookPercent(b);return `<article class="bookCard elegantBook"><img class="cover" src="${b.portada}" alt="Portada ${esc(b.titulo)}"><div class="bookInfo"><div class="tagRow">${tags(b)}</div><h2>${esc(b.titulo)}</h2><h3>${esc(b.subtitulo)}</h3><p class="bookDescription">${esc(b.descripcion||'Una enseñanza para profundizar, comprender y llevar la Palabra a la vida.')}</p><p class="muted authorLine">${esc(b.autor)}</p><div class="progressLine"><div class="progress"><i style="width:${pct}%"></i></div><b>${pct}% leído</b></div><div class="bookButtons"><button class="btn" onclick="selectBook('${b.id}')">📖 ${pct?'Continuar leyendo':'Abrir libro'}</button><button class="btn secondary" onclick="selectBook('${b.id}');setTimeout(openBook,0)">☷ Ver contenido</button>${isAdminMode()&&importedBooksCache.some(x=>x.id===b.id)?`<button class="btn secondary" style="color:#a32626;border-color:#d9a9a9" onclick='deleteImportedBook(${JSON.stringify(b.id)})'>🗑 Eliminar libro</button>`:''}</div></div></article>`}).join(""):`<div class="libraryNoResults"><b>No encontramos libros con ese criterio.</b><span>Pruebe otra palabra o seleccione “Todos”.</span></div>`;
 const count=document.getElementById('libraryCount');if(count)count.textContent=`${rows.length} de ${books.length} libro${books.length===1?'':'s'}`;
}
window.filterLibraryCatalog=()=>{libraryCatalogQuery=document.getElementById('libraryCatalogSearch')?.value||'';if(libraryCatalogQuery.trim())libraryCatalogCategory='todos';else if(libraryCatalogCategory==='todos')libraryCatalogCategory='inicio';updateLibraryThemeView()}
window.setLibraryCategory=c=>openLibraryTopic(c)
function library(){
 book=null;current=null;libraryCatalogQuery='';libraryCatalogCategory='inicio';const name=profileName();
 app.innerHTML=`<section class="landingHero"><div class="heroSun"></div><div class="heroHills h1x"></div><div class="heroHills h2x"></div><div class="heroCopy"><div class="heroEyebrow">UNA BIBLIOTECA PARA</div><h1>VIVIR LA PALABRA</h1><div class="heroSteps"><span>Lee</span><i></i><span>Comprende</span><i></i><span>Enseña</span><i></i><span>Vive</span></div><p>Un espacio para profundizar en la <b>Palabra</b>, examinar la vida y convertir cada enseñanza en un paso de formación en Cristo.</p></div><div class="heroVerse"><em>“Toda la Escritura es inspirada por Dios<br>y útil para enseñar, para redargüir, para corregir,<br>para instruir en justicia.”</em><strong>📖 2 Timoteo 3:16</strong></div><div class="heroBible">SANTA<br>BIBLIA</div></section>
 <section class="welcomeStrip">${name?`<div><span>☀️</span><p><b>Buenos días, ${esc(name)}</b><small>Continúa tu camino de formación.</small></p></div>`:`<div><span>📖</span><p><b>Bienvenido a tu Biblioteca Digital</b><small>Lee, comprende, enseña y vive la Palabra.</small></p></div>`}<button class="softTopBtn" onclick="profileBackup()">♙ Mi perfil</button></section>
 <section class="homeActions"><button class="actionTile active" onclick="library()"><b>📖</b><span><strong>Toda la biblioteca</strong><small>Explora todos los libros</small></span></button><button class="actionTile" onclick="document.getElementById('libraryCatalogSearch')?.focus()"><b>⌕</b><span><strong>Buscar</strong><small>Encuentra un libro o tema</small></span></button><button class="actionTile" onclick="collection()"><b>♥</b><span><strong>Mi colección</strong><small>Píldoras y enseñanzas</small></span></button><button class="actionTile" onclick="formation()"><b>🌱</b><span><strong>Mi camino de formación</strong><small>Tu progreso y aprendizaje</small></span></button><button class="actionTile" onclick="profileBackup()"><b>♙</b><span><strong>Mi perfil y respaldo</strong><small>Tu nombre, exportar e importar</small></span></button></section>
 <div class="libraryTitleRow"><div><h2>Biblioteca por temas</h2><i></i></div><p>📖 Tu biblioteca seguirá creciendo<br>con nuevos libros de Leonard Moon.</p></div>
 <section class="libraryCatalogTools"><div class="librarySearchBox"><span>⌕</span><input id="libraryCatalogSearch" type="search" placeholder="Buscar por título, tema o palabra..." oninput="filterLibraryCatalog()"></div><small id="libraryCount">${books.length} de ${books.length} libros</small></section>
 <section id="libraryTopics"></section><section id="libraryResults" hidden><div id="themeResultHeading"></div><section id="libraryCatalog" class="books elegantBooks"></section></section>
 <section class="learningStrip"><button onclick="searchLibrary()"><b>📖</b><span><strong>Comprende</strong><small>Respuestas para tu vida</small></span><i>›</i></button><button onclick="formation()"><b>◉</b><span><strong>Discierne</strong><small>Principios que iluminan</small></span><i>›</i></button><button onclick="collection()"><b>💡</b><span><strong>Enseña</strong><small>Píldoras que transforman</small></span><i>›</i></button><button onclick="collection()"><b>↗</b><span><strong>Vive</strong><small>Lleva la verdad más lejos</small></span><i>›</i></button></section><div class="closingMotto"><span></span><em>“La verdad de la Palabra, aplicada en la vida, transforma generaciones.”</em><span></span></div>`;updateLibraryThemeView()}
window.library=library;
window.selectBook=id=>{book=books.find(b=>b.id===id);state=loadState(id);home()}
function home(){app.innerHTML=`<section class="hero"><img class="cover" src="${book.portada}"><div><span class="badge">LIBRO COMPLETO</span><h1>${esc(book.titulo)}</h1><h2>${esc(book.subtitulo)}</h2><p class="muted">${esc(book.autor)}</p><div class="progress"><i style="width:${percent()}%"></i></div><p>${percent()}% del libro leído</p><div class="row"><button class="btn" onclick="openBook()">Índice del libro</button><button class="btn secondary" onclick="formation()">🌿 Mi camino de formación</button>${state.last?`<button class="btn secondary" onclick="openSection('${state.last}')">Continuar leyendo</button>`:""}<button class="btn secondary" onclick="pills('${book.id}')">💡 Píldoras</button><button class="btn secondary" onclick="library()">← Biblioteca</button></div></div></section><section class="card section"><h2>Experiencia del libro</h2><p>Lectura → comprensión → discernimiento → cierre → progreso. Ahora también puede guardar enseñanzas, consultar píldoras y compartir contenido.</p></section>`}
window.library=library;
window.openBook=()=>{app.innerHTML=`<section class="card"><div class="row"><button class="btn secondary" onclick="library()">← Biblioteca</button><button class="btn secondary" onclick="home()">Portada del libro</button><button class="btn secondary" onclick="pills('${book.id}')">💡 Píldoras</button></div><h1>${esc(book.titulo)}</h1><h2>Índice completo</h2>${book.secciones.map(s=>`<div class="chapter"><div><span class="badge">${esc(s.tipo)}</span><h3>${esc(s.titulo)}</h3><div class="muted">${esc(s.subtitulo)}</div></div><button class="btn ${state.done[s.id]?'secondary':''}" onclick="openSection('${s.id}')">${state.done[s.id]?'✓ Completado':'Abrir'}</button></div>`).join("")}</section>`}
function itemButton(type,text,label){return `<button class="mini" onclick='saveItem(${JSON.stringify(type)},${JSON.stringify(text)},${JSON.stringify(label)})'>♡ Guardar</button>`}
window.openSection=id=>{current=book.secciones.find(s=>s.id===id);state.last=id;save();app.innerHTML=`<article class="card reader"><div class="row"><button class="btn secondary" onclick="openBook()">← Índice</button><button class="btn secondary" onclick="pills('${book.id}','${current.id}')">💡 Píldoras de esta sección</button></div><span class="badge">${esc(current.tipo)}</span><h1>${esc(current.titulo)}</h1><h2>${esc(current.subtitulo)}</h2>${current.referencia?`<div class="quote scripture">📖 ${esc(current.referencia)}<br>${esc(current.versiculo)}<div>${itemButton('Porción bíblica',`${current.referencia} — ${current.versiculo}`,current.titulo)}</div></div>`:""}${current.secciones.map(renderSection).join("")}<div class="row section"><button class="btn" onclick="finishReading()">✓ Terminé la lectura</button><button class="btn secondary" onclick="openBook()">Índice</button></div></article>`}
function renderSection(s){
 const residuos=new Set(["Principio del formulario","Final del formulario"]);
 let h=s.heading?`<div class="head">${esc(s.heading)}</div>`:"";
 return h+(s.lines||[]).filter(x=>!residuos.has((x||"").trim())).map(x=>{
  let v=(x||'').trim();
  if(v.startsWith("💬"))return `<div class="quote">${esc(v)}<div>${itemButton('Frase',v,current.titulo)}</div></div>`;
  if(v.startsWith("📖")||v.startsWith("✨"))return `<p class="editorialHighlight"><b>${esc(v)}</b> ${itemButton(v.startsWith('📖')?'Porción bíblica':'Frase',v,current.titulo)}</p>`;
  if(/^([“«].+[”»]|“[^”]+)$/.test(v)&&v.length>25)return `<blockquote class="editorialQuotation">${esc(v)}</blockquote>`;
  if(/^(?:TEXTO BASE|Texto base:?|E — EXPOSICI[OÓ]N|P — PRINCIPIO|A — APLICACI[OÓ]N|ORACI[OÓ]N FINAL|REFLEXI[OÓ]N FINAL|PREGUNTAS(?: DE REFLEXI[OÓ]N)?):?$/i.test(v))return `<div class="head editorialInnerHeading">${esc(v)}</div>`;
  if(/^\([^()]{3,65}\)$/.test(v))return `<p class="editorialReference">${esc(v)}</p>`;
  return `<p>${esc(v)}</p>`;
 }).join("")
}
window.finishReading=()=>{state.read=state.read||{};state.read[current.id]=true;save();experience()}
function experience(){app.innerHTML=`<section class="card"><span class="badge">AHORA LLEVEMOS ESTA ENSEÑANZA A LA VIDA</span><h1>${esc(current.tipo)} · ${esc(current.titulo)}</h1><p>Primero comprensión de la enseñanza; después discernimiento personal. Son dos momentos distintos.</p><div class="row"><button class="btn" onclick="showTest()">📝 Comprensión</button><button class="btn secondary" onclick="showDisc()">🔍 Discernimiento</button></div></section>`}
window.showTest=()=>{if(!current.test?.length){app.innerHTML=`<section class="card"><h1>📝 Comprensión de la enseñanza</h1><p>Esta sección todavía no tiene un test de comprensión aprobado.</p><div class="feedback"><b>Integridad del contenido:</b> el Importador Inteligente no inventa preguntas ni respuestas. Cuando exista un test aprobado para esta sección podrá incorporarse sin alterar el texto del libro.</div><div class="row section"><button class="btn secondary" onclick="openSection('${current.id}')">← Volver a la lectura</button><button class="btn secondary" onclick="showDisc()">Ver discernimiento</button></div></section>`;return}app.innerHTML=`<h1>📝 Comprensión de la enseñanza</h1><p class="muted">Las preguntas están construidas exclusivamente sobre esta sección del libro.</p>${current.test.map((q,i)=>`<div class="card question"><h3>${i+1}. ${esc(q.pregunta)}</h3>${q.opciones.map((o,j)=>`<label class="option"><input type="radio" name="q${i}" value="${j}"> ${esc(o)}</label>`).join("")}</div>`).join("")}<button class="btn" onclick="grade()">Calificar comprensión</button><div id="result" class="section"></div>`}
window.grade=()=>{let ok=0,detail=[];current.test.forEach((q,i)=>{let x=document.querySelector(`input[name=q${i}]:checked`),good=x&&+x.value===q.correcta;if(good)ok++;detail.push(`<div class="feedback"><b>${i+1}. ${good?'✓ Correcta':'Revisar'}</b><br>${esc(q.explicacion)}</div>`)});let pct=Math.round(ok/current.test.length*100);state.test[current.id]=pct;save();$("#result").innerHTML=`<div class="card"><h2>Comprensión: ${pct}%</h2><p>${ok} de ${current.test.length} respuestas correctas.</p>${detail.join("")}<div class="row section"><button class="btn" onclick="showDisc()">Continuar a discernimiento →</button></div></div>`}
window.showDisc=()=>{if(!current.discernimiento?.length){app.innerHTML=`<section class="card"><h1>🔍 Discernimiento personal</h1><p>Esta sección todavía no tiene preguntas de discernimiento aprobadas.</p><div class="feedback"><b>Integridad del contenido:</b> la aplicación no atribuye al libro preguntas espirituales que no estén aprobadas.</div><div class="row section"><button class="btn secondary" onclick="openSection('${current.id}')">← Volver a la lectura</button><button class="btn secondary" onclick="openBook()">Índice</button></div></section>`;return}app.innerHTML=`<h1>🔍 Discernimiento personal</h1><p class="muted">No hay respuestas correctas o incorrectas.</p>${current.discernimiento.map((q,i)=>`<div class="card question"><h3>${i+1}. ${esc(q.pregunta)}</h3>${q.opciones.map((o,j)=>`<label class="option"><input type="radio" name="d${i}" value="${j}"> ${esc(o)}</label>`).join("")}<div class="feedback">${esc(q.orientacion)}</div></div>`).join("")}<button class="btn" onclick="finishDisc()">Guardar mi discernimiento</button>`}
window.finishDisc=()=>{state.disc[current.id]=true;save();closing()}
function closing(){let prayer=current.secciones.find(s=>s.heading.startsWith("🙏"));let closing=current.secciones.find(s=>s.heading.startsWith("✨ FRASE"));let principle=current.secciones.find(s=>s.heading.startsWith("💬 PRINCIPIO"));app.innerHTML=`<section class="card reader"><h1>Cierre de la sección</h1>${principle?`<div class="head">${esc(principle.heading)}</div>${principle.lines.map(x=>`<p>${esc(x)}</p>`).join("")}`:""}${prayer?`<div class="head">${esc(prayer.heading)}</div>${prayer.lines.map(x=>`<p>${esc(x)}</p>`).join("")}`:""}${closing?`<div class="head">${esc(closing.heading)}</div><div class="quote">${closing.lines.map(esc).join("<br>")}</div>`:""}<button class="btn" onclick="finishSection()">✓ HE TERMINADO ESTA SECCIÓN</button></section>`}
window.finishSection=()=>{state.done[current.id]=true;save();let i=book.secciones.findIndex(s=>s.id===current.id),next=book.secciones[i+1];app.innerHTML=`<section class="card done"><h1>✓ ${esc(current.tipo)} completado</h1><h2>${esc(current.titulo)}</h2><p>📖 Enseñanza leída ✓<br>📝 Comprensión realizada ✓<br>🔍 Discernimiento realizado ✓<br>🙏 Cierre realizado ✓</p><div class="progress"><i style="width:${percent()}%"></i></div><p>${percent()}% del libro leído</p><div class="row">${next?`<button class="btn" onclick="openSection('${next.id}')">Continuar: ${esc(next.tipo)} →</button>`:"<button class='btn' onclick='finalResult()'>Ver resultado final →</button>"}<button class="btn secondary" onclick="openBook()">Índice</button><button class="btn secondary" onclick="journalForm('${book.id}','${current.id}')">📝 Registrar en mi cuaderno</button></div><div class="visitorNextStep"><b>¿Qué sigue?</b><span>Continúa leyendo, medita en las píldoras de esta sección o lleva lo aprendido a tu camino de formación.</span><div class="row"><button class="btn secondary" onclick="pills('${book.id}','${current.id}')">💡 Meditar</button><button class="btn secondary" onclick="formation()">🌱 Mi camino</button></div></div></section>`}
window.finalResult=()=>{let vals=Object.values(state.test),avg=vals.length?Math.round(vals.reduce((a,b)=>a+b,0)/vals.length):0;app.innerHTML=`<section class="card done"><h1>📚 ${esc(book.titulo)} completado</h1><h2>${esc(book.subtitulo)}</h2><p>Progreso de lectura: ${percent()}%</p><p>Promedio de comprensión: ${avg}%</p><p>Ha recorrido las secciones de este libro usando el modelo maestro de lectura, comprensión y discernimiento.</p><div class="row"><button class="btn" onclick="openBook()">Volver al índice</button><button class="btn secondary" onclick="library()">Biblioteca</button></div></section>`}
function progress(){if(!book){app.innerHTML=`<section class="card"><h1>📊 Progreso de mi biblioteca</h1>${books.map(b=>`<div class="libraryProgress"><h2>${esc(b.titulo)}</h2><div class="progress"><i style="width:${bookPercent(b)}%"></i></div><p>${bookPercent(b)}% leído</p><button class="btn secondary" onclick="selectBook('${b.id}')">Ver libro</button></div>`).join("")}</section>`;return}app.innerHTML=`<section class="card"><h1>📊 Mi progreso · ${esc(book.titulo)}</h1><div class="progress"><i style="width:${percent()}%"></i></div><h2>${percent()}%</h2>${book.secciones.map(s=>`<p>${state.done[s.id]?'✓':'○'} ${esc(s.tipo)}: ${esc(s.titulo)} ${state.test[s.id]!=null?`— Comprensión ${state.test[s.id]}%`:""}</p>`).join("")}</section>`}
function cleanMarks(t){return (t||'').replace(/^[💬✨➡️📖]\s*/u,'').replace(/^“|”$/g,'').trim()}
function normalizeForCompare(t){return cleanMarks(t).replace(/[“”"'.,;:!?¿¡()\[\]{}—–-]/g,' ').replace(/\s+/g,' ').trim().toLowerCase()}
function biblicalIntegrity(text,reference,verse,explanation){
 let v=(verse||'').trim(), ref=(reference||'').trim(), exp=(explanation||'').trim();
 if(!ref)return {reference:'',verse:'',explanation:exp};
 let nv=normalizeForCompare(v), nt=normalizeForCompare(text), ne=normalizeForCompare(exp);
 // Nunca presentar la píldora o la reflexión como si fueran el texto literal de la Escritura.
 if(!v || nv===nt || (ne && nv===ne) || /^[💬✨➡️]/u.test(v))v='';
 return {reference:ref,verse:v,explanation:exp};
}
const BIBLE_TEXT_FALLBACK={
 'Proverbios 4:1':'Oíd, hijos, la enseñanza de un padre, Y estad atentos, para que conozcáis cordura.',
 'Juan 4:16':'Jesús le dijo: Ve, llama a tu marido, y ven acá.',
 'Santiago 1:22':'Pero sed hacedores de la palabra, y no tan solamente oidores, engañándoos a vosotros mismos.'
};
function normalizeBibleRef(r){return (r||'').replace(/\s+/g,' ').trim().toLowerCase()}
function bibleTextFor(reference){
 let ref=(reference||'').trim(); if(!ref)return '';
 let key=normalizeBibleRef(ref);
 // Primero usamos el texto bíblico que ya forma parte de los libros reales de la Biblioteca.
 for(let b of books){for(let s of (b.secciones||[])){if(normalizeBibleRef(s.referencia)===key){let x=biblicalIntegrity('',s.referencia,s.versiculo,'');if(x.verse)return x.verse.replace(/^[“\"]|[”\"]$/g,'').trim()}}}
 // Respaldo local para referencias de libros importados cuyo DOCX solo trae la referencia.
 for(let k in BIBLE_TEXT_FALLBACK)if(normalizeBibleRef(k)===key)return BIBLE_TEXT_FALLBACK[k];
 return '';
}
function pillReflectionFromSource(p){
 // v3.3.1: la reflexión debe nacer del contexto INMEDIATO de la píldora.
 // Nunca saltamos a otros bloques ni reunimos frases dispersas por similitud temática.
 let b=(books||[]).find(x=>x.id===p.bookId), sec=b?.secciones?.find(x=>x.id===p.sectionId); if(!sec)return '';
 let target=normalizeForCompare(p.text), groups=sec.secciones||[];
 for(let g of groups){
  let seq=[g.heading,...(g.lines||[])].map(x=>(x||'').trim());
  let hit=seq.findIndex(z=>{let nz=normalizeForCompare(z);return nz&&target&&(nz===target||nz.includes(target)||target.includes(nz))});
  if(hit<0)continue;
  let out=[];
  for(let i=hit+1;i<seq.length;i++){
   let z=seq[i]; if(!z)break;
   if(/^[💬✨📖]/u.test(z))break;
   if(z.length<28)continue;
   if(p.verse&&normalizeForCompare(z)===normalizeForCompare(p.verse))continue;
   out.push(cleanTeachingLine(z));
   if(out.length>=3||out.join(' ').length>=420)break;
  }
  return out.join(' ');
 }
 return '';
}
function isSolidPillReflection(text,pillText='',verse=''){
 let t=(text||'').replace(/\s+/g,' ').trim();
 if(t.length<45 || t.split(/\s+/).length<8)return false;
 if(/(?:principio|final)\s+del\s+formulario/i.test(t))return false;
 if(/^(?:observa eso|observa nuevamente|preguntas|oraci[oó]n|reflexi[oó]n final)/i.test(t))return false;
 let n=normalizeForCompare(t);
 if(!n||n===normalizeForCompare(pillText)||n===normalizeForCompare(verse))return false;
 if(/[:;,–—-]$/.test(t))return false;
 return true;
}
function isVerifiedVerse(v){
 let t=(v||'').trim();
 return t.length>=35 && !/(?:principio|final)\s+del\s+formulario/i.test(t)
  && !/(?:\.\.\.|…)/.test(t) && !/^(?:observa|reflexi[oó]n|enseñanza|cap[ií]tulo)/i.test(t)
  && !/^[💬✨➡️]/u.test(t);
}
function validBibleReference(ref){
 return /^(?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?$/u.test((ref||'').trim());
}
function scripturePairsFromSection(sec){
 let out=[];
 function add(ref,verse){
  ref=(ref||'').replace(/^📖\s*/u,'').trim();verse=(verse||'').replace(/^[“"]|[”"]$/g,'').trim();
  if(validBibleReference(ref)&&isVerifiedVerse(verse)&&!out.some(x=>normalizeBibleRef(x.referencia)===normalizeBibleRef(ref)&&x.versiculo===verse))out.push({referencia:ref,versiculo:verse});
 }
 for(let x of sec.pildoraEscritura||[])add(x.referencia,x.versiculo);
 add(sec.referencia,sec.versiculo);
 for(let g of sec.secciones||[]){let lines=g.lines||[];
  for(let i=0;i<lines.length;i++){
   let t=(lines[i]||'').trim();if(!t.startsWith('📖'))continue;
   let rest=t.replace(/^📖\s*/u,'').trim();
   let m=rest.match(/^((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)[.\s—–:-]*(.*)$/u);
   if(m){let v=m[2]||'';if(!v&&i+1<lines.length)v=lines[i+1];add(m[1],v)}
  }
 }
 return out;
}
function immediatePillReflection(p){
 let b=(books||[]).find(x=>x.id===p.bookId), sec=b?.secciones?.find(x=>x.id===p.sectionId); if(!sec)return '';
 let target=normalizeForCompare(p.text), groups=sec.secciones||[];
 for(let g of groups){
  let seq=[g.heading,...(g.lines||[])].map(x=>(x||'').trim()), hit=seq.findIndex(z=>{let nz=normalizeForCompare(z);return nz&&target&&(nz===target||nz.includes(target)||target.includes(nz))});
  if(hit<0)continue;
  // 1. Preferimos el desarrollo continuo que sigue inmediatamente a la píldora.
  let after=[];
  for(let i=hit+1;i<seq.length;i++){let z=seq[i];if(!z||/^[💬✨📖]/u.test(z))break;if(p.verse&&normalizeForCompare(z)===normalizeForCompare(p.verse))continue;after.push(cleanTeachingLine(z));if(after.join(' ').length>=360)break}
  let a=after.join(' ').trim(); if(isSolidPillReflection(a,p.text,p.verse))return a;
  // 2. Si la frase cierra un bloque, usamos solamente el párrafo CONTIGUO inmediatamente anterior.
  let before=[];
  for(let i=hit-1;i>=0;i--){let z=seq[i];if(!z||/^[💬✨📖]/u.test(z))break;if(p.verse&&normalizeForCompare(z)===normalizeForCompare(p.verse))continue;before.unshift(cleanTeachingLine(z));if(before.join(' ').length>=360)break}
  let q=before.join(' ').trim(); if(isSolidPillReflection(q,p.text,p.verse))return q;
  return '';
 }
 return '';
}
function pillContextOverlap(a,b){
 const stop=new Set(['porque','cuando','sobre','donde','desde','hasta','entre','todos','todas','estas','estos','tiene','puede','hacer','tienen','aquella','aquello','señor','dios','cristo','jesús','palabra','hombre','mujer','vida','mismo','misma']);
 const tok=x=>new Set(normalizeForCompare(x).split(/\s+/).filter(w=>w.length>=5&&!stop.has(w)));
 let aa=tok(a),bb=tok(b),n=0;aa.forEach(w=>{if(bb.has(w))n++});return n;
}
function sourceScriptureForPill(p){
 let b=(books||[]).find(x=>x.id===p.bookId),sec=b?.secciones?.find(x=>x.id===p.sectionId);
 if(!sec)return null;
 let candidates=scripturePairsFromSection(sec);if(!candidates.length)return null;
 let exact=candidates.find(x=>normalizeBibleRef(x.referencia)===normalizeBibleRef(p.reference));
 if(exact)return exact;
 // Never attach a random verse to an unrelated thought. Only use a verified
 // section anchor when the section provides a single unambiguous biblical passage.
 // No se asigna una cita a una frase sin correspondencia explícita.
 if(candidates.length===1 && p.reference && normalizeBibleRef(candidates[0].referencia)===normalizeBibleRef(p.reference))return candidates[0];
 return null;
}
function finalizePill(p){
 let supplied=(p.explanation||'').trim();
 let explanation=isSolidPillReflection(supplied,p.text,p.verse)?supplied:immediatePillReflection(p);
 if(!isSolidPillReflection(explanation,p.text,p.verse))explanation='';
 let source=sourceScriptureForPill(p);
 return {...p,reference:source?.referencia||'',verse:source?.versiculo||'',explanation};
}
function pushCompletePill(out,p){let fp=finalizePill(p);if(fp.reference&&fp.verse&&isSolidPillReflection(fp.explanation,fp.text,fp.verse))out.push(fp)}
// Motor de lectura de manuscritos v4.6.9: utiliza únicamente citas literales
// de la sección, jamás un versículo de otro capítulo o libro. No inventa Biblia.
function motorBiblePair(ref,verse){
 let r=(ref||'').replace(/^📖\s*/u,'').trim().replace(/[–—]/g,'-');
 let v=(verse||'').trim().replace(/^[“"]|[”"]$/g,'');
 if(!validBibleReference(r)||!isVerifiedVerse(v))return null;
 return {reference:r,verse:v};
}
function motorLocalPairs(sec){
 let out=[],add=(r,v)=>{let x=motorBiblePair(r,v);if(x&&!out.some(y=>normalizeBibleRef(y.reference)===normalizeBibleRef(x.reference)&&y.verse===x.verse))out.push(x)};
 add(sec.referencia,sec.versiculo);
 for(let x of sec.pildoraEscritura||[])add(x.referencia,x.versiculo);
 for(let g of sec.secciones||[]){let lines=[g.heading,...(g.lines||[])];
  for(let i=0;i<lines.length;i++){
   let t=(lines[i]||'').trim(),m=t.match(/^📖\s*((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)(?:\s*[—–:]\s*(.*))?$/u);
   if(m){let v=m[2]||lines[i+1]||'';add(m[1],v)}
  }
 }
 return out;
}
function motorCleanIndependence(t){return !/(?:según|como dice|como vimos|en este|en el|del|nuestro)\s+(?:libro|capítulo|texto|manuscrito)|consulte el capítulo|el autor (?:dice|menciona)/i.test(t||'')}
function motorCandidates(b,sectionId){
 let out=[],seen=new Set();
 for(let sec of b.secciones||[]){if(sectionId&&sec.id!==sectionId)continue;
  let pairs=motorLocalPairs(sec);
  if(!pairs.length)continue;
  for(let g of sec.secciones||[]){let lines=[g.heading,...(g.lines||[])].map(x=>(x||'').trim());
   let anchors=[];
   for(let i=0;i<lines.length;i++){
    let t=lines[i];if(!t)continue;
    if(/^📖/.test(t)){
     let rest=t.replace(/^📖\s*/u,''),match=rest.match(/^((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)/u);
     if(match){let pair=pairs.find(x=>normalizeBibleRef(x.reference)===normalizeBibleRef(match[1]));if(pair)anchors.push({i,pair})}
    }
   }
   // Una cita principal es utilizable solamente cuando no hay referencias competidoras.
   let unique=pairs.length===1?pairs[0]:null;
   for(let i=0;i<lines.length;i++){
    let raw=lines[i],marked=/^[💬✨]/u.test(raw),bullet=/^[•●]\s*[“"]/.test(raw);
    if(!marked&&!bullet)continue;
    let t=cleanMarks(raw).replace(/^[•●]\s*/,'').replace(/^[“"]|[”"]$/g,'').trim();
    if(t.length<35||t.length>340||!motorCleanIndependence(t))continue;
    let near=anchors.filter(x=>x.i<=i).slice(-1)[0],pair=near?.pair||unique;
    if(!pair)continue;
    // Reflexión solamente del desarrollo inmediato; sin fórmulas genéricas.
    let after=[];
    for(let j=i+1;j<lines.length;j++){
     let x=lines[j];if(!x||/^[💬✨📖•●]/u.test(x))break;
     if(x.length<22||!motorCleanIndependence(x))continue;
     after.push(cleanTeachingLine(x));if(after.join(' ').length>440)break;
    }
    let explanation=after.join(' ').trim();
    if(!isSolidPillReflection(explanation,t,pair.verse))continue;
    let key=normalizeForCompare(t);if(seen.has(key))continue;seen.add(key);
    out.push({bookId:b.id,book:b.titulo,sectionId:sec.id,section:sec.titulo,type:'Píldora',text:t,reference:pair.reference,verse:pair.verse,explanation});
   }
  }
 }
 return out;
}

// v4.6.14 — Reconstrucción editorial no destructiva para libros DOCX.
// Las etiquetas del manuscrito son marcadores, nunca pensamientos.
function docxPillLabel(t){return /^(?:💬\s*)?(?:principio(?: espiritual)?|reflexi[oó]n(?: final)?|s[ií]ntesis(?: espiritual)?|cita clave|aplicaci[oó]n|ense[nñ]anza|frase de cierre|texto base|tema)\s*:?\s*$/i.test((t||'').trim())}
function docxPillStatement(t){let v=cleanMarks(t||'').replace(/^[“”"'«»\s]+|[“”"'«»\s]+$/g,'').trim();return v.length>=38&&v.length<=350&&v.split(/\s+/).length>=7&&!docxPillLabel(v)&&motorCleanIndependence(v)&&!/(?:\.{3}|…)$/.test(v)?v:''}
function docxPillScriptures(lines){
 let out=[],refRx=/^((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)$/u;
 const add=(i,ref,verse)=>{let x=motorBiblePair(ref,verse);if(x&&!out.some(z=>z.i===i&&normalizeBibleRef(z.reference)===normalizeBibleRef(x.reference)))out.push({...x,i})};
 for(let i=0;i<lines.length;i++){
  let t=(lines[i]||'').trim(),clean=t.replace(/^📖\s*/u,'').trim();
  let match=clean.match(refRx);
  if(match){let verse=(lines[i+1]||'').trim();add(i,match[1],verse);continue}
  // «Texto bíblico» seguido por la referencia y la cita.
  if(/^📖/.test(t)&&i+2<lines.length){let m=(lines[i+1]||'').trim().match(refRx);if(m)add(i+1,m[1],lines[i+2]);}
  // Cita y referencia en una misma línea, siempre conservando el texto literal.
  let inline=t.match(/^[📖\s]*[“"«](.+?)[”"»]\s*\(?((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+:\d+(?:[-–]\d+)?)\)?\s*$/u);
  if(inline)add(i,inline[2],inline[1]);
 }
 return out.sort((a,b)=>a.i-b.i);
}
function docxEditorialPills(b,sectionId){
 let result=[],seen=new Set();
 for(let sec of b.secciones||[]){if(sectionId&&sec.id!==sectionId)continue;
  let lines=(sec.secciones||[]).flatMap(g=>[g.heading,...(g.lines||[])]).map(t=>(t||'').trim()).filter(Boolean);
  let refs=docxPillScriptures(lines);
  for(let i=0;i<lines.length;i++){
   let raw=lines[i],marked=/^[💬✨]/u.test(raw)||docxPillLabel(raw);
   if(!marked)continue;
   let candidate=docxPillLabel(raw)?lines[i+1]||'':raw;
   let statement=docxPillStatement(candidate);
   if(!statement)continue;
   let anchor=refs.filter(x=>x.i<=i).slice(-1)[0];
   if(!anchor||i-anchor.i>65)continue;
   // Preferir párrafos del mismo argumento, inmediatamente anteriores al principio.
   let before=[];
   for(let j=i-1;j>Math.max(anchor.i,i-10);j--){let v=lines[j];
    if(docxPillLabel(v)||/^[📖💬✨🙏🔥]/u.test(v)||/^\s*(?:[IVX]+\.|\d+[.)])\s/.test(v))break;
    if(v.length>=35&&!/^[“"«]/u.test(v)&&motorCleanIndependence(v))before.unshift(cleanTeachingLine(v));
    if(before.join(' ').length>=480)break;
   }
   let after=[];
   for(let j=i+(docxPillLabel(raw)?2:1);j<Math.min(lines.length,i+10);j++){
    let v=lines[j];if(docxPillLabel(v)||/^[📖💬✨🙏🔥🌿]/u.test(v))break;
    if(v.length>=35&&!/^[“"«]/u.test(v)&&motorCleanIndependence(v))after.push(cleanTeachingLine(v));
    if(after.join(' ').length>=480)break;
   }
   let explanation=[before.join(' '),after.join(' ')].filter(Boolean).sort((a,b)=>b.length-a.length)[0]||'';
   if(!isSolidPillReflection(explanation,statement,anchor.verse))continue;
   let key=normalizeForCompare(statement);if(seen.has(key))continue;seen.add(key);
   result.push({bookId:b.id,book:b.titulo,sectionId:sec.id,section:sec.titulo,type:'Píldora',text:statement,reference:anchor.reference,verse:anchor.verse,explanation});
  }
 }
 return result;
}


// v4.6.16: reconoce citas literales ANTES de su referencia en manuscritos DOCX.
// No fabrica versículos: únicamente utiliza citas completas y atribuidas en el libro.
function docxContextPills(b,sectionId){
 const output=[],seen=new Set();
 const rx=/^\(?\s*((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,2}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)\s*\)?\s*$/u;
 const isQuote=t=>/^[“"«]/u.test(t)&&/[”"»]$/.test(t);
 const strip=t=>(t||'').replace(/^[“"«\s]+|[”"»\s]+$/g,'').trim();
 const skip=t=>!t||/^(?:📖\s*)?(?:CAP[ÍI]TULO\s*\d+|PR[ÓO]LOGO|INTRODUCCI[ÓO]N|CONCLUSI[ÓO]N|EP[ÍI]LOGO|PRINCIPIO|PREGUNTA|REFLEXI[ÓO]N|FUENTE\s*→|\d+\.)/i.test(t)||rx.test(t)||isQuote(t);
 for(const sec of b.secciones||[]){if(sectionId&&sec.id!==sectionId)continue;
  const groups=sec.secciones||[];
  const lines=groups.flatMap(g=>[g.heading,...(g.lines||[])]).flatMap(x=>(x||'').split(/\n/)).map(x=>x.trim()).filter(Boolean);
  let anchors=[];
  for(let i=0;i<lines.length;i++){
   let match=lines[i].replace(/^📖\s*/u,'').match(rx);if(!match)continue;
   let quote='',from=i,to=i;
   // Versículo antes de la referencia: puede ocupar varias líneas contiguas.
   if(i>0){let parts=[];for(let j=i-1;j>=Math.max(0,i-5);j--){let t=lines[j];if(!t||rx.test(t)||/^📖\s*(?:CAP[ÍI]TULO|EL|LA)/i.test(t))break;parts.unshift(t);from=j;if(/^[“"«]/u.test(t))break;}let candidate=parts.join(' ');if(/^[“"«]/u.test(candidate)&&/[”"»]\s*$/.test(candidate))quote=strip(candidate);}
   // Referencia antes de la cita.
   if(!quote&&i+1<lines.length){let parts=[];for(let j=i+1;j<Math.min(lines.length,i+6);j++){let t=lines[j];if(rx.test(t)||/^📖\s*(?:CAP[ÍI]TULO|EL|LA)/i.test(t))break;parts.push(t);to=j;if(/[”"»]\s*$/.test(t))break;}let candidate=parts.join(' ');if(/^[“"«]/u.test(candidate)&&/[”"»]\s*$/.test(candidate))quote=strip(candidate);}
   let pair=motorBiblePair(match[1],quote);if(pair)anchors.push({...pair,from,to});
  }
  for(const anchor of anchors){
   // Seleccionar un principio del contexto inmediato de la cita, nunca del índice.
   let candidates=[];
   for(let j=Math.max(0,anchor.from-14);j<Math.min(lines.length,anchor.to+16);j++){
    let t=lines[j];if(j>=anchor.from&&j<=anchor.to||skip(t))continue;
    let clean=docxPillStatement(t);if(!clean||/:$/.test(clean)||(!/[.!?]$/.test(clean)&&clean.length<85))continue;
    let d=j<anchor.from?anchor.from-j:j-anchor.to;
    let strong=/(?:fuente|cisterna|depend|fluj|fruto|espíritu|dios|cristo|vida|corazón|proveedor)/i.test(clean)?1:0;
    candidates.push({j,text:clean,d,score:strong*5-d});
   }
   candidates.sort((a,b)=>b.score-a.score);
   for(const candidate of candidates.slice(0,5)){
    let parts=[];
    // Reflexión = desarrollo textual contiguo del MISMO lado de la cita.
    for(let j=candidate.j+1;j<Math.min(lines.length,candidate.j+9);j++){
     if(j>=anchor.from&&j<=anchor.to)break;
     let t=lines[j];if(skip(t)||/^[📖📌]/u.test(t))continue;
     if(t.length>=25)parts.push(t);
     if(parts.join(' ').length>=380)break;
    }
    if(parts.join(' ').length<95){parts=[];for(let j=candidate.j-1;j>=Math.max(0,candidate.j-8);j--){if(j>=anchor.from&&j<=anchor.to)break;let t=lines[j];if(skip(t)||/^[📖📌]/u.test(t))continue;if(t.length>=25)parts.unshift(t);if(parts.join(' ').length>=380)break;}}
    let explanation=parts.join(' ').trim();
    if(!isSolidPillReflection(explanation,candidate.text,anchor.verse)||explanation.length<95)continue;
    let key=sec.id+'|'+normalizeForCompare(candidate.text);if(seen.has(key))continue;
    seen.add(key);output.push({bookId:b.id,book:b.titulo,sectionId:sec.id,section:sec.titulo,type:'Píldora',text:candidate.text,reference:anchor.reference,verse:anchor.verse,explanation});break;
   }
  }
 }
 return output;
}


// v4.6.17: banco local de pasajes completos y propuestas de enseñanza.
// Reutiliza solo versículos citados literalmente en el manuscrito y limita la
// distancia temática; nunca inventa una cita ni una reflexión genérica.
function docxExpandedPills(b,sectionId){
 const result=[],seen=new Set();
 const refRx=/^\(?\s*((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)\s*\)?\s*$/u;
 const clean=t=>(t||'').replace(/^[“"«\s]+|[”"»\s]+$/g,'').trim();
 const words=t=>new Set((t||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').match(/[a-z]{5,}/g)||[]);
 const isHeading=t=>/^(?:📖\s*)?(?:CAP[ÍI]TULO\s+\d+|PR[ÓO]LOGO|INTRODUCCI[ÓO]N|CONCLUSI[ÓO]N|EP[ÍI]LOGO|PRINCIPIO|PREGUNTA|REFLEXI[ÓO]N|FUENTE\s*→|\d+[.)])\b/i.test(t)||docxPillLabel(t)||refRx.test(t);
 for(const sec of b.secciones||[]){if(sectionId&&sec.id!==sectionId)continue;
  const lines=(sec.secciones||[]).flatMap(g=>[g.heading,...(g.lines||[])]).map(x=>(x||'').trim()).filter(Boolean);
  const anchors=[];
  for(let i=0;i<lines.length;i++){
   let m=lines[i].replace(/^📖\s*/u,'').match(refRx);if(!m)continue;
   let verse='',start=i,end=i;
   // Captura citas de varios párrafos antes o después de la referencia.
   for(const side of [-1,1]){
    let chunks=[];
    for(let d=1;d<=7;d++){
     const j=i+side*d;if(j<0||j>=lines.length)break;
     let t=lines[j];if(refRx.test(t)||/^📖\s*CAP[ÍI]TULO/i.test(t))break;
     if(side===-1)chunks.unshift(t);else chunks.push(t);
     let joined=chunks.join(' ');
     if(/^[“"«]/.test(joined)&&/[”"»]$/.test(joined)){
      verse=clean(joined);start=Math.min(i,j);end=Math.max(i,j);break;
     }
    }
    if(verse)break;
   }
   let pair=motorBiblePair(m[1],verse);
   if(pair&&!anchors.some(a=>normalizeBibleRef(a.reference)===normalizeBibleRef(pair.reference)&&a.verse===pair.verse))anchors.push({...pair,start,end,i});
  }
  if(!anchors.length)continue;
  // Cada candidato debe ser un pensamiento autónomo con reflexión de su mismo bloque.
  const proposals=[];
  for(let i=0;i<lines.length;i++){
   if(anchors.some(a=>i>=a.start&&i<=a.end))continue;
   const thought=docxPillStatement(lines[i]);
   if(!thought||isHeading(lines[i])||/^[-•●👉]/u.test(lines[i]))continue;
   if(!/[.!?…:]$/.test(thought)&&thought.length<80)continue;
   let explanation=[];
   for(let j=i+1;j<Math.min(i+8,lines.length);j++){
    const t=lines[j];if(anchors.some(a=>j>=a.start&&j<=a.end)||isHeading(t)||/^[📖💬✨🙏🔥]/u.test(t))break;
    if(t.length>=30&&motorCleanIndependence(t))explanation.push(cleanTeachingLine(t));
    if(explanation.join(' ').length>=300)break;
   }
   const reflection=explanation.join(' ').trim();
   if(reflection.length<105||!isSolidPillReflection(reflection,thought,''))continue;
   proposals.push({i,thought,reflection});
  }
  for(const item of proposals){
   // Priorizar la cita más cercana, sin cruzar capítulos.
   let options=anchors.map(a=>({a,d:Math.abs(item.i-a.i)})).sort((x,y)=>x.d-y.d);
   let best=options[0];if(!best||best.d>85)continue;
   // Si hay varios pasajes, evitar adjudicar arbitrariamente una enseñanza remota.
   if(options.length>1&&options[1].d-best.d<5&&best.d>24)continue;
   const a=best.a,key=sec.id+'|'+normalizeForCompare(item.thought);
   if(seen.has(key))continue;
   seen.add(key);
   result.push({bookId:b.id,book:b.titulo,sectionId:sec.id,section:sec.titulo,type:'Píldora',text:item.thought,reference:a.reference,verse:a.verse,explanation:item.reflection});
  }
 }
 return result;
}


// v4.6.21 — Integridad de citas en DOCX: nunca tratar encabezados como Escritura.
function docxIsEditorialHeading(t){
 let x=(t||'').replace(/^[\s📖🌿💬➡️🔥✨🙏🔍🕊️]+/gu,'').trim();
 return /^(?:preguntas?(?:\s+de)?\s+(?:reflexi[oó]n|discernimiento)|evidencias?\s+de|claves?\s+para|oraci[oó]n|principio|reflexi[oó]n|conclusi[oó]n|aplicaci[oó]n|dise[nñ]o\s+hoy|cap[ií]tulo|frase\s+de\s+cierre|declaraci[oó]n|cita\s+clave)\b/i.test(x);
}
function docxScriptureSourcePairs(sec){
 const out=[];
 const refRx=/^((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+\s*:\s*\d+(?:\s*[-–]\s*\d+)?)\s*(?:[—–-]\s*)?(.*)$/u;
 const add=(ref,verse)=>{
  let v=(verse||'').replace(/^[\s“"«]+|[\s”"»]+$/g,'').trim();
  if(!validBibleReference(ref)||v.length<18||docxIsEditorialHeading(v)||/^[📖💬🌿➡️]/u.test(v)||/^(?:preguntas|evidencias|claves)\b/i.test(v))return;
  if(!out.some(z=>normalizeBibleRef(z.referencia)===normalizeBibleRef(ref)&&normalizeForCompare(z.versiculo)===normalizeForCompare(v)))out.push({referencia:ref,versiculo:v,excerpt:/\.{3}|…/.test(v)});
 };
 for(let g of sec.secciones||[]){
  const lines=[g.heading,...(g.lines||[])].map(t=>(t||'').trim()).filter(Boolean);
  for(let i=0;i<lines.length;i++){
   let t=lines[i].replace(/^📖\s*/u,'').trim(),m=t.match(refRx);
   if(m){
    let v=m[2]||'';
    if(!v&&i+1<lines.length&&/^[“"«]/u.test(lines[i+1]))v=lines[i+1];
    add(m[1],v);
   }
   // Formato inverso: «texto bíblico» — Libro 1:2
   let reverse=t.match(/^[“"«](.+?)[”"»]\s*[—–-]?\s*((?:(?:[1-3]|I{1,3})\s*)?[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+(?:\s+[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+){0,3}\s+\d+:\d+(?:[-–]\d+)?)$/u);
   if(reverse)add(reverse[2],reverse[1]);
  }
 }
 return out;
}
function docxRepairPillScripture(p,sec){
 const pairs=docxScriptureSourcePairs(sec);
 const matches=pairs.filter(x=>normalizeBibleRef(x.referencia)===normalizeBibleRef(p.reference));
 if(!matches.length)return null;
 const original=normalizeForCompare(p.verse||'');
 let found=matches.find(x=>normalizeForCompare(x.versiculo)===original)||matches[0];
 // Nunca aceptar un título editorial como versículo ni asociar otra referencia.
 if(!found||docxIsEditorialHeading(found.versiculo))return null;
 return {...p,reference:found.referencia,verse:found.versiculo,excerpt:found.excerpt||false};
}

function getPills(b,sectionId){
 let out=[];
 // Entradas extraídas del manuscrito con referencia explícita, texto y reflexión.
 // No se utilizan referencias de otro capítulo ni textos de relleno.
 b.secciones.filter(s=>!sectionId||s.id===sectionId).forEach(s=>{
  for(let p of (s.pildorasEditadas||[])){
   if(!validBibleReference(p.reference)||!(p.excerpt ? (p.verse||'').length>=20 : isVerifiedVerse(p.verse))||!isSolidPillReflection(p.explanation,p.text,p.verse))continue;
   out.push({bookId:b.id,book:b.titulo,sectionId:s.id,section:s.titulo,type:'Píldora',text:p.text,reference:p.reference,verse:p.verse,explanation:p.explanation,excerpt:!!p.excerpt});
  }
 });
 let prior=out.slice();
 out=[];
 b.secciones.filter(s=>!sectionId||s.id===sectionId).forEach(s=>{
  s.secciones.forEach((g,gi)=>{
   // Los libros importados por el motor pueden conservar una frase 💬/✨ como encabezado
   // del bloque. La incorporamos también al catálogo global sin inventar contenido.
   let gh=(g.heading||'').trim();
   if(gh.startsWith('💬')||gh.startsWith('✨')){
    let ref=s.referencia||'', verse=s.versiculo||'', exp=[];
    for(let z of (g.lines||[])){z=(z||'').trim();if(!z||z.startsWith('💬')||z.startsWith('✨')||z.startsWith('📖'))break;exp.push(z);if(exp.length>=4)break}
    pushCompletePill(out,{bookId:b.id,book:b.titulo,sectionId:s.id,section:s.titulo,text:cleanMarks(gh),type:'Píldora',reference:ref,verse:verse,explanation:exp.join(' ')});
   }
   g.lines.forEach((line,li)=>{
   let t=(line||'').trim(); if(!(t.startsWith('💬')||t.startsWith('✨')))return;
   let ref=s.referencia||'', verse=s.versiculo||'';
   
   for(let k=li-1;k>=0;k--){let z=(g.lines[k]||'').trim();if(z.startsWith('📖')){ref=z.replace(/^📖\s*/,'').trim();let nv=(g.lines[k+1]||'').trim();if(nv && !nv.startsWith('💬')&&!nv.startsWith('✨'))verse=nv;break}}
   let exp=[];
   for(let k=li+1;k<g.lines.length && exp.length<4;k++){let z=(g.lines[k]||'').trim();if(!z||z.startsWith('💬')||z.startsWith('✨')||z.startsWith('📖'))break;exp.push(z)}
   // v3.3.1: si no existe reflexión inmediata en este mismo bloque, se deja sin reflexión.
   // Es preferible una píldora breve y fiel que una composición de frases tomadas de otros bloques.
   pushCompletePill(out,{bookId:b.id,book:b.titulo,sectionId:s.id,section:s.titulo,text:cleanMarks(t),type:'Píldora',reference:ref,verse:verse,explanation:exp.join(' ')});
   });
  });
  // Los libros expositivos no siempre contienen marcas 💬/✨. Extraer píldoras
  // de frases completas del propio capítulo, sin fabricar doctrina ni Escritura.
  if(!out.some(p=>p.sectionId===s.id)){
   let lines=(s.secciones||[]).flatMap(g=>g.lines||[]);
   let prose=lines.map(x=>(x||'').trim()).filter(x=>x.length>=65&&x.length<=320&&!/^[📖💬✨]/u.test(x)&&!/^\s*[“"]/.test(x)&&!/^\s*(?:CAP[IÍ]TULO|ORACI[OÓ]N|PREGUNTAS)/i.test(x));
   let used=0;
   for(let i=0;i<prose.length&&used<3;i++){
    let t=prose[i];if(!/[.!?…]$/.test(t))continue;
    let reflection=prose.slice(i+1,i+3).join(' ');
    let pill=finalizePill({bookId:b.id,book:b.titulo,sectionId:s.id,section:s.titulo,text:t,type:'Píldora',reference:'',verse:'',explanation:reflection});
    if(!pill.reference||!pill.verse||!isSolidPillReflection(pill.explanation,pill.text,pill.verse))continue;
    out.push(pill);used++;i+=2;
   }
  }
 });
 // Evitar duplicados entre el banco explícito y las citas del motor anterior.
 // La edición bíblica validada prevalece sobre la extracción automática, sin duplicar
 // ni disminuir el número de píldoras.
 // Incorporación del motor del manuscrito; no se sobreescriben ediciones aprobadas.
 for(let p of motorCandidates(b,sectionId)){
  if(!out.some(x=>x.sectionId===p.sectionId&&normalizeForCompare(x.text)===normalizeForCompare(p.text)))out.push(p);
 }
 for(let p of prior){
  let at=out.findIndex(x=>x.sectionId===p.sectionId&&normalizeForCompare(x.text)===normalizeForCompare(p.text));
  if(at>=0)out[at]=p;else out.push(p);
 }
 // El motor DOCX conserva ediciones válidas y reconstruye las etiquetas sueltas.
 if(b.sourceName){
  const curated=prior.filter(p=>docxPillStatement(p.text)&&validBibleReference(p.reference)&&isVerifiedVerse(p.verse)&&isSolidPillReflection(p.explanation,p.text,p.verse));
  const generated=docxEditorialPills(b,sectionId);
  const contextual=docxContextPills(b,sectionId);
  const expanded=docxExpandedPills(b,sectionId);
  const all=[...curated,...generated,...contextual,...expanded,...out.filter(p=>docxPillStatement(p.text)&&validBibleReference(p.reference)&&isVerifiedVerse(p.verse)&&isSolidPillReflection(p.explanation,p.text,p.verse))];
  let unique=new Map();for(let p of all){let key=p.sectionId+'|'+normalizeForCompare(p.text);if(!unique.has(key))unique.set(key,p)}
  // Verificación final en cada apertura: también corrige píldoras ya importadas.
  // No modifica el libro ni sobrescribe los datos guardados.
  const checked=[];
  for(const p of unique.values()){
   const sec=b.secciones.find(s=>s.id===p.sectionId);if(!sec)continue;
   const repaired=docxRepairPillScripture(p,sec);
   if(repaired&&isSolidPillReflection(repaired.explanation,repaired.text,repaired.verse))checked.push(repaired);
  }
  return checked.slice(0,100);
 }
 // Tope editorial; no se fabrican píldoras para completar 100.
 return out.slice(0,100);
}
window.pills=(bookId,sectionId,idx=0)=>{
 let b=books.find(x=>x.id===bookId),ps=getPills(b,sectionId); idx=Math.max(0,Math.min(Number(idx)||0,Math.max(0,ps.length-1)));
 if(!ps.length){app.innerHTML=`<section class="card"><button class="btn secondary" onclick="selectBook('${b.id}')">← Libro</button><div class="feedback">Esta sección no contiene frases marcadas como píldoras.</div></section>`;return}
 let p=ps[idx], prev=idx>0?idx-1:ps.length-1, next=idx<ps.length-1?idx+1:0;
 app.innerHTML=`<section class="spiritualPill">
 <div class="pillTop"><button class="pillBack" onclick="${sectionId?`goToSection('${b.id}','${sectionId}')`:`globalPillsPage()`}">‹ <span>Volver</span></button><div class="pillTitle">💡 <strong>PÍLDORA ESPIRITUAL</strong></div><div class="pillPager"><span>${idx+1} de ${ps.length}</span><button onclick="pills('${b.id}',${sectionId?`'${sectionId}'`:'null'},${prev})">‹</button><button onclick="pills('${b.id}',${sectionId?`'${sectionId}'`:'null'},${next})">›</button></div></div>
 <div class="pillBody"><div class="pillStatement">💬 <span>${esc(p.text)}</span></div>
 ${p.reference&&p.verse?`<div class="pillScripture"><div class="pillRef">📖 ${esc(p.reference)}${p.excerpt?' · Fragmento citado en el manuscrito':''}</div>${p.verse?`<div class="pillVerse">“${esc(p.verse.replace(/^[“\"]|[”\"]$/g,''))}”</div>`:``}</div>`:''}
 ${p.explanation?`<div class="pillExplanation"><span class="arrowBox">➡</span><span>${esc(p.explanation)}</span></div>`:''}
 <div class="pillSignature"><span></span><em>Constructores del Reino</em><span></span></div>
 <div class="pillActions"><button onclick='saveRaw(${JSON.stringify(p)})'>♡ <b>Guardar</b></button><button onclick='sharePill(${JSON.stringify(p)})'>⌯ <b>Compartir</b></button><button onclick='downloadCard(${JSON.stringify(p.text)},${JSON.stringify(p.book)},${JSON.stringify(p.section)},${JSON.stringify(p.reference||'')},${JSON.stringify(p.verse||'')},${JSON.stringify(p.explanation||'')})'>▧ <b>Crear imagen</b></button><button onclick='bookmarkPicker(${JSON.stringify(p)})'>🔖 <b>Crear separador</b></button><button onclick="goToSection('${p.bookId}','${p.sectionId}')">▤ <b>Ver en el libro</b></button></div>
 <div class="pillOrigin">${esc(p.book)} · ${esc(p.section)} · Leonard Moon</div></div></section>`;
}
window.goToSection=(bid,sid)=>{book=books.find(b=>b.id===bid);state=loadState(bid);openSection(sid)}
window.saveItem=(type,text,label)=>{if(!book||!current)return;saveRaw({type,text,bookId:book.id,book:book.titulo,sectionId:current.id,section:label||current.titulo})}
window.saveRaw=item=>{let c=loadCollection(),key=`${item.bookId}|${item.sectionId}|${item.type}|${item.text}`;if(!c.some(x=>x.key===key)){c.unshift({...item,key,date:new Date().toISOString()});saveCollection(c);alert('Guardado en Mi colección.')}else alert('Esta enseñanza ya está guardada.')}
window.collection=()=>{let c=loadCollection();app.innerHTML=`<section class="card"><span class="badge">❤️ MI COLECCIÓN</span><h1>Enseñanzas que he guardado</h1><input id="collectionSearch" class="searchBox" placeholder="Buscar en mi colección..." oninput="filterCollection()"><div id="collectionList">${renderCollection(c)}</div></section>`}
function renderCollection(c){return c.length?c.map((x,i)=>`<article class="saved"><span class="badge">${esc(x.type)}</span><h3>${esc(x.book)}</h3><p class="muted">${esc(x.section)}</p><blockquote>${esc(x.text)}</blockquote><div class="row"><button class="mini" onclick='shareText(${JSON.stringify(x.text)},${JSON.stringify(x.book)},${JSON.stringify(x.section)})'>📲 Compartir</button><button class="mini" onclick='downloadCard(${JSON.stringify(x.text)},${JSON.stringify(x.book)},${JSON.stringify(x.section)},${JSON.stringify(x.reference||'')},${JSON.stringify(x.verse||'')},${JSON.stringify(x.explanation||'')})'>🖼 Imagen</button><button class="mini danger" onclick="removeSaved('${x.key.replace(/'/g,"\\'")}')">Eliminar</button></div></article>`).join(''):'<p class="muted">Todavía no ha guardado enseñanzas.</p>'}
window.filterCollection=()=>{let q=$('#collectionSearch').value.toLowerCase(),c=loadCollection().filter(x=>`${x.text} ${x.book} ${x.section} ${x.type}`.toLowerCase().includes(q));$('#collectionList').innerHTML=renderCollection(c)}
window.removeSaved=key=>{saveCollection(loadCollection().filter(x=>x.key!==key));collection()}
function searchable(){let out=[];books.forEach(b=>b.secciones.forEach(s=>{let text=[s.titulo,s.subtitulo,s.referencia,s.versiculo,...s.secciones.flatMap(g=>[g.heading,...g.lines])].filter(Boolean).join(' ');out.push({b,s,text})}));return out}
window.searchLibrary=()=>{app.innerHTML=`<section class="card"><span class="badge">🔎 BUSCADOR DE TODA LA BIBLIOTECA</span><h1>¿Qué desea encontrar?</h1><p class="muted">Busca palabras y expresiones dentro del contenido de todos los libros.</p><input id="globalSearch" class="searchBox" placeholder="Ejemplo: altar, obediencia, congregados..." oninput="runSearch()"><div id="searchResults"></div></section>`;$('#globalSearch').focus()}
window.runSearch=()=>{let q=$('#globalSearch').value.trim().toLowerCase();if(q.length<2){$('#searchResults').innerHTML='';return}let r=searchable().filter(x=>x.text.toLowerCase().includes(q));$('#searchResults').innerHTML=`<p class="muted">${r.length} secciones encontradas.</p>`+r.map(x=>{let raw=x.text,idx=raw.toLowerCase().indexOf(q),snippet=raw.slice(Math.max(0,idx-90),idx+q.length+150);return `<article class="searchResult"><span class="badge">${esc(x.b.titulo)}</span><h3>${esc(x.s.tipo)} · ${esc(x.s.titulo)}</h3><p>…${esc(snippet)}…</p><button class="mini" onclick="goToSection('${x.b.id}','${x.s.id}')">📖 Abrir sección</button></article>`}).join('')}
window.shareText=(text,bookTitle,section)=>sharePill({text,book:bookTitle,section});
window.sharePill=p=>{if(p.reference&&!p.verse)p={...p,reference:''};let msg=`💡 PÍLDORA ESPIRITUAL\n\n“${p.text||''}”${p.reference&&p.verse?`\n\n📖 ${p.reference}\n${p.verse}`:''}${p.explanation?`\n\n➡️ ${p.explanation}`:''}\n\n${p.section||''}\n${p.book||''}\nLeonard Moon`;
 let wa='https://wa.me/?text='+encodeURIComponent(msg), mail='mailto:?subject='+encodeURIComponent('Píldora espiritual · '+(p.book||'Leonard Moon'))+'&body='+encodeURIComponent(msg);
 let old=document.getElementById('shareModal');if(old)old.remove();let m=document.createElement('div');m.id='shareModal';m.className='shareOverlay';m.innerHTML=`<div class="shareModal"><button class="shareClose" onclick="document.getElementById('shareModal').remove()">×</button><h2>📲 Compartir píldora</h2><p>Seleccione cómo desea compartirla.</p><a class="shareChoice whatsapp" href="${wa}" target="_blank" rel="noopener">WhatsApp</a><a class="shareChoice" href="${mail}">✉️ Correo electrónico</a><button class="shareChoice copy" id="copyPill">📋 Copiar texto</button></div>`;document.body.appendChild(m);document.getElementById('copyPill').onclick=async()=>{try{await navigator.clipboard.writeText(msg);alert('Píldora copiada.')}catch(e){let ta=document.createElement('textarea');ta.value=msg;document.body.appendChild(ta);ta.select();document.execCommand('copy');ta.remove();alert('Píldora copiada.')}}}

function wrap(ctx,text,maxWidth){let words=text.split(/\s+/),lines=[],line='';for(let w of words){let t=line?line+' '+w:w;if(ctx.measureText(t).width>maxWidth&&line){lines.push(line);line=w}else line=t}if(line)lines.push(line);return lines}
// Imagen editorial autosuficiente: muestra la reflexión propia de cada píldora.
// El texto se ajusta al espacio disponible; nunca se sustituye por publicidad del libro.
window.downloadCard=(text,bookTitle,section,reference='',verse='',explanation='')=>{
 if(!verse)reference='';
 const c=document.createElement('canvas');c.width=1080;c.height=1350;
 const x=c.getContext('2d');
 const bg=x.createLinearGradient(0,0,1080,1350);bg.addColorStop(0,'#ffffff');bg.addColorStop(1,'#f3efff');
 x.fillStyle=bg;x.fillRect(0,0,1080,1350);x.fillStyle='#6f48ff';x.fillRect(0,0,18,1350);
 x.textAlign='center';x.fillStyle='#32216f';x.font='700 42px Georgia';x.fillText('💡  PÍLDORA ESPIRITUAL',540,105);
 x.strokeStyle='#ded5ff';x.lineWidth=3;x.beginPath();x.moveTo(90,140);x.lineTo(990,140);x.stroke();
 const clean=v=>String(v||'').replace(/\s+/g,' ').trim();
 const statement=clean(text), scripture=clean(verse).replace(/^[“"]|[”"]$/g,''), reflection=clean(explanation);
 // El título y la firma conservan un espacio propio; se distribuye el resto entre enseñanza y Escritura.
 const footerTop=1190, top=180, contentBottom=footerTop-24;
 function layout(font,leading,content,width,maxHeight){x.font=font;const lines=wrap(x,content,width);return {lines,leading,height:lines.length*leading,ok:lines.length*leading<=maxHeight}}
 function fitted(content,style,maxSize,minSize,width,maxHeight,leadingFactor){
  for(let size=maxSize;size>=minSize;size--){let lead=Math.ceil(size*leadingFactor),l=layout(style+' '+size+'px Georgia',lead,content,width,maxHeight);if(l.ok)return {...l,size,font:style+' '+size+'px Georgia'}}
  return null;
 }
 let quote=fitted('“'+statement+'”','italic',50,24,880,270,1.25);
 let bible=reference?fitted('“'+scripture+'”','normal',30,18,850,260,1.35):null;
 let reflectionBlock=reflection?fitted(reflection,'normal',28,17,820,310,1.35):null;
 // En textos excepcionalmente largos, ampliar verticalmente el lienzo antes que recortar palabras.
 let extra=0;
 if(!quote){x.font='italic 24px Georgia';extra+=Math.max(0,wrap(x,'“'+statement+'”',880).length*31-270)}
 if(reference&&!bible){x.font='18px Georgia';extra+=Math.max(0,wrap(x,'“'+scripture+'”',850).length*25-260)}
 if(reflection&&!reflectionBlock){x.font='17px Georgia';extra+=Math.max(0,wrap(x,reflection,820).length*24-310)}
 if(extra){c.height=1350+extra+100;return drawExpandedPillCard(c,statement,bookTitle,section,reference,scripture,reflection)}
 let y=top;
 x.fillStyle='#4022c9';x.font=quote.font;
 quote.lines.forEach(line=>{x.fillText(line,540,y+quote.leading);y+=quote.leading});
 if(reference){y+=30;x.fillStyle='#29253a';x.font='700 33px Georgia';x.fillText('📖  '+reference,540,y+32);y+=57;
  x.font=bible.font;bible.lines.forEach(line=>{x.fillText(line,540,y+bible.leading);y+=bible.leading});
 }
 y+=35;
 if(reflectionBlock){
  const boxHeight=Math.max(145,reflectionBlock.height+104);x.fillStyle='#eee9ff';roundRect(x,75,y,930,boxHeight,26);x.fill();
  x.fillStyle='#51456f';x.font='700 23px Georgia';x.fillText('REFLEXIÓN ESPIRITUAL',540,y+42);
  x.font=reflectionBlock.font;let ty=y+58;reflectionBlock.lines.forEach(line=>{ty+=reflectionBlock.leading;x.fillText(line,540,ty)});
  y+=boxHeight;
 }else{
  // No se inventa reflexión ni se invita a leer el libro si el origen no la contiene.
  x.fillStyle='#eee9ff';roundRect(x,75,y,930,100,26);x.fill();x.fillStyle='#51456f';x.font='italic 26px Georgia';x.fillText('Una verdad para meditar y vivir.',540,y+58);y+=100;
 }
 let signatureY=Math.max(y+38,footerTop-78);
 if(signatureY>=footerTop){c.height=signatureY+165;return drawExpandedPillCard(c,statement,bookTitle,section,reference,scripture,reflection)}
 x.fillStyle='#7657e8';x.font='27px Georgia';x.fillText('—  Constructores del Reino  —',540,signatureY);
 x.strokeStyle='#ded5ff';x.beginPath();x.moveTo(150,footerTop-18);x.lineTo(930,footerTop-18);x.stroke();
 x.fillStyle='#3d3264';x.font='700 23px Georgia';let footer=wrap(x,clean(section).toUpperCase(),900);
 let fy=footerTop+13;footer.forEach(line=>{x.fillText(line,540,fy);fy+=29});
 x.font='700 25px Georgia';let titles=wrap(x,clean(bookTitle).toUpperCase(),900);titles.forEach(line=>{x.fillText(line,540,fy);fy+=30});
 x.font='italic 26px Georgia';x.fillText('Leonard Moon',540,fy+13);
 const a=document.createElement('a');a.download='pildora-espiritual-leonard-moon.png';a.href=c.toDataURL('image/png');a.click();
};
function drawExpandedPillCard(c,statement,bookTitle,section,reference,scripture,reflection){
 // Diseño de altura flexible para píldoras extensas: ningún versículo termina a media frase.
 const x=c.getContext('2d');let parts=[];
 function block(content,font,width,leading){x.font=font;return {lines:wrap(x,content,width),font,leading}}
 const q=block('“'+statement+'”','italic 30px Georgia',850,42);
 const v=reference?block('“'+scripture+'”','24px Georgia',840,34):null;
 const r=reflection?block(reflection,'24px Georgia',810,34):null;
 const estimated=180+q.lines.length*q.leading+(v?95+v.lines.length*v.leading:0)+(r?110+r.lines.length*r.leading:0)+235;
 c.height=Math.max(1350,estimated);const h=c.height;
 const bg=x.createLinearGradient(0,0,1080,h);bg.addColorStop(0,'#ffffff');bg.addColorStop(1,'#f3efff');x.fillStyle=bg;x.fillRect(0,0,1080,h);x.fillStyle='#6f48ff';x.fillRect(0,0,18,h);
 x.textAlign='center';x.fillStyle='#32216f';x.font='700 42px Georgia';x.fillText('💡  PÍLDORA ESPIRITUAL',540,100);
 x.strokeStyle='#ded5ff';x.beginPath();x.moveTo(90,140);x.lineTo(990,140);x.stroke();let y=180;
 x.fillStyle='#4022c9';x.font=q.font;q.lines.forEach(line=>{y+=q.leading;x.fillText(line,540,y)});
 if(v){y+=50;x.fillStyle='#29253a';x.font='700 32px Georgia';x.fillText('📖  '+reference,540,y);y+=18;x.font=v.font;v.lines.forEach(line=>{y+=v.leading;x.fillText(line,540,y)})}
 if(r){y+=40;const boxH=r.lines.length*r.leading+100;x.fillStyle='#eee9ff';roundRect(x,75,y,930,boxH,26);x.fill();x.fillStyle='#51456f';x.font='700 23px Georgia';x.fillText('REFLEXIÓN ESPIRITUAL',540,y+40);x.font=r.font;let ry=y+55;r.lines.forEach(line=>{ry+=r.leading;x.fillText(line,540,ry)});y+=boxH}
 y+=55;x.fillStyle='#7657e8';x.font='26px Georgia';x.fillText('—  Constructores del Reino  —',540,y);
 y+=65;x.fillStyle='#3d3264';x.font='700 24px Georgia';wrap(x,String(section||'').toUpperCase(),900).forEach(line=>{x.fillText(line,540,y);y+=32});
 x.font='700 24px Georgia';wrap(x,String(bookTitle||'').toUpperCase(),900).forEach(line=>{x.fillText(line,540,y);y+=32});x.font='italic 26px Georgia';x.fillText('Leonard Moon',540,y+18);
 const a=document.createElement('a');a.download='pildora-espiritual-leonard-moon.png';a.href=c.toDataURL('image/png');a.click();
}

const bookmarkThemes=[
 {name:'Camino',tag:'La Palabra como guía',a:'#f8e8c7',b:'#6f431d',accent:'#9b6428',scene:'path'},
 {name:'Caramelo',tag:'Un mensaje que endulza',a:'#ffe4eb',b:'#a91f45',accent:'#d83d68',scene:'candy'},
 {name:'Regalo',tag:'Un mensaje que es un regalo',a:'#fff0cf',b:'#8a5208',accent:'#c47b0d',scene:'gift'},
 {name:'Mariposa',tag:'Un mensaje que transforma',a:'#e4f4df',b:'#145b35',accent:'#27804d',scene:'butterfly'},
 {name:'Refugio',tag:'Un mensaje que da seguridad',a:'#eee4ff',b:'#3c267d',accent:'#6843bd',scene:'refuge'}
];
window.bookmarkPicker=p=>{let old=document.getElementById('bookmarkModal');if(old)old.remove();let m=document.createElement('div');m.id='bookmarkModal';m.className='shareOverlay bookmarkOverlay';m.innerHTML=`<div class="bookmarkModal"><button class="shareClose" onclick="document.getElementById('bookmarkModal').remove()">×</button><span class="badge">🔖 SEPARADORES DE PÍLDORAS</span><h2>Elija un diseño para esta píldora</h2><p>Los cinco diseños usan la <b>píldora real</b>: frase, Palabra, reflexión y procedencia. Solo cambia la experiencia visual.</p><div class="bookmarkChoices bookmarkChoicesFive">${bookmarkThemes.map((t,i)=>`<button onclick='downloadBookmark(${JSON.stringify(p)},${i})'><span class="bookmarkSwatch visual-${t.scene}" style="--ba:${t.a};--bb:${t.b};--bc:${t.accent}"><i>${t.scene==='path'?'↝':t.scene==='candy'?'🍬':t.scene==='gift'?'🎁':t.scene==='butterfly'?'🦋':'⌂'}</i><strong>${i+1}</strong></span><b>${t.name}</b><small>${t.tag}</small></button>`).join('')}</div><div class="bookmarkNote">Después de generarlo podrá visualizarlo, guardarlo o compartirlo desde su dispositivo.</div></div>`;document.body.appendChild(m)};
function bookmarkScene(ctx,t){
 let g=ctx.createLinearGradient(0,0,0,1800);g.addColorStop(0,t.a);g.addColorStop(.72,'#fffdf8');g.addColorStop(1,t.a);ctx.fillStyle=g;ctx.fillRect(0,0,650,1800);
 ctx.save();ctx.globalAlpha=.96;
 if(t.scene==='path'){
   let sky=ctx.createLinearGradient(0,0,0,560);sky.addColorStop(0,'#f6c66b');sky.addColorStop(1,'#fff3d4');ctx.fillStyle=sky;ctx.fillRect(0,0,650,560);ctx.fillStyle='#7e9b4a';ctx.beginPath();ctx.moveTo(0,500);ctx.quadraticCurveTo(180,390,330,500);ctx.quadraticCurveTo(500,390,650,485);ctx.lineTo(650,650);ctx.lineTo(0,650);ctx.fill();ctx.strokeStyle='#f8e8bd';ctx.lineWidth=42;ctx.beginPath();ctx.moveTo(315,610);ctx.bezierCurveTo(250,520,410,460,330,330);ctx.stroke();
 }else if(t.scene==='candy'){
   ctx.fillStyle='#ffd5df';ctx.fillRect(0,0,650,520);ctx.translate(325,245);ctx.rotate(-.08);ctx.fillStyle='#fff0f4';ctx.beginPath();ctx.moveTo(-180,-35);ctx.lineTo(-255,-95);ctx.lineTo(-240,70);ctx.closePath();ctx.fill();ctx.beginPath();ctx.moveTo(180,-35);ctx.lineTo(255,-95);ctx.lineTo(240,70);ctx.closePath();ctx.fill();ctx.fillStyle='#e94c72';roundRect(ctx,-180,-82,360,164,82);ctx.fill();ctx.strokeStyle='#fff';ctx.lineWidth=26;for(let q=-125;q<=125;q+=70){ctx.beginPath();ctx.moveTo(q-30,-68);ctx.lineTo(q+30,68);ctx.stroke()}ctx.setTransform(1,0,0,1,0,0);
 }else if(t.scene==='gift'){
   ctx.fillStyle='#fff0c9';ctx.fillRect(0,0,650,520);ctx.fillStyle='#fffaf0';roundRect(ctx,155,185,340,245,24);ctx.fill();ctx.fillStyle='#d29a24';ctx.fillRect(300,185,50,245);ctx.fillRect(155,270,340,45);ctx.strokeStyle='#d29a24';ctx.lineWidth=26;ctx.beginPath();ctx.ellipse(280,170,70,42,-.35,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(370,170,70,42,.35,0,Math.PI*2);ctx.stroke();
 }else if(t.scene==='butterfly'){
   ctx.fillStyle='#e6f4d8';ctx.fillRect(0,0,650,520);ctx.translate(325,235);ctx.fillStyle='#f39a22';ctx.strokeStyle='#382417';ctx.lineWidth=9;ctx.beginPath();ctx.ellipse(-85,-35,115,70,-.55,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(85,-35,115,70,.55,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(-65,75,90,55,.55,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(65,75,90,55,-.55,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#2e241e';roundRect(ctx,-12,-105,24,220,12);ctx.fill();ctx.setTransform(1,0,0,1,0,0);
 }else{
   let sky=ctx.createLinearGradient(0,0,0,540);sky.addColorStop(0,'#8f75ca');sky.addColorStop(.65,'#f0b8a0');sky.addColorStop(1,'#f7d4a7');ctx.fillStyle=sky;ctx.fillRect(0,0,650,540);ctx.fillStyle='#28304d';ctx.beginPath();ctx.moveTo(0,470);ctx.lineTo(150,360);ctx.lineTo(260,450);ctx.lineTo(410,315);ctx.lineTo(650,460);ctx.lineTo(650,560);ctx.lineTo(0,560);ctx.fill();ctx.fillStyle='#4a3a3a';roundRect(ctx,250,265,150,190,10);ctx.fill();ctx.beginPath();ctx.moveTo(225,280);ctx.lineTo(325,195);ctx.lineTo(425,280);ctx.closePath();ctx.fill();ctx.fillStyle='#ffd96a';roundRect(ctx,300,340,50,85,8);ctx.fill();
 }
 ctx.restore();
}
function fitLines(ctx,text,maxWidth,maxLines,startSize,minSize=27){for(let size=startSize;size>=minSize;size-=2){ctx.font=`italic 700 ${size}px Georgia`;let ls=wrap(ctx,text,maxWidth);if(ls.length<=maxLines)return {size,lines:ls}}ctx.font=`italic 700 ${minSize}px Georgia`;let ls=wrap(ctx,text,maxWidth).slice(0,maxLines);if(ls.length){let last=ls.length-1;while(ctx.measureText(ls[last]+'…').width>maxWidth&&ls[last].length>3)ls[last]=ls[last].slice(0,-2);ls[last]+='…'}return {size:minSize,lines:ls}}
function bookmarkTextBlock(ctx,text,x,y,maxWidth,lineHeight,maxLines,font,color){ctx.font=font;ctx.fillStyle=color;ctx.textAlign='left';let ls=wrap(ctx,text,maxWidth).slice(0,maxLines);for(let l of ls){ctx.fillText(l,x,y);y+=lineHeight}return y}
window.downloadBookmark=(p,themeIndex=0)=>{
 let t=bookmarkThemes[themeIndex]||bookmarkThemes[0],c=document.createElement('canvas');c.width=650;c.height=1800;let x=c.getContext('2d');bookmarkScene(x,t);
 // paper panel: begins below the visual motif and leaves a thematic footer visible
 let panelTop=440;x.fillStyle='rgba(255,253,248,.96)';roundRect(x,35,panelTop,580,1240,30);x.fill();x.strokeStyle=t.accent+'55';x.lineWidth=2;x.stroke();
 x.textAlign='center';x.fillStyle=t.accent;x.font='700 24px Georgia';x.fillText('💡  PÍLDORA ESPIRITUAL',325,500);
 let f=fitLines(x,'“'+(p.text||'')+'”',500,7,43,29),y=575;x.fillStyle=t.b;x.font=`italic 700 ${f.size}px Georgia`;for(let l of f.lines){x.fillText(l,325,y);y+=f.size*1.22}
 if(p.reference){y+=22;x.strokeStyle=t.accent+'55';x.beginPath();x.moveTo(110,y-12);x.lineTo(540,y-12);x.stroke();x.fillStyle=t.b;x.font='700 28px Georgia';x.fillText('📖  '+p.reference,325,y+22);y+=65;if(p.verse){x.fillStyle='#35312d';x.font='24px Georgia';let vs=wrap(x,'“'+p.verse.replace(/[“”"]/g,'')+'”',500).slice(0,6);for(let l of vs){x.fillText(l,325,y);y+=32}}}
 let reflection=(p.explanation||'').trim();if(reflection){y+=26;x.strokeStyle=t.accent+'44';x.beginPath();x.moveTo(110,y);x.lineTo(540,y);x.stroke();y+=45;x.textAlign='left';x.fillStyle=t.b;x.font='700 27px Georgia';x.fillText('💬  Reflexión',92,y);y+=42;y=bookmarkTextBlock(x,reflection,92,y,466,31,8,'24px Georgia','#3d3934');}
 y=Math.min(Math.max(y+42,1325),1460);x.textAlign='center';x.fillStyle=t.accent;x.font='italic 22px Georgia';x.fillText('🌱  Constructores del Reino',325,y);
 // provenance footer
 x.fillStyle=t.b;x.font='700 20px Georgia';let sy=1545,sl=wrap(x,(p.section||'').toUpperCase(),510).slice(0,2);for(let l of sl){x.fillText(l,325,sy);sy+=28}x.font='700 25px Georgia';let bl=wrap(x,(p.book||'').toUpperCase(),510).slice(0,2);for(let l of bl){x.fillText(l,325,sy+10);sy+=32}x.font='italic 22px Georgia';x.fillText('Leonard Moon',325,sy+28);x.font='15px Arial';x.fillText('BIBLIOTECA DIGITAL · Una biblioteca para vivir la Palabra',325,sy+62);
 c.toBlob(blob=>{if(!blob)return alert('No fue posible generar el separador.');showBookmarkPreview(blob,p,t)},'image/png')};
window.showBookmarkPreview=(blob,p,t)=>{document.getElementById('bookmarkModal')?.remove();document.getElementById('bookmarkPreviewModal')?.remove();let url=URL.createObjectURL(blob),filename=`separador-${(p.book||'libro').toLowerCase().replace(/[^a-z0-9]+/g,'-')}-${t.name.toLowerCase()}.png`;window._bookmarkPreview={blob,url,filename};let m=document.createElement('div');m.id='bookmarkPreviewModal';m.className='shareOverlay bookmarkPreviewOverlay';m.innerHTML=`<div class="bookmarkPreviewModal"><button class="shareClose" onclick="closeBookmarkPreview()">×</button><span class="badge">🔖 SEPARADOR LISTO</span><h2>Visualice primero su separador</h2><div class="bookmarkPreviewImage"><img src="${url}" alt="Separador generado"></div><div class="bookmarkPreviewActions"><button class="btn" onclick="shareBookmarkNative()">↗ Compartir / Guardar</button><button class="btn secondary" onclick="saveBookmarkFile()">⇩ Guardar archivo</button></div><p class="bookmarkIOSHelp">En iPhone y iPad use <b>Compartir / Guardar</b> para abrir la hoja de Apple. Desde allí puede elegir <b>Guardar imagen</b> o <b>Guardar en Archivos</b>.</p></div>`;document.body.appendChild(m)};
window.closeBookmarkPreview=()=>{let d=window._bookmarkPreview;if(d?.url)URL.revokeObjectURL(d.url);window._bookmarkPreview=null;document.getElementById('bookmarkPreviewModal')?.remove()};
window.shareBookmarkNative=async()=>{let d=window._bookmarkPreview;if(!d)return;let file=new File([d.blob],d.filename,{type:'image/png'});try{if(navigator.share&&(!navigator.canShare||navigator.canShare({files:[file]}))){await navigator.share({files:[file],title:'Separador · Biblioteca Digital'});return}}catch(e){if(e?.name==='AbortError')return}saveBookmarkFile()};
window.saveBookmarkFile=()=>{let d=window._bookmarkPreview;if(!d)return;let a=document.createElement('a');a.href=d.url;a.download=d.filename;document.body.appendChild(a);a.click();a.remove()};
function roundRect(ctx,x,y,w,h,r){ctx.beginPath();ctx.moveTo(x+r,y);ctx.arcTo(x+w,y,x+w,y+h,r);ctx.arcTo(x+w,y+h,x,y+h,r);ctx.arcTo(x,y+h,x,y,r);ctx.arcTo(x,y,x+w,y,r);ctx.closePath()}
window.formation=()=>{let j=loadJournal(),c=loadCollection();app.innerHTML=`<section class="formationHero"><span class="badge">🌿 MI CAMINO DE FORMACIÓN</span><h1>Lo que estoy aprendiendo a través de mis libros</h1><p class="muted">Un espacio para ver mi recorrido, conservar lo que he recibido y registrar decisiones personales.</p></section><section class="formationGrid"><article class="formationCard"><div class="formationIcon">📚</div><h2>Mi recorrido</h2>${books.map(b=>{let st=loadState(b.id),last=st.last?sectionLabel(b,st.last):'Aún no iniciado';return `<div class="routeBook"><b>${esc(b.titulo)}</b><div class="progress"><i style="width:${bookPercent(b)}%"></i></div><small>${bookPercent(b)}% · ${esc(last)}</small></div>`}).join('')}<button class="btn secondary" onclick="progress()">Ver progreso completo</button></article><article class="formationCard"><div class="formationIcon">📝</div><h2>Mi cuaderno</h2><p>${j.length} registro${j.length===1?'':'s'} personal${j.length===1?'':'es'}.</p><p class="muted">Lo que me habló, lo que debo revisar y la decisión que quiero tomar.</p><button class="btn" onclick="journal()">Abrir mi cuaderno</button></article><article class="formationCard"><div class="formationIcon">❤️</div><h2>Lo que he guardado</h2><p>${c.length} enseñanza${c.length===1?'':'s'} en Mi colección.</p><p class="muted">Píldoras, frases y porciones bíblicas que quiero conservar.</p><button class="btn secondary" onclick="collection()">Abrir Mi colección</button></article><article class="formationCard"><div class="formationIcon">🌱</div><h2>Lo que estoy trabajando</h2><p>${j.filter(x=>x.revisar||x.decision).length} registro${j.filter(x=>x.revisar||x.decision).length===1?'':'s'} con revisión o decisión.</p><p class="muted">Aquí aparecen únicamente asuntos que yo mismo he escrito; la aplicación no interpreta ni atribuye mensajes espirituales.</p><button class="btn secondary" onclick="workingOn()">Ver mis decisiones</button></article></section><section class="card section"><div class="row"><button class="btn" onclick="historyFormation()">📜 Mi historia de formación</button><button class="btn secondary" onclick="library()">← Biblioteca</button></div></section>`}
window.journalForm=(bid,sid)=>{let b=books.find(x=>x.id===bid),sec=b.secciones.find(x=>x.id===sid),old=loadJournal().find(x=>x.bookId===bid&&x.sectionId===sid);app.innerHTML=`<section class="card journalForm"><span class="badge">📝 MI CUADERNO</span><h1>${esc(b.titulo)}</h1><h2>${esc(sec.tipo)} · ${esc(sec.titulo)}</h2><label>¿Qué me habló de manera especial?</label><textarea id="jHablo" placeholder="Escriba con sus propias palabras...">${esc(old?.hablo||'')}</textarea><label>¿Qué debo revisar en mi vida?</label><textarea id="jRevisar" placeholder="Escriba lo que desea revisar...">${esc(old?.revisar||'')}</textarea><label>¿Qué decisión quiero tomar?</label><textarea id="jDecision" placeholder="Escriba una decisión concreta...">${esc(old?.decision||'')}</textarea><div class="row"><button class="btn" onclick="saveJournalEntry('${bid}','${sid}')">Guardar en mi cuaderno</button><button class="btn secondary" onclick="goToSection('${bid}','${sid}')">Volver al capítulo</button></div></section>`}
window.saveJournalEntry=(bid,sid)=>{let b=books.find(x=>x.id===bid),sec=b.secciones.find(x=>x.id===sid),j=loadJournal(),entry={bookId:bid,book:b.titulo,sectionId:sid,section:`${sec.tipo} · ${sec.titulo}`,hablo:$('#jHablo').value.trim(),revisar:$('#jRevisar').value.trim(),decision:$('#jDecision').value.trim(),date:new Date().toISOString()};j=j.filter(x=>!(x.bookId===bid&&x.sectionId===sid));j.unshift(entry);saveJournal(j);alert('Registro guardado en Mi cuaderno.');journal()}
window.journal=()=>{let j=loadJournal();app.innerHTML=`<section class="card"><span class="badge">📝 MI CUADERNO</span><h1>Mis registros de lectura</h1><p class="muted">Organizados por libro, sección y fecha.</p>${j.length?j.map((x,i)=>`<article class="journalEntry"><div class="journalDate">${new Date(x.date).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}</div><h2>${esc(x.book)}</h2><h3>${esc(x.section)}</h3>${x.hablo?`<h4>💡 Lo que me habló</h4><p>${esc(x.hablo)}</p>`:''}${x.revisar?`<h4>🔍 Lo que debo revisar</h4><p>${esc(x.revisar)}</p>`:''}${x.decision?`<h4>🎯 Mi decisión</h4><p>${esc(x.decision)}</p>`:''}<div class="row"><button class="mini" onclick="journalForm('${x.bookId}','${x.sectionId}')">Editar</button><button class="mini" onclick="goToSection('${x.bookId}','${x.sectionId}')">Ver capítulo</button><button class="mini danger" onclick="deleteJournal(${i})">Eliminar</button></div></article>`).join(''):'<div class="feedback">Todavía no ha escrito en su cuaderno. Al terminar una sección use “Registrar en mi cuaderno”.</div>'}<div class="row section"><button class="btn secondary" onclick="formation()">← Mi camino de formación</button></div></section>`}
window.deleteJournal=i=>{let j=loadJournal();j.splice(i,1);saveJournal(j);journal()}
window.workingOn=()=>{let j=loadJournal().filter(x=>x.revisar||x.decision);app.innerHTML=`<section class="card"><span class="badge">🌱 LO QUE ESTOY TRABAJANDO</span><h1>Revisiones y decisiones que yo mismo he registrado</h1><p class="muted">Este espacio no interpreta sus respuestas. Solamente organiza lo que usted escribió durante su lectura.</p>${j.length?j.map(x=>`<article class="workItem"><h3>${esc(x.book)} · ${esc(x.section)}</h3>${x.revisar?`<p><b>🔍 Revisar:</b> ${esc(x.revisar)}</p>`:''}${x.decision?`<p><b>🎯 Decisión:</b> ${esc(x.decision)}</p>`:''}</article>`).join(''):'<div class="feedback">Aún no hay revisiones o decisiones registradas.</div>'}<button class="btn secondary" onclick="formation()">← Mi camino de formación</button></section>`}
window.historyFormation=()=>{let j=loadJournal();app.innerHTML=`<section class="card"><span class="badge">📜 MI HISTORIA DE FORMACIÓN</span><h1>Mi recorrido personal</h1><p class="muted">Una línea de tiempo construida únicamente con mis propios registros.</p><div class="timeline">${j.length?j.map(x=>`<article class="timelineItem"><div class="timelineDot"></div><div><div class="journalDate">${new Date(x.date).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}</div><h3>${esc(x.book)}</h3><p>${esc(x.section)}</p>${x.decision?`<p><b>Decisión registrada:</b> ${esc(x.decision)}</p>`:''}</div></article>`).join(''):'<div class="feedback">Su historia comenzará cuando guarde el primer registro en Mi cuaderno.</div>'}</div><button class="btn secondary" onclick="formation()">← Mi camino de formación</button></section>`}
document.querySelector("#homeBtn").onclick=ministryHome;document.querySelectorAll("[data-nav]").forEach(b=>b.onclick=()=>{let n=b.dataset.nav;if(n==='inicio')ministryHome();else if(n==='biblioteca')library();else if(n==='progreso')progress();else if(n==='buscar')searchLibrary();else if(n==='formacion')formation();else collection()});

// v1.6 · Perfil y respaldo local
const profileKey='bd_perfil_v16';
function loadProfile(){try{return JSON.parse(localStorage.getItem(profileKey)||'{}')}catch{return {}}}
function saveProfileData(p){localStorage.setItem(profileKey,JSON.stringify(p||{}))}
function profileName(){return (loadProfile().name||'').trim()}
function downloadJSON(data,name){const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
// v3.9 · PUENTE DE PUBLICACIÓN — consolida el catálogo base y los libros aprobados que viven en IndexedDB.
window.exportPublicCatalogBridge=()=>{
 try{
  if(!isAdminMode()){alert('Esta herramienta está disponible únicamente en modo Administrador.');return}
  const imported=loadImportedBooks();
  const importedIds=new Set(imported.map(b=>b.id));
  const baseCount=books.filter(b=>!importedIds.has(b.id)).length;
  const consolidated=books.map(b=>JSON.parse(JSON.stringify(b)));
  const pkg={format:'biblioteca-digital-catalogo-publico',version:'3.9.1',generatedAt:new Date().toISOString(),instructions:'Archivo puente para integrar en la v4.0 pública. No contiene datos personales del lector.',summary:{baseBooks:baseCount,importedBooks:imported.length,totalBooks:consolidated.length},books:consolidated};
  downloadJSON(pkg,'CATALOGO-PUBLICO-LEONARD-MOON-v3.9.1.json');
  alert(`Catálogo preparado correctamente.\n\nLibros base: ${baseCount}\nLibros incorporados: ${imported.length}\nTotal para publicación: ${consolidated.length}\n\nEnvíeme el archivo CATALOGO-PUBLICO-LEONARD-MOON-v3.9.1.json para construir la v4.0 pública estable.`);
 }catch(e){console.error('Error preparando catálogo público',e);alert('No fue posible preparar el catálogo público. Detalle: '+(e?.message||e));}
}
window.profileBackup=()=>{const p=loadProfile();app.innerHTML=`<section class="card profileCard"><span class="badge">🔐 MI PERFIL Y RESPALDO</span><h1>Mi espacio personal</h1><p class="muted">Estos datos se guardan únicamente en este navegador. No se mezclan con los de otros lectores que usen la misma dirección de GitHub Pages.</p><label>¿Cómo quieres que te llamemos?</label><input id="profileName" class="profileInput" maxlength="60" value="${esc(p.name||'')}" placeholder="Tu nombre"><div class="row"><button class="btn" onclick="saveProfileName()">Guardar nombre</button></div><hr><h2>Respaldo de mi recorrido</h2><p>Guarda en un archivo tu progreso, cuaderno, colección y datos de formación para poder recuperarlos en otro navegador o dispositivo.</p><div class="row"><button class="btn" onclick="exportJourney()">📤 Exportar mi recorrido</button><label class="btn secondary importBtn">📥 Recuperar mi recorrido<input id="importJourney" type="file" accept="application/json,.json" hidden onchange="importJourneyFile(this.files[0])"></label></div><div class="feedback section"><b>Importante:</b> el archivo de respaldo contiene información personal que tú mismo hayas escrito en Mi Cuaderno. Guárdalo donde consideres seguro.</div><hr><h2>Comenzar de nuevo</h2><p class="muted">Borra únicamente los datos personales de esta Biblioteca en este navegador. Los libros y la aplicación no se eliminan.</p><button class="btn dangerBtn" onclick="resetJourney()">🗑️ Comenzar de nuevo</button><div class="row section"><button class="btn secondary" onclick="library()">← Biblioteca</button></div></section>`}
window.saveProfileName=()=>{const name=$('#profileName').value.trim();saveProfileData({name});alert(name?'Nombre guardado.':'Nombre eliminado.');library()}
window.exportJourney=async()=>{const data={format:'biblioteca-digital-leonard-moon',version:2,exportedAt:new Date().toISOString(),data:{},importedBooks:loadImportedBooks()};for(let i=0;i<localStorage.length;i++){const k=localStorage.key(i);if(k&&k.startsWith('bd_')&&k!==IMPORTED_BOOKS_KEY)data.data[k]=localStorage.getItem(k)};const who=profileName().toLowerCase().replace(/[^a-z0-9áéíóúñ]+/gi,'-').replace(/^-|-$/g,'')||'lector';downloadJSON(data,`biblioteca-digital-respaldo-${who}.json`)}
window.importJourneyFile=async file=>{if(!file)return;try{const raw=await file.text(),obj=JSON.parse(raw);if(obj.format!=='biblioteca-digital-leonard-moon'||!obj.data||typeof obj.data!=='object')throw new Error('Formato no reconocido');if(!confirm('Este respaldo reemplazará los datos actuales de esta Biblioteca en este navegador. ¿Deseas continuar?'))return;Object.keys(localStorage).filter(k=>k.startsWith('bd_')).forEach(k=>localStorage.removeItem(k));Object.entries(obj.data).forEach(([k,v])=>{if(k.startsWith('bd_')&&typeof v==='string')localStorage.setItem(k,v)});if(Array.isArray(obj.importedBooks))await saveImportedBooks(obj.importedBooks);else if(obj.data[IMPORTED_BOOKS_KEY]){try{await saveImportedBooks(JSON.parse(obj.data[IMPORTED_BOOKS_KEY]))}catch{}}alert('Recorrido recuperado correctamente. La Biblioteca se recargará para restaurar también los libros incorporados.');location.reload()}catch(e){console.error(e);alert('No fue posible recuperar este archivo. Verifica que sea un respaldo creado por Biblioteca Digital.')}}
window.resetJourney=()=>{if(!confirm('¿Seguro que deseas comenzar de nuevo? Se borrarán progreso, cuaderno, colección y perfil guardados en este navegador.'))return;if(!confirm('Esta acción no se puede deshacer salvo que tengas un respaldo exportado. ¿Continuar?'))return;Object.keys(localStorage).filter(k=>k.startsWith('bd_')&&k!==IMPORTED_BOOKS_KEY).forEach(k=>localStorage.removeItem(k));book=null;current=null;state=null;alert('Tu recorrido local fue reiniciado. Los libros incorporados en el almacenamiento ampliado se conservaron.');library()}
function welcomeIfNeeded(){if(localStorage.getItem('bd_welcome_v16'))return;localStorage.setItem('bd_welcome_v16','1');setTimeout(()=>{let old=document.getElementById('welcomeModal');if(old)return;let m=document.createElement('div');m.id='welcomeModal';m.className='shareOverlay';m.innerHTML=`<div class="shareModal welcomeModal"><button class="shareClose" onclick="document.getElementById('welcomeModal').remove()">×</button><h2>📚 Bienvenido a Biblioteca Digital</h2><p>Tu recorrido se guardará solamente en este navegador.</p><input id="welcomeName" class="profileInput" maxlength="60" placeholder="¿Cómo quieres que te llamemos?"><div class="row"><button class="btn" onclick="saveWelcomeName()">Comenzar mi recorrido</button><button class="btn secondary" onclick="document.getElementById('welcomeModal').remove()">Ahora no</button></div></div>`;document.body.appendChild(m)},200)}
window.saveWelcomeName=()=>{let n=document.getElementById('welcomeName').value.trim();if(n)saveProfileData({name:n});document.getElementById('welcomeModal')?.remove();library()}
// Corrige navegación inferior de Formación y añade acceso al perfil.
document.querySelectorAll('[data-nav]').forEach(b=>b.onclick=()=>{let n=b.dataset.nav;if(n==='biblioteca')library();else if(n==='progreso')progress();else if(n==='buscar')searchLibrary();else if(n==='formacion')formation();else collection()});
setTimeout(welcomeIfNeeded,350);


// v3.0.1 · MOTOR GLOBAL DE ENSEÑANZAS — CONTENIDO REAL + INTEGRIDAD BÍBLICA
// Regla: título, Escritura y desarrollo son capas distintas. Nunca se usa una reflexión como versículo.
const teachSkip=/INTRODUCCIÓN|PREGUNTAS DE DISCERNIMIENTO|ORACIÓN FINAL|CITA CLAVE|PRINCIPIO FINAL|FRASE DE CIERRE/i;
function cleanHeading(h){return (h||'').replace(/^[^A-Za-zÁÉÍÓÚÜÑ0-9¿¡]+/u,'').trim()}
function cleanTeachingLine(t){return (t||'').replace(/^[💬✨🔥🌿🌊➡👉🙏]+\s*/u,'').trim()}
function isTeachingMetaLine(x){return /^📖/.test(x)||/^💬/.test(x)||/^✨/.test(x)}
function teachingProseFromGroup(g,knownVerse=''){
 let lines=(g?.lines||[]).map(x=>(x||'').trim()).filter(Boolean), skip=new Set(), verse='';
 for(let i=0;i<lines.length;i++)if(lines[i].startsWith('📖')){skip.add(i);let n=(lines[i+1]||'').trim();if(n&&!isTeachingMetaLine(n)){verse=n;skip.add(i+1)}break}
 let kv=normalizeForCompare(knownVerse||verse);
 return lines.filter((x,i)=>!skip.has(i)&&!isTeachingMetaLine(x)).map(cleanTeachingLine).filter(x=>x&&(!kv||normalizeForCompare(x)!==kv));
}
function enrichThinTeaching(groups,gi,prose,verse,title){
 // v3.3.1 · COHERENCIA CONTEXTUAL
 // Una enseñanza se construye únicamente con el bloque continuo donde nació.
 // Se prohíbe completar con bloques vecinos, aunque compartan palabras o tema.
 let out=[], seen=new Set(), nv=normalizeForCompare(verse), nt=normalizeForCompare(title);
 for(let x of (prose||[])){
  x=(x||'').trim(); let nx=normalizeForCompare(x);
  if(!x||!nx||nx===nv||nx===nt||seen.has(nx))continue;
  seen.add(nx); out.push(x);
 }
 return out;
}
function teachingCatalog(){
 let out=[];
 (books||[]).forEach(b=>(b.secciones||[]).forEach(sec=>{
  let groups=sec.secciones||[];
  groups.forEach((g,gi)=>{
   let rawHeading=(g.heading||'').trim(),title=cleanHeading(rawHeading);
   if(!title||teachSkip.test(title))return;
   let lines=(g.lines||[]).map(x=>(x||'').trim()).filter(Boolean);
   let ref=sec.referencia||'',verse=sec.versiculo||'',scriptureLine=-1;
   for(let i=0;i<lines.length;i++){
    if(lines[i].startsWith('📖')){
     ref=lines[i].replace(/^📖\s*/,'').trim()||ref; scriptureLine=i;
     let n=(lines[i+1]||'').trim(); if(n&&!isTeachingMetaLine(n))verse=n;
     break;
    }
   }
   let headingIsPill=/^[💬✨]/u.test(rawHeading),pillLine=lines.find(x=>/^[💬✨]/u.test(x));
   let pill=headingIsPill?cleanTeachingLine(rawHeading):(pillLine?cleanTeachingLine(pillLine):'');
   // El versículo inmediatamente posterior a 📖 se excluye SIEMPRE del desarrollo.
   let prose=lines.filter((x,i)=>i!==scriptureLine&&i!==scriptureLine+1&&!isTeachingMetaLine(x)).map(cleanTeachingLine).filter(Boolean);
   if(/^CONTENIDO$/i.test(title)){
    let candidate=prose.find(x=>x.length>=8&&x.length<=140&&!/^(?:Leonard Moon|Prólogo|Capítulo|Conclusión)$/i.test(x));
    if(candidate){title=candidate.replace(/[.:;]+$/,'').trim();let used=false;prose=prose.filter(x=>{if(!used&&normalizeForCompare(x)===normalizeForCompare(candidate)){used=true;return false}return true})}
    else return;
   }
   if(headingIsPill){let contextual=prose.filter(x=>normalizeForCompare(x)!==normalizeForCompare(pill));if(!contextual.length)prose=[];else prose=contextual;title=pill}
   let integrity=biblicalIntegrity(title,ref,verse,prose.join(' '));ref=integrity.reference;verse=integrity.verse;
   if(ref){
    let canonical=bibleTextFor(ref);if(canonical)verse=canonical;
    if(verse&&prose.some(x=>normalizeForCompare(x)===normalizeForCompare(verse)))verse=canonical||'';
   }
   // Desarrollo suficiente, pero exclusivamente con texto real del capítulo.
   prose=enrichThinTeaching(groups,gi,prose,verse,title);
   let nv=normalizeForCompare(verse); if(nv)prose=prose.filter(x=>normalizeForCompare(x)!==nv);
   // Publicamos menos piezas, pero con desarrollo real. No ensamblamos frases para llenar espacio.
   let proseChars=prose.join(' ').length;
   if(!prose.length || proseChars<90)return;
   out.push({id:`${b.id}|${sec.id}|${gi}`,bookId:b.id,book:b.titulo,sectionId:sec.id,section:`${sec.tipo} · ${sec.titulo}`,title,reference:ref,verse,paragraphs:prose,pill,category:(b.categoria||'Biblioteca').split('·')[0].trim()||'Biblioteca'});
  });
 }));return out;
}
let teachingFilter='todos';
window.teachings=()=>{let all=teachingCatalog(),ids=new Set(all.map(t=>t.bookId)),cats=(books||[]).filter(b=>ids.has(b.id));if(teachingFilter!=='todos'&&!ids.has(teachingFilter))teachingFilter='todos';app.innerHTML=`<section class="teachHero"><span class="badge">📖 ENSEÑANZAS DEL MINISTERIO</span><h1>Verdades extraídas de nuestra Biblioteca</h1><p>El libro es la fuente. Cada enseñanza que aparece aquí nace del contenido real escrito por Leonard Moon y conduce nuevamente al libro de origen.</p></section><section class="teachToolbar"><input id="teachSearch" placeholder="Buscar una enseñanza, tema o texto bíblico..." oninput="renderTeachings()"><button class="teachFilter ${teachingFilter==='todos'?'active':''}" data-tf="todos" onclick="setTeachingFilter(this,'todos')">Todas <small>${all.length}</small></button>${cats.map(b=>{let n=all.filter(t=>t.bookId===b.id).length;return `<button class="teachFilter ${teachingFilter===b.id?'active':''}" data-tf="${esc(b.id)}" onclick='setTeachingFilter(this,${JSON.stringify(b.id)})'>${esc(b.titulo)} <small>${n}</small></button>`}).join('')}</section><div id="teachResults"></div>`;renderTeachings()}
window.setTeachingFilter=(el,val)=>{teachingFilter=val;document.querySelectorAll('.teachFilter').forEach(x=>x.classList.remove('active'));if(el)el.classList.add('active');renderTeachings();setTimeout(()=>document.getElementById('teachResults')?.scrollIntoView({behavior:'smooth',block:'start'}),40)}
window.renderTeachings=()=>{let q=(document.getElementById('teachSearch')?.value||'').trim().toLowerCase(),all=teachingCatalog(),r=all.filter(t=>(teachingFilter==='todos'||t.bookId===teachingFilter)&&(!q||`${t.title} ${t.book} ${t.section} ${t.reference} ${t.verse||''} ${t.paragraphs.join(' ')}`.toLowerCase().includes(q))),activeBooks=new Set(r.map(t=>t.bookId)).size;let host=document.getElementById('teachResults');if(!host)return;host.innerHTML=`<div class="teachCount">${r.length} enseñanza${r.length===1?'':'s'} encontrada${r.length===1?'':'s'}${teachingFilter==='todos'?` en ${activeBooks} libro${activeBooks===1?'':'s'}`:` en ${esc((books||[]).find(b=>b.id===teachingFilter)?.titulo||'este libro')}`}.</div>`+(r.length?`<section class="teachGrid">${r.map(t=>`<article class="teachCard"><div class="source">EXTRAÍDA DE ${esc(t.book)}</div><h2>${esc(t.title)}</h2>${t.reference?`<div class="ref">📖 ${esc(t.reference)}</div>`:''}<p>${esc(t.paragraphs.slice(0,3).join(' '))}</p><button class="btn" onclick='openTeaching(${JSON.stringify(t.id)})'>Leer enseñanza →</button></article>`).join('')}</section>`:`<div class="teachEmpty">No encontramos enseñanzas con esa búsqueda dentro del libro seleccionado.</div>`)}
function teachingVisualParagraph(x,i){let z=(x||'').trim();if(!z)return '';let upper=z===z.toUpperCase()&&/[A-ZÁÉÍÓÚÜÑ]/.test(z)&&z.length<100;if(upper)return `<h3 class="teachSubhead">🌿 ${esc(z)}</h3>`;if(z.length<150&&(/[“”]/.test(z)||/^(El |La |Los |Las |No |Cuando |Una |Un )/.test(z)))return `<div class="teachAccentQuote">❝ <span>${esc(z)}</span></div>`;return `<p>${esc(z)}</p>`}
window.openTeaching=id=>{let t=teachingCatalog().find(x=>x.id===id);if(!t)return teachings();let p=t.pill||t.title||t.paragraphs[0]||'';let reflection=t.paragraphs.slice(-3).join(' ');let pillObj=finalizePill({bookId:t.bookId,book:t.book,sectionId:t.sectionId,section:t.section,text:p,type:'Enseñanza',reference:t.reference,verse:t.verse,explanation:reflection});app.innerHTML=`<article class="teachingDetail unifiedTeaching"><div class="teachingHead"><button class="btn secondary" onclick="teachings()">← Enseñanzas</button><div class="source">ENSEÑANZA EXTRAÍDA DE ${esc(t.book)}</div><h1>${esc(t.title)}</h1><p>${esc(t.section)}</p></div><div class="teachingBody">${t.reference?`<div class="teachScripture unifiedScripture"><b>📖 ${esc(t.reference)}</b>${t.verse?`<div>“${esc(t.verse.replace(/^[“\"]|[”\"]$/g,''))}”</div>`:''}</div>`:''}<section class="teachBlock unifiedBlock"><h2>🌿 CONTENIDO</h2>${t.paragraphs.map(teachingVisualParagraph).join('')}</section><section class="teachPill unifiedTeachPill"><b>💡 Píldora destacada</b><blockquote>“${esc(p)}”</blockquote></section><div class="teachSignature"><span></span><em>Constructores del Reino</em><span></span></div><div class="teachActions unifiedActions"><button class="btn" onclick='saveRaw(${JSON.stringify(pillObj)})'>♡ Guardar</button><button class="btn secondary" onclick='sharePill(${JSON.stringify(pillObj)})'>⌯ Compartir</button><button class="btn secondary" onclick='downloadCard(${JSON.stringify(p)},${JSON.stringify(t.book)},${JSON.stringify(t.section)},${JSON.stringify(t.reference||'')},${JSON.stringify(t.verse||'')},${JSON.stringify(pillObj.explanation||'')})'>▧ Crear imagen</button><button class="btn secondary" onclick='bookmarkPicker(${JSON.stringify(pillObj)})'>🔖 Crear separador</button><button class="btn secondary" onclick="goToSection('${t.bookId}','${t.sectionId}')">▤ Ver en el libro</button></div><div class="teachOrigin"><b>Fuente:</b> ${esc(t.book)} · ${esc(t.section)} · Leonard Moon<br><small>Esta enseñanza se presenta a partir del contenido existente del libro; no añade una doctrina independiente al texto de origen.</small></div></div></article>`}

// v2.0 · VIDEOTECA DEL MINISTERIO

let ministryResources=[];
let publicResources=[];
let resourceFilter='todos';
const RESOURCE_STORE_KEY='ministerio_recursos_local_v21';
function loadLocalResources(){try{return JSON.parse(localStorage.getItem(RESOURCE_STORE_KEY)||'[]')}catch(e){return []}}
function saveLocalResources(){localStorage.setItem(RESOURCE_STORE_KEY,JSON.stringify(ministryResources))}
function resourceCats(){return ['todos',...new Set(ministryResources.map(r=>r.categoria).filter(Boolean))]}
window.setResourceFilter=(el,c)=>{resourceFilter=c;document.querySelectorAll('.resourceFilter').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderResources();enforceVisitorPermissions()}
window.renderResources=()=>{let filters=document.getElementById('resourceFilters');if(filters)filters.innerHTML=resourceCats().map(c=>`<button class="resourceFilter ${resourceFilter===c?'active':''}" onclick="setResourceFilter(this,'${String(c).replace(/'/g,"\\'")}')">${c==='todos'?'Todos':esc(c)}</button>`).join('');let q=(document.getElementById('resourceSearch')?.value||'').trim().toLowerCase();let rows=ministryResources.filter(r=>(resourceFilter==='todos'||r.categoria===resourceFilter)&&(!q||`${r.titulo||''} ${r.descripcion||''} ${r.libro||''}`.toLowerCase().includes(q)));let host=document.getElementById('resourceResults');if(!host)return;if(!ministryResources.length){host.innerHTML=`<section class="resourceEmpty"><div class="resourceEmptyIcon">📄</div><h2>La Biblioteca de Recursos está lista</h2><p>Aquí puede incorporar los PDF que quiera poner a disposición de quienes visiten el Ministerio.</p><button class="btn" onclick="openResourceUploader()">＋ Agregar mi primer recurso</button></section>`;return}let featured=rows.find(r=>r.destacado)||rows[0],rest=rows.filter(r=>!featured||r.id!==featured.id);host.innerHTML=`${featured?`<section class="resourceFeatured"><h2>☆ Recurso destacado</h2><article><div class="resourceCover">📄<b>PDF</b></div><div class="resourceInfo"><span class="resourceTag">${esc(featured.categoria||'Recurso')}</span><h3>${esc(featured.titulo)}</h3>${featured.libro?`<small>Relacionado con: ${esc(featured.libro)}</small>`:''}<p>${esc(featured.descripcion||'')}</p><div class="resourceMeta">${featured.fecha?`📅 ${esc(featured.fecha)}`:''}${featured.tamano?` <span>·</span> 📄 ${esc(featured.tamano)}`:''}</div></div><div class="resourceActions"><button class="btn" onclick="viewResource('${featured.id}')">👁 Ver en línea</button><button class="btn secondary" onclick="downloadResource('${featured.id}')">⇩ Descargar</button>${isAdminMode()?`<button class="btn danger" onclick="deleteResource('${featured.id}')">🗑 Eliminar</button>`:''}</div></article></section>`:''}<section class="resourceList"><div class="resourceListHead"><h2>▣ Más recursos</h2><span>${rows.length} recurso${rows.length===1?'':'s'}</span></div><div class="resourceGrid">${rest.map(r=>`<article class="resourceCard"><div class="resourceCardTop"><span>📄</span><b>PDF</b></div><span class="resourceTag">${esc(r.categoria||'Recurso')}</span><h3>${esc(r.titulo)}</h3>${r.libro?`<small>Relacionado con:<br>${esc(r.libro)}</small>`:''}<p>${esc(r.descripcion||'')}</p><div class="resourceCardActions"><button class="btn secondary" onclick="viewResource('${r.id}')">👁 Ver</button><button class="btn secondary" onclick="downloadResource('${r.id}')">⇩ Descargar</button>${isAdminMode()?`<button class="resourceDelete" onclick="deleteResource('${r.id}')" title="Eliminar">🗑</button>`:''}</div></article>`).join('')}</div></section>`}
window.openResourceUploader=()=>{if(!isAdminMode()){alert('Esta función está disponible únicamente en modo administrador.');return}app.innerHTML=`<section class="resourceUploadPage"><button class="btn secondary" onclick="resourcesPage()">← Volver a Recursos</button><div class="resourceUploadCard"><span class="badge">📄 NUEVO RECURSO</span><h1>Agregar recurso PDF</h1><p>Seleccione el material terminado y complete sus datos.</p><label>Archivo PDF<input id="ruFile" type="file" accept="application/pdf,.pdf"></label><label>Título<input id="ruTitle" placeholder="Título del recurso"></label><div class="resourceFormGrid"><label>Categoría<select id="ruCat"><option>Guía</option><option>Estudio</option><option>Familia</option><option>Finanzas</option><option>Formación</option><option>Plantilla</option><option>Otro</option></select></label><label>Libro relacionado (opcional)<input id="ruBook" placeholder="Ej. CONGREGADOS"></label></div><label>Descripción<textarea id="ruDesc" rows="4"></textarea></label><div class="resourceFormGrid"><label>Fecha<input id="ruDate" type="date"></label><label class="checkLine"><input id="ruFeatured" type="checkbox"> Marcar como recurso destacado</label></div><div class="resourceUploadNotice"><b>Prueba local:</b> el PDF queda guardado en este navegador/equipo. Para la publicación definitiva podremos alojar los materiales públicamente sin cargar innecesariamente la aplicación.</div><button class="btn" onclick="saveUploadedResource()">Guardar recurso</button></div></section>`}
window.saveUploadedResource=()=>{let file=document.getElementById('ruFile')?.files?.[0],title=(document.getElementById('ruTitle')?.value||'').trim();if(!file)return alert('Seleccione primero un archivo PDF.');if(!title)return alert('Escriba el título del recurso.');if(file.size>4.5*1024*1024)return alert('Para esta prueba local use un PDF de hasta 4,5 MB.');let rd=new FileReader();rd.onload=()=>{let r={id:'res-'+Date.now(),titulo:title,categoria:document.getElementById('ruCat').value,libro:document.getElementById('ruBook').value,descripcion:document.getElementById('ruDesc').value,fecha:document.getElementById('ruDate').value,destacado:document.getElementById('ruFeatured').checked,tamano:(file.size/1024/1024).toFixed(2)+' MB',archivo:rd.result,nombre:file.name};let all=loadLocalResources();if(r.destacado)all.forEach(x=>x.destacado=false);all.push(r);ministryResources=all;try{saveLocalResources();resourcesPage()}catch(e){alert('El navegador no tiene espacio suficiente para guardar este PDF.')}};rd.readAsDataURL(file)}
function findResourceById(id){return ministryResources.find(x=>x.id===id)||publicResources.find(x=>x.id===id)||loadLocalResources().find(x=>x.id===id)}
window.viewResource=id=>{let r=findResourceById(id);if(!r)return alert('El recurso no está disponible.');let source=r.archivo||r.url;if(!source)return alert('El archivo no está disponible.');window.open(source,'_blank')}
window.downloadResource=id=>{let r=findResourceById(id);if(!r)return alert('El recurso no está disponible.');let source=r.archivo||r.url;if(!source)return alert('El archivo no está disponible.');let a=document.createElement('a');a.href=source;a.download=r.nombre||((r.titulo||'recurso')+'.pdf');a.target='_blank';a.rel='noopener';document.body.appendChild(a);a.click();a.remove()}
window.deleteResource=id=>{if(!isAdminMode()){alert('Esta función está disponible únicamente en modo administrador.');return}if(!confirm('¿Eliminar este recurso?'))return;ministryResources=loadLocalResources().filter(x=>x.id!==id);saveLocalResources();resourcesPage()}

fetch('data/resources.json').then(r=>r.ok?r.json():[]).then(v=>{publicResources=Array.isArray(v)?v:[];if(document.getElementById('resourceResults'))resourcesPage()}).catch(()=>{publicResources=[]});

let ministryVideos=[];
let videoFilter='todos';
const VIDEO_STORE_KEY='ministerio_videos_local_v201';
function loadLocalVideos(){try{return JSON.parse(localStorage.getItem(VIDEO_STORE_KEY)||'[]')}catch(e){return []}}
function saveLocalVideos(){localStorage.setItem(VIDEO_STORE_KEY,JSON.stringify(ministryVideos.filter(v=>v.local)))}
let publicVideos=[];
function syncVideoCatalog(){const local=loadLocalVideos();ministryVideos=[...publicVideos,...local.filter(l=>!publicVideos.some(b=>b.id===l.id))]}
fetch('data/videos.json').then(r=>r.ok?r.json():[]).then(v=>{publicVideos=Array.isArray(v)?v:[];syncVideoCatalog();if(document.getElementById('videoResults'))renderVideos()}).catch(()=>{publicVideos=[];syncVideoCatalog();if(document.getElementById('videoResults'))renderVideos()});
function videoThumb(v){return v.miniatura||'assets/video-placeholder.svg'}
function videoCats(){return ['todos',...new Set(ministryVideos.map(v=>v.categoria).filter(Boolean))]}
window.videosPage=()=>{videoFilter='todos';syncVideoCatalog();app.innerHTML=`<section class="videoHero"><div><span class="badge">🎥 VIDEOTECA DEL MINISTERIO</span><h1>Mensajes para escuchar, compartir<br>y llevar a la vida.</h1><p>Videos terminados del ministerio, reunidos en un solo lugar.</p>${isAdminMode()?`<button class="btn videoAddBtn" onclick="openVideoUploader()">＋ Agregar video</button>`:''}</div></section><section class="videoToolbar"><input id="videoSearch" placeholder="Buscar videos..." oninput="renderVideos()"><div id="videoFilters"></div></section><div id="videoResults"></div>`;renderVideos();enforceVisitorPermissions()}
window.openVideoUploader=()=>{if(!isAdminMode()){alert('Esta función está disponible únicamente en modo administrador.');return}app.innerHTML=`<section class="videoUploadPage"><button class="btn secondary" onclick="videosPage()">← Volver a Videoteca</button><div class="videoUploadCard"><span class="badge">🎥 NUEVO VIDEO</span><h1>Agregar un video terminado</h1><p>Seleccione el MP4 que ya produjo y complete sus datos.</p><label>Archivo MP4<input id="vuFile" type="file" accept="video/mp4,video/*"></label><label>Título<input id="vuTitle" placeholder="Título del video"></label><div class="videoFormGrid"><label>Categoría<select id="vuCat"><option>Enseñanza</option><option>Libro</option><option>Píldora</option><option>Serie</option><option>Mensaje especial</option></select></label><label>Duración<input id="vuDuration" placeholder="Ej. 5:12"></label></div><label>Descripción<textarea id="vuDesc" rows="4"></textarea></label><div class="videoFormGrid"><label>Libro relacionado (opcional)<input id="vuBook"></label><label>Capítulo (opcional)<input id="vuChapter"></label></div><div class="videoFormGrid"><label>Referencia bíblica (opcional)<input id="vuRef"></label><label>Fecha<input id="vuDate" type="date"></label></div><label class="checkLine"><input id="vuFeatured" type="checkbox"> Marcar como video destacado</label><div class="videoUploadNotice"><b>Prueba local:</b> el MP4 queda guardado solamente en este navegador/equipo. Cuando publiquemos el Portal, usaremos alojamiento público para que todos puedan verlo sin volver pesada la Biblioteca.</div><button class="btn" onclick="saveUploadedVideo()">Guardar en la Videoteca</button></div></section>`}
window.saveUploadedVideo=()=>{let file=document.getElementById('vuFile')?.files?.[0],title=(document.getElementById('vuTitle')?.value||'').trim();if(!file)return alert('Seleccione primero el archivo de video.');if(!title)return alert('Escriba el título del video.');if(file.size>4.5*1024*1024)return alert('Para esta prueba local use un MP4 de hasta 4,5 MB. Los videos normales se alojarán externamente al publicar el Portal.');let rd=new FileReader();rd.onload=()=>{let v={id:'local-'+Date.now(),titulo:title,categoria:document.getElementById('vuCat').value,duracion:document.getElementById('vuDuration').value,descripcion:document.getElementById('vuDesc').value,libro:document.getElementById('vuBook').value,capitulo:document.getElementById('vuChapter').value,referencia:document.getElementById('vuRef').value,fecha:document.getElementById('vuDate').value,destacado:document.getElementById('vuFeatured').checked,archivo:rd.result,local:true};if(v.destacado)ministryVideos.forEach(x=>x.destacado=false);ministryVideos.push(v);try{saveLocalVideos();videosPage()}catch(e){ministryVideos.pop();alert('El navegador no tiene espacio suficiente para guardar este MP4.')}};rd.readAsDataURL(file)}
window.playMinistryVideo=()=>{const el=document.getElementById('activeMinistryVideo');if(!el)return;el.play().catch(()=>alert('No fue posible iniciar este archivo. Compruebe que el video sea MP4 compatible con el navegador.'))}
window.deleteLocalVideo=id=>{if(!isAdminMode()){alert('Esta función está disponible únicamente en modo administrador.');return}let v=ministryVideos.find(x=>x.id===id);if(!v?.local)return;if(!confirm('¿Eliminar este video de la Videoteca? Esta acción liberará el espacio que ocupa en este navegador.'))return;ministryVideos=ministryVideos.filter(x=>x.id!==id);try{saveLocalVideos()}catch(e){};alert('Video eliminado. Ya puede subir otro.');videosPage()}
window.setVideoFilter=(el,val)=>{videoFilter=val;document.querySelectorAll('.videoFilter').forEach(x=>x.classList.remove('active'));el.classList.add('active');renderVideos();enforceVisitorPermissions()}
window.renderVideos=()=>{let filters=document.getElementById('videoFilters');if(filters)filters.innerHTML=videoCats().map((c,i)=>`<button class="videoFilter ${videoFilter===c?'active':''}" onclick="setVideoFilter(this,${JSON.stringify(c)})">${c==='todos'?'Todos':esc(c)}</button>`).join('');let q=(document.getElementById('videoSearch')?.value||'').trim().toLowerCase();let rows=ministryVideos.filter(v=>(videoFilter==='todos'||v.categoria===videoFilter)&&(!q||`${v.titulo||''} ${v.descripcion||''} ${v.libro||''} ${v.categoria||''}`.toLowerCase().includes(q)));let host=document.getElementById('videoResults');if(!host)return;if(!ministryVideos.length){host.innerHTML=`<section class="videoEmpty"><div class="videoEmptyIcon">▶</div><h2>La Videoteca está lista</h2><p>Aquí aparecerán los videos terminados que usted vaya incorporando al Portal. La producción permanece independiente en CONSTRUCTOR-VIDEO.</p><div class="videoEmptySteps"><span>1. Produzca el video</span><b>→</b><span>2. Exporte el MP4</span><b>→</b><span>3. Agréguelo aquí</span></div><button class="btn" onclick="openVideoUploader()">＋ Agregar mi primer video</button><small>No se ha incluido ningún video de demostración para evitar publicar contenido ficticio.</small></section>`;return}let featured=rows.find(v=>v.destacado)||rows[0];let rest=rows.filter(v=>!featured||v.id!==featured.id);host.innerHTML=`${featured?`<section class="videoFeatured"><h2>✦ Video destacado</h2><article onclick="openVideo('${String(featured.id).replace(/'/g,"\\'")}')"><div class="videoPoster"><img src="${esc(videoThumb(featured))}" alt=""><button class="playCircle videoPlayButton" type="button" aria-label="Abrir y reproducir video" onclick="event.stopPropagation();openVideo('${String(featured.id).replace(/'/g,"\\'")}')">▶</button>${featured.duracion?`<i>${esc(featured.duracion)}</i>`:''}</div><div><span class="videoTag">${esc(featured.categoria||'Video')}</span><h3>${esc(featured.titulo)}</h3><p>${esc(featured.descripcion||'')}</p>${featured.libro?`<small>Relacionado con ${esc(featured.libro)}</small>`:''}</div></article></section>`:''}<section class="videoList"><div class="videoListHead"><h2>${featured?'Más recientes':'Videos'}</h2><span>${rows.length} video${rows.length===1?'':'s'}</span></div><div class="videoGrid">${rest.map(v=>`<article class="videoCard" onclick="openVideo('${String(v.id).replace(/'/g,"\\'")}')"><div class="videoPoster"><img src="${esc(videoThumb(v))}" alt=""><span class="playCircle small">▶</span>${v.duracion?`<i>${esc(v.duracion)}</i>`:''}</div><span class="videoTag">${esc(v.categoria||'Video')}</span><h3>${esc(v.titulo)}</h3><p>${esc(v.descripcion||'')}</p>${v.libro?`<small>${esc(v.libro)}</small>`:''}</article>`).join('')}</div></section>`}
window.openVideo=id=>{let v=ministryVideos.find(x=>x.id===id);if(!v)return videosPage();let related=ministryVideos.filter(x=>x.id!==id&&(v.libro&&x.libro===v.libro)).slice(0,3);app.innerHTML=`<article class="videoDetail"><button class="btn secondary" onclick="videosPage()">← Videoteca</button><div class="videoPlayer">${(v.archivo||v.url)?`<video id="activeMinistryVideo" controls playsinline preload="metadata" src="${v.archivo||v.url}">Su navegador no puede reproducir este video.</video>`:`<div class="videoNoFile"><span>▶</span><p>Video no disponible.</p></div>`}</div><div class="videoDetailBody"><span class="videoTag">${esc(v.categoria||'Video')}</span><h1>${esc(v.titulo)}</h1><div class="videoMeta">${v.duracion?`▶ ${esc(v.duracion)}`:''}${v.fecha?` <span>·</span> 📅 ${esc(v.fecha)}`:''}</div><div class="videoActions"><button class="btn" onclick="playMinistryVideo()">▶ Reproducir</button><button class="btn secondary" onclick="shareVideo('${String(v.id).replace(/'/g,"\\'")}')">↗ Compartir</button>${v.local&&isAdminMode()?`<button class="btn danger" onclick="deleteLocalVideo('${String(v.id).replace(/'/g,"\\'")}')">🗑 Eliminar video</button>`:''}</div>${v.descripcion?`<section><h2>Descripción</h2><p>${esc(v.descripcion)}</p></section>`:''}${v.referencia?`<section class="videoScripture"><h2>📖 Texto bíblico central</h2><b>${esc(v.referencia)}</b>${v.versiculo?`<p>“${esc(v.versiculo)}”</p>`:''}</section>`:''}${v.libro?`<section class="videoRelatedBook"><h2>📚 Relacionado</h2><div><strong>${esc(v.libro)}</strong>${v.capitulo?`<span>${esc(v.capitulo)}</span>`:''}${v.bookId&&v.sectionId?`<button class="btn secondary" onclick="goToSection('${esc(v.bookId)}','${esc(v.sectionId)}')">Ir al libro →</button>`:''}</div></section>`:''}${related.length?`<section><h2>Más videos de este libro</h2><div class="videoGrid compact">${related.map(x=>`<article class="videoCard" onclick="openVideo('${String(x.id).replace(/'/g,"\\'")}')"><div class="videoPoster"><img src="${esc(videoThumb(x))}" alt=""><span class="playCircle small">▶</span></div><h3>${esc(x.titulo)}</h3></article>`).join('')}</div></section>`:''}</div></article>`}
window.shareVideo=async id=>{let v=ministryVideos.find(x=>x.id===id);if(!v)return;let msg=`${v.titulo}\n${v.descripcion||''}`.trim();if(navigator.share){try{await navigator.share({title:v.titulo,text:msg});return}catch(e){}}try{await navigator.clipboard.writeText(msg);alert('Información del video copiada.')}catch(e){alert(msg)}}


// v2.7 — Importador inteligente de libros (local, sin inventar contenido)
// v2.9 · Auditoría integral de escalabilidad
function scalabilityAuditRows(){
 let imported=loadImportedBooks(), tc=typeof teachingCatalog==='function'?teachingCatalog():[], pc=typeof globalPillCatalog==='function'?globalPillCatalog():[];
 return books.map(b=>{let st=loadState(b.id),isImported=imported.some(x=>x.id===b.id),sections=b.secciones?.length||0,teach=tc.filter(x=>x.bookId===b.id).length,pills=pc.filter(x=>x.bookId===b.id).length,tests=(b.secciones||[]).filter(x=>x.test?.length).length,disc=(b.secciones||[]).filter(x=>x.discernimiento?.length).length;return {b,isImported,sections,teach,pills,tests,disc,last:st.last||'',pct:bookPercent(b)}})
}
window.scalabilityAudit=()=>{if(!isAdminMode()){alert('Esta auditoría está disponible únicamente en modo Administrador.');return}let rows=scalabilityAuditRows(), imported=rows.filter(x=>x.isImported).length, checks=[['Catálogo dinámico',rows.length===books.length,`${rows.length} libros activos`],['Libros importados persistentes',loadImportedBooks().length===imported,`${imported} libro${imported===1?'':'s'} en almacenamiento ampliado (IndexedDB)`],['Progreso independiente',rows.every(x=>Number.isFinite(x.pct)),`Estado separado por ID de libro`],['Continuar donde quedé',rows.every(x=>!x.last||(x.b.secciones||[]).some(s=>s.id===x.last)),`Última sección validada por libro`],['Enseñanzas globales',rows.every(x=>x.teach>=0),`${rows.reduce((a,x)=>a+x.teach,0)} enseñanzas indexadas`],['Píldoras globales',rows.every(x=>x.pills>=0),`${rows.reduce((a,x)=>a+x.pills,0)} píldoras indexadas`],['Respaldo',true,'Incluye claves bd_, también libros incorporados'],['Reinicio personal',true,'Conserva los libros incorporados']];app.innerHTML=`<section class="card"><button class="btn secondary" onclick="ministryHome()">← Inicio</button><span class="badge">⚙ v3.2 · ALMACENAMIENTO ESCALABLE</span><h1>Estado integral de la Biblioteca</h1><p class="muted">Comprueba que los libros incorporados por el motor participen en los módulos generales sin depender de programación manual.</p><div class="auditChecks">${checks.map(c=>`<div class="feedback"><b>${c[1]?'✓':'⚠'} ${esc(c[0])}</b><br>${esc(c[2])}</div>`).join('')}</div><h2 class="section">Auditoría por libro</h2><div class="importSections">${rows.map(x=>`<div><b>${esc(x.b.titulo)} ${x.isImported?'· IMPORTADO':'· BASE'}</b><span>${x.sections} secciones · ${x.pct}% leído · ${x.teach} enseñanzas · ${x.pills} píldoras</span><small>Comprensión aprobada: ${x.tests}/${x.sections} · Discernimiento aprobado: ${x.disc}/${x.sections}${x.last?' · Continuar: '+esc(sectionLabel(x.b,x.last)):''}</small></div>`).join('')}</div><div class="feedback section"><b>Regla de integridad:</b> si un libro importado no contiene tests o discernimiento aprobados, la aplicación lo informa y no inventa preguntas.</div><div class="row section"><button class="btn" onclick="library()">📚 Ver Biblioteca</button><button class="btn secondary" onclick="profileBackup()">🔐 Probar respaldo</button></div></section>`}

const IMPORTED_BOOKS_KEY='bd_imported_books_v27';
function normalizeBookTitle(t){return (t||'').replace(/^\s*(?:LIBRO|EL LIBRO)\s*[:\-–—]?\s+/i,'').trim()}
function normalizeImportedBookIdentity(b){
 if(!b||typeof b!=='object')return b;
 // Migración puntual de la prueba v2.7.3: el quinto libro fue guardado con el primer encabezado del prólogo.
 b.titulo=normalizeBookTitle(b.titulo);
 // Reparar identidad guardada sin modificar identificador, secciones, píldoras ni progreso.
 // El nombre del archivo original permite identificar el libro de manera inequívoca.
 if(/^\s*(?:📘\s*)?[ÍI]NDICE\s+(?:RESUMIDO|FINAL|GENERAL)\s*$/i.test(b.titulo||'') && /LA[ _-]+GRACIA[ _-]+NO[ _-]+HABITA[ _-]+EL[ _-]+SISTEMA/i.test(b.sourceName||'')){
   b.titulo='LA GRACIA NO HABITA EL SISTEMA';
   if(!b.subtitulo)b.subtitulo='Por qué Dios sigue hablando desde el desierto';
 }

 if(/^\s*(?:📘\s*)?[ÍI]NDICE\s+FINAL\s*$/i.test(b.titulo||'') && (/FUENTE\s+AL\s+FRUTO/i.test(JSON.stringify((b.secciones||[]).slice(0,3)).slice(0,12000))||/FUENTE[ _-]+AL[ _-]+FRUTO/i.test(b.sourceName||'')))b.titulo='DE LA FUENTE AL FRUTO';
 // Reparación no destructiva: el DOCX comienza con ÍNDICE FINAL antes del título real.
 // No cambiar el ID: así se conservan progreso, favoritos y enlaces existentes.
 if(/^\s*[📘📖\s]*[ÍI]NDICE\s+FINAL\s*$/i.test(b.titulo||'') && /(?:DE[ _-]+LA[ _-]+FUENTE[ _-]+AL[ _-]+FRUTO)/i.test(b.sourceName||'')){
   b.titulo='DE LA FUENTE AL FRUTO';
   if(!b.subtitulo)b.subtitulo='Cuando el proveedor cambia, la economía colapsa';
 }
 if((b.titulo||'').trim().toLowerCase()==='la incomodidad que revela la verdad'){
   b.titulo='COHERENCIA ESPIRITUAL';
   b.id='coherencia-espiritual';
 }
 return b;
}
function formationCleanText(x){return (x||'').replace(/^[📖💬✨🔥🌊🌿🙏⚡✝️\s]+/u,'').replace(/\s+/g,' ').trim()}
function formationIsCompleteIdea(x){
 x=formationCleanText(x);if(x.length<48||x.length>320)return false;
 if(/^(CAP[IÍ]TULO|PR[ÓO]LOGO|CONCLUSI[ÓO]N|CONTENIDO|INTRODUCCI[ÓO]N|LIQUIDEZ|AUTOSOSTENIBILIDAD)\b/i.test(x))return false;
 if(/^[A-ZÁÉÍÓÚÑ0-9 .,:;()¿?¡!\-]{8,}$/.test(x)&&!/[a-záéíóúñ]/.test(x))return false;
 if(/[:;,\-–—]$/.test(x))return false;
 let words=x.split(/\s+/).length;if(words<8)return false;
 return /[.!?…»”’]$/.test(x)||words>=12;
}
function formationSourceLines(sec){
 let out=[];(sec.secciones||[]).forEach(g=>{(g.lines||[]).forEach(raw=>{let x=formationCleanText(raw);if(formationIsCompleteIdea(x)&&!/^Leonard Moon$/i.test(x))out.push(x)})});
 return [...new Set(out)];
}
function formationKeyWords(x){return formationCleanText(x).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ñ ]/g,' ').split(/\s+/).filter(w=>w.length>4&&!['porque','antes','despues','donde','cuando','desde','hasta','sobre','entre','tambien','puede','deben','deber','tiene','tener','nuestro','nuestra','estas','estos','esto','como'].includes(w))}
function formationSimilarity(a,b){let A=new Set(formationKeyWords(a)),B=new Set(formationKeyWords(b));if(!A.size||!B.size)return 0;let n=[...A].filter(x=>B.has(x)).length;return n/Math.min(A.size,B.size)}
function formationDistinctIdeas(src,correct){return src.filter(x=>x!==correct&&formationSimilarity(x,correct)<.42).sort((a,b)=>Math.abs(a.length-correct.length)-Math.abs(b.length-correct.length))}
function rotateFormationOptions(items,correct,seed){let a=[correct,...items.filter(x=>x!==correct)].slice(0,4);if(a.length<4)return null;let n=seed%a.length;return a.slice(n).concat(a.slice(0,n))}
function buildSectionFormation(sec){
 let src=formationSourceLines(sec), test=[], title=formationCleanText(sec.titulo);
 let add=(pregunta,correct,others,exp)=>{if(!formationIsCompleteIdea(correct))return;let opts=rotateFormationOptions(others,correct,test.length+1);if(!opts)return;test.push({pregunta,opciones:opts,correcta:opts.indexOf(correct),explicacion:exp,_motor:'semantic-v311'})};
 let usable=src.filter(x=>formationIsCompleteIdea(x));
 if(usable.length>=4){let c=usable[0];add(`Según ${sec.tipo==='Prólogo'?'el Prólogo':'la sección'} “${title||sec.tipo}”, ¿cuál de estas ideas sí está desarrollada por el autor?`,c,formationDistinctIdeas(usable,c),`La respuesta correcta reproduce una idea completa desarrollada en el texto leído: “${c}”`)}
 if(usable.length>=5){let c=usable.find((x,i)=>i>0&&formationKeyWords(x).length>=6)||usable[1];add('¿Cuál de estas afirmaciones corresponde realmente al argumento desarrollado en la lectura?',c,formationDistinctIdeas(usable,c),`Esta afirmación está sustentada de forma directa en el contenido de la sección; las demás corresponden a ideas diferentes.`)}
 if(usable.length>=6){let c=usable.slice().reverse().find(x=>formationKeyWords(x).length>=6)||usable[usable.length-1];add('Al considerar el desarrollo completo de la sección, ¿cuál de estas conclusiones o afirmaciones pertenece al texto leído?',c,formationDistinctIdeas(usable,c),`La respuesta se toma de una idea completa del desarrollo, no de un encabezado ni de una frase aislada.`)}
 if(sec.referencia&&sec.versiculo){let c=formationCleanText(sec.versiculo),others=formationDistinctIdeas(usable,c);if(formationIsCompleteIdea(c)&&others.length>=3)add(`¿Cuál es el texto que la sección relaciona con ${sec.referencia}?`,c,others,`La sección vincula ${sec.referencia} con este texto bíblico.`)}
 let discernimiento=[
  {pregunta:`Después de leer “${title||sec.tipo}”, ¿qué describe mejor su situación actual frente a esta enseñanza?`,opciones:['Ya la estoy viviendo de manera consciente.','La comprendo, pero necesito llevarla a una decisión concreta.','Identifico un área que debo revisar con mayor profundidad.','Necesito volver al texto antes de responder.'],orientacion:'No busca una respuesta correcta. Compare su vida con la enseñanza que acaba de leer.'},
  {pregunta:'¿Dónde necesita aplicar primero lo comprendido en esta sección?',opciones:['En una decisión personal que estoy tomando.','En mis hábitos y prioridades cotidianas.','En una relación o responsabilidad que debo atender.','En mi manera de responder a Dios y a su Palabra.'],orientacion:'El discernimiento convierte la lectura en una aplicación concreta; elija el ámbito que realmente corresponda a su situación.'},
  {pregunta:'¿Cuál será su siguiente paso después de esta lectura?',opciones:['Volveré a leer el bloque que más me confrontó.','Registraré una decisión concreta en mi cuaderno.','Conversaré esta enseñanza con mi familia o alguien de confianza.','Pondré en práctica hoy una acción coherente con lo aprendido.'],orientacion:'Seleccione un paso realizable. Esta respuesta pertenece a su proceso personal y no se atribuye al texto del libro.'}
 ];
 return {test,discernimiento};
}
function isOldGeneratedFormation(test){return Array.isArray(test)&&test.some(q=>/¿Cuál es el enfoque central|¿Cuál de estas afirmaciones aparece realmente|¿Qué idea o bloque temático|¿Cuál de estas frases pertenece al cierre/i.test(q.pregunta||''))}
function hydrateImportedFormation(b){(b.secciones||[]).forEach(sec=>{let f=buildSectionFormation(sec);if(!sec.test?.length||isOldGeneratedFormation(sec.test))sec.test=f.test;if(!sec.discernimiento?.length)sec.discernimiento=f.discernimiento});return b}
const IMPORTED_DB_NAME='biblioteca-digital-leonard-moon';
const IMPORTED_DB_STORE='imported-books';
let importedBooksCache=[];
function openImportedDB(){return new Promise((resolve,reject)=>{let q=indexedDB.open(IMPORTED_DB_NAME,1);q.onupgradeneeded=()=>{let db=q.result;if(!db.objectStoreNames.contains(IMPORTED_DB_STORE))db.createObjectStore(IMPORTED_DB_STORE,{keyPath:'id'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
async function idbImportedBooks(){let db=await openImportedDB();return await new Promise((resolve,reject)=>{let tx=db.transaction(IMPORTED_DB_STORE,'readonly'),q=tx.objectStore(IMPORTED_DB_STORE).getAll();q.onsuccess=()=>resolve(q.result||[]);q.onerror=()=>reject(q.error)})}
async function idbSaveImportedBooks(arr){let db=await openImportedDB();return await new Promise((resolve,reject)=>{let tx=db.transaction(IMPORTED_DB_STORE,'readwrite'),st=tx.objectStore(IMPORTED_DB_STORE);st.clear();arr.forEach(x=>st.put(x));tx.oncomplete=()=>resolve(true);tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error||new Error('No fue posible guardar en IndexedDB'))})}
async function initializeImportedBooksStorage(){let dbBooks=[];try{dbBooks=await idbImportedBooks()}catch(e){console.warn('IndexedDB no disponible',e)}let legacy=[];try{legacy=JSON.parse(localStorage.getItem(IMPORTED_BOOKS_KEY)||'[]')}catch{}let merged=[...dbBooks];legacy.forEach(x=>{if(!merged.some(b=>b.id===x.id))merged.push(x)});merged=merged.map(normalizeImportedBookIdentity).map(hydrateImportedFormation);if(merged.length){try{await idbSaveImportedBooks(merged);localStorage.removeItem(IMPORTED_BOOKS_KEY)}catch(e){console.warn('Migración a IndexedDB pendiente',e)}}importedBooksCache=merged;return merged}
// Recuperación localizada: jamás reemplaza capítulos ni otros libros.
// Sólo completa las píldoras del ejemplar ya importado cuando están ausentes.
async function recoverMissingWaterFirePills(imported){
 const book=imported.find(b=>b.id==='del-agua-al-fuego');
 if(!book||!(book.secciones||[]).length)return imported;
 const existing=(book.secciones||[]).reduce((n,s)=>n+(s.pildorasEditadas||[]).length,0);
 if(existing>0)return imported;
 try{
  const r=await fetch('data/pildoras-recuperacion-agua-fuego.json',{cache:'no-store'});
  if(!r.ok)return imported;
  const data=await r.json();if(data.id!==book.id)return imported;
  let added=0;
  for(const sec of book.secciones){
   if((sec.pildorasEditadas||[]).length)continue;
   const candidates=data.sections?.[sec.id];
   if(Array.isArray(candidates)&&candidates.length){sec.pildorasEditadas=candidates;added+=candidates.length}
  }
  if(added){await saveImportedBooks(imported);console.info('Píldoras recuperadas de DEL AGUA AL FUEGO:',added)}
 }catch(e){console.warn('Recuperación de píldoras pendiente:',e)}
 return imported;
}
// Recuperación no destructiva de EL REINO NO PIENSA EN MAPAS (manuscrito original).
async function recoverReinoMapas(imported){
 const b=imported.find(x=>x.id==='el-reino-no-piensa-en-mapas');if(!b)return imported;
 try{
  const r=await fetch('data/pildoras-recuperacion-reino-mapas.json',{cache:'no-store'});if(!r.ok)return imported;
  const d=await r.json();if(d.id!==b.id)return imported;
  let changed=false;
  for(const missing of d.missingSections||[]){if(!b.secciones.some(s=>s.id===missing.id)){b.secciones.push(missing);changed=true}}
  const rank=id=>id==='prologo'?0:id==='introduccion'?0.5:id.startsWith('capitulo-')?Number(id.slice(9)):id==='conclusion'?1000:id==='epilogo'?1001:999;
  if(changed)b.secciones.sort((a,z)=>rank(a.id)-rank(z.id));
  for(const sec of b.secciones){if((sec.pildorasEditadas||[]).length)continue;
   const candidates=d.sections?.[sec.id];if(Array.isArray(candidates)&&candidates.length){sec.pildorasEditadas=candidates;changed=true}
  }
  if(changed){await saveImportedBooks(imported);console.info('Recuperación del Reino aplicada sin sustituir capítulos existentes.');}
 }catch(e){console.warn('Recuperación del Reino pendiente:',e)}
 return imported;
}
// Eliminación individual segura: NO vacía ni reescribe el almacén completo.
// Solo afecta al registro de IndexedDB cuyo identificador fue confirmado.
async function idbDeleteOneImportedBook(id){
 const db=await openImportedDB();
 try{
  return await new Promise((resolve,reject)=>{
   const tx=db.transaction(IMPORTED_DB_STORE,'readwrite');
   const store=tx.objectStore(IMPORTED_DB_STORE);
   const get=store.get(id);
   let found=false;
   get.onsuccess=()=>{if(get.result){found=true;store.delete(id)}};
   get.onerror=()=>{try{tx.abort()}catch{}};
   tx.oncomplete=()=>found?resolve(true):reject(new Error('El libro no existe en el almacenamiento. No se modificó ningún otro libro.'));
   tx.onerror=()=>reject(tx.error||new Error('Error al eliminar'));
   tx.onabort=()=>reject(tx.error||new Error('Se canceló la eliminación'));
  });
 }finally{db.close()}
}
window.deleteImportedBook=async id=>{
 if(!isAdminMode()){alert('Solo el administrador puede eliminar libros.');return}
 const target=importedBooksCache.find(x=>x.id===id);
 if(!target){alert('Este libro no es importado o no está disponible para eliminar.');return}
 const title=target.titulo||id;
 if(!confirm('¿Eliminar únicamente el libro «'+title+'» de este navegador?\n\nSus capítulos y píldoras importadas dejarán de estar disponibles. Los demás libros no se modificarán.\n\nVerifique que tiene un respaldo JSON reciente.'))return;
 const answer=prompt('Para confirmar la eliminación de «'+title+'», escriba ELIMINAR:');
 if(answer!=='ELIMINAR'){if(answer!==null)alert('No se eliminó ningún libro.');return}
 // No tocar memoria ni interfaz hasta confirmar el commit real de IndexedDB.
 try{
  await idbDeleteOneImportedBook(id);
  importedBooksCache=importedBooksCache.filter(x=>x.id!==id);
  books=books.filter(x=>x.id!==id);
  if(book&&book.id===id){book=null;current=null;state=null}
  alert('Libro eliminado: '+title+'. Los demás libros se conservaron.');
  library();
 }catch(e){console.error('Eliminación individual cancelada',e);alert('No se pudo eliminar el libro. Los demás libros no se modificaron. Detalle: '+(e?.message||e))}
};
function loadImportedBooks(){return importedBooksCache.map(normalizeImportedBookIdentity).map(hydrateImportedFormation)}
async function saveImportedBooks(x){let arr=x.map(normalizeImportedBookIdentity).map(hydrateImportedFormation);await idbSaveImportedBooks(arr);importedBooksCache=arr;try{localStorage.removeItem(IMPORTED_BOOKS_KEY)}catch{}return true}
function slugifyBook(s){return (s||'libro').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,70)||'libro'}
let importerDraft=null, importerCover='';
window.bookImporter=()=>{if(!isAdminMode()){alert('Esta herramienta está disponible únicamente en modo Administrador.');return}app.innerHTML=`<section class="importerHero"><button class="btn secondary" onclick="ministryHome()">← Inicio</button><span class="badge">⚙ v3.2 · ALMACENAMIENTO ESCALABLE</span><h1>Importador inteligente de libros</h1><p>Cargue el archivo DOCX original y la portada. El sistema leerá el documento localmente en este navegador y mostrará una vista previa antes de incorporar.</p></section><section class="importerGrid"><article class="card"><h2>1. Libro original</h2><label class="importDrop">📄 Seleccionar DOCX<input id="importDocx" type="file" accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document" hidden onchange="analyzeBookDocx(this.files[0])"></label><div id="docxStatus" class="muted">Aún no se ha cargado un libro.</div></article><article class="card"><h2>2. Portada</h2><label class="importDrop">🖼 Seleccionar portada<input id="importCover" type="file" accept="image/*" hidden onchange="loadImporterCover(this.files[0])"></label><div id="coverStatus" class="muted">Aún no se ha cargado una portada.</div></article></section><section id="importPreview"></section><section class="card importerNote"><b>Importante</b><p>El importador no inventa enseñanzas ni textos. Detecta y organiza lo que existe en el DOCX. La incorporación de prueba queda guardada solamente en este navegador; para publicarla en GitHub debe integrarse después al catálogo público.</p></section>`}
window.loadImporterCover=file=>{if(!file)return;let r=new FileReader();r.onload=()=>{importerCover=r.result;document.getElementById('coverStatus').innerHTML=`✓ ${esc(file.name)}<br><img class="importCoverPreview" src="${importerCover}">`;renderImporterPreview()};r.readAsDataURL(file)}
async function inflateRaw(bytes){if(typeof DecompressionStream==='undefined')throw new Error('Este navegador no permite descomprimir DOCX. Use Chrome, Edge o Safari actualizado.');let ds=new DecompressionStream('deflate-raw'),w=ds.writable.getWriter();w.write(bytes);w.close();return new Uint8Array(await new Response(ds.readable).arrayBuffer())}
async function zipEntry(buf,name){let u=new Uint8Array(buf),dv=new DataView(buf),eocd=-1;for(let i=u.length-22;i>=Math.max(0,u.length-65557);i--){if(dv.getUint32(i,true)===0x06054b50){eocd=i;break}}if(eocd<0)throw new Error('DOCX no válido.');let count=dv.getUint16(eocd+10,true),off=dv.getUint32(eocd+16,true),p=off,dec=new TextDecoder();for(let n=0;n<count;n++){if(dv.getUint32(p,true)!==0x02014b50)break;let method=dv.getUint16(p+10,true),cs=dv.getUint32(p+20,true),nl=dv.getUint16(p+28,true),xl=dv.getUint16(p+30,true),cl=dv.getUint16(p+32,true),lo=dv.getUint32(p+42,true),fn=dec.decode(u.slice(p+46,p+46+nl));if(fn===name){let lnl=dv.getUint16(lo+26,true),lxl=dv.getUint16(lo+28,true),start=lo+30+lnl+lxl,data=u.slice(start,start+cs);if(method===0)return data;if(method===8)return await inflateRaw(data);throw new Error('Método de compresión DOCX no compatible.')}p+=46+nl+xl+cl}throw new Error('No se encontró el contenido principal del DOCX.')}
function docxParagraphs(xml){let d=new DOMParser().parseFromString(xml,'application/xml');return [...d.getElementsByTagNameNS('*','p')].map(p=>[...p.getElementsByTagNameNS('*','t')].map(t=>t.textContent).join('').trim()).filter(Boolean)}
function structuralBookMarker(x){
 let t=(x||'').replace(/^[^A-Za-zÁÉÍÓÚÑ0-9]+/u,'').trim().toUpperCase();
 if(/^PR[ÓO]LOGO(?:\s|$)/.test(t))return {key:'prologo',order:0};
 if(/^INTRODUCCI[ÓO]N(?:\s|$)/.test(t))return {key:'introduccion',order:0.5};
 let m=t.match(/^CAP[ÍI]TULO\s+(\d{1,3})(?:\s|[.:-]|$)/);
 if(m)return {key:'capitulo-'+Number(m[1]),order:Number(m[1])};
 if(/^CONCLUSI[ÓO]N(?:\s|$)/.test(t)){
  // Los cierres internos (p. ej. CONCLUSIÓN DEL PRÓLOGO o CONCLUSIÓN DEL CAPÍTULO)
  // pertenecen a su sección y no deben finalizar el libro prematuramente.
  if(/^CONCLUSI[ÓO]N\s+(?:DEL?|DE\s+LA|DE\s+LOS|DE\s+LAS)\s+(?:PR[ÓO]LOGO|INTRODUCCI[ÓO]N|CAP[ÍI]TULO|SECCI[ÓO]N|APARTADO|TEMA|BLOQUE)\b/.test(t))return null;
  return {key:'conclusion',order:1000};
 }
 if(/^EP[ÍI]LOGO(?:\s|$)/.test(t))return {key:'epilogo',order:1001};
 return null;
}
function splitBookSections(lines){
 // Detectar el cuerpo real, no las entradas del índice. Los títulos de un índice
 // están muy próximos entre sí; los capítulos reales contienen texto sustancial.
 const markers=[];
 lines.forEach((line,index)=>{const m=structuralBookMarker(line);if(m)markers.push({...m,index})});
 if(!markers.length)return [parseImportedSection(lines,0)];
 const substantive=m=>{
  const next=markers.find(n=>n.index>m.index);
  const span=(next?.index??lines.length)-m.index;
  return span>=12;
 };
 // Primera aparición del prólogo que realmente contiene texto y no es el índice.
 // Si no existe, usamos el primer capítulo con contenido sustancial.
 const bodyStart=markers.find(m=>m.key==='prologo'&&substantive(m))
  ||markers.find(m=>m.key==='capitulo-1'&&substantive(m))
  ||markers.find(m=>substantive(m))||markers[0];
 const actual=markers.filter(m=>m.index>=bodyStart.index);
 const chosen=[];
 for(const m of actual){
  const prev=chosen[chosen.length-1];
  if(prev?.key===m.key)continue; // Encabezado repetido: conservarlo dentro del capítulo.
  if(m.key==='introduccion'&&chosen.some(x=>x.key.startsWith('capitulo-')))continue;
  if(m.key==='introduccion'&&chosen.some(x=>x.key==='prologo')&&!substantive(m))continue;
  if(m.key==='epilogo'&&!substantive(m)&&m.index<lines.length-12)continue;
  if(prev&&m.order<prev.order)continue;
  chosen.push(m);
 }
 return chosen.map((m,j)=>parseImportedSection(lines.slice(m.index,chosen[j+1]?.index??lines.length),j));
}
function parseImportedSection(a,i){
 let first=(a[0]||'').trim(),up=first.toUpperCase(),marker=structuralBookMarker(first);
 let tipo=marker?.key==='prologo'?'Prólogo':marker?.key==='introduccion'?'Introducción':marker?.key==='conclusion'?'Conclusión':marker?.key==='epilogo'?'Epílogo':marker?.key?.startsWith('capitulo-')?'Capítulo '+marker.key.slice(9):'Sección';
 let titleIdx=marker?1:0;
 let inlineTitle=first.replace(/^[^A-Za-zÁÉÍÓÚÑ0-9]+/u,'').replace(/^(?:CAP[ÍI]TULO\s+\d+|PR[ÓO]LOGO|INTRODUCCI[ÓO]N|CONCLUSI[ÓO]N|EP[ÍI]LOGO)\s*[.:-]?\s*/i,'').trim();
 let titulo=inlineTitle||(a[titleIdx]||tipo).replace(/^[^A-Za-zÁÉÍÓÚÑ0-9¿¡]+/u,'').trim();
 let subtitle='',ref='',verse='';
 for(let k=titleIdx+1;k<Math.min(a.length,titleIdx+8);k++){
  let x=a[k];if(!subtitle&&/^(✝|cuando\b)/i.test(x))subtitle=x.replace(/^✝\s*/,'').trim();
  let m=x.match(/(?:📖\s*)?((?:[1-3]\s*)?[A-Za-zÁÉÍÓÚÑáéíóúñ]+(?:\s+[A-Za-zÁÉÍÓÚÑáéíóúñ]+)*\s+\d+:\d+(?:-\d+)?)/);
  if(!ref&&m){ref=m[1];verse=a[k+1]||''}
 }
 let body=a.slice(Math.max(titleIdx+1,1)),groups=[],g={heading:'🌿 CONTENIDO',lines:[]};
 for(let x of body){if(/^[🔥🌊🌿✨🙏💬]/u.test(x)&&x.length<120){if(g.lines.length||g.heading!=='🌿 CONTENIDO')groups.push(g);g={heading:x,lines:[]}}else g.lines.push(x)}
 if(g.lines.length||!groups.length)groups.push(g);
 return {id:marker?.key||slugifyBook(tipo),tipo,titulo,subtitulo:subtitle,referencia:ref,versiculo:verse,secciones:groups,test:[],discernimiento:[]};
}
function detectMasterBookIdentity(lines,fileName){
 let firstMarker=lines.findIndex(x=>structuralBookMarker(x));
 let pre=(firstMarker>0?lines.slice(0,firstMarker):[]).map(x=>x.trim()).filter(Boolean);
 let clean=x=>(x||'').replace(/^[^A-Za-zÁÉÍÓÚÑ0-9¿¡]+/u,'').trim();
 // Evitar usar encabezados de índice como identidad del libro.

 let candidates=pre.map(clean).filter(x=>x&&x.length>=3&&x.length<=90&&!/^(LEONARD MOON|AUTOR|(?:ÍNDICE|INDICE)(?:\s+(?:FINAL|RESUMIDO|GENERAL|ANALÍTICO|ANALITICO|DE\s+CONTENIDOS?))?|(?:TABLA\s+DE\s+)?CONTENIDO(?:S)?)$/i.test(x)&&!/(UN DISEÑO|SUBT[IÍ]TULO|SERIE)/i.test(x));
 // En una portada de libro el título suele ser una línea breve en mayúsculas; preferimos esa identidad sobre el primer título del prólogo.
 let upper=candidates.filter(x=>/[A-ZÁÉÍÓÚÑ]/.test(x)&&x===x.toUpperCase()&&x.split(/\s+/).length<=8);
 let title=(upper[0]||candidates[0]||fileName.replace(/\.docx$/i,'').replace(/[-_]+/g,' ')).trim();
 title=normalizeBookTitle(title);
 return {titulo:title||'Libro',sourceName:fileName};
}
window.analyzeBookDocx=async file=>{if(!file)return;let st=document.getElementById('docxStatus');st.textContent='Analizando DOCX…';try{let buf=await file.arrayBuffer(),raw=await zipEntry(buf,'word/document.xml'),xml=new TextDecoder().decode(raw),lines=docxParagraphs(xml),secs=splitBookSections(lines),identity=detectMasterBookIdentity(lines,file.name);let titleGuess=identity.titulo;importerDraft={id:slugifyBook(titleGuess),titulo:titleGuess,subtitulo:'',autor:'Leonard Moon',categoria:'Formación · Hogar',portada:'',descripcion:'',sourceName:identity.sourceName,secciones:secs};st.innerHTML=`✓ ${esc(file.name)}<br><b>${lines.length}</b> párrafos leídos · <b>${secs.length}</b> secciones detectadas.<br><b>Identidad maestra:</b> ${esc(titleGuess)}`;renderImporterPreview()}catch(e){importerDraft=null;st.innerHTML=`<b>No fue posible analizar el DOCX.</b><br>${esc(e.message)}`}}
function renderImporterPreview(){let h=document.getElementById('importPreview');if(!h||!importerDraft)return;let d=importerDraft;h.innerHTML=`<section class="card"><span class="badge">3. VISTA PREVIA ANTES DE INCORPORAR</span><div class="importMeta"><div>${importerCover?`<img src="${importerCover}" class="importBookCover">`:'<div class="importNoCover">Sin portada</div>'}</div><div><label>Título maestro del libro</label><input id="impTitle" value="${esc(d.titulo)}" oninput="updateImporterMeta()"><label>Subtítulo</label><input id="impSubtitle" value="${esc(d.subtitulo)}" oninput="updateImporterMeta()"><label>Autor</label><input id="impAuthor" value="${esc(d.autor)}" oninput="updateImporterMeta()"><label>Categoría</label><input id="impCategory" value="${esc(d.categoria)}" oninput="updateImporterMeta()"></div></div><h2>Estructura principal detectada</h2><p class="muted">El importador detecta prólogo, introducción, capítulos numerados sin límite fijo, conclusión y epílogo cuando están presentes. Revise la estructura antes de guardar.</p><div class="importSections">${d.secciones.map((s,i)=>`<div><b>${i+1}. ${esc(s.tipo)}</b><span>${esc(s.titulo)}</span><small>${esc(s.referencia||'Sin referencia detectada')}</small></div>`).join('')}</div><div class="row section"><button class="btn" onclick="incorporateImportedBook()">✓ Incorporar libro de prueba</button><button class="btn secondary" onclick="downloadImportPackage()">⇩ Exportar paquete JSON</button></div><p class="muted">Revise especialmente títulos y estructura. Comprensión se construye con ideas completas y sustentadas de cada sección; discernimiento se presenta como aplicación personal y nunca como texto atribuido al autor.</p></section>`}
window.updateImporterMeta=()=>{if(!importerDraft)return;importerDraft.titulo=document.getElementById('impTitle')?.value.trim()||importerDraft.titulo;importerDraft.subtitulo=document.getElementById('impSubtitle')?.value.trim()||'';importerDraft.autor=document.getElementById('impAuthor')?.value.trim()||'Leonard Moon';importerDraft.categoria=document.getElementById('impCategory')?.value.trim()||'';importerDraft.id=slugifyBook(importerDraft.titulo)}
function preparedImportedBook(){updateImporterMeta();let x=JSON.parse(JSON.stringify(importerDraft));x.portada=importerCover||'';return x}
window.incorporateImportedBook=async()=>{if(!importerDraft)return;let x=hydrateImportedFormation(preparedImportedBook());if(!x.portada&&!confirm('No ha cargado una portada. ¿Desea incorporar el libro sin portada?'))return;let existing=loadImportedBooks().find(b=>b.id===x.id);if(existing&&!confirm('Ya existe un libro con este título. Reemplazarlo puede modificar su contenido. ¿Desea continuar?'))return;let arr=loadImportedBooks().filter(b=>b.id!==x.id);arr.push(x);let pillCount=getPills(x).length;if(!pillCount){if(!confirm('El manuscrito se reconoció, pero el motor no encontró píldoras con fundamento bíblico completo. El libro y sus capítulos sí se guardarán. ¿Desea incorporarlo y revisar sus citas después?'))return;}try{await saveImportedBooks(arr)}catch(e){console.error(e);alert('No fue posible guardar el libro en el almacenamiento ampliado del navegador. Verifique que no esté navegando en modo privado y vuelva a intentarlo.');return}books=[...books.filter(b=>b.id!==x.id),x];alert('Libro incorporado correctamente. Píldoras detectadas: '+pillCount+'. Ya aparece en Biblioteca en este navegador.');library()}
window.downloadImportPackage=()=>{if(!importerDraft)return;let x=preparedImportedBook(),blob=new Blob([JSON.stringify(x,null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download=`${x.id}.json`;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}

// v3.3.1 · MOTOR DE COHERENCIA CONTEXTUAL — bloques continuos para Enseñanzas y Píldoras.

// v3.3.2 · ESTÁNDAR UNIVERSAL DE PÍLDORAS — solo piezas completas: frase + Palabra + reflexión contextual sólida.

/* v3.4 · MI RUTA DE FORMACIÓN — recomendaciones basadas únicamente en contenido real de la biblioteca */
const FORMATION_ROUTE_KEY='bd_formation_route_v340';
const formationThemes=[
 {id:'hogar',icon:'🏠',name:'Fortalecer mi hogar',desc:'Familia, matrimonio, casa, legado y responsabilidades.',words:['hogar','familia','casa','matrimonio','esposo','esposa','padre','madre','hijos','legado']},
 {id:'fe',icon:'🙏',name:'Crecer en fe y confianza',desc:'Fe, confianza, obediencia, presencia y relación con Dios.',words:['fe','confiar','confianza','obediencia','dios','cristo','presencia','palabra','reino','voz']},
 {id:'coherencia',icon:'🧭',name:'Vivir con coherencia',desc:'Alinear lo que creo, digo, decido y vivo.',words:['coherencia','alinear','alineado','verdad','obediencia','vida','corazón','decision','decisión','integridad']},
 {id:'finanzas',icon:'📐',name:'Ordenar mis decisiones y recursos',desc:'Administración, cargas, presupuesto, recursos y sostenibilidad.',words:['cuentas','presupuesto','administrar','administración','recursos','cargas','dinero','finanzas','sostener','capacidad','deuda']},
 {id:'liderazgo',icon:'🔥',name:'Revisar mi liderazgo espiritual',desc:'Servicio, altar, autoridad, sistema, llamado y paternidad.',words:['altar','liderazgo','autoridad','servicio','sistema','llamado','padre','paternidad','ministerio','discípulos','discipulos']},
 {id:'transformacion',icon:'🌱',name:'Avanzar en transformación personal',desc:'Cambios del corazón, discernimiento, propósito y nueva vida.',words:['transformación','transformacion','cambio','corazón','corazon','discernimiento','propósito','proposito','nuevo','nueva','camino','restauración','restauracion']}
];
function formationSectionText(b,s){return [b.titulo,b.subtitulo,s.tipo,s.titulo,s.subtitulo,s.referencia,s.versiculo,...(s.secciones||[]).flatMap(g=>[g.heading,...(g.lines||[])])].filter(Boolean).join(' ').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')}
function formationThemeMatches(theme){let rows=[];books.forEach(b=>(b.secciones||[]).forEach((s,idx)=>{let txt=formationSectionText(b,s),score=0,hits=[];theme.words.forEach(w=>{let n=w.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase(),m=txt.match(new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'g'));if(m){score+=Math.min(m.length,5);hits.push(w)}});if(score)rows.push({book:b,section:s,index:idx,score,hits:[...new Set(hits)]})}));return rows.sort((a,b)=>b.score-a.score||a.index-b.index)}
function buildFormationRoute(theme){let matches=formationThemeMatches(theme),chosen=[],usedBooks=new Set();for(let x of matches){if(chosen.length>=5)break;if(!usedBooks.has(x.book.id)){chosen.push(x);usedBooks.add(x.book.id)}}for(let x of matches){if(chosen.length>=5)break;if(!chosen.some(y=>y.book.id===x.book.id&&y.section.id===x.section.id))chosen.push(x)}return chosen}
function formationStepStatus(x){let st=loadState(x.book.id),read=!!st.read?.[x.section.id],test=st.test?.[x.section.id]!=null,disc=!!st.disc?.[x.section.id],done=!!st.done?.[x.section.id];return {read,test,disc,done,count:[read,test,disc,done].filter(Boolean).length}}
window.chooseFormationRoute=id=>{let theme=formationThemes.find(x=>x.id===id);if(!theme)return;localStorage.setItem(FORMATION_ROUTE_KEY,JSON.stringify({themeId:id,created:new Date().toISOString()}));formationRoute(id)};
window.clearFormationRoute=()=>{localStorage.removeItem(FORMATION_ROUTE_KEY);formation()};
window.formationRoute=id=>{let theme=formationThemes.find(x=>x.id===id)||formationThemes[0],route=buildFormationRoute(theme);app.innerHTML=`<section class="routeHero"><button class="btn secondary" onclick="formation()">← Mi camino</button><span class="badge">${theme.icon} MI RUTA DE FORMACIÓN</span><h1>${esc(theme.name)}</h1><p>${esc(theme.desc)}</p><div class="routeIntegrity">Esta ruta se construye buscando este tema dentro del contenido real de los libros. No añade enseñanzas externas ni atribuye mensajes nuevos al autor.</div></section>${route.length?`<section class="routeSteps">${route.map((x,i)=>{let q=formationStepStatus(x),pct=q.count*25;return `<article class="routeStep"><div class="routeStepNo">${i+1}</div><div class="routeStepBody"><small>${esc(x.book.titulo)} · ${esc(x.section.tipo)}</small><h2>${esc(x.section.titulo)}</h2>${x.section.referencia?`<div class="routeRef">📖 ${esc(x.section.referencia)}</div>`:''}<p class="muted">Coincidencias temáticas en el contenido: ${esc(x.hits.slice(0,4).join(' · '))}</p><div class="progress"><i style="width:${pct}%"></i></div><div class="routeMiniSteps"><span class="${q.read?'done':''}">📖 Lee</span><span class="${q.test?'done':''}">📝 Comprende</span><span class="${q.disc?'done':''}">🔍 Discierne</span><span class="${q.done?'done':''}">✓ Completa</span></div><div class="row"><button class="btn" onclick="goToSection('${x.book.id}','${x.section.id}')">${q.done?'Volver a la sección':'Continuar este paso'} →</button><button class="btn secondary" onclick="pills('${x.book.id}','${x.section.id}')">💡 Meditar en sus píldoras</button><button class="btn secondary" onclick="journalForm('${x.book.id}','${x.section.id}')">🎯 Mi aplicación</button></div></div></article>`}).join('')}</section>`:`<section class="card"><h2>Aún no encontramos una ruta suficiente para este tema.</h2><p>La Biblioteca no inventará recomendaciones sin respaldo en sus libros.</p></section>`}<section class="routeFooter"><button class="btn secondary" onclick="clearFormationRoute()">Elegir otra necesidad</button><button class="btn secondary" onclick="library()">📚 Biblioteca</button></section>`};
window.formation=()=>{let j=loadJournal(),c=loadCollection(),saved=null;try{saved=JSON.parse(localStorage.getItem(FORMATION_ROUTE_KEY)||'null')}catch(e){}let active=saved&&formationThemes.find(x=>x.id===saved.themeId);app.innerHTML=`<section class="formationHero routeWelcome"><span class="badge">🌿 MI RUTA DE FORMACIÓN</span><h1>¿Qué necesitas fortalecer hoy?</h1><p class="muted">No siempre sabemos qué libro comenzar. Permite que la Biblioteca encuentre un camino usando únicamente el contenido real que ya existe en tus libros.</p>${active?`<button class="btn" onclick="formationRoute('${active.id}')">Continuar mi ruta: ${active.icon} ${esc(active.name)} →</button>`:''}</section><section class="routeThemeGrid">${formationThemes.map(t=>`<button class="routeTheme" onclick="chooseFormationRoute('${t.id}')"><b>${t.icon}</b><strong>${esc(t.name)}</strong><small>${esc(t.desc)}</small><span>Explorar ruta →</span></button>`).join('')}</section><section class="formationGrid routeSummary"><article class="formationCard"><div class="formationIcon">📚</div><h2>Mi recorrido</h2><p>${books.filter(b=>bookPercent(b)>0).length} libro${books.filter(b=>bookPercent(b)>0).length===1?'':'s'} iniciado${books.filter(b=>bookPercent(b)>0).length===1?'':'s'}.</p><button class="btn secondary" onclick="progress()">Ver progreso completo</button></article><article class="formationCard"><div class="formationIcon">📝</div><h2>Mi cuaderno</h2><p>${j.length} registro${j.length===1?'':'s'} personal${j.length===1?'':'es'}.</p><button class="btn secondary" onclick="journal()">Abrir mi cuaderno</button></article><article class="formationCard"><div class="formationIcon">❤️</div><h2>Lo que he guardado</h2><p>${c.length} elemento${c.length===1?'':'s'} en Mi colección.</p><button class="btn secondary" onclick="collection()">Abrir Mi colección</button></article><article class="formationCard"><div class="formationIcon">🎯</div><h2>Mis decisiones</h2><p>${j.filter(x=>x.revisar||x.decision).length} registro${j.filter(x=>x.revisar||x.decision).length===1?'':'s'} con revisión o decisión.</p><button class="btn secondary" onclick="workingOn()">Ver mis decisiones</button></article></section><section class="card section routeHistory"><div class="row"><button class="btn" onclick="historyFormation()">📜 Mi historia de formación</button><button class="btn secondary" onclick="library()">← Biblioteca</button></div></section>`};

/* v3.5 · BUSCADOR INTELIGENTE DE LA BIBLIOTECA
   Busca por intención y palabras relacionadas, pero solo devuelve contenido que existe en los libros. */
const SMART_STOP=new Set('a al algo algunas algunos ante antes como con contra cual cuando de del desde donde el ella en entre era es esa ese eso esta este esto hay la las lo los me mi mis no nos o para pero por porque que se si sin sobre su sus te tu tus un una uno y ya yo tengo tiene quiero puedo poder siento sentir estoy esta vida hoy muy mas más'.split(/\s+/));
const SMART_GROUPS=[
 ['hogar','familia','casa','matrimonio','esposo','esposa','padre','madre','hijo','hijos','legado'],
 ['dinero','cuentas','presupuesto','finanzas','recursos','cargas','deuda','administrar','administracion','sostener','sostenibilidad','capacidad'],
 ['miedo','temor','ansiedad','preocupacion','incertidumbre','confiar','confianza','fe'],
 ['coherencia','integridad','alinear','alineado','obediencia','verdad','decidir','decision','decisiones'],
 ['sistema','religioso','religion','estructura','presencia','reino','voz','cristo','dios'],
 ['liderazgo','autoridad','servicio','ministerio','llamado','altar','paternidad','discipulo','discipulos'],
 ['cambio','transformacion','restauracion','corazon','proposito','discernimiento','nuevo','nueva','camino']
];
function smartNorm(v){return (v||'').toString().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9ñ\s]/g,' ').replace(/\s+/g,' ').trim()}
function smartTokens(q){let raw=smartNorm(q).split(' ').filter(w=>w.length>2&&!SMART_STOP.has(w)),set=new Set(raw);raw.forEach(w=>SMART_GROUPS.forEach(g=>{if(g.includes(w))g.forEach(x=>set.add(smartNorm(x)))}));return [...set]}
function smartScore(text,title,tokens){let body=' '+smartNorm(text)+' ',head=' '+smartNorm(title)+' ',score=0,hits=[];tokens.forEach(w=>{let re=new RegExp(`\\b${w.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')}\\b`,'g'),hm=head.match(re),bm=body.match(re);if(hm){score+=Math.min(hm.length,3)*6;hits.push(w)}if(bm){score+=Math.min(bm.length,6)*2;hits.push(w)}});return {score,hits:[...new Set(hits)]}}
function smartSnippet(text,tokens){let clean=(text||'').replace(/\s+/g,' ').trim(),n=smartNorm(clean),pos=-1;for(let w of tokens){let p=n.indexOf(w);if(p>=0&&(pos<0||p<pos))pos=p}if(pos<0)return clean.slice(0,260);let start=Math.max(0,pos-95);return (start?'…':'')+clean.slice(start,start+330)+(start+330<clean.length?'…':'')}
function smartSearchData(q){let tokens=smartTokens(q),sections=[],teachings=[],pills=[];
 books.forEach(b=>(b.secciones||[]).forEach(s=>{let body=[s.titulo,s.subtitulo,s.referencia,s.versiculo,...(s.secciones||[]).flatMap(g=>[g.heading,...(g.lines||[])])].filter(Boolean).join(' '),m=smartScore(body,`${b.titulo} ${s.titulo}`,tokens);if(m.score)sections.push({type:'section',score:m.score,hits:m.hits,book:b,section:s,body})}));
 (typeof teachingCatalog==='function'?teachingCatalog():[]).forEach(t=>{let body=[t.title,t.section,t.reference,t.verse,...(t.paragraphs||[])].filter(Boolean).join(' '),m=smartScore(body,`${t.book} ${t.title}`,tokens);if(m.score)teachings.push({type:'teaching',score:m.score,hits:m.hits,item:t,body})});
 (typeof globalPillCatalog==='function'?globalPillCatalog():[]).forEach(p=>{let body=[p.text,p.section,p.reference,p.verse,p.explanation].filter(Boolean).join(' '),m=smartScore(body,`${p.book} ${p.text}`,tokens);if(m.score)pills.push({type:'pill',score:m.score,hits:m.hits,item:p,body})});
 let sort=x=>x.sort((a,b)=>b.score-a.score);return {tokens,sections:sort(sections).slice(0,8),teachings:sort(teachings).slice(0,8),pills:sort(pills).slice(0,8)}
}
function smartSuggestedTheme(tokens){let best=null,bestN=0;formationThemes.forEach(t=>{let words=t.words.map(smartNorm),n=tokens.filter(w=>words.includes(w)||SMART_GROUPS.some(g=>g.includes(w)&&g.some(x=>words.includes(x)))).length;if(n>bestN){best=t;bestN=n}});return bestN?best:null}
window.searchLibrary=()=>{app.innerHTML=`<section class="smartSearchHero"><span class="badge">🔎 BUSCADOR INTELIGENTE DE LA BIBLIOTECA</span><h1>Cuéntame qué necesitas encontrar</h1><p>Puede escribir una palabra, un tema o una situación con sus propias palabras. El buscador no inventa respuestas: encuentra contenido que ya existe en los libros de Leonard Moon.</p><div class="smartSearchBox"><textarea id="globalSearch" rows="3" placeholder="Ejemplo: Tengo miedo de no poder sostener económicamente mi hogar"></textarea><button class="btn" onclick="runSearch()">Buscar en la Biblioteca →</button></div><div class="smartExamples"><button onclick="smartExample(this)">Tengo miedo de no poder sostener mi hogar</button><button onclick="smartExample(this)">Conozco de Dios pero mi vida no está cambiando</button><button onclick="smartExample(this)">Quiero ordenar mis decisiones y mis recursos</button></div></section><div id="searchResults" class="smartSearchResults"><div class="smartSearchWelcome">📚 Escriba lo que está viviendo o el tema que desea profundizar.</div></div>`;setTimeout(()=>document.getElementById('globalSearch')?.focus(),30)};
window.smartExample=b=>{let i=document.getElementById('globalSearch');if(i){i.value=b.textContent;runSearch()}};
window.runSearch=()=>{let input=document.getElementById('globalSearch'),host=document.getElementById('searchResults');if(!input||!host)return;let q=input.value.trim();if(q.length<3){host.innerHTML='<div class="smartSearchWelcome">Escriba un poco más para buscar dentro de la Biblioteca.</div>';return}let r=smartSearchData(q),total=r.sections.length+r.teachings.length+r.pills.length,theme=smartSuggestedTheme(r.tokens);if(!total){host.innerHTML=`<div class="smartNoResults"><h2>No encontramos contenido suficiente para esa búsqueda.</h2><p>La Biblioteca prefiere no inventar una respuesta. Pruebe con otras palabras o explore los libros.</p><button class="btn secondary" onclick="library()">📚 Ver Biblioteca</button></div>`;return}
 let sectionCards=r.sections.slice(0,5).map(x=>`<article class="smartResultCard"><span class="smartType">📖 PARA LEER</span><small>${esc(x.book.titulo)} · ${esc(x.section.tipo)}</small><h3>${esc(x.section.titulo)}</h3>${x.section.referencia?`<b class="smartRef">${esc(x.section.referencia)}</b>`:''}<p>${esc(smartSnippet(x.body,r.tokens))}</p><button class="btn secondary" onclick="goToSection('${x.book.id}','${x.section.id}')">Abrir en el libro →</button></article>`).join('');
 let teachingCards=r.teachings.slice(0,5).map(x=>{let t=x.item;return `<article class="smartResultCard"><span class="smartType">🌿 ENSEÑANZA</span><small>${esc(t.book)} · ${esc(t.section)}</small><h3>${esc(t.title)}</h3>${t.reference?`<b class="smartRef">${esc(t.reference)}</b>`:''}<p>${esc(smartSnippet(x.body,r.tokens))}</p><button class="btn secondary" onclick='openTeaching(${JSON.stringify(t.id)})'>Leer enseñanza →</button></article>`}).join('');
 let pillCards=r.pills.slice(0,5).map(x=>{let p=x.item;return `<article class="smartResultCard"><span class="smartType">💡 PÍLDORA</span><small>${esc(p.book)} · ${esc(p.section)}</small><h3>“${esc(p.text)}”</h3>${p.reference?`<b class="smartRef">${esc(p.reference)}</b>`:''}${p.explanation?`<p>${esc(p.explanation)}</p>`:''}<button class="btn secondary" onclick="pills('${String(p.bookId).replace(/'/g,"\\'")}',null,${p.pillIndex})">Meditar en esta píldora →</button></article>`}).join('');
 host.innerHTML=`<section class="smartAnswer"><span class="badge">RESULTADOS EN CONTENIDO REAL</span><h2>Encontramos caminos dentro de la Biblioteca</h2><p>Estos resultados se ordenan por relación con sus palabras. La aplicación no ha creado una enseñanza nueva.</p>${theme?`<div class="smartRouteSuggestion"><div><b>${theme.icon} Ruta relacionada: ${esc(theme.name)}</b><span>${esc(theme.desc)}</span></div><button class="btn" onclick="chooseFormationRoute('${theme.id}')">Llevar esto a Mi Camino →</button></div>`:''}</section>${sectionCards?`<section class="smartGroup"><h2>📖 Para leer</h2><div class="smartResultGrid">${sectionCards}</div></section>`:''}${teachingCards?`<section class="smartGroup"><h2>🌿 Enseñanzas relacionadas</h2><div class="smartResultGrid">${teachingCards}</div></section>`:''}${pillCards?`<section class="smartGroup"><h2>💡 Píldoras para meditar</h2><div class="smartResultGrid">${pillCards}</div></section>`:''}`
};

// v3.7 · EXPERIENCIA DE FORMACIÓN Y SEGUIMIENTO
const FORMATION_INSIGHTS_KEY='bd_lo_que_dios_me_muestra_v37';
function loadFormationInsights(){try{return JSON.parse(localStorage.getItem(FORMATION_INSIGHTS_KEY)||'[]')}catch(e){return []}}
function saveFormationInsights(x){localStorage.setItem(FORMATION_INSIGHTS_KEY,JSON.stringify(x))}
function formationStats(){
 let started=0,finished=0,sections=0,tests=0,discs=0;
 books.forEach(b=>{let s=loadState(b.id),pct=bookPercent(b);if(pct>0||s.last)started++;if(pct>=100)finished++;b.secciones.forEach(sec=>{if((s.read&&s.read[sec.id])||(s.done&&s.done[sec.id]))sections++;if(s.test&&s.test[sec.id])tests++;if(s.disc&&s.disc[sec.id])discs++})});
 let j=loadJournal(),c=loadCollection();return {started,finished,sections,tests,discs,saved:c.length,decisions:j.filter(x=>x.decision||x.revisar).length,notes:loadFormationInsights().length};
}
function activeFormationTheme(){try{let x=JSON.parse(localStorage.getItem(FORMATION_ROUTE_KEY)||'null');return x&&formationThemes.find(t=>t.id===x.themeId)}catch(e){return null}}
window.continueMyFormation=()=>{let t=activeFormationTheme();if(t)return formationRoute(t.id);let snap=visitorJourneySnapshot();if(snap.latest?.st?.last)return continueVisitorReading(snap.latest.b.id,snap.latest.st.last);formation()};
window.formationInsight=()=>{let notes=loadFormationInsights();app.innerHTML=`<section class="card insightForm"><span class="badge">✍️ ESPACIO PERSONAL Y PRIVADO</span><h1>Lo que Dios me está mostrando</h1><p class="muted">Escribe con tus propias palabras lo que estás comprendiendo, revisando o decidiendo. La aplicación no interpreta ni atribuye a Dios lo que escribas; este espacio solamente conserva tu registro en este navegador.</p><label>¿Qué estoy comprendiendo?</label><textarea id="fiUnderstand" rows="4" placeholder="Escribe aquí..."></textarea><label>¿Qué quiero revisar o aplicar?</label><textarea id="fiApply" rows="4" placeholder="Escribe aquí..."></textarea><label>¿Qué decisión quiero recordar?</label><textarea id="fiDecision" rows="4" placeholder="Escribe aquí..."></textarea><div class="row"><button class="btn" onclick="saveFormationInsight()">Guardar mi reflexión</button><button class="btn secondary" onclick="formation()">← Mi camino</button></div></section><section class="card section"><h2>Mis reflexiones guardadas</h2>${notes.length?notes.map((n,i)=>`<article class="insightItem"><div class="journalDate">${new Date(n.date).toLocaleDateString('es-CO',{year:'numeric',month:'long',day:'numeric'})}</div>${n.understand?`<p><b>💡 Comprendo:</b> ${esc(n.understand)}</p>`:''}${n.apply?`<p><b>🌱 Quiero revisar/aplicar:</b> ${esc(n.apply)}</p>`:''}${n.decision?`<p><b>🎯 Decisión:</b> ${esc(n.decision)}</p>`:''}<button class="mini danger" onclick="deleteFormationInsight(${i})">Eliminar</button></article>`).join(''):'<div class="feedback">Todavía no has guardado una reflexión personal.</div>'}</section>`};
window.saveFormationInsight=()=>{let understand=(document.getElementById('fiUnderstand')?.value||'').trim(),apply=(document.getElementById('fiApply')?.value||'').trim(),decision=(document.getElementById('fiDecision')?.value||'').trim();if(!understand&&!apply&&!decision)return alert('Escribe al menos una reflexión antes de guardar.');let n=loadFormationInsights();n.unshift({understand,apply,decision,date:new Date().toISOString()});saveFormationInsights(n);formationInsight()};
window.deleteFormationInsight=i=>{let n=loadFormationInsights();n.splice(i,1);saveFormationInsights(n);formationInsight()};
window.formation=()=>{let j=loadJournal(),c=loadCollection(),st=formationStats(),active=activeFormationTheme(),snap=visitorJourneySnapshot();let next=active?`${active.icon} ${active.name}`:(snap.latest?`${snap.latest.b.titulo} · ${sectionLabel(snap.latest.b,snap.latest.st.last)}`:'Elige una ruta para comenzar');app.innerHTML=`<section class="formationHero formationDashboardHero"><span class="badge">🌿 MI CAMINO DE FORMACIÓN</span><h1>Mi recorrido personal</h1><p>No se trata solamente de cuánto has leído, sino de continuar caminando en lo que has comprendido.</p><button class="btn formationContinue" onclick="continueMyFormation()">Continuar mi formación →</button></section><section class="formationStats"><article><b>${st.started}</b><span>Libros iniciados</span><small>${st.finished} terminados</small></article><article><b>${st.sections}</b><span>Secciones leídas</span><small>Lectura real registrada</small></article><article><b>${st.tests}</b><span>Comprensiones</span><small>Realizadas</small></article><article><b>${st.discs}</b><span>Discernimientos</span><small>Realizados</small></article><article><b>${st.saved}</b><span>Píldoras / contenidos</span><small>Guardados</small></article><article><b>${st.decisions}</b><span>Decisiones</span><small>Personales</small></article></section><section class="nextFormationStep"><div><span>TU SIGUIENTE PASO</span><h2>${esc(next)}</h2><p>${active?'Tu ruta está guardada. Continúa desde el recorrido que elegiste.':snap.latest?'Retoma tu última lectura y sigue avanzando desde allí.':'Puedes comenzar escogiendo qué área necesitas fortalecer hoy.'}</p></div><button class="btn" onclick="continueMyFormation()">Continuar mi formación</button></section><section class="formationCenterGrid"><article class="formationCenterCard"><b>🧭</b><h2>Elegir o cambiar mi ruta</h2><p>Encuentra un recorrido usando únicamente el contenido real de la Biblioteca.</p><button class="btn secondary" onclick="formationChooseRoute()">Ver necesidades de formación</button></article><article class="formationCenterCard privateInsight"><b>✍️</b><h2>Lo que Dios me está mostrando</h2><p>Un espacio privado para escribir lo que estás comprendiendo y las decisiones que quieres recordar.</p><small>${st.notes} reflexión${st.notes===1?'':'es'} guardada${st.notes===1?'':'s'} en este navegador.</small><button class="btn secondary" onclick="formationInsight()">Abrir mi espacio personal</button></article><article class="formationCenterCard"><b>📝</b><h2>Mi cuaderno</h2><p>${j.length} registro${j.length===1?'':'s'} de lectura con lo que te habló, lo que revisas y tus decisiones.</p><button class="btn secondary" onclick="journal()">Abrir mi cuaderno</button></article><article class="formationCenterCard"><b>❤️</b><h2>Mi colección</h2><p>${c.length} elemento${c.length===1?'':'s'} guardado${c.length===1?'':'s'} para volver a meditar.</p><button class="btn secondary" onclick="collection()">Abrir mi colección</button></article></section><section class="formationFooterActions"><button class="btn secondary" onclick="progress()">📊 Ver progreso completo</button><button class="btn secondary" onclick="workingOn()">🎯 Mis decisiones</button><button class="btn secondary" onclick="historyFormation()">📜 Mi historia de formación</button><button class="btn secondary" onclick="library()">← Biblioteca</button></section>`};
window.formationChooseRoute=()=>{let active=activeFormationTheme();app.innerHTML=`<section class="formationHero routeWelcome"><span class="badge">🌿 ELEGIR MI RUTA</span><h1>¿Qué necesitas fortalecer hoy?</h1><p class="muted">La Biblioteca construye cada recorrido usando únicamente contenido real de tus libros.</p>${active?`<button class="btn" onclick="formationRoute('${active.id}')">Continuar ruta actual: ${active.icon} ${esc(active.name)} →</button>`:''}</section><section class="routeThemeGrid">${formationThemes.map(t=>`<button class="routeTheme" onclick="chooseFormationRoute('${t.id}')"><b>${t.icon}</b><strong>${esc(t.name)}</strong><small>${esc(t.desc)}</small><span>Explorar ruta →</span></button>`).join('')}</section><section class="routeFooter"><button class="btn secondary" onclick="formation()">← Mi recorrido</button></section>`};


// v4.6.31 — PDFs de Recursos en IndexedDB, sin reescribir ni borrar el catálogo legado.
(function(){
  const DB='leonard_moon_recursos_pdf_v1', STORE='pdfs';
  function openDB(){return new Promise((resolve,reject)=>{const q=indexedDB.open(DB,1);q.onupgradeneeded=()=>{if(!q.result.objectStoreNames.contains(STORE))q.result.createObjectStore(STORE,{keyPath:'id'})};q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error)})}
  async function allDB(){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readonly');const q=t.objectStore(STORE).getAll();q.onsuccess=()=>resolve(q.result);q.onerror=()=>reject(q.error);t.oncomplete=()=>db.close()})}
  async function putDB(r){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).put(r);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>{db.close();reject(t.error)};t.onabort=()=>reject(t.error)})}
  async function deleteDB(id){const db=await openDB();return new Promise((resolve,reject)=>{const t=db.transaction(STORE,'readwrite');t.objectStore(STORE).delete(id);t.oncomplete=()=>{db.close();resolve()};t.onerror=()=>{db.close();reject(t.error)};t.onabort=()=>reject(t.error)})}
  let cache=[],loading=null;
  window.getIndexedResourcePDF=id=>cache.find(x=>String(x.id)===String(id))?.pdf||null;
  async function refresh(){if(loading)return loading;loading=(async()=>{try{cache=await allDB()}catch(e){console.error('No fue posible leer PDFs de IndexedDB',e);cache=[]}finally{loading=null}return cache})();return loading}
  const originalResourcesPage=window.resourcesPage;
  window.resourcesPage=async function(){await refresh();originalResourcesPage();const known=new Set(ministryResources.map(r=>r.id));for(const r of cache)if(!known.has(r.id)){ministryResources.push(r);known.add(r.id)}renderResources();enforceVisitorPermissions()};
  window.saveUploadedResource=async function(){
    const file=document.getElementById('ruFile')?.files?.[0],title=(document.getElementById('ruTitle')?.value||'').trim();
    if(!file)return alert('Seleccione primero un archivo PDF.');if(!title)return alert('Escriba el título del recurso.');
    if(file.type&&file.type!=='application/pdf'&&!file.name.toLowerCase().endsWith('.pdf'))return alert('Seleccione un archivo PDF válido.');
    if(file.size>40*1024*1024)return alert('Para esta versión utilice un PDF de hasta 40 MB.');
    const btn=document.querySelector('.resourceUploadCard button[onclick="saveUploadedResource()"]');if(btn){btn.disabled=true;btn.textContent='Guardando PDF...'}
    const r={id:'res-'+Date.now()+'-'+Math.random().toString(36).slice(2,8),titulo:title,categoria:document.getElementById('ruCat').value,libro:document.getElementById('ruBook').value,descripcion:document.getElementById('ruDesc').value,fecha:document.getElementById('ruDate').value,destacado:document.getElementById('ruFeatured').checked,tamano:(file.size/1048576).toFixed(2)+' MB',pdf:file,nombre:file.name};
    try{await putDB(r);await window.resourcesPage()}catch(e){console.error('Error guardando PDF en IndexedDB',e);alert('No se pudo guardar el PDF. Revise el espacio disponible del navegador y conserve el archivo original.');if(btn){btn.disabled=false;btn.textContent='Guardar recurso'}}
  };
  const originalView=window.viewResource,originalDownload=window.downloadResource;
  window.viewResource=function(id){const r=cache.find(x=>x.id===id);if(!r)return originalView(id);const url=URL.createObjectURL(r.pdf);const win=window.open(url,'_blank');if(!win){URL.revokeObjectURL(url);alert('Permita abrir ventanas para visualizar el PDF.')}else setTimeout(()=>URL.revokeObjectURL(url),120000)};
  window.downloadResource=function(id){const r=cache.find(x=>x.id===id);if(!r)return originalDownload(id);const url=URL.createObjectURL(r.pdf),a=document.createElement('a');a.href=url;a.download=r.nombre||'recurso.pdf';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),60000)};
  const originalDelete=window.deleteResource;
  window.deleteResource=async function(id){const r=cache.find(x=>x.id===id);if(!r)return originalDelete(id);if(!isAdminMode())return alert('Solo el administrador puede eliminar recursos.');if(!confirm('¿Eliminar definitivamente este recurso PDF?'))return;try{await deleteDB(id);await window.resourcesPage()}catch(e){console.error(e);alert('No se pudo eliminar el recurso.')}};
})();
