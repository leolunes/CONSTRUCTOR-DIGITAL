(function(){
  function safe(v){
    return String(v == null ? "" : v).trim();
  }

  function num(v){
    var n = Number(v || 0);
    return Number.isFinite(n) ? n : 0;
  }

  function nowISO(){
    return new Date().toISOString();
  }

  function makeId(prefix){
    return (prefix || "id") + "_" + Math.random().toString(16).slice(2) + "_" + Date.now().toString(16);
  }

  function clone(obj){
    return JSON.parse(JSON.stringify(obj == null ? null : obj));
  }

  function normalizeChapterCode(v){
    return safe(v);
  }

  function normalizeChapterName(v){
    return safe(v);
  }

  function normalizeApuRefCode(v){
    return safe(v);
  }

  function normalizeCurrency(v){
    var c = safe(v).toUpperCase();
    return c || "COP";
  }

  function normalizeItem(item, mode){
    var it = item || {};
    var code = safe(it.code);
    var chapterCode = normalizeChapterCode(it.chapterCode);
    var chapterName = normalizeChapterName(it.chapterName);
    var apuRefCode = normalizeApuRefCode(it.apuRefCode) || code;

    return {
      id: safe(it.id) || makeId(mode === "oficial" ? "oit" : "it"),
      chapterCode: chapterCode,
      chapterName: chapterName,
      apuRefCode: apuRefCode,
      code: code,
      desc: safe(it.desc),
      unit: safe(it.unit),
      pu: num(it.pu),
      qty: num(it.qty)
    };
  }

  function normalizeItems(items, mode){
    var arr = Array.isArray(items) ? items : [];
    return arr.map(function(it){
      return normalizeItem(it, mode);
    });
  }

  function normalizeChapter(ch, mode){
    var c = ch || {};
    return {
      id: safe(c.id) || makeId(mode === "oficial" ? "ochap" : "chap"),
      chapterCode: normalizeChapterCode(c.chapterCode || c.code),
      chapterName: normalizeChapterName(c.chapterName || c.name)
    };
  }

  function normalizeChapters(chapters, mode){
    var arr = Array.isArray(chapters) ? chapters : [];
    var out = [];
    var seen = {};

    arr.forEach(function(ch){
      var c = normalizeChapter(ch, mode);
      if(!c.chapterCode) return;
      if(seen[c.chapterCode]) return;
      seen[c.chapterCode] = true;
      out.push(c);
    });

    out.sort(function(a, b){
      var aa = safe(a.chapterCode);
      var bb = safe(b.chapterCode);
      var na = Number(aa);
      var nb = Number(bb);
      var aNum = Number.isFinite(na);
      var bNum = Number.isFinite(nb);

      if(aNum && bNum) return na - nb;
      return aa.localeCompare(bb, "es", { numeric:true });
    });

    return out;
  }

  function normalizeApuOverrideMap(map){
    var src = map && typeof map === "object" ? map : {};
    var out = {};
    var k;

    for(k in src){
      if(!Object.prototype.hasOwnProperty.call(src, k)) continue;

      var code = safe(k);
      var rec = src[k] || {};
      var lines = Array.isArray(rec.lines) ? rec.lines : [];

      out[code] = {
        code: code,
        updatedAt: safe(rec.updatedAt) || nowISO(),
        lines: lines.map(function(l){
          return {
            group: safe(l.group || l.tipo),
            desc: safe(l.desc),
            unit: safe(l.unit),
            qty: num(l.qty),
            pu: num(l.pu),
            parcial: num(l.parcial || (num(l.qty) * num(l.pu)))
          };
        })
      };
    }

    return out;
  }

  function inferChapterCodeFromItemCode(code){
    var c = safe(code);
    if(!c) return "";
    if(c.indexOf(".") >= 0) return safe(c.split(".")[0]);
    if(/^\d+$/.test(c)) return c;
    return "";
  }

  function fillChapterNamesFromChapterList(items, chapters){
    var map = {};
    var out = [];
    var i;

    for(i=0; i<chapters.length; i++){
      map[safe(chapters[i].chapterCode)] = safe(chapters[i].chapterName);
    }

    for(i=0; i<items.length; i++){
      var it = clone(items[i]) || {};
      if(!safe(it.chapterCode)){
        it.chapterCode = inferChapterCodeFromItemCode(it.code);
      }
      if(!safe(it.chapterName) && map[safe(it.chapterCode)]){
        it.chapterName = map[safe(it.chapterCode)];
      }
      out.push(it);
    }

    return out;
  }

  function mergeInferredChapters(items, chapters, mode){
    var base = normalizeChapters(chapters, mode);
    var map = {};
    var i;

    for(i=0; i<base.length; i++){
      map[safe(base[i].chapterCode)] = clone(base[i]);
    }

    for(i=0; i<items.length; i++){
      var code = safe(items[i].chapterCode) || inferChapterCodeFromItemCode(items[i].code);
      if(!code) continue;

      if(!map[code]){
        map[code] = {
          id: makeId(mode === "oficial" ? "ochap" : "chap"),
          chapterCode: code,
          chapterName: safe(items[i].chapterName)
        };
      }else if(!safe(map[code].chapterName) && safe(items[i].chapterName)){
        map[code].chapterName = safe(items[i].chapterName);
      }
    }

    var out = [];
    var k;
    for(k in map){
      if(!Object.prototype.hasOwnProperty.call(map, k)) continue;
      out.push(map[k]);
    }

    out.sort(function(a, b){
      var aa = safe(a.chapterCode);
      var bb = safe(b.chapterCode);
      var na = Number(aa);
      var nb = Number(bb);
      var aNum = Number.isFinite(na);
      var bNum = Number.isFinite(nb);

      if(aNum && bNum) return na - nb;
      return aa.localeCompare(bb, "es", { numeric:true });
    });

    return out;
  }

  function buildEmptyProject(payload){
    var p = payload || {};

    return {
      id: safe(p.id) || makeId("proj"),
      createdAt: safe(p.createdAt) || nowISO(),
      updatedAt: safe(p.updatedAt) || nowISO(),

      name: safe(p.name),
      entity: safe(p.entity),
      location: safe(p.location),
      currency: normalizeCurrency(p.currency),

      adminPct: num(p.adminPct || p.aiuPct || 18),
      imprevPct: num(p.imprevPct || 2),
      utilPct: num(p.utilPct || 5),
      ivaUtilPct: num(p.ivaUtilPct || p.ivaPct || 19),

      aiuPct: num(p.aiuPct || 25),
      ivaPct: num(p.ivaPct || 19),
      ivaBase: safe(p.ivaBase) || "sobre_directo_aiu",

      logoDataUrl: safe(p.logoDataUrl),

      instPais: safe(p.instPais),
      instDepto: safe(p.instDepto),
      instMunicipio: safe(p.instMunicipio),
      instEntidad: safe(p.instEntidad),
      instProyectoLabel: safe(p.instProyectoLabel),
      instFechaElab: safe(p.instFechaElab),

      chapters: [],
      items: [],
      apuOverrides: {},

      oficialChapters: [],
      oficialItems: [],
      oficialApuOverrides: {}
    };
  }

  function normalizeProject(project){
    var base = buildEmptyProject(project || {});

    base.name = safe(project && project.name);
    base.entity = safe(project && project.entity);
    base.location = safe(project && project.location);
    base.currency = normalizeCurrency(project && project.currency);

    base.adminPct = num(project && (project.adminPct != null ? project.adminPct : (project.aiuPct != null ? project.aiuPct : 18)));
    base.imprevPct = num(project && (project.imprevPct != null ? project.imprevPct : 2));
    base.utilPct = num(project && (project.utilPct != null ? project.utilPct : 5));
    base.ivaUtilPct = num(project && (project.ivaUtilPct != null ? project.ivaUtilPct : (project.ivaPct != null ? project.ivaPct : 19)));

    base.aiuPct = num(project && (project.aiuPct != null ? project.aiuPct : (base.adminPct + base.imprevPct + base.utilPct)));
    base.ivaPct = num(project && (project.ivaPct != null ? project.ivaPct : base.ivaUtilPct));

    base.ivaBase = safe(project && project.ivaBase) || "sobre_directo_aiu";

    base.logoDataUrl = safe(project && project.logoDataUrl);

    base.instPais = safe(project && project.instPais);
    base.instDepto = safe(project && project.instDepto);
    base.instMunicipio = safe(project && project.instMunicipio);
    base.instEntidad = safe(project && project.instEntidad);
    base.instProyectoLabel = safe(project && project.instProyectoLabel);
    base.instFechaElab = safe(project && project.instFechaElab);

    base.items = normalizeItems(project && project.items, "base");
    base.chapters = normalizeChapters(project && project.chapters, "base");
    base.items = fillChapterNamesFromChapterList(base.items, base.chapters);
    base.chapters = mergeInferredChapters(base.items, base.chapters, "base");
    base.apuOverrides = normalizeApuOverrideMap(project && project.apuOverrides);

    base.oficialItems = normalizeItems(project && project.oficialItems, "oficial");
    base.oficialChapters = normalizeChapters(project && project.oficialChapters, "oficial");
    base.oficialItems = fillChapterNamesFromChapterList(base.oficialItems, base.oficialChapters);
    base.oficialChapters = mergeInferredChapters(base.oficialItems, base.oficialChapters, "oficial");
    base.oficialApuOverrides = normalizeApuOverrideMap(project && project.oficialApuOverrides);

    return base;
  }

  function createProject(payload){
    return normalizeProject(buildEmptyProject(payload || {}));
  }

  function cloneProject(project){
    return normalizeProject(clone(project || {}));
  }

  function getBudgetView(project, mode){
    var p = normalizeProject(project);
    var m = String(mode || "base").toLowerCase();

    if(m === "oficial"){
      return {
        id: p.id,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,

        name: p.name,
        entity: p.entity,
        location: p.location,
        currency: p.currency,

        adminPct: p.adminPct,
        imprevPct: p.imprevPct,
        utilPct: p.utilPct,
        ivaUtilPct: p.ivaUtilPct,
        aiuPct: p.aiuPct,
        ivaPct: p.ivaPct,
        ivaBase: p.ivaBase,

        logoDataUrl: p.logoDataUrl,

        instPais: p.instPais,
        instDepto: p.instDepto,
        instMunicipio: p.instMunicipio,
        instEntidad: p.instEntidad,
        instProyectoLabel: p.instProyectoLabel,
        instFechaElab: p.instFechaElab,

        chapters: clone(p.oficialChapters),
        items: clone(p.oficialItems),
        apuOverrides: clone(p.oficialApuOverrides),
        __budgetMode: "oficial"
      };
    }

    return {
      id: p.id,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,

      name: p.name,
      entity: p.entity,
      location: p.location,
      currency: p.currency,

      adminPct: p.adminPct,
      imprevPct: p.imprevPct,
      utilPct: p.utilPct,
      ivaUtilPct: p.ivaUtilPct,
      aiuPct: p.aiuPct,
      ivaPct: p.ivaPct,
      ivaBase: p.ivaBase,

      logoDataUrl: p.logoDataUrl,

      instPais: p.instPais,
      instDepto: p.instDepto,
      instMunicipio: p.instMunicipio,
      instEntidad: p.instEntidad,
      instProyectoLabel: p.instProyectoLabel,
      instFechaElab: p.instFechaElab,

      chapters: clone(p.chapters),
      items: clone(p.items),
      apuOverrides: clone(p.apuOverrides),
      __budgetMode: "base"
    };
  }

  function setBudgetItems(project, mode, items){
    var p = normalizeProject(project);

    if(String(mode || "base").toLowerCase() === "oficial"){
      p.oficialItems = normalizeItems(items, "oficial");
      p.oficialItems = fillChapterNamesFromChapterList(p.oficialItems, p.oficialChapters);
      p.oficialChapters = mergeInferredChapters(p.oficialItems, p.oficialChapters, "oficial");
    }else{
      p.items = normalizeItems(items, "base");
      p.items = fillChapterNamesFromChapterList(p.items, p.chapters);
      p.chapters = mergeInferredChapters(p.items, p.chapters, "base");
    }

    p.updatedAt = nowISO();
    return p;
  }

  function setBudgetChapters(project, mode, chapters){
    var p = normalizeProject(project);

    if(String(mode || "base").toLowerCase() === "oficial"){
      p.oficialChapters = normalizeChapters(chapters, "oficial");
      p.oficialItems = fillChapterNamesFromChapterList(p.oficialItems, p.oficialChapters);
      p.oficialChapters = mergeInferredChapters(p.oficialItems, p.oficialChapters, "oficial");
    }else{
      p.chapters = normalizeChapters(chapters, "base");
      p.items = fillChapterNamesFromChapterList(p.items, p.chapters);
      p.chapters = mergeInferredChapters(p.items, p.chapters, "base");
    }

    p.updatedAt = nowISO();
    return p;
  }

  function setBudgetOverrides(project, mode, overrides){
    var p = normalizeProject(project);

    if(String(mode || "base").toLowerCase() === "oficial"){
      p.oficialApuOverrides = normalizeApuOverrideMap(overrides);
    }else{
      p.apuOverrides = normalizeApuOverrideMap(overrides);
    }

    p.updatedAt = nowISO();
    return p;
  }

  function getProjectSummary(project){
    var p = normalizeProject(project);

    return {
      id: p.id,
      name: p.name,
      entity: p.entity,
      location: p.location,
      currency: p.currency,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,

      baseItems: p.items.length,
      oficialItems: p.oficialItems.length,
      baseChapters: p.chapters.length,
      oficialChapters: p.oficialChapters.length
    };
  }

  window.ProjectModel = {
    nowISO: nowISO,
    makeId: makeId,
    createProject: createProject,
    normalizeProject: normalizeProject,
    cloneProject: cloneProject,
    getBudgetView: getBudgetView,
    setBudgetItems: setBudgetItems,
    setBudgetChapters: setBudgetChapters,
    setBudgetOverrides: setBudgetOverrides,
    getProjectSummary: getProjectSummary
  };
})();