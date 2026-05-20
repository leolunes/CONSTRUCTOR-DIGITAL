(function () {
  "use strict";

  /* =========================================================
     GOBIERNO DEL HOMBRE INTERIOR - APP.JS AJUSTADO
     Compatible con:
     /CONSTRUCTOR-DIGITAL/gobierno-hombre-interior/
     ========================================================= */

  const APP_STORAGE_KEY = "gobierno_hombre_interior_estado";
  const APP_HISTORY_KEY = "gobierno_hombre_interior_historial";

  const state = {
    preguntas: [],
    resultados: {},
    capitulos: [],
    devocionales: {},
    respuestas: {},
    ultimoResultado: null
  };

  const FALLBACK_PREGUNTAS = [
    { id: "a1", eje: "A", titulo: "Pórtico del pasado", texto: "Pienso con frecuencia en situaciones del pasado que todavía me pesan." },
    { id: "a2", eje: "A", titulo: "Pórtico del pasado", texto: "Siento que hay recuerdos que todavía gobiernan cómo me siento hoy." },
    { id: "a3", eje: "A", titulo: "Pórtico del pasado", texto: "Me cuesta soltar experiencias antiguas aunque hayan pasado años." },
    { id: "a4", eje: "A", titulo: "Pórtico del pasado", texto: "Hay heridas del pasado que siguen afectando mis decisiones presentes." },
    { id: "a5", eje: "A", titulo: "Pórtico del pasado", texto: "Vuelvo mentalmente a conversaciones, errores o pérdidas que ya ocurrieron." },
    { id: "a6", eje: "A", titulo: "Pórtico del pasado", texto: "Siento que una parte de mi alma sigue detenida en algo que ya pasó." },

    { id: "b1", eje: "B", titulo: "Pórtico del presente", texto: "Puedo entregar a Dios lo que siento sin quedarme cargándolo." },
    { id: "b2", eje: "B", titulo: "Pórtico del presente", texto: "Normalmente vivo un día a la vez, sin quedarme atrapado entre pasado y futuro." },
    { id: "b3", eje: "B", titulo: "Pórtico del presente", texto: "Percibo paz interior aun en medio de situaciones difíciles." },
    { id: "b4", eje: "B", titulo: "Pórtico del presente", texto: "Antes de reaccionar, busco dirección espiritual para entender lo que estoy viviendo." },
    { id: "b5", eje: "B", titulo: "Pórtico del presente", texto: "Siento que mi espíritu gobierna mejor mis decisiones que mis emociones." },
    { id: "b6", eje: "B", titulo: "Pórtico del presente", texto: "Puedo descansar aunque no tenga todas las respuestas resueltas." },

    { id: "c1", eje: "C", titulo: "Pórtico del futuro", texto: "Con frecuencia me preocupo por cosas que todavía no han ocurrido." },
    { id: "c2", eje: "C", titulo: "Pórtico del futuro", texto: "Mi mente suele adelantarse a escenarios negativos del mañana." },
    { id: "c3", eje: "C", titulo: "Pórtico del futuro", texto: "Me cuesta descansar porque siento que debo controlar lo que viene." },
    { id: "c4", eje: "C", titulo: "Pórtico del futuro", texto: "Siento presión interna por resolver desde hoy problemas que todavía no existen." },
    { id: "c5", eje: "C", titulo: "Pórtico del futuro", texto: "La incertidumbre me produce angustia y necesidad de tener todo bajo control." },
    { id: "c6", eje: "C", titulo: "Pórtico del futuro", texto: "Mi alma se tensa pensando en lo que podría salir mal más adelante." }
  ];

  const FALLBACK_RESULTADOS = {
    A: {
      codigo: "A",
      nombre: "Pórtico del pasado",
      subtipo: "Depresión / carga retenida",
      frase: "El pasado pesa cuando el alma decide sostener lo que debía entregar.",
      versiculo: "Isaías 43:18 — “No os acordéis de las cosas pasadas…”",
      descripcion: "Tu resultado indica que el alma está reteniendo cargas asociadas al pasado. El flujo hacia el espíritu y hacia Cristo se encuentra interrumpido por recuerdos, peso emocional o procesos que no han sido completamente entregados.",
      principio: "La depresión no es solo tristeza: es una estructura donde la carga nunca descendió."
    },
    B: {
      codigo: "B",
      nombre: "Pórtico del presente",
      subtipo: "Gobierno correcto / paz",
      frase: "El presente es el único lugar donde el alma deja de cargar y el espíritu comienza a gobernar.",
      versiculo: "Hebreos 3:15 — “Si oyereis hoy su voz…”",
      descripcion: "Tu resultado indica un mejor equilibrio interior. El alma percibe, el espíritu gobierna y la carga encuentra mejor transferencia hacia Cristo. Este es el modelo más estable del diseño interior.",
      principio: "La paz no es ausencia de carga: es evidencia de un sistema correctamente gobernado."
    },
    C: {
      codigo: "C",
      nombre: "Pórtico del futuro",
      subtipo: "Ansiedad / carga anticipada",
      frase: "El futuro pesa cuando el alma intenta controlar lo que aún no ha llegado.",
      versiculo: "Mateo 6:34 — “No os afanéis por el día de mañana…”",
      descripcion: "Tu resultado indica que el alma está anticipando escenarios futuros y cargando antes de tiempo lo que todavía no existe. El flujo está interrumpido por el intento de control.",
      principio: "La ansiedad no nace del futuro: nace del intento del alma por controlarlo."
    }
  };

  const FALLBACK_DEVOCIONALES = {
    A: {
      enfoque: "Sanar memoria, soltar el pasado y restaurar el flujo hacia Cristo.",
      accion: "Escribe tres experiencias del pasado que aún tienen peso en tu vida. Luego, una por una, preséntalas en oración y declara: “Esto ya no gobierna mi presente”.",
      oracion: "Señor, hoy reconozco que he estado cargando cosas que ya pasaron. Recuerdos, heridas, errores y momentos que no he soltado. Hoy decido entregarte todo lo que mi alma ha retenido. Sana mi memoria, libera mi interior y restablece el flujo correcto en mi vida. Declaro que el pasado ya no tiene autoridad sobre mí. En el nombre de Jesús, Amén."
    },
    B: {
      enfoque: "Permanecer en el presente, fortalecer el gobierno del espíritu y mantener el flujo.",
      accion: "Toma unos minutos hoy para identificar qué estás cargando actualmente. Entrégalo conscientemente a Dios y declara: “Esto no lo sostengo yo, lo sostienes Tú”.",
      oracion: "Señor, gracias porque hoy puedo vivir en Tu diseño. Enséñame a permanecer en el presente, a no retroceder al pasado ni anticipar el futuro. Fortalece mi espíritu para que gobierne correctamente y permite que mi alma encuentre descanso en Ti. Hoy decido confiar y caminar en Tu dirección. En el nombre de Jesús, Amén."
    },
    C: {
      enfoque: "Rendir el control, soltar el futuro y regresar al presente.",
      accion: "Escribe tres cosas que te generan ansiedad sobre el futuro. Luego conviértelas en una oración de entrega, diciendo: “Señor, esto está en Tus manos, no en las mías”.",
      oracion: "Señor, hoy reconozco que he intentado controlar lo que aún no ha ocurrido. He cargado el futuro como si dependiera de mí. Hoy renuncio a ese control. Te entrego mis planes, mis temores y todo lo que no puedo manejar. Enséñame a vivir en el presente y a descansar en Tu gobierno. Declaro que Tú sostienes mi vida. En el nombre de Jesús, Amén."
    }
  };

  const FALLBACK_CAPITULOS = [
    {
      id: "prologo",
      titulo: "Prólogo",
      contenido: "<div class='badge'>Prólogo</div><h3>Quién gobierna tu interior</h3><p>El hombre no colapsa por lo que vive, sino por dónde lo sostiene.</p>"
    }
  ];

  const OPCIONES = [
    { valor: 0, texto: "Nunca" },
    { valor: 1, texto: "A veces" },
    { valor: 2, texto: "Frecuentemente" },
    { valor: 3, texto: "Casi siempre" }
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function log(...args) {
    console.log("[GHI]", ...args);
  }

  function warn(...args) {
    console.warn("[GHI]", ...args);
  }

  function getScreens() {
    return Array.from(document.querySelectorAll(".screen"));
  }

  function showScreen(screenId) {
    getScreens().forEach((screen) => screen.classList.remove("active"));
    const target = $(screenId);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch (error) {
      warn("No se pudo parsear JSON:", error);
      return fallback;
    }
  }

  function saveState() {
    try {
      const payload = {
        respuestas: state.respuestas,
        ultimoResultado: state.ultimoResultado,
        nombreUsuario: $("nombreUsuario") ? $("nombreUsuario").value.trim() : ""
      };
      localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
    } catch (error) {
      warn("No se pudo guardar estado:", error);
    }
  }

  function restoreState() {
    try {
      const raw = localStorage.getItem(APP_STORAGE_KEY);
      if (!raw) return;

      const saved = safeParse(raw, null);
      if (!saved) return;

      state.respuestas = saved.respuestas || {};
      state.ultimoResultado = saved.ultimoResultado || null;

      const input = $("nombreUsuario");
      if (input && saved.nombreUsuario) {
        input.value = saved.nombreUsuario;
      }
    } catch (error) {
      warn("No se pudo restaurar estado:", error);
    }
  }

  function saveHistory(entry) {
    try {
      const raw = localStorage.getItem(APP_HISTORY_KEY);
      const arr = safeParse(raw, []);
      arr.unshift(entry);
      localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(arr.slice(0, 100)));
    } catch (error) {
      warn("No se pudo guardar historial:", error);
    }
  }

  async function fetchJson(path, fallback) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`No se pudo cargar ${path} - status ${res.status}`);
      }
      const data = await res.json();
      log(`Cargado correctamente: ${path}`);
      return data;
    } catch (error) {
      warn(`Usando fallback para ${path}`, error);
      return fallback;
    }
  }

  async function loadData() {
    state.preguntas = await fetchJson("data/preguntas.json", FALLBACK_PREGUNTAS);
    state.resultados = await fetchJson("data/resultados.json", FALLBACK_RESULTADOS);
    state.capitulos = await fetchJson("data/capitulos.json", FALLBACK_CAPITULOS);
    state.devocionales = await fetchJson("data/devocionales.json", FALLBACK_DEVOCIONALES);

    if (!Array.isArray(state.preguntas) || !state.preguntas.length) {
      state.preguntas = FALLBACK_PREGUNTAS;
    }

    if (!Array.isArray(state.capitulos) || !state.capitulos.length) {
      state.capitulos = FALLBACK_CAPITULOS;
    }

    renderPreguntas();
    restoreState();
    restoreSelectedAnswers();
    renderCapitulos();

    if (state.ultimoResultado) {
      renderResultado(state.ultimoResultado);
    }
  }

  function renderPreguntas() {
    const container = $("preguntasContainer");
    if (!container) return;

    container.innerHTML = "";

    state.preguntas.forEach((pregunta, index) => {
      const card = document.createElement("div");
      card.className = "pregunta-card";

      const title = document.createElement("h3");
      title.textContent = `${index + 1}. ${pregunta.titulo}`;

      const text = document.createElement("p");
      text.className = "pregunta-texto";
      text.textContent = pregunta.texto;

      const opcionesWrap = document.createElement("div");
      opcionesWrap.className = "opciones";

      OPCIONES.forEach((op) => {
        const optionRow = document.createElement("div");
        optionRow.className = "opcion";

        const input = document.createElement("input");
        input.type = "radio";
        input.name = pregunta.id;
        input.id = `${pregunta.id}_${op.valor}`;
        input.value = String(op.valor);

        input.addEventListener("change", () => {
          state.respuestas[pregunta.id] = Number(op.valor);
          saveState();
        });

        const label = document.createElement("label");
        label.setAttribute("for", input.id);
        label.textContent = op.texto;

        optionRow.appendChild(input);
        optionRow.appendChild(label);
        opcionesWrap.appendChild(optionRow);
      });

      card.appendChild(title);
      card.appendChild(text);
      card.appendChild(opcionesWrap);

      container.appendChild(card);
    });
  }

  function restoreSelectedAnswers() {
    Object.keys(state.respuestas || {}).forEach((id) => {
      const value = state.respuestas[id];
      const input = document.getElementById(`${id}_${value}`);
      if (input) {
        input.checked = true;
      }
    });
  }

  function renderCapitulos() {
    const lista = $("listaCapitulos");
    const contenido = $("contenidoCapitulo");

    if (!lista || !contenido) return;

    lista.innerHTML = "";
    contenido.innerHTML = `
      <div class="badge">Biblioteca</div>
      <h3>Lectura del libro</h3>
      <p>Selecciona un prólogo o capítulo para leer su contenido aquí.</p>
    `;

    state.capitulos.forEach((capitulo) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "capitulo-btn";
      btn.textContent = capitulo.titulo;

      btn.addEventListener("click", () => {
        contenido.innerHTML = capitulo.contenido || `<p>${capitulo.titulo}</p>`;
        window.scrollTo({ top: lista.offsetTop, behavior: "smooth" });
      });

      lista.appendChild(btn);
    });
  }

  function validarRespuestasCompletas() {
    const faltantes = [];

    state.preguntas.forEach((pregunta) => {
      const valor = state.respuestas[pregunta.id];
      if (typeof valor !== "number" || Number.isNaN(valor)) {
        faltantes.push(pregunta.id);
      }
    });

    return {
      ok: faltantes.length === 0,
      faltantes
    };
  }

  function sumarPorEjes() {
    const sumas = { A: 0, B: 0, C: 0 };

    state.preguntas.forEach((pregunta) => {
      const val = Number(state.respuestas[pregunta.id] || 0);
      if (pregunta.eje === "A") sumas.A += val;
      if (pregunta.eje === "B") sumas.B += val;
      if (pregunta.eje === "C") sumas.C += val;
    });

    return sumas;
  }

  function calcularPorcentajes(sumas) {
    const total = sumas.A + sumas.B + sumas.C;
    if (total <= 0) {
      return { A: 0, B: 0, C: 0 };
    }

    const raw = [
      { eje: "A", value: (sumas.A / total) * 100 },
      { eje: "B", value: (sumas.B / total) * 100 },
      { eje: "C", value: (sumas.C / total) * 100 }
    ];

    const floors = raw.map((item) => ({
      eje: item.eje,
      base: Math.floor(item.value),
      decimal: item.value - Math.floor(item.value)
    }));

    let usados = floors.reduce((acc, item) => acc + item.base, 0);
    let faltan = 100 - usados;

    floors.sort((a, b) => b.decimal - a.decimal);

    for (let i = 0; i < faltan; i++) {
      floors[i % floors.length].base += 1;
    }

    const resultado = { A: 0, B: 0, C: 0 };
    floors.forEach((item) => {
      resultado[item.eje] = item.base;
    });

    return resultado;
  }

  function determinarDominante(sumas) {
    const orden = [
      { eje: "A", valor: sumas.A },
      { eje: "B", valor: sumas.B },
      { eje: "C", valor: sumas.C }
    ].sort((a, b) => b.valor - a.valor);

    const primero = orden[0];
    const segundo = orden[1];

    return {
      dominante: primero.eje,
      empate: primero.valor === segundo.valor,
      mezcla: primero.valor === segundo.valor ? `${primero.eje}/${segundo.eje}` : primero.eje,
      orden
    };
  }

  function formatearFecha() {
    return new Date().toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function getResultadoPorEje(eje) {
    return state.resultados[eje] || FALLBACK_RESULTADOS[eje];
  }

  function getDevocionalPorEje(eje) {
    return state.devocionales[eje] || FALLBACK_DEVOCIONALES[eje];
  }

  function construirDictamen(result) {
    const { A, B, C } = result.porcentajes;

    if (B >= 60) {
      return "Predomina el pórtico del presente. El sistema muestra una base de estabilidad interior, con mejor transferencia de cargas hacia el espíritu y hacia Cristo.";
    }

    if (B >= 45 && C >= 30) {
      return "Existe una base presente funcional, pero con influencia importante del futuro. Hay estabilidad parcial, aunque persiste tendencia a anticipar y controlar.";
    }

    if (B >= 45 && A >= 30) {
      return "Existe una base presente funcional, pero con influencia importante del pasado. El sistema avanza, aunque todavía arrastra memoria emocional no completamente entregada.";
    }

    if (C > B && C >= 40) {
      return "Predomina el pórtico del futuro. El sistema muestra tendencia a ansiedad, anticipación y necesidad de control sobre lo que aún no ha ocurrido.";
    }

    if (A > B && A >= 40) {
      return "Predomina el pórtico del pasado. El sistema muestra tendencia a depresión estructural, peso retenido y procesos del ayer que aún afectan el presente.";
    }

    if (A >= 30 && C >= 30) {
      return "El sistema presenta tensión entre pasado y futuro. Hay poca permanencia en el presente, con riesgo de inestabilidad interior por acumulación y anticipación simultáneas.";
    }

    return "El sistema presenta un estado mixto. Aunque no hay colapso dominante absoluto, sí existen zonas del alma que necesitan mayor transferencia, discernimiento y reposo.";
  }

  function pintarPortico(eje) {
    const carga = $("carga");
    const viga = $("viga");
    const columna = $("columna");

    if (!carga || !viga || !columna) return;

    viga.setAttribute("x", "60");
    viga.setAttribute("y", "70");
    viga.setAttribute("width", "200");
    viga.setAttribute("height", "12");

    columna.setAttribute("x", "150");
    columna.setAttribute("y", "82");
    columna.setAttribute("width", "20");
    columna.setAttribute("height", "90");

    if (eje === "A") {
      carga.setAttribute("cx", "70");
      carga.setAttribute("cy", "50");
      viga.setAttribute("y", "78");
    } else if (eje === "B") {
      carga.setAttribute("cx", "160");
      carga.setAttribute("cy", "50");
      viga.setAttribute("y", "70");
    } else if (eje === "C") {
      carga.setAttribute("cx", "250");
      carga.setAttribute("cy", "50");
      viga.setAttribute("y", "78");
    }
  }

  function renderResultado(result) {
    const resultadoTexto = $("resultadoTexto");
    const detalleResultado = $("detalleResultado");

    if (!resultadoTexto || !detalleResultado) return;

    const resultado = getResultadoPorEje(result.dominante);
    const devocional = getDevocionalPorEje(result.dominante);
    const dictamen = construirDictamen(result);

    resultadoTexto.innerHTML = `
      <div class="resultado-titulo">${resultado.nombre}</div>
      <p><strong>Lectura principal:</strong> ${resultado.subtipo}</p>
      <p class="resultado-frase">“${resultado.frase}”</p>
      <p>${resultado.descripcion}</p>
      <p class="resultado-versiculo">${resultado.versiculo}</p>
      <p class="resultado-principio"><strong>Principio:</strong> ${resultado.principio}</p>
      ${result.empate ? `<p class="small-note"><strong>Lectura mixta:</strong> ${result.mezcla}</p>` : ""}
      <div class="bloque-info">
        <strong>Dictamen:</strong>
        <p>${dictamen}</p>
      </div>
    `;

    detalleResultado.innerHTML = `
      <div class="badge">Ruta sugerida</div>

      <p><strong>Nombre:</strong> ${result.nombre}</p>
      <p><strong>Fecha:</strong> ${result.fecha}</p>

      <hr>

      <h3>Distribución del sistema interior</h3>
      <ul>
        <li>🔵 Pasado / Pórtico A: ${result.porcentajes.A}%</li>
        <li>🟡 Presente / Pórtico B: ${result.porcentajes.B}%</li>
        <li>🔴 Futuro / Pórtico C: ${result.porcentajes.C}%</li>
      </ul>

      <p class="portico-leyenda"><strong>Puntajes:</strong> A=${result.puntajes.A}, B=${result.puntajes.B}, C=${result.puntajes.C}</p>

      <hr>

      <h3>Ruta de intervención espiritual</h3>
      <p><strong>Enfoque:</strong> ${devocional.enfoque}</p>
      <p><strong>Acción práctica:</strong> ${devocional.accion}</p>

      <div class="bloque-info">
        <strong>Oración guiada:</strong>
        <p>${devocional.oracion}</p>
      </div>
    `;

    pintarPortico(result.dominante);
  }

  function calcularResultadoInterno() {
    const inputNombre = $("nombreUsuario");
    const nombre = inputNombre ? inputNombre.value.trim() : "";

    if (!nombre) {
      alert("Debes escribir tu nombre antes de calcular el resultado.");
      return null;
    }

    const validacion = validarRespuestasCompletas();
    if (!validacion.ok) {
      alert(`Debes responder todas las preguntas antes de continuar. Faltan ${validacion.faltantes.length} pregunta(s).`);
      return null;
    }

    const puntajes = sumarPorEjes();
    const porcentajes = calcularPorcentajes(puntajes);
    const dominanteInfo = determinarDominante(puntajes);

    const result = {
      nombre,
      fecha: formatearFecha(),
      puntajes,
      porcentajes,
      dominante: dominanteInfo.dominante,
      empate: dominanteInfo.empate,
      mezcla: dominanteInfo.mezcla
    };

    state.ultimoResultado = result;
    saveState();
    saveHistory(result);

    log("Resultado calculado:", result);
    return result;
  }

  function irAEvaluacion() {
    showScreen("evaluacion");
  }

  function irALectura() {
    showScreen("lectura");
  }

  function volverInicio() {
    showScreen("inicio");
  }

  function calcularResultado() {
    try {
      const result = calcularResultadoInterno();
      if (!result) return;

      renderResultado(result);
      showScreen("resultado");
    } catch (error) {
      console.error("[GHI] Error al calcular resultado:", error);
      alert("Ocurrió un error al calcular el resultado. Abre F12 > Console y compárteme el error si vuelve a pasar.");
    }
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;

    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").then(() => {
        log("Service Worker registrado");
      }).catch((error) => {
        warn("No se pudo registrar Service Worker:", error);
      });
    });
  }

  function exposeGlobals() {
    window.irAEvaluacion = irAEvaluacion;
    window.irALectura = irALectura;
    window.volverInicio = volverInicio;
    window.calcularResultado = calcularResultado;
  }

  document.addEventListener("DOMContentLoaded", async () => {
    try {
      exposeGlobals();
      await loadData();
      registerSW();
      log("Aplicación iniciada correctamente");
    } catch (error) {
      console.error("[GHI] Error al iniciar aplicación:", error);
      alert("La aplicación encontró un problema al iniciar. Revisa F12 > Console.");
    }
  });
})();