(function(){
/* =========================================================
PDF.JS — ESTÁNDAR ÚNICO (TODOS LOS PDFs)
Confirmado por usted:
1) Portada institucional
2) Contenido inicia limpio (sin repetir gran título)
3) Firma siempre en la última página
4) Encabezado superior solo desde página 2 en adelante

✅ ESTÁNDAR VISUAL DEFINIDO:
- SIN sombreados (NO fill en títulos/headers/filas)
- SIN contornos / cajas (NO rect en títulos/headers/celdas)
- SOLO líneas horizontales finas (separadores)
- Textos y filas NUNCA se montan (alto de fila dinámico)
- Evitar cortes por ancho: columnas ajustadas + auto-fit numérico

✅ FIX NUEVO (2026-03):
- Cuando el usuario CAMBIA el CÓDIGO visible del ítem, el PDF NO debe
asumir que ese código corresponde al código real de la base.
- Solución robusta: getAPUForProjectItem ahora:
1) intenta apuRefCode (si existe)
2) intenta code (tal cual, sin normalizar/padding)
3) si falla: busca en la BASE por DESCRIPCIÓN (match fuerte) y usa ese code real
Esto evita falsos mapeos tipo 1.9 -> 1.09 y evita “No se encontró descomposición”
cuando el usuario renumera el presupuesto.

✅ AJUSTE NUEVO (2026-03 móvil):
- Antes de exportar/compartir PDF se fuerza guardado del estado
- Cuando la app pasa a segundo plano (share sheet / WhatsApp / visor PDF),
se vuelve a forzar guardado
- En móvil, la descarga intenta abrir el PDF en pestaña aparte para evitar
que la PWA actual se desmonte

✅ AJUSTE NUEVO (2026-03 IVA PROYECTO):
- PDF IVA PROYECTO NO liquida IVA sobre MANO DE OBRA ni TRANSPORTES
- En Colombia, para esta lógica del proyecto:
* MANO DE OBRA => IVA 0%
* TRANSPORTES => IVA 0%
Las demás categorías se liquidan con la tarifa configurada del proyecto.

✅ AJUSTE NUEVO (2026-03 decimales APU):
- En el desglose de los APUs, el VR PARCIAL debe mostrarse con dos decimales.
- También el costo directo del encabezado del APU se muestra con dos decimales.

✅ AJUSTE NUEVO (2026-03 ACTAS PARCIALES):
- Se agregan utilidades PDF para:
* Acta parcial individual
* Resumen de actas parciales
* Ejecutado acumulado vs presupuesto
- Estos PDFs trabajarán sobre la estructura:
project.actasParciales = [...]
sin romper la compatibilidad de los PDFs existentes.

✅ AJUSTE NUEVO (2026-03 PRESENTACIÓN REPORTES):
- Los PDFs:
* Cantidad de recursos e insumos del presupuesto
* Distribución porcentual costos directos
* Rendimiento equipo y mano de obra por actividad
* Presupuesto de obra desagregado
* Resumen presupuesto obra desagregado
usarán formato tipo reporte horizontal / vertical según corresponda,
con encabezado simple, datos generales, tablas limpias y textos completos.

✅ AJUSTE NUEVO (2026-03 TEXTOS LARGOS):
- En todos los PDFs se debe priorizar:
* nombre del proyecto completo
* descripción completa de capítulos
* descripción completa de ítems
con salto de línea y altura dinámica para evitar cortes.
========================================================= */

// =========================
// TEMA VISUAL (GLOBAL)
// =========================
const PDF_THEME = {
safe: {
top: 54,
bottom: 64
},
lines: {
header: { w: 0.55, c: 120 },
row: { w: 0.35, c: 200 },
band: { w: 0.55, c: 160 }
}
};

// =========================
// Formateadores / helpers
// =========================
function moneyCOP(n){ return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO"); }
function moneyCOP0(n){ return "$ " + Math.round(Number(n||0)).toLocaleString("es-CO"); }
function moneyCOP2(n){
const v = Number(n||0);
return "$ " + v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmt2(n){
const v = Number(n||0);
return v.toLocaleString("es-CO", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function fmt0(n){
const v = Number(n||0);
return Math.round(v).toLocaleString("es-CO");
}
function fmtQty(n){
const v = Number(n||0);
return v.toLocaleString("es-CO", { minimumFractionDigits: 0, maximumFractionDigits: 6 });
}
function safe(s){ return String(s||""); }

function sanitizeName(s){
return String(s||"archivo")
.replace(/[^\w\d]+/g,"_")
.replace(/^_+|_+$/g,"")
.slice(0,60) || "archivo";
}

function buildFilename(project, suffix=""){
const name = sanitizeName(project?.name || "proyecto");
return `Presupuesto_${name}${suffix ? "_"+suffix : ""}_${Date.now()}.pdf`;
}
function buildFilenameSpecs(project){
const name = sanitizeName(project?.name || "proyecto");
return `Especificaciones_Tecnicas_${name}_${Date.now()}.pdf`;
}
function buildFilenameDesagregado(project){
const name = sanitizeName(project?.name || "proyecto");
return `Presupuesto_Obra_Desagregado_${name}_${Date.now()}.pdf`;
}
function buildFilenameResumenDesagregado(project){
const name = sanitizeName(project?.name || "proyecto");
return `Resumen_Presupuesto_Obra_Desagregado_${name}_${Date.now()}.pdf`;
}
function buildFilenameDistribucionPctDirectos(project){
const name = sanitizeName(project?.name || "proyecto");
return `Distribucion_Porcentual_Costos_Directos_${name}_${Date.now()}.pdf`;
}
function buildFilenameRendimientos(project){
const name = sanitizeName(project?.name || "proyecto");
return `Rendimiento_Equipo_Mano_Obra_Por_Actividad_${name}_${Date.now()}.pdf`;
}
function buildFilenameResumenMaterialesActividad(project){
const name = sanitizeName(project?.name || "proyecto");
return `Resumen_Materiales_Por_Actividad_${name}_${Date.now()}.pdf`;
}
function buildFilenameCantRecursosInsumos(project){
const name = sanitizeName(project?.name || "proyecto");
return `Cantidad_Recursos_Insumos_Presupuesto_${name}_${Date.now()}.pdf`;
}
function buildFilenameIvaProyecto(project){
const name = sanitizeName(project?.name || "proyecto");
return `IVA_Proyecto_${name}_${Date.now()}.pdf`;
}

// ===== NUEVO: filenames ACTAS =====
function buildFilenameActaParcial(project, acta){
const name = sanitizeName(project?.name || "proyecto");
const num = sanitizeName(acta?.numero || "acta");
return `Acta_Parcial_${num}_${name}_${Date.now()}.pdf`;
}
function buildFilenameResumenActas(project){
const name = sanitizeName(project?.name || "proyecto");
return `Resumen_Actas_Parciales_${name}_${Date.now()}.pdf`;
}
function buildFilenameEjecutadoVsPresupuesto(project){
const name = sanitizeName(project?.name || "proyecto");
return `Ejecutado_vs_Presupuesto_${name}_${Date.now()}.pdf`;
}

function newDoc(options){
if(!window.jspdf?.jsPDF) throw new Error("jsPDF no está cargado.");
const { jsPDF } = window.jspdf;

const o = options || {};
const orientation = o.orientation || "portrait";

const doc = new jsPDF({
unit: "pt",
format: "letter",
orientation
});

try{
doc.setTextColor(0);
doc.setDrawColor(0);
doc.setFillColor(255,255,255);
}catch(_){}

return doc;
}

function getPageSize(doc){
const w = doc.internal?.pageSize?.getWidth ? doc.internal.pageSize.getWidth() : 612;
const h = doc.internal?.pageSize?.getHeight ? doc.internal.pageSize.getHeight() : 792;
return { w, h };
}

// =========================
// Persistencia móvil / guards
// =========================
let __pdfPersistHooksInstalled = false;

function sleep(ms){
return new Promise(res => setTimeout(res, ms));
}

function forcePersistAppState(){
try{
if(window.StorageAPI?.loadStore && window.StorageAPI?.saveStore){
const db = StorageAPI.loadStore();
StorageAPI.saveStore(db);
}
}catch(err){
console.warn("[PDF] No se pudo forzar persistencia StorageAPI:", err);
}

try{
if(navigator.storage && typeof navigator.storage.persist === "function"){
navigator.storage.persist().catch(()=>{});
}
}catch(_){}

try{
sessionStorage.setItem("presupuesto_contable_last_pdf_ts", String(Date.now()));
sessionStorage.setItem("presupuesto_contable_last_url", String(location.href || ""));
}catch(_){}
}

function installPersistHooksOnce(){
if(__pdfPersistHooksInstalled) return;
__pdfPersistHooksInstalled = true;

const persistNow = ()=>{
try{ forcePersistAppState(); }catch(_){}
};

try{
document.addEventListener("visibilitychange", ()=>{
if(document.visibilityState === "hidden"){
persistNow();
}
}, { passive:true });
}catch(_){}

try{
window.addEventListener("pagehide", persistNow, { passive:true });
}catch(_){}

try{
window.addEventListener("beforeunload", persistNow, { passive:true });
}catch(_){}

try{
window.addEventListener("blur", persistNow, { passive:true });
}catch(_){}
}

function isMobileLike(){
try{
const ua = navigator.userAgent || "";
return /Android|iPhone|iPad|iPod|Mobile/i.test(ua);
}catch(_){
return false;
}
}

// =========================
// Líneas / Auto-fit / Column-fit
// =========================
function hLine(doc, x1, x2, y, w=0.35, c=200){
doc.setDrawColor(c);
doc.setLineWidth(w);
doc.line(x1, y, x2, y);
doc.setLineWidth(0.2);
doc.setDrawColor(0);
}

function fitColsToWidth(cols, targetW, minW=18){
const total = cols.reduce((s,c)=>s + (Number(c.w)||0), 0);
if(total === targetW) return cols;

if(total < targetW){
const out = cols.map(c=>({ ...c }));
const idx = out.findIndex(c => String(c.key||c.k||"") === "desc" || String(c.key||c.k||"") === "description");
const useIdx = idx >= 0 ? idx : (out.length-1);
out[useIdx].w = Math.max(minW, (out[useIdx].w||0) + (targetW-total));
return out;
}

const scale = targetW / total;
let acc = 0;
const out = cols.map((c,i)=>{
const w = (i === cols.length-1) ? 0 : Math.max(minW, Math.floor((Number(c.w)||0)*scale));
acc += w;
return { ...c, w };
});
out[out.length-1].w = Math.max(minW, Math.floor(targetW - acc));
return out;
}

function fitTextRight(doc, text, maxW, baseFs, minFs=6.2){
let fs = baseFs;
doc.setFontSize(fs);
while(fs > minFs && doc.getTextWidth(String(text)) > maxW){
fs -= 0.2;
doc.setFontSize(fs);
}
return fs;
}

function splitToLines(doc, text, maxW, maxLines){
const lines = doc.splitTextToSize(safe(text), maxW);
if(!maxLines) return lines;
return lines.slice(0, maxLines);
}

function splitToLinesFull(doc, text, maxW){
return doc.splitTextToSize(safe(text), maxW);
}

function textBlockHeight(lines, lineH=10, padTop=8, padBottom=4){
const n = Array.isArray(lines) ? lines.length : 1;
return padTop + (n * lineH) + padBottom;
}

function isAccesoriosPercentLine(ln){
const d = String(ln?.desc || "").toLowerCase();
const u = String(ln?.unit || "").trim().toLowerCase();
return d.includes("accesorios") && (d.includes("%") || u === "%");
}

// =========================
// Helpers de encabezado tipo reporte
// =========================
function formatDateTimeShort(d){
try{
const dt = d ? new Date(d) : new Date();
return dt.toLocaleString("es-CO");
}catch(_){
return new Date().toLocaleString("es-CO");
}
}

function projectDisplayName(project){
return safe(project?.instProyectoLabel || project?.name || "PROYECTO");
}

function projectEntityName(project){
return safe(project?.instEntidad || project?.entity || "—");
}

function projectLocationName(project){
return safe(project?.location || project?.instMunicipio || "—");
}

function drawSimpleReportHeader(doc, L, title, project, opts){
const o = opts || {};
const pageNow = doc.getCurrentPageInfo ? doc.getCurrentPageInfo().pageNumber : 1;
const margin = L.margin;
const contentW = L.contentW;
const rightX = margin + contentW;
const projectName = projectDisplayName(project);
const generatedAt = formatDateTimeShort(o.generatedAt || new Date());

const titleLines = splitToLinesFull(doc, safe(title || ""), contentW - 180);
const projLines = splitToLinesFull(doc, safe(projectName), contentW - 180);

doc.setFont("helvetica","bold");
doc.setFontSize(11);

let y = L.getY();
doc.text(titleLines, margin, y);

doc.setFont("helvetica","normal");
doc.setFontSize(10);
doc.text(generatedAt, rightX, y, { align:"right" });

y += Math.max(14, titleLines.length * 11);

doc.setFont("helvetica","bold");
doc.setFontSize(10.5);
doc.text(projLines, margin, y);

y += Math.max(12, projLines.length * 10);

hLine(doc, margin, rightX, y, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
y += 16;

if(o.showDatosGenerales !== false){
doc.setFont("helvetica","bold");
doc.setFontSize(10);
doc.text("DATOS GENERALES", margin, y);
y += 14;

doc.setFont("helvetica","normal");
doc.setFontSize(9.8);

const dataLines = [];
dataLines.push(`Proyecto: ${projectName}`);
if(o.includeEntity) dataLines.push(`Entidad: ${projectEntityName(project)}`);
if(o.includeLocation) dataLines.push(`Ubicación: ${projectLocationName(project)}`);
dataLines.push(`Fecha generación: ${generatedAt}`);

for(const ln of dataLines){
const parts = splitToLinesFull(doc, ln, contentW);
doc.text(parts, margin, y);
y += Math.max(12, parts.length * 10);
}

y += 10;
}

if(pageNow === 1 && o.forceOnCurrentPage){
L.setY(y);
}else{
L.setY(y);
}
}

function drawReportFooterPageNumber(doc){
const pageCount = doc.getNumberOfPages();
const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);
const marginX = 44;

for(let p=1; p<=pageCount; p++){
doc.setPage(p);
doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, PAGE_H - 44, PAGE_W - marginX, PAGE_H - 44);
doc.setLineWidth(0.2);
doc.setFont("helvetica","normal");
doc.setFontSize(9);
doc.text(`Página ${p} de ${pageCount}`, PAGE_W/2, PAGE_H - 28, { align:"center" });
}
}

function stampSimpleReportHeaderFooter(doc, { docType, projectName, logoDataUrl }){
const pageCount = doc.getNumberOfPages();
const marginX = 44;
const now = new Date().toLocaleString();

for(let p=1; p<=pageCount; p++){
doc.setPage(p);
const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);

try{
doc.setTextColor(0);
doc.setDrawColor(0);
}catch(_){}

doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, PAGE_H - 44, PAGE_W - marginX, PAGE_H - 44);
doc.setLineWidth(0.2);

doc.setFont("helvetica","normal");
doc.setFontSize(9);
doc.text(`Página ${p} de ${pageCount}`, PAGE_W/2, PAGE_H - 28, { align:"center" });

if(p === 1) continue;

let headerY = 26;
let textStartX = marginX;

if(logoDataUrl){
const ok = tryAddImage(doc, logoDataUrl, marginX, 12, 50, 20);
if(ok) textStartX = marginX + 58;
}

doc.setFont("helvetica","bold");
doc.setFontSize(9.5);

const titleLines = doc.splitTextToSize(safe(docType), PAGE_W - textStartX - 180);
doc.text(titleLines, textStartX, headerY);

doc.setFont("helvetica","normal");
doc.setFontSize(8.8);

const projLines = doc.splitTextToSize(safe(projectName), PAGE_W - textStartX - 180);
const projY = headerY + Math.max(10, titleLines.length * 9);
doc.text(projLines, textStartX, projY);

doc.text(now, PAGE_W - marginX, 26, { align:"right" });

const lineY = Math.max(projY + Math.max(8, projLines.length * 8), 42);
doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, lineY, PAGE_W - marginX, lineY);
doc.setLineWidth(0.2);
}
}

// =========================
// Layout base
// =========================
function mkLayout(doc){
const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);
const margin = 44;
const contentW = PAGE_W - margin*2;
let y = (PDF_THEME?.safe?.top ?? 54);

function ensure(h){
const bottomLimit = PAGE_H - (PDF_THEME?.safe?.bottom ?? 64);
if(y + h > bottomLimit){
doc.addPage();
try{
doc.setTextColor(0);
doc.setDrawColor(0);
doc.setFillColor(255,255,255);
}catch(_){}
y = (PDF_THEME?.safe?.top ?? 54);
return true;
}
return false;
}

function setY(v){ y = v; }
function getY(){ return y; }

function p(t){
doc.setFont("helvetica","normal");
doc.setFontSize(10);
const lines = doc.splitTextToSize(safe(t), contentW);
const h = lines.length*13 + 8;
ensure(h);
doc.text(lines, margin, y);
y += lines.length*13 + 6;
}

function row(label,value){
ensure(18);
doc.setFont("helvetica","bold"); doc.setFontSize(10);
doc.text(safe(label), margin, y);
doc.setFont("helvetica","normal");
doc.text(safe(value), margin + 260, y);
y += 16;
}

function line(){
ensure(12);
hLine(doc, margin, margin+contentW, y, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
y += 12;
}

const col = {
item: margin + 0,
desc: margin + 62,
parc: margin + contentW,
qty: margin + contentW - 70,
pu: margin + contentW - 150,
unit: margin + contentW - 230
};
const DESC_W = (col.unit - col.desc) - 12;

function tableHeaderPresupuesto(){
const yTop = y;
const h = 18;
ensure(h + 8);

doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
const baseY = yTop + 12;

doc.text("ITEM", col.item, baseY);
doc.text("DESCRIPCIÓN", col.desc, baseY);
doc.text("UNID", col.unit, baseY);
doc.text("VR UNIT", col.pu, baseY, { align:"right" });
doc.text("CANT", col.qty, baseY, { align:"right" });
doc.text("VR PARCIAL", col.parc, baseY, { align:"right" });

hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);

y = yTop + h + 8;
}

function tableRowPresupuesto(it){
const parcial = Number(it.pu||0) * Number(it.qty||0);
const item = safe(it.code);
const unit = safe(it.unit);

doc.setFont("helvetica","normal"); doc.setFontSize(9.2);
const descLines = doc.splitTextToSize(safe(it.desc), DESC_W);

const lineH = 11;
const rowH = Math.max(18, 8 + (descLines.length * lineH));
const jumped = ensure(rowH + 10);
if(jumped) tableHeaderPresupuesto();

const yTop = y;
const baseY = yTop + 12;

doc.setFont("helvetica","bold");
doc.text(item, col.item, baseY);

doc.setFont("helvetica","normal");
doc.text(descLines, col.desc, baseY);

doc.text(unit, col.unit, baseY);
doc.text(moneyCOP(it.pu), col.pu, baseY, { align:"right" });
doc.text(safe(it.qty), col.qty, baseY, { align:"right" });

doc.setFont("helvetica","bold");
doc.text(moneyCOP(parcial), col.parc, baseY, { align:"right" });

hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
y = yTop + rowH + 2;
}

function shortGroup(g){
const s = safe(g).trim();
if(!s) return "-";
const up = s.toUpperCase();
if(up.includes("EQUIPO") && up.includes("HERRAM")) return "EQUIPO/HERR.";
if(up.includes("MANO") && up.includes("OBRA")) return "MANO OBRA";
if(up.includes("MATERIAL")) return "MATERIALES";
if(up.includes("TRANSP")) return "TRANSPORTES";
return s.length > 16 ? (s.slice(0,16) + "…") : s;
}

const aCol = {
grp: margin + 0,
desc: margin + 150,
parc: margin + contentW,
pu: margin + contentW - 110,
qty: margin + contentW - 180,
unit: margin + contentW - 240
};
const A_DESC_W = (aCol.unit - aCol.desc) - 12;

function tableHeaderAPU(){
const yTop = y;
const h = 18;
ensure(h + 8);

doc.setFont("helvetica","bold"); doc.setFontSize(9.2);
const baseY = yTop + 12;

doc.text("GRUPO", aCol.grp, baseY);
doc.text("DESCRIPCIÓN", aCol.desc, baseY);
doc.text("UNID", aCol.unit, baseY);
doc.text("CANT", aCol.qty, baseY, { align:"right" });
doc.text("VR UNIT", aCol.pu, baseY, { align:"right" });
doc.text("VR PARCIAL", aCol.parc, baseY, { align:"right" });

hLine(doc, margin, margin+contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
y = yTop + h + 8;
}

function tableRowAPU(lineObj){
const grpRaw = safe(lineObj.group || lineObj.tipo || "-");
const grp = shortGroup(grpRaw);
const unit = safe(lineObj.unit || "");
const qty = Number(lineObj.qty||0);
const pu = Number(lineObj.pu||0);
const parcial = Number(lineObj.parcial||0) || (qty * pu);

doc.setFont("helvetica","normal"); doc.setFontSize(9.2);
const descLines = doc.splitTextToSize(safe(lineObj.desc), A_DESC_W);

const lineH = 11;
const rowH = Math.max(18, 8 + (descLines.length * lineH));
const jumped = ensure(rowH + 10);
if(jumped) tableHeaderAPU();

const yTop = y;
const baseY = yTop + 12;

doc.setFont("helvetica","normal");
doc.text(grp, aCol.grp, baseY);
doc.text(descLines, aCol.desc, baseY);

doc.text(unit, aCol.unit, baseY);
doc.text(String(qty||0), aCol.qty, baseY, { align:"right" });
doc.text(moneyCOP(pu), aCol.pu, baseY, { align:"right" });

doc.setFont("helvetica","bold");
doc.text(moneyCOP2(parcial), aCol.parc, baseY, { align:"right" });

hLine(doc, margin, margin+contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
y = yTop + rowH + 2;
}

return {
PAGE_W, PAGE_H, margin, contentW,
getY, setY,
ensure, p, row, line,
tableHeaderPresupuesto, tableRowPresupuesto,
tableHeaderAPU, tableRowAPU
};
}

function drawBand(doc, x, y, w, h, text, opts){
const o = opts || {};
const fs = o.fontSize || 10;
const bold = (o.bold !== false);

doc.setTextColor(0);
doc.setFont("helvetica", bold ? "bold" : "normal");
doc.setFontSize(fs);

const lines = doc.splitTextToSize(safe(text), w - 4);
doc.text(lines, x, y + 12);

const usedH = Math.max(h, 8 + lines.length * 10);
hLine(doc, x, x+w, y + usedH - 2, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
}

function drawCellText(doc, x, y, w, h, text, align, opts){
const o = opts || {};
const fs = o.fontSize || 7.2;
const pad = o.pad ?? 2;

doc.setFont("helvetica", o.bold ? "bold" : "normal");
doc.setFontSize(fs);

const tx = (align === "right") ? (x + w - pad)
: (align === "center") ? (x + w/2)
: (x + pad);

if(Array.isArray(text)){
const startY = y + pad + fs;
doc.text(text, tx, startY, { align: align || "left" });
}else{
const baseY = y + pad + fs;
doc.text(safe(text), tx, baseY, { align: align || "left" });
}
}

function imageTypeFromDataUrl(dataUrl){
const s = String(dataUrl||"");
if(s.startsWith("data:image/png")) return "PNG";
if(s.startsWith("data:image/jpeg") || s.startsWith("data:image/jpg")) return "JPEG";
if(s.startsWith("data:image/webp")) return "WEBP";
return "";
}

function tryAddImage(doc, dataUrl, x, y, w, h){
const t = imageTypeFromDataUrl(dataUrl);
if(!dataUrl || !t) return false;
try{
doc.addImage(String(dataUrl), t, x, y, w, h);
return true;
}catch(_){
return false;
}
}

function stampHeaderFooter(doc, { docType, projectName, logoDataUrl }){
const pageCount = doc.getNumberOfPages();
const marginX = 44;
const now = new Date().toLocaleString();

const headerTop = 14;
const headerLineY = 42;

const logoW = 64;
const logoH = 24;

for(let p=1; p<=pageCount; p++){
doc.setPage(p);
const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);

try{
doc.setTextColor(0);
doc.setDrawColor(0);
}catch(_){}

doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, PAGE_H - 44, PAGE_W - marginX, PAGE_H - 44);
doc.setLineWidth(0.2);

doc.setFont("helvetica","normal");
doc.setFontSize(9);
doc.text(`Página ${p} de ${pageCount}`, PAGE_W/2, PAGE_H - 28, { align:"center" });

if(p === 1) continue;

doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, headerLineY, PAGE_W - marginX, headerLineY);
doc.setLineWidth(0.2);

let textStartX = marginX;
if(logoDataUrl){
const ok = tryAddImage(doc, logoDataUrl, marginX, headerTop, logoW, logoH);
if(ok) textStartX = marginX + logoW + 10;
}

doc.setFont("helvetica","bold");
doc.setFontSize(9.5);

const docTypeLines = doc.splitTextToSize(safe(docType), PAGE_W - textStartX - 150);
doc.text(docTypeLines, textStartX, 28);

doc.setFont("helvetica","normal");
doc.setFontSize(9.2);

const projLines = doc.splitTextToSize(safe(projectName), PAGE_W - textStartX - 150);
const projY = 28 + Math.max(10, docTypeLines.length * 8);
if(projectName) doc.text(projLines, textStartX, projY);

doc.text(now, PAGE_W - marginX, 28, { align:"right" });
}
}

function dateLongEsCO(d){
const dt = (d instanceof Date) ? d : new Date(d || Date.now());
const meses = ["enero","febrero","marzo","abril","mayo","junio","julio","agosto","septiembre","octubre","noviembre","diciembre"];
return `${dt.getDate()} de ${meses[dt.getMonth()]} de ${dt.getFullYear()}`;
}
function up(s){ return String(s||"").trim().toUpperCase(); }

function getInstitutionHeader(project){
const country = up(project?.instPais || "REPÚBLICA DE COLOMBIA");

const deptRaw = up(project?.instDepto || "");
const deptLine = deptRaw
? (deptRaw.includes("DEPARTAMENTO") ? deptRaw : ("DEPARTAMENTO DE " + deptRaw))
: "DEPARTAMENTO DE —";

const muniRaw = up(project?.instMunicipio || "");
const muniLine = muniRaw
? (muniRaw.includes("MUNICIPIO") ? muniRaw : ("MUNICIPIO DE " + muniRaw))
: "MUNICIPIO DE —";

return { country, deptLine, muniLine };
}

function drawInstitutionalCover(doc, L, project, docTitle){
try{
doc.setFillColor(255,255,255);
doc.rect(0,0,L.PAGE_W,L.PAGE_H,"F");
doc.setTextColor(0);
doc.setDrawColor(0);
}catch(_){}

const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;

const entidadContratante = String(project?.instEntidad || project?.entity || "—");
const ubicacion = String(project?.location || "—");

const fechaElabRaw = String(project?.instFechaElab || "");
const fechaElab = fechaElabRaw ? fechaElabRaw : dateLongEsCO(new Date());

const projectLabel = String(project?.instProyectoLabel || project?.name || "PROYECTO");
const projectNameUpper = up(projectLabel);

const { country, deptLine, muniLine } = getInstitutionHeader(project);

const logo = String(project?.logoDataUrl || "");
if(logo){
const w = 160, h = 60;
const x = (L.PAGE_W - w)/2;
const yLogo = 44;
tryAddImage(doc, logo, x, yLogo, w, h);
}

let y = 130;
if(logo) y = 160;

doc.setFont("helvetica","bold"); doc.setFontSize(12);
doc.text(country, L.PAGE_W/2, y, { align:"center" }); y += 18;
doc.text(deptLine, L.PAGE_W/2, y, { align:"center" }); y += 18;
doc.text(muniLine, L.PAGE_W/2, y, { align:"center" }); y += 30;

doc.setFont("helvetica","bold"); doc.setFontSize(14);
const titleLines = doc.splitTextToSize(up(docTitle||""), L.contentW);
doc.text(titleLines, L.PAGE_W/2, y, { align:"center" });
y += Math.max(22, titleLines.length * 14);

doc.setFont("helvetica","bold"); doc.setFontSize(12);
const projCoverLines = doc.splitTextToSize(`PROYECTO: ${projectNameUpper}`, L.contentW);
doc.text(projCoverLines, L.PAGE_W/2, y, { align:"center" });
y += Math.max(26, projCoverLines.length * 12) + 12;

doc.setFont("helvetica","normal"); doc.setFontSize(11);

const eLines = doc.splitTextToSize(`Entidad Contratante: ${entidadContratante}`, L.contentW);
doc.text(eLines, L.margin, y); y += Math.max(16, eLines.length * 11);

const uLines = doc.splitTextToSize(`Ubicación: ${ubicacion}`, L.contentW);
doc.text(uLines, L.margin, y); y += Math.max(16, uLines.length * 11);

const fLines = doc.splitTextToSize(`Fecha de Elaboración: ${fechaElab}`, L.contentW);
doc.text(fLines, L.margin, y); y += Math.max(16, fLines.length * 11);

if(elab && (elab.nombre || elab.profesion || elab.matricula)){
y += 6;
if(elab.nombre){
const ln = doc.splitTextToSize(`Elaboró: ${elab.nombre}`, L.contentW);
doc.text(ln, L.margin, y); y += Math.max(14, ln.length * 11);
}
if(elab.profesion){
const ln = doc.splitTextToSize(`Profesión: ${elab.profesion}`, L.contentW);
doc.text(ln, L.margin, y); y += Math.max(14, ln.length * 11);
}
if(elab.matricula){
const ln = doc.splitTextToSize(`Matrícula Profesional: ${elab.matricula}`, L.contentW);
doc.text(ln, L.margin, y); y += Math.max(14, ln.length * 11);
}
}
}

function loadImage(dataUrl){
return new Promise((res, rej)=>{
const img = new Image();
img.onload = ()=>res(img);
img.onerror = ()=>rej(new Error("No se pudo cargar la imagen de firma."));
img.src = dataUrl;
});
}

async function firmaToBlackOnWhitePNG(firmaDataUrl){
if(!firmaDataUrl || !String(firmaDataUrl).startsWith("data:image")) return "";
try{
const img = await loadImage(String(firmaDataUrl));
const w = Math.max(1, img.naturalWidth || img.width || 1);
const h = Math.max(1, img.naturalHeight || img.height || 1);

const c = document.createElement("canvas");
c.width = w; c.height = h;

const ctx = c.getContext("2d", { willReadFrequently:true });
ctx.fillStyle = "#ffffff";
ctx.fillRect(0,0,w,h);
ctx.drawImage(img, 0, 0, w, h);

const im = ctx.getImageData(0,0,w,h);
const d = im.data;

const TH = 120;
for(let i=0; i<d.length; i+=4){
const r = d[i], g = d[i+1], b = d[i+2];
const lum = (r*0.2126 + g*0.7152 + b*0.0722);
if(lum < TH){
d[i] = 255; d[i+1] = 255; d[i+2] = 255; d[i+3] = 255;
}else{
d[i] = 0; d[i+1] = 0; d[i+2] = 0; d[i+3] = 255;
}
}

ctx.putImageData(im,0,0);
return c.toDataURL("image/png");
}catch(_){
return "";
}
}

async function appendElaboradorFirma(doc, L){
const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;
const nombre = elab?.nombre ? String(elab.nombre) : "";
const profesion = elab?.profesion ? String(elab.profesion) : "";
const matricula = elab?.matricula ? String(elab.matricula) : "";
const firmaDataUrl = elab?.firmaDataUrl ? String(elab.firmaDataUrl) : "";

const need = 240;
L.ensure(need);

const boxX = L.margin;
const boxW = 520;

const sigX = boxX;
const sigY = L.getY() + 10;
const sigW = 320;
const sigH = 95;

doc.setFont("helvetica","normal"); doc.setFontSize(11);
doc.text("Firma:", sigX, sigY - 6);

let firmaForPDF = "";
if(firmaDataUrl && firmaDataUrl.startsWith("data:image")){
firmaForPDF = await firmaToBlackOnWhitePNG(firmaDataUrl);
}

if(firmaForPDF){
try{
doc.setFillColor(255,255,255);
doc.rect(sigX+1, sigY+1, sigW-2, sigH-2, "F");
doc.addImage(firmaForPDF, "PNG", sigX+8, sigY+8, sigW-16, sigH-16);
}catch(_){}
}

const lineY = sigY + sigH + 55;

doc.setDrawColor(0);
doc.setLineWidth(0.8);
doc.line(boxX, lineY, boxX + boxW, lineY);
doc.setLineWidth(0.2);

doc.setFont("helvetica","bold"); doc.setFontSize(11);
doc.text(nombre || "____________________________", boxX, lineY + 18);

doc.setFont("helvetica","normal"); doc.setFontSize(11);
let yy = lineY + 34;
if(profesion){
const ln = doc.splitTextToSize(profesion, boxW);
doc.text(ln, boxX, yy);
yy += Math.max(14, ln.length * 11);
}
if(matricula){
const ln = doc.splitTextToSize(`M.P. ${matricula}`, boxW);
doc.text(ln, boxX, yy);
yy += Math.max(14, ln.length * 11);
}

L.setY(Math.max(L.getY(), yy + 10));
}

function pct(project, key, legacyKey){
const v = project?.[key];
if(Number.isFinite(Number(v))) return Number(v);
const lv = legacyKey ? project?.[legacyKey] : undefined;
if(Number.isFinite(Number(lv))) return Number(lv);
return 0;
}

function totalsCompat(project){
const t = (window.Calc && typeof Calc.calcTotals === "function") ? (Calc.calcTotals(project) || {}) : {};
const directo = Number(t.directo||0);

if(("admin" in t) || ("imprev" in t) || ("util" in t) || ("ivaUtil" in t) || ("subtotal" in t)){
return {
directo,
admin: Number(t.admin||0),
imprev: Number(t.imprev||0),
util: Number(t.util||0),
subtotal: Number(t.subtotal||0),
ivaUtil: Number(t.ivaUtil||0),
total: Number(t.total||0)
};
}

const aiu = Number(t.aiu||0);
const iva = Number(t.iva||0);
const total = Number(t.total|| (directo + aiu + iva));
return {
directo,
admin: aiu,
imprev: 0,
util: 0,
subtotal: directo + aiu,
ivaUtil: iva,
total
};
}

// =========================
// Helpers para ACTAS PARCIALES
// =========================
function getProjectActas(project){
return Array.isArray(project?.actasParciales) ? project.actasParciales.slice() : [];
}

function getActaLines(acta){
return Array.isArray(acta?.lines) ? acta.lines.slice() : [];
}

function actaEstado(acta){
return String(acta?.estado || "BORRADOR").trim().toUpperCase();
}

function actaNumero(acta){
return String(acta?.numero || "").trim() || "—";
}

function actaFecha(acta){
return String(acta?.fecha || "").slice(0,10);
}

function actaPeriodo(acta){
return String(acta?.periodo || "").trim() || "—";
}

function actaObservacion(acta){
return String(acta?.observacion || "").trim();
}

function actaLineParcial(line){
const qty = Number(line?.qtyActa ?? line?.qty ?? 0);
const pu = Number(line?.pu ?? 0);
const parcial = Number(line?.vrParcialActa ?? line?.parcial ?? 0);
return parcial || (qty * pu);
}

function actaTotal(acta){
const own = Number(acta?.totalValor || 0);
if(own > 0) return own;
return getActaLines(acta).reduce((s,ln)=> s + actaLineParcial(ln), 0);
}

function sortActas(list){
return (list || []).slice().sort((a,b)=>{
const fa = String(a?.fecha || "");
const fb = String(b?.fecha || "");
if(fa !== fb) return fb.localeCompare(fa, "es");
return String(a?.numero || "").localeCompare(String(b?.numero || ""), "es", { numeric:true });
});
}

function calcActasAcumuladas(project){
const actas = getProjectActas(project);
const acc = new Map();

for(const acta of actas){
for(const ln of getActaLines(acta)){
const code = String(ln?.code || "").trim();
if(!code) continue;
const prev = Number(acc.get(code) || 0);
const qtyActa = Number(ln?.qtyActa ?? ln?.qty ?? 0);
acc.set(code, prev + qtyActa);
}
}
return acc;
}

function calcActasResumen(project){
const actas = sortActas(getProjectActas(project));
const acumuladoPorItem = calcActasAcumuladas(project);
const items = Array.isArray(project?.items) ? project.items.slice() : [];

const rowsVsPres = items.map(it=>{
const code = String(it?.code || "").trim();
const qtyPres = Number(it?.qty || 0);
const qtyEj = Number(acumuladoPorItem.get(code) || 0);
const saldo = qtyPres - qtyEj;
const pu = Number(it?.pu || 0);
return {
chapterCode: String(it?.chapterCode || ""),
chapterName: String(it?.chapterName || ""),
code,
desc: String(it?.desc || ""),
unit: String(it?.unit || ""),
qtyPresupuesto: qtyPres,
qtyEjecutada: qtyEj,
saldo,
pu,
vrPresupuesto: qtyPres * pu,
vrEjecutado: qtyEj * pu
};
});

const totalActas = actas.reduce((s,a)=> s + actaTotal(a), 0);
const totalEjecutado = rowsVsPres.reduce((s,r)=> s + Number(r.vrEjecutado || 0), 0);
const totalPresupuesto = rowsVsPres.reduce((s,r)=> s + Number(r.vrPresupuesto || 0), 0);

return {
actas,
rowsVsPres,
totalActas,
totalEjecutado,
totalPresupuesto
};
}

const __apuDescCache = new Map();

function normDesc(s){
return String(s||"")
.toLowerCase()
.normalize("NFD").replace(/[\u0300-\u036f]/g,"")
.replace(/[^\w\s]+/g," ")
.replace(/\s+/g," ")
.trim();
}

function tokenSet(s){
const t = normDesc(s);
if(!t) return new Set();
const parts = t.split(" ").filter(p=>p.length>=3);
return new Set(parts);
}

function jaccard(aSet, bSet){
if(!aSet.size && !bSet.size) return 0;
let inter = 0;
for(const x of aSet){ if(bSet.has(x)) inter++; }
const uni = aSet.size + bSet.size - inter;
return uni ? (inter/uni) : 0;
}

async function findApuCodeByDesc(desc, unit){
const d = normDesc(desc);
const u = String(unit||"").trim().toLowerCase();
if(!d) return "";

const cacheKey = d + "|" + u;
if(__apuDescCache.has(cacheKey)) return __apuDescCache.get(cacheKey) || "";

if(!window.APUBase || typeof APUBase.search !== "function"){
__apuDescCache.set(cacheKey, "");
return "";
}

try{
const results = await APUBase.search(desc, 35);
const list = Array.isArray(results) ? results : [];
const candidates = list.filter(r => r && !r.isChapter && r.code && r.desc);

if(!candidates.length){
__apuDescCache.set(cacheKey, "");
return "";
}

for(const r of candidates){
const rNorm = normDesc(String(r.desc||""));
const rUnit = String(r.unit||"").trim().toLowerCase();
if(rNorm === d){
if(!u || (rUnit && rUnit === u)){
const exactCode = String(r.code||"").trim();
__apuDescCache.set(cacheKey, exactCode);
return exactCode;
}
}
}

const targetTokens = tokenSet(desc);

let best = null;
let bestScore = 0;

for(const r of candidates){
const rDesc = String(r.desc||"");
const rUnit = String(r.unit||"").trim().toLowerCase();
const rNorm = normDesc(rDesc);

const sTok = jaccard(targetTokens, tokenSet(rDesc));
const sExact = (rNorm === d) ? 0.55 : 0;
const sUnit = (u && rUnit && u === rUnit) ? 0.12 : 0;
const sContain = (rNorm.includes(d) || d.includes(rNorm)) ? 0.10 : 0;

const score = sTok + sExact + sUnit + sContain;

if(score > bestScore){
bestScore = score;
best = r;
}
}

const OK = best && bestScore >= 0.62;
const foundCode = OK ? String(best.code||"").trim() : "";

__apuDescCache.set(cacheKey, foundCode);
return foundCode;
}catch(_){
__apuDescCache.set(cacheKey, "");
return "";
}
}

async function getAPUForProjectItem(project, it){
const c1 = String(it?.apuRefCode || "").trim();
const c2 = String(it?.code || "").trim();

const candidates = [];
for(const c of [c1, c2]){
if(c && !candidates.includes(c)) candidates.push(c);
}

function looksLikeSameAPU(expectedDesc, expectedUnit, apuSubtitle){
const ed = String(expectedDesc||"").trim();
if(!ed) return true;
const a = tokenSet(ed);
const b = tokenSet(String(apuSubtitle||"").trim() || "");
const sim = jaccard(a,b);
if(sim < 0.30) return false;
return true;
}

async function tryByCode(apuCode){
if(!apuCode) return null;

try{
if(window.StorageAPI?.getApuOverride){
const ov = StorageAPI.getApuOverride(project.id, apuCode);
if(ov){
const lines = Array.isArray(ov.lines) ? ov.lines : [];
const directo = lines.reduce((s,l)=>{
const qty = Number(l.qty||0);
const pu = Number(l.pu||0);
const parcial = Number(l.parcial||0) || (qty*pu);
return s + parcial;
}, 0);

if(!looksLikeSameAPU(it?.desc, it?.unit, ov.desc || it?.desc)){
return null;
}

return {
_src: "override",
_match: "code",
code: apuCode,
subtitle: String(ov.desc || it.desc || "").trim(),
unit: String(ov.unit || it.unit || "").trim(),
directo,
lines
};
}
}
}catch(_){}

try{
const custom = window.StorageAPI?.getCustomAPU ? StorageAPI.getCustomAPU(apuCode) : null;
if(custom){
const directo = (custom.lines||[]).reduce((s,l)=>{
const qty = Number(l.qty||0);
const pu = Number(l.pu||0);
const parcial = Number(l.parcial||0) || (qty*pu);
return s + parcial;
}, 0);

if(!looksLikeSameAPU(it?.desc, it?.unit, custom.desc || it?.desc)){
return null;
}

return {
_src:"custom",
_match: "code",
code: apuCode,
subtitle: String(custom.desc || it.desc || "").trim(),
unit: String(custom.unit || it.unit || "").trim(),
directo,
lines: custom.lines || []
};
}
}catch(_){}

const base = await (window.APUBase?.getAPU ? APUBase.getAPU(apuCode) : null);
if(!base) return null;

if(!looksLikeSameAPU(it?.desc, it?.unit, base.subtitle || it?.desc)){
return null;
}

return {
_src:"base",
_match: "code",
code: apuCode,
subtitle: String(base.subtitle || it.desc || "").trim(),
unit: String(base.unit || it.unit || "").trim(),
directo: Number(base.directo||0),
lines: base.lines || []
};
}

for(const c of candidates){
const got = await tryByCode(c);
if(got) return got;
}

const desc = String(it?.desc || "").trim();
if(desc){
const codeByDesc = await findApuCodeByDesc(desc, it?.unit);
if(codeByDesc){
const got = await tryByCode(codeByDesc);
if(got){
got._match = "desc";
got._descCode = codeByDesc;
return got;
}
}
}

return null;
}

function openBlobInNewTab(blob){
try{
const url = URL.createObjectURL(blob);
const win = window.open(url, "_blank", "noopener,noreferrer");
setTimeout(()=>URL.revokeObjectURL(url), 60000);
return !!win;
}catch(_){
return false;
}
}

function downloadBlob(blob, filename){
const mobile = isMobileLike();

if(mobile){
const opened = openBlobInNewTab(blob);
if(opened) return true;
}

const url = URL.createObjectURL(blob);
const a = document.createElement("a");
a.href = url;
a.download = filename || `archivo_${Date.now()}.pdf`;
a.rel = "noopener";
a.target = "_blank";
document.body.appendChild(a);
a.click();
a.remove();
setTimeout(()=>URL.revokeObjectURL(url), 1500);
return true;
}

async function shareBlobAsFile(blob, filename){
const canShare = !!navigator.share;
if(!canShare) return false;

const file = new File([blob], filename, { type:"application/pdf" });

try{
if(navigator.canShare && !navigator.canShare({ files:[file] })){
return false;
}
}catch(_){}

try{
forcePersistAppState();
await sleep(80);

await navigator.share({
title: filename,
text: "PDF generado desde CONSTRUCTOR-DIGITAL",
files: [file]
});

forcePersistAppState();
return true;
}catch(err){
console.log("[PDF] share cancelled/error:", err);
forcePersistAppState();
return false;
}
}

async function finalizePDF(doc, filename, opts){
installPersistHooksOnce();
forcePersistAppState();

const o = opts || {};
const blob = doc.output("blob");

try{
sessionStorage.setItem("presupuesto_contable_last_pdf_name", String(filename || ""));
sessionStorage.setItem("presupuesto_contable_last_pdf_ts", String(Date.now()));
}catch(_){}

await sleep(60);
forcePersistAppState();

if(o.share){
const ok = await shareBlobAsFile(blob, filename);
forcePersistAppState();
if(ok) return true;

downloadBlob(blob, filename);
await sleep(60);
forcePersistAppState();
return true;
}

downloadBlob(blob, filename);
await sleep(60);
forcePersistAppState();
return true;
}

function ensureWithHeader(L, needH, headerFn){
const jumped = L.ensure(needH);
if(jumped && typeof headerFn === "function"){
headerFn();
}
return jumped;
}

function classifyDirectGroup(grpRaw){
const upg = String(grpRaw||"").toUpperCase();
if(upg.includes("SUBCONTRAT")) return "SUBCONTRATOS";
if(upg.includes("MATERIAL")) return "MATERIALES";
if(upg.includes("MANO") && upg.includes("OBRA")) return "MANO DE OBRA";
if(upg.includes("EQUIPO") || upg.includes("HERRAM") || upg.includes("MAQUIN")) return "EQUIPO Y HERRAM";
if(upg.includes("TRANSP")) return "TRANSPORTES";
return "OTROS";
}

function getChapterFromItem(it){
return it.chapterCode || (String(it.code||"").split(".")[0] || "SIN");
}
function getChapterNameFromItem(it){
return safe(it.chapterName||"");
}

async function calcDesagregadoByItemFromAPU(project, items){
const out = [];
const totals = {
MATERIALES:0,
"EQUIPO Y HERRAM":0,
"MANO DE OBRA":0,
SUBCONTRATOS:0,
TRANSPORTES:0,
OTROS:0
};

for(const it of (items||[])){
const qtyItem = Number(it.qty||0);

const apuObj = await getAPUForProjectItem(project, it);
const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];

const unitBuckets = {
MATERIALES:0,
"EQUIPO Y HERRAM":0,
"MANO DE OBRA":0,
SUBCONTRATOS:0,
TRANSPORTES:0,
OTROS:0
};

for(const ln of lines){
const grp = classifyDirectGroup(ln.group || ln.tipo || "");
const lqty = Number(ln.qty||0);
const lpu = Number(ln.pu||0);
const parcialUnit = Number(ln.parcial||0) || (lqty * lpu);
unitBuckets[grp] = (unitBuckets[grp]||0) + parcialUnit;
}

const row = {
chapterCode: getChapterFromItem(it),
chapterName: getChapterNameFromItem(it),
code: safe(it.code||""),
desc: safe(it.desc||""),
unit: safe(it.unit||""),
qtyItem,
MATERIALES: unitBuckets.MATERIALES * qtyItem,
"EQUIPO Y HERRAM": unitBuckets["EQUIPO Y HERRAM"] * qtyItem,
"MANO DE OBRA": unitBuckets["MANO DE OBRA"] * qtyItem,
SUBCONTRATOS: unitBuckets.SUBCONTRATOS * qtyItem,
TRANSPORTES: unitBuckets.TRANSPORTES * qtyItem,
OTROS: unitBuckets.OTROS * qtyItem
};

row.VR_PARCIAL =
row.MATERIALES +
row["EQUIPO Y HERRAM"] +
row["MANO DE OBRA"] +
row.SUBCONTRATOS +
row.TRANSPORTES +
row.OTROS;

totals.MATERIALES += row.MATERIALES;
totals["EQUIPO Y HERRAM"] += row["EQUIPO Y HERRAM"];
totals["MANO DE OBRA"] += row["MANO DE OBRA"];
totals.SUBCONTRATOS += row.SUBCONTRATOS;
totals.TRANSPORTES += row.TRANSPORTES;
totals.OTROS += row.OTROS;

out.push(row);
}

const totalDirecto =
totals.MATERIALES +
totals["EQUIPO Y HERRAM"] +
totals["MANO DE OBRA"] +
totals.SUBCONTRATOS +
totals.TRANSPORTES +
totals.OTROS;

return { rows: out, totals, totalDirecto };
}
/* =========================================================
   FASE 2 — AJUSTES FORMATO REPORTES (SIN REEMPLAZAR)
   ========================================================= */

/* =========================
   Helper: split SIN límite (evita textos cortados)
   ========================= */
function splitToLinesFull(doc, text, maxW){
  return doc.splitTextToSize(safe(text), maxW);
}

/* =========================
   Helper: Encabezado tipo informe
   ========================= */
function drawSimpleReportHeader(doc, L, title, project, opts){
  const o = opts || {};
  const margin = L.margin;

  doc.setFont("helvetica","bold");
  doc.setFontSize(11);
  doc.text(safe(title), margin, L.getY());

  L.setY(L.getY()+16);

  doc.setFont("helvetica","normal");
  doc.setFontSize(9);

  doc.text(`PROYECTO: ${safe(project?.name)}`, margin, L.getY());
  L.setY(L.getY()+14);

  if(o.generatedAt){
    doc.text(`FECHA: ${new Date().toLocaleDateString()}`, margin, L.getY());
    L.setY(L.getY()+14);
  }

  hLine(doc, margin, margin + L.contentW, L.getY());
  L.setY(L.getY()+10);
}

/* =========================
   Helper: Header/Footer simple
   ========================= */
function stampSimpleReportHeaderFooter(doc, cfg){
  stampHeaderFooter(doc, cfg);
}

/* =========================================================
   1. DISTRIBUCIÓN PORCENTUAL (NUEVO FORMATO)
   ========================================================= */
PDF.exportDistribucionPorcentualCostosDirectosPDF = async function(project, opts){

  const doc = newDoc();
  const L = mkLayout(doc);

  const { items } = Calc.groupByChapters(project);
  const total = items.reduce((s,it)=> s + (Number(it.pu||0)*Number(it.qty||0)),0);

  drawInstitutionalCover(doc, L, project, "DISTRIBUCIÓN PORCENTUAL");

  doc.addPage();
  L.setY(PDF_THEME.safe.top);

  drawSimpleReportHeader(doc, L, "DISTRIBUCIÓN PORCENTUAL COSTOS DIRECTOS", project, { generatedAt:true });

  let cols = [
    {k:"item",label:"ITEM",w:60},
    {k:"desc",label:"DESCRIPCIÓN",w:320},
    {k:"vr",label:"VR PARCIAL",w:120},
    {k:"pct",label:"%",w:60}
  ];

  cols = fitColsToWidth(cols, L.contentW);

  function header(){
    let x=L.margin;
    doc.setFont("helvetica","bold");
    cols.forEach(c=>{
      doc.text(c.label,x,L.getY());
      x+=c.w;
    });
    L.setY(L.getY()+12);
    hLine(doc,L.margin,L.margin+L.contentW,L.getY());
    L.setY(L.getY()+6);
  }

  header();

  items.forEach(it=>{
    const parcial = Number(it.pu||0)*Number(it.qty||0);
    const pct = total>0 ? (parcial/total)*100 : 0;

    const descLines = splitToLinesFull(doc,it.desc,cols[1].w-4);
    const h = descLines.length*10;

    let x=L.margin;
    doc.text(it.code,x,L.getY()); x+=cols[0].w;
    doc.text(descLines,x,L.getY()); x+=cols[1].w;
    doc.text(moneyCOP0(parcial),x,L.getY(),{align:"right"}); x+=cols[2].w;
    doc.text(fmt2(pct)+"%",x,L.getY(),{align:"right"});

    L.setY(L.getY()+h);
    hLine(doc,L.margin,L.margin+L.contentW,L.getY());
    L.setY(L.getY()+4);
  });

  await appendElaboradorFirma(doc, L);

  stampSimpleReportHeaderFooter(doc,{
    docType:"DISTRIBUCIÓN",
    projectName:project.name,
    logoDataUrl:project.logoDataUrl
  });

  return finalizePDF(doc, buildFilenameDistribucionPctDirectos(project), opts);
};

/* =========================================================
   2. CANTIDAD RECURSOS (FORMATO TIPO IMAGEN)
   ========================================================= */
PDF.exportCantidadRecursosEInsumosPresupuestoPDF = async function(project, opts){

  const doc = newDoc({orientation:"landscape"});
  const L = mkLayout(doc);

  const items = Calc.groupByChapters(project).items;

  const map = new Map();

  for(const it of items){
    const apu = await getAPUForProjectItem(project,it);
    const lines = apu?.lines || [];

    lines.forEach(ln=>{
      const key = ln.desc+"_"+ln.unit;

      const cant = Number(ln.qty||0)*Number(it.qty||0);
      const vr = cant*Number(ln.pu||0);

      if(!map.has(key)){
        map.set(key,{
          desc:ln.desc,
          unit:ln.unit,
          p:ln.pu,
          cant:0,
          vr:0
        });
      }

      const r = map.get(key);
      r.cant+=cant;
      r.vr+=vr;
    });
  }

  const rows = [...map.values()];
  const total = rows.reduce((s,r)=>s+r.vr,0);

  drawInstitutionalCover(doc, L, project, "CANTIDAD RECURSOS");

  doc.addPage();
  L.setY(PDF_THEME.safe.top);

  drawSimpleReportHeader(doc, L, "CANTIDAD DE RECURSOS E INSUMOS", project, { generatedAt:true });

  rows.forEach(r=>{
    const pct = total>0 ? (r.vr/total)*100 : 0;

    const txt = `${r.desc} | ${r.unit} | ${fmtQty(r.cant)} | ${moneyCOP0(r.vr)} | ${fmt2(pct)}%`;

    doc.text(txt,L.margin,L.getY());
    L.setY(L.getY()+12);
  });

  await appendElaboradorFirma(doc, L);

  stampSimpleReportHeaderFooter(doc,{
    docType:"CANTIDADES",
    projectName:project.name,
    logoDataUrl:project.logoDataUrl
  });

  return finalizePDF(doc, buildFilenameCantRecursosInsumos(project), opts);
};
/* =========================================================
FASE 3 — AJUSTES FINALES DE FORMATO
- Presupuesto de obra desagregado
- Resumen presupuesto de obra desagregado
- Rendimiento de equipo y mano de obra por actividad
- Ajuste global: textos largos sin cortar
========================================================= */

/* =========================
Helper: texto completo del proyecto
========================= */
function projectDisplayNameFull(project){
return String(
project?.instProyectoLabel ||
project?.name ||
"PROYECTO"
).trim();
}

/* =========================
Helper: portada sin cortar nombre del proyecto
========================= */
const __drawInstitutionalCover_original__ = drawInstitutionalCover;
drawInstitutionalCover = function(doc, L, project, docTitle){
try{
doc.setFillColor(255,255,255);
doc.rect(0,0,L.PAGE_W,L.PAGE_H,"F");
doc.setTextColor(0);
doc.setDrawColor(0);
}catch(_){}

const elab = window.StorageAPI?.getElaborador ? StorageAPI.getElaborador() : null;

const entidadContratante = String(project?.instEntidad || project?.entity || "—");
const ubicacion = String(project?.location || "—");

const fechaElabRaw = String(project?.instFechaElab || "");
const fechaElab = fechaElabRaw ? fechaElabRaw : dateLongEsCO(new Date());

const projectLabel = projectDisplayNameFull(project).toUpperCase();
const { country, deptLine, muniLine } = getInstitutionHeader(project);

const logo = String(project?.logoDataUrl || "");
if(logo){
const w = 160, h = 60;
const x = (L.PAGE_W - w)/2;
const yLogo = 44;
tryAddImage(doc, logo, x, yLogo, w, h);
}

let y = 130;
if(logo) y = 160;

doc.setFont("helvetica","bold");
doc.setFontSize(12);
doc.text(country, L.PAGE_W/2, y, { align:"center" }); y += 18;
doc.text(deptLine, L.PAGE_W/2, y, { align:"center" }); y += 18;
doc.text(muniLine, L.PAGE_W/2, y, { align:"center" }); y += 30;

doc.setFont("helvetica","bold");
doc.setFontSize(14);
const titleLines = doc.splitTextToSize(up(docTitle||""), L.contentW - 10);
doc.text(titleLines, L.PAGE_W/2, y, { align:"center" });
y += (titleLines.length * 16) + 10;

doc.setFont("helvetica","bold");
doc.setFontSize(12);
const projLines = doc.splitTextToSize(`PROYECTO: ${projectLabel}`, L.contentW - 10);
doc.text(projLines, L.PAGE_W/2, y, { align:"center" });
y += (projLines.length * 15) + 18;

doc.setFont("helvetica","normal");
doc.setFontSize(11);
doc.text(`Entidad Contratante: ${entidadContratante}`, L.margin, y); y += 16;
doc.text(`Ubicación: ${ubicacion}`, L.margin, y); y += 16;
doc.text(`Fecha de Elaboración: ${fechaElab}`, L.margin, y); y += 16;

if(elab && (elab.nombre || elab.profesion || elab.matricula)){
y += 6;
if(elab.nombre){ doc.text(`Elaboró: ${elab.nombre}`, L.margin, y); y += 14; }
if(elab.profesion){ doc.text(`Profesión: ${elab.profesion}`, L.margin, y); y += 14; }
if(elab.matricula){ doc.text(`Matrícula Profesional: ${elab.matricula}`, L.margin, y); y += 14; }
}
};

/* =========================
Helper: header/footer con nombre completo proyecto
========================= */
const __stampHeaderFooter_original__ = stampHeaderFooter;
stampHeaderFooter = function(doc, { docType, projectName, logoDataUrl }){
const pageCount = doc.getNumberOfPages();
const marginX = 44;
const now = new Date().toLocaleString();
const headerTop = 14;
const headerLineY = 42;
const logoW = 64;
const logoH = 24;

for(let p=1; p<=pageCount; p++){
doc.setPage(p);
const { w: PAGE_W, h: PAGE_H } = getPageSize(doc);

try{
doc.setTextColor(0);
doc.setDrawColor(0);
}catch(_){}

doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, PAGE_H - 44, PAGE_W - marginX, PAGE_H - 44);
doc.setLineWidth(0.2);

doc.setFont("helvetica","normal");
doc.setFontSize(9);
doc.text(`Página ${p} de ${pageCount}`, PAGE_W/2, PAGE_H - 28, { align:"center" });

if(p === 1) continue;

doc.setDrawColor(200);
doc.setLineWidth(0.6);
doc.line(marginX, headerLineY, PAGE_W - marginX, headerLineY);
doc.setLineWidth(0.2);

let textStartX = marginX;
if(logoDataUrl){
const ok = tryAddImage(doc, logoDataUrl, marginX, headerTop, logoW, logoH);
if(ok) textStartX = marginX + logoW + 10;
}

const rightLimit = PAGE_W - marginX - 120;
const nameWidth = Math.max(120, rightLimit - textStartX);

doc.setFont("helvetica","bold");
doc.setFontSize(9.5);
const typeLines = doc.splitTextToSize(safe(docType), nameWidth);
doc.text(typeLines[0] || "", textStartX, 28);

doc.setFont("helvetica","normal");
doc.setFontSize(8.8);
const nameLines = doc.splitTextToSize(safe(projectName), nameWidth);
doc.text(nameLines.slice(0,2), textStartX, 38);

doc.setFont("helvetica","normal");
doc.setFontSize(9.2);
doc.text(now, PAGE_W - marginX, 28, { align:"right" });
}
};

/* =========================================================
3. PRESUPUESTO DE OBRA DESAGREGADO (FORMATO TIPO IMAGEN)
========================================================= */
PDF.exportPresupuestoObraDesagregadoPDF = async function(project, opts){
const doc = newDoc({ orientation:"landscape" });
const L = mkLayout(doc);

const grouped = Calc.groupByChapters(project);
const items = Array.isArray(grouped?.items) ? grouped.items : [];
const desg = await calcDesagregadoByItemFromAPU(project, items);

drawInstitutionalCover(doc, L, project, "PRESUPUESTO DE OBRA DESAGREGADO");

doc.addPage();
L.setY(PDF_THEME.safe.top);

drawSimpleReportHeader(doc, L, "PRESUPUESTO DE OBRA DESAGREGADO", project, { generatedAt:true });

const margin = L.margin;
const contentW = L.contentW;

let cols = [
{ k:"cap", label:"CAP", w:34 },
{ k:"item", label:"ITEM", w:54 },
{ k:"desc", label:"DESCRIPCIÓN", w:250 },
{ k:"und", label:"UND", w:40 },
{ k:"cant", label:"CANT", w:60 },
{ k:"mat", label:"MAT", w:74 },
{ k:"eq", label:"EQ/HERR", w:78 },
{ k:"mo", label:"M.O.", w:74 },
{ k:"sub", label:"SUBC", w:70 },
{ k:"tra", label:"TRANS", w:70 },
{ k:"otr", label:"OTROS", w:64 },
{ k:"tot", label:"TOTAL", w:84 }
];
cols = fitColsToWidth(cols, contentW, 20);

function header(){
const yTop = L.getY();
const h = 18;
L.ensure(h + 8);

let x = margin;
doc.setFont("helvetica","bold");
doc.setFontSize(7.0);

for(const c of cols){
drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.0 });
x += c.w;
}

hLine(doc, margin, margin + contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
L.setY(yTop + h + 6);
}

function chapterBand(txt){
const yTop = L.getY();
ensureWithHeader(L, 20, header);
doc.setFont("helvetica","bold");
doc.setFontSize(8.6);
doc.text(String(txt||""), margin, yTop + 10);
hLine(doc, margin, margin + contentW, yTop + 16, PDF_THEME.lines.band.w, PDF_THEME.lines.band.c);
L.setY(yTop + 20);
}

function row(r){
const descLines = splitToLinesFull(doc, safe(r.desc), cols[2].w - 6);
const rowH = Math.max(18, 8 + descLines.length * 9);

ensureWithHeader(L, rowH + 10, header);

const yTop = L.getY();
let x = margin;

drawCellText(doc, x, yTop, cols[0].w, rowH, safe(r.chapterCode), "left", { fontSize:7.0 }); x += cols[0].w;
drawCellText(doc, x, yTop, cols[1].w, rowH, safe(r.code), "left", { bold:true, fontSize:7.0 }); x += cols[1].w;
drawCellText(doc, x, yTop, cols[2].w, rowH, descLines, "left", { fontSize:7.0 }); x += cols[2].w;
drawCellText(doc, x, yTop, cols[3].w, rowH, safe(r.unit), "center", { fontSize:7.0 }); x += cols[3].w;
drawCellText(doc, x, yTop, cols[4].w, rowH, fmtQty(r.qtyItem || 0), "right", { fontSize:7.0 }); x += cols[4].w;
drawCellText(doc, x, yTop, cols[5].w, rowH, moneyCOP0(r.MATERIALES||0), "right", { fontSize:7.0 }); x += cols[5].w;
drawCellText(doc, x, yTop, cols[6].w, rowH, moneyCOP0(r["EQUIPO Y HERRAM"]||0), "right", { fontSize:7.0 }); x += cols[6].w;
drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(r["MANO DE OBRA"]||0), "right", { fontSize:7.0 }); x += cols[7].w;
drawCellText(doc, x, yTop, cols[8].w, rowH, moneyCOP0(r.SUBCONTRATOS||0), "right", { fontSize:7.0 }); x += cols[8].w;
drawCellText(doc, x, yTop, cols[9].w, rowH, moneyCOP0(r.TRANSPORTES||0), "right", { fontSize:7.0 }); x += cols[9].w;
drawCellText(doc, x, yTop, cols[10].w, rowH, moneyCOP0(r.OTROS||0), "right", { fontSize:7.0 }); x += cols[10].w;
drawCellText(doc, x, yTop, cols[11].w, rowH, moneyCOP0(r.VR_PARCIAL||0), "right", { bold:true, fontSize:7.0 });

hLine(doc, margin, margin + contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
L.setY(yTop + rowH + 2);
}

header();

if(!desg.rows.length){
L.p("No hay ítems para desagregar.");
}else{
let currentChap = null;
for(const r of desg.rows){
if(r.chapterCode !== currentChap){
currentChap = r.chapterCode;
chapterBand(`CAPÍTULO ${safe(r.chapterCode)} — ${safe(r.chapterName)}`);
header();
}
row(r);
}
}

L.p(" ");
drawBand(doc, L.margin, L.getY(), L.contentW, 18, "RESUMEN TOTAL", { fontSize:10, bold:true });
L.setY(L.getY()+24);

L.row("MATERIALES:", moneyCOP0(desg.totals.MATERIALES||0));
L.row("EQUIPO Y HERRAMIENTA:", moneyCOP0(desg.totals["EQUIPO Y HERRAM"]||0));
L.row("MANO DE OBRA:", moneyCOP0(desg.totals["MANO DE OBRA"]||0));
L.row("SUBCONTRATOS:", moneyCOP0(desg.totals.SUBCONTRATOS||0));
L.row("TRANSPORTES:", moneyCOP0(desg.totals.TRANSPORTES||0));
L.row("OTROS:", moneyCOP0(desg.totals.OTROS||0));
L.row("TOTAL COSTO DIRECTO:", moneyCOP0(desg.totalDirecto||0));

await appendElaboradorFirma(doc, L);

stampHeaderFooter(doc, {
docType:"PRESUPUESTO DE OBRA DESAGREGADO",
projectName: projectDisplayNameFull(project),
logoDataUrl: project.logoDataUrl || ""
});

return await finalizePDF(doc, buildFilenameDesagregado(project), opts);
};

/* =========================================================
4. RESUMEN PRESUPUESTO DE OBRA DESAGREGADO (FORMATO TIPO IMAGEN)
========================================================= */
PDF.exportResumenPresupuestoObraDesagregadoPDF = async function(project, opts){
const doc = newDoc();
const L = mkLayout(doc);

const grouped = Calc.groupByChapters(project);
const items = Array.isArray(grouped?.items) ? grouped.items : [];
const desg = await calcDesagregadoByItemFromAPU(project, items);

const totalDirecto = Number(desg.totalDirecto || 0);
function pctV(v){
return totalDirecto > 0 ? (Number(v||0) / totalDirecto) * 100 : 0;
}

drawInstitutionalCover(doc, L, project, "RESUMEN PRESUPUESTO DE OBRA DESAGREGADO");

doc.addPage();
L.setY(PDF_THEME.safe.top);

drawSimpleReportHeader(doc, L, "RESUMEN PRESUPUESTO DE OBRA DESAGREGADO", project, { generatedAt:true });

const rows = [
{ concepto:"MATERIALES", valor:desg.totals.MATERIALES||0, pct:pctV(desg.totals.MATERIALES||0) },
{ concepto:"EQUIPO Y HERRAMIENTA", valor:desg.totals["EQUIPO Y HERRAM"]||0, pct:pctV(desg.totals["EQUIPO Y HERRAM"]||0) },
{ concepto:"MANO DE OBRA", valor:desg.totals["MANO DE OBRA"]||0, pct:pctV(desg.totals["MANO DE OBRA"]||0) },
{ concepto:"SUBCONTRATOS", valor:desg.totals.SUBCONTRATOS||0, pct:pctV(desg.totals.SUBCONTRATOS||0) },
{ concepto:"TRANSPORTES", valor:desg.totals.TRANSPORTES||0, pct:pctV(desg.totals.TRANSPORTES||0) },
{ concepto:"OTROS", valor:desg.totals.OTROS||0, pct:pctV(desg.totals.OTROS||0) }
];

const margin = L.margin;
const contentW = L.contentW;

let cols = [
{ k:"concepto", label:"CONCEPTO", w:290 },
{ k:"valor", label:"VALOR", w:140 },
{ k:"pct", label:"%", w:90 }
];
cols = fitColsToWidth(cols, contentW, 28);

function header(){
const yTop = L.getY();
const h = 18;
L.ensure(h + 8);

let x = margin;
doc.setFont("helvetica","bold");
doc.setFontSize(8.4);

for(const c of cols){
drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:8.4 });
x += c.w;
}

hLine(doc, margin, margin + contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
L.setY(yTop + h + 6);
}

function row(r){
const rowH = 18;
ensureWithHeader(L, rowH + 8, header);

const yTop = L.getY();
let x = margin;

drawCellText(doc, x, yTop, cols[0].w, rowH, r.concepto, "left", { fontSize:8.4 }); x += cols[0].w;
drawCellText(doc, x, yTop, cols[1].w, rowH, moneyCOP0(r.valor), "right", { fontSize:8.4 }); x += cols[1].w;
drawCellText(doc, x, yTop, cols[2].w, rowH, `${fmt2(r.pct)}%`, "right", { bold:true, fontSize:8.4 });

hLine(doc, margin, margin + contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
L.setY(yTop + rowH + 2);
}

header();
rows.forEach(row);

L.p(" ");
L.row("TOTAL COSTO DIRECTO:", moneyCOP0(totalDirecto));
L.row("TOTAL PORCENTUAL:", "100.00%");

await appendElaboradorFirma(doc, L);

stampHeaderFooter(doc, {
docType:"RESUMEN PRESUPUESTO DE OBRA DESAGREGADO",
projectName: projectDisplayNameFull(project),
logoDataUrl: project.logoDataUrl || ""
});

return await finalizePDF(doc, buildFilenameResumenDesagregado(project), opts);
};

/* =========================================================
5. RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD
(FORMATO TIPO IMAGEN)
========================================================= */
PDF.exportRendimientoEquipoYManoDeObraPorActividadPDF = async function(project, opts){
const doc = newDoc({ orientation:"landscape" });
const L = mkLayout(doc);

const grouped = Calc.groupByChapters(project);
const items = Array.isArray(grouped?.items) ? grouped.items : [];

drawInstitutionalCover(doc, L, project, "RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD");

doc.addPage();
L.setY(PDF_THEME.safe.top);

drawSimpleReportHeader(doc, L, "RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD", project, { generatedAt:true });

const margin = L.margin;
const contentW = L.contentW;

let cols = [
{ k:"cap", label:"CAP", w:34 },
{ k:"item", label:"ITEM", w:52 },
{ k:"act", label:"ACTIVIDAD", w:250 },
{ k:"grupo", label:"GRUPO", w:110 },
{ k:"rec", label:"RECURSO", w:230 },
{ k:"und", label:"UND", w:42 },
{ k:"cant", label:"RENDIMIENTO", w:78 },
{ k:"vr", label:"VR UNIT", w:82 }
];
cols = fitColsToWidth(cols, contentW, 20);

function header(){
const yTop = L.getY();
const h = 18;
L.ensure(h + 8);

let x = margin;
doc.setFont("helvetica","bold");
doc.setFontSize(7.0);

for(const c of cols){
drawCellText(doc, x, yTop, c.w, h, c.label, "center", { bold:true, fontSize:7.0 });
x += c.w;
}

hLine(doc, margin, margin + contentW, yTop + h, PDF_THEME.lines.header.w, PDF_THEME.lines.header.c);
L.setY(yTop + h + 6);
}

function row(baseItem, ln){
const d1 = splitToLinesFull(doc, safe(baseItem.desc), cols[2].w - 6);
const d2 = splitToLinesFull(doc, safe(ln.desc), cols[4].w - 6);
const rowH = Math.max(18, 8 + Math.max(d1.length, d2.length) * 9);

ensureWithHeader(L, rowH + 10, header);

const yTop = L.getY();
let x = margin;

drawCellText(doc, x, yTop, cols[0].w, rowH, safe(baseItem.chapterCode), "left", { fontSize:7.0 }); x += cols[0].w;
drawCellText(doc, x, yTop, cols[1].w, rowH, safe(baseItem.code), "left", { bold:true, fontSize:7.0 }); x += cols[1].w;
drawCellText(doc, x, yTop, cols[2].w, rowH, d1, "left", { fontSize:7.0 }); x += cols[2].w;
drawCellText(doc, x, yTop, cols[3].w, rowH, normalizeGroup(ln.group || ln.tipo || ""), "left", { fontSize:7.0 }); x += cols[3].w;
drawCellText(doc, x, yTop, cols[4].w, rowH, d2, "left", { fontSize:7.0 }); x += cols[4].w;
drawCellText(doc, x, yTop, cols[5].w, rowH, safe(ln.unit), "center", { fontSize:7.0 }); x += cols[5].w;
drawCellText(doc, x, yTop, cols[6].w, rowH, fmtQty(Number(ln.qty||0)), "right", { fontSize:7.0 }); x += cols[6].w;
drawCellText(doc, x, yTop, cols[7].w, rowH, moneyCOP0(Number(ln.pu||0)), "right", { bold:true, fontSize:7.0 });

hLine(doc, margin, margin + contentW, yTop + rowH, PDF_THEME.lines.row.w, PDF_THEME.lines.row.c);
L.setY(yTop + rowH + 2);
}

header();

for(const it of items){
const apuObj = await getAPUForProjectItem(project, it);
const lines = (apuObj && Array.isArray(apuObj.lines)) ? apuObj.lines : [];
const filtered = lines.filter(ln=>{
const g = normalizeGroup(ln.group || ln.tipo || "");
return g === "MANO DE OBRA" || g === "EQUIPO / HERRAMIENTA / MAQUINARIA";
});

if(!filtered.length) continue;

for(const ln of filtered){
row(it, ln);
}
}

await appendElaboradorFirma(doc, L);

stampHeaderFooter(doc, {
docType:"RENDIMIENTO DE EQUIPO Y MANO DE OBRA POR ACTIVIDAD",
projectName: projectDisplayNameFull(project),
logoDataUrl: project.logoDataUrl || ""
});

return await finalizePDF(doc, buildFilenameRendimientos(project), opts);
};

/* =========================
Alias actualizados
========================= */
PDF.exportRendimientoEquipoManoObraActividadPDF = async function(project, opts){
return await PDF.exportRendimientoEquipoYManoDeObraPorActividadPDF(project, opts);
};

PDF.exportCantidadRecursosInsumosPresupuestoPDF = async function(project, opts){
return await PDF.exportCantidadRecursosEInsumosPresupuestoPDF(project, opts);
};


