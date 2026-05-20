(function () {
  "use strict";

  /* =========================================================
     GOBIERNO DEL HOMBRE INTERIOR - APP.JS DEFINITIVO
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

  function getTodayISO() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  function saveState() {
    try {
      const payload = {
        respuestas: state.respuestas,
        ultimoResultado: state.ultimoResultado,
        nombreUsuario: $("nombreUsuario") ? $("nombreUsuario").value.trim() : "",
        mentorUsuario: $("mentorUsuario") ? $("mentorUsuario").value.trim() : "",
        fechaEvaluacion: $("fechaEvaluacion") ? $("fechaEvaluacion").value : ""
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

      const inputNombre = $("nombreUsuario");
      const inputMentor = $("mentorUsuario");
      const inputFecha = $("fechaEvaluacion");

      if (inputNombre && saved.nombreUsuario) inputNombre.value = saved.nombreUsuario;
      if (inputMentor && saved.mentorUsuario) inputMentor.value = saved.mentorUsuario;
      if (inputFecha && saved.fechaEvaluacion) inputFecha.value = saved.fechaEvaluacion;
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

    const fechaInput = $("fechaEvaluacion");
    if (fechaInput && !fechaInput.value) {
      fechaInput.value = getTodayISO();
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
      if (input) input.checked = true;
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

    const usados = floors.reduce((acc, item) => acc + item.base, 0);
    const faltan = 100 - usados;

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

  function formatearFechaVisible(fechaISO) {
    if (!fechaISO) {
      return new Date().toLocaleDateString("es-CO");
    }

    if (fechaISO.includes("/")) return fechaISO;

    const [y, m, d] = fechaISO.split("-");
    if (!y || !m || !d) return fechaISO;
    return `${d}/${m}/${y}`;
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

  function pintarPortico(result) {
    const { A, B, C } = result.porcentajes;

    const carga = $("carga");
    const viga = $("viga");
    const columna = $("columna");

    const flechaPasado = $("flechaPasado");
    const flechaPresente = $("flechaPresente");
    const flechaFuturo = $("flechaFuturo");
    const flechaActual = $("flechaActual");

    const labelPasado = $("labelPasado");
    const labelPresente = $("labelPresente");
    const labelFuturo = $("labelFuturo");

    if (viga) {
      viga.setAttribute("x", "60");
      viga.setAttribute("y", "70");
      viga.setAttribute("width", "200");
      viga.setAttribute("height", "12");
    }

    if (columna) {
      columna.setAttribute("x", "150");
      columna.setAttribute("y", "82");
      columna.setAttribute("width", "20");
      columna.setAttribute("height", "90");
    }

    // Carga principal tradicional
    if (carga) {
      let x = 160;
      let y = 50;

      if (result.dominante === "A") {
        x = 70;
        y = 50;
        if (viga) viga.setAttribute("y", "78");
      } else if (result.dominante === "B") {
        x = 160;
        y = 50;
        if (viga) viga.setAttribute("y", "70");
      } else if (result.dominante === "C") {
        x = 250;
        y = 50;
        if (viga) viga.setAttribute("y", "78");
      }

      carga.setAttribute("cx", String(x));
      carga.setAttribute("cy", String(y));
    }

    // Flechas por porcentaje
    if (flechaPasado) flechaPasado.setAttribute("stroke-width", String(Math.max(2, A / 10)));
    if (flechaPresente) flechaPresente.setAttribute("stroke-width", String(Math.max(2, B / 10)));
    if (flechaFuturo) flechaFuturo.setAttribute("stroke-width", String(Math.max(2, C / 10)));

    // Labels
    if (labelPasado) labelPasado.textContent = `${A}%`;
    if (labelPresente) labelPresente.textContent = `${B}%`;
    if (labelFuturo) labelFuturo.textContent = `${C}%`;

    // Vector resultante / ubicación actual
    const posicionActual = (A * 70 + B * 160 + C * 250) / 100;

    if (flechaActual) {
      flechaActual.setAttribute("x1", String(posicionActual));
      flechaActual.setAttribute("x2", String(posicionActual));
      flechaActual.setAttribute("stroke-width", "6");
    }

    // Métricas visuales auxiliares
    renderMetricas(result);
  }

  function renderMetricas(result) {
    const cont = $("metricasResultado");
    if (!cont) return;

    cont.classList.remove("hidden");
    cont.innerHTML = `
      <div class="metricas">
        <div class="metrica metrica-past">
          <div class="metrica-header">
            <span>Pasado</span>
            <span>${result.porcentajes.A}%</span>
          </div>
          <div class="metrica-barra"><span style="width:${result.porcentajes.A}%"></span></div>
        </div>

        <div class="metrica metrica-present">
          <div class="metrica-header">
            <span>Presente</span>
            <span>${result.porcentajes.B}%</span>
          </div>
          <div class="metrica-barra"><span style="width:${result.porcentajes.B}%"></span></div>
        </div>

        <div class="metrica metrica-future">
          <div class="metrica-header">
            <span>Futuro</span>
            <span>${result.porcentajes.C}%</span>
          </div>
          <div class="metrica-barra"><span style="width:${result.porcentajes.C}%"></span></div>
        </div>
      </div>
    `;
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
      <p><strong>Mentor:</strong> ${result.mentor || "No registrado"}</p>
      <p><strong>Fecha:</strong> ${formatearFechaVisible(result.fecha)}</p>

      <hr>

      <h3>Distribución del sistema interior</h3>
      <ul>
        <li>🔵 Pasado / Pórtico A: ${result.porcentajes.A}%</li>
        <li>🟢 Presente / Pórtico B: ${result.porcentajes.B}%</li>
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

    pintarPortico(result);
  }

  function calcularResultadoInterno() {
    const inputNombre = $("nombreUsuario");
    const inputMentor = $("mentorUsuario");
    const inputFecha = $("fechaEvaluacion");

    const nombre = inputNombre ? inputNombre.value.trim() : "";
    const mentor = inputMentor ? inputMentor.value.trim() : "";
    const fecha = inputFecha && inputFecha.value ? inputFecha.value : getTodayISO();

    if (!nombre) {
      alert("Debes escribir el nombre del paciente antes de calcular el resultado.");
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
      mentor,
      fecha,
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

  function generarHtmlPDF(result) {
    const resultado = getResultadoPorEje(result.dominante);
    const devocional = getDevocionalPorEje(result.dominante);
    const dictamen = construirDictamen(result);

    return `
<!DOCTYPE html>
<html lang="es">
<head>
<meta charset="UTF-8">
<title>Informe - Gobierno del Hombre Interior</title>
<style>
  body{
    font-family: Georgia, "Times New Roman", serif;
    color:#111827;
    margin:40px;
    line-height:1.55;
  }
  h1,h2,h3{ margin:0 0 10px; }
  h1{ font-size:24px; text-transform:uppercase; }
  h2{ font-size:18px; margin-top:28px; color:#92400e; }
  .sub{ font-style:italic; margin-bottom:18px; color:#374151; }
  .box{
    border:1px solid #d1d5db;
    border-left:5px solid #d4af37;
    padding:14px 16px;
    margin:14px 0;
    background:#f9fafb;
  }
  .meta p{ margin:4px 0; }
  ul{ margin:8px 0 14px 20px; }
  li{ margin:4px 0; }
  .past{ color:#2563eb; font-weight:bold; }
  .present{ color:#16a34a; font-weight:bold; }
  .future{ color:#dc2626; font-weight:bold; }
  .small{ color:#4b5563; font-size:12px; }
  hr{ border:none; border-top:1px solid #d1d5db; margin:18px 0; }
</style>
</head>
<body>
  <h1>Gobierno del Hombre Interior</h1>
  <p class="sub">Informe de evaluación del paciente</p>

  <div class="meta">
    <p><strong>Paciente:</strong> ${result.nombre}</p>
    <p><strong>Mentor:</strong> ${result.mentor || "No registrado"}</p>
    <p><strong>Fecha:</strong> ${formatearFechaVisible(result.fecha)}</p>
  </div>

  <h2>Resultado principal</h2>
  <p><strong>${resultado.nombre}</strong></p>
  <p>${resultado.subtipo}</p>
  <div class="box">
    <p><strong>Frase guía:</strong> “${resultado.frase}”</p>
    <p>${resultado.descripcion}</p>
    <p><strong>Versículo:</strong> ${resultado.versiculo}</p>
    <p><strong>Principio:</strong> ${resultado.principio}</p>
  </div>

  <h2>Dictamen</h2>
  <div class="box">
    <p>${dictamen}</p>
  </div>

  <h2>Distribución del sistema interior</h2>
  <ul>
    <li class="past">Pasado / Pórtico A: ${result.porcentajes.A}%</li>
    <li class="present">Presente / Pórtico B: ${result.porcentajes.B}%</li>
    <li class="future">Futuro / Pórtico C: ${result.porcentajes.C}%</li>
  </ul>
  <p class="small">Puntajes base: A=${result.puntajes.A}, B=${result.puntajes.B}, C=${result.puntajes.C}</p>

  <h2>Ruta de intervención espiritual</h2>
  <div class="box">
    <p><strong>Enfoque:</strong> ${devocional.enfoque}</p>
    <p><strong>Acción práctica:</strong> ${devocional.accion}</p>
    <p><strong>Oración guiada:</strong> ${devocional.oracion}</p>
  </div>

  <h2>Observación final</h2>
  <div class="box">
    <p>Este informe presenta una lectura espiritual y estructural del estado actual del hombre interior, con base en la analogía del pórtico: pasado, presente y futuro.</p>
  </div>
</body>
</html>
    `;
  }

  function descargarPDF() {
    const result = state.ultimoResultado;
    if (!result) {
      alert("Primero debes calcular un resultado.");
      return;
    }

    const html = generarHtmlPDF(result);
    const win = window.open("", "_blank", "width=900,height=1000");

    if (!win) {
      alert("El navegador bloqueó la ventana de impresión. Permite ventanas emergentes e inténtalo de nuevo.");
      return;
    }

    win.document.open();
    win.document.write(html);
    win.document.close();

    win.onload = function () {
      setTimeout(() => {
        win.focus();
        win.print();
      }, 350);
    };
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

  function resetearAppCompleta() {
    if (!confirm("¿Deseas reiniciar completamente la aplicación? Se borrarán todos los datos guardados.")) {
      return;
    }

    try {
      localStorage.removeItem(APP_STORAGE_KEY);
      localStorage.removeItem(APP_HISTORY_KEY);

      state.respuestas = {};
      state.ultimoResultado = null;

      const nombre = $("nombreUsuario");
      const mentor = $("mentorUsuario");
      const fecha = $("fechaEvaluacion");

      if (nombre) nombre.value = "";
      if (mentor) mentor.value = "";
      if (fecha) fecha.value = getTodayISO();

      document.querySelectorAll("input[type='radio']").forEach((radio) => {
        radio.checked = false;
      });

      const resultadoTexto = $("resultadoTexto");
      const detalleResultado = $("detalleResultado");
      const metricas = $("metricasResultado");

      if (resultadoTexto) resultadoTexto.innerHTML = "";
      if (detalleResultado) detalleResultado.innerHTML = "";
      if (metricas) {
        metricas.innerHTML = "";
        metricas.classList.add("hidden");
      }

      // Reset visual flechas
      ["flechaPasado", "flechaPresente", "flechaFuturo", "flechaActual"].forEach((id) => {
        const el = $(id);
        if (el) el.setAttribute("stroke-width", "0");
      });

      ["labelPasado", "labelPresente", "labelFuturo"].forEach((id) => {
        const el = $(id);
        if (el) el.textContent = "";
      });

      showScreen("inicio");

      setTimeout(() => {
        location.reload();
      }, 250);
    } catch (error) {
      console.error("[GHI] Error al resetear la app:", error);
      alert("Ocurrió un error al reiniciar la aplicación.");
    }
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
    window.resetearAppCompleta = resetearAppCompleta;
    window.descargarPDF = descargarPDF;
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