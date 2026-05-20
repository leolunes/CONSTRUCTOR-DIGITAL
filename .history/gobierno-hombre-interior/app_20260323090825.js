(function () {
  "use strict";

  /* =========================================================
     GOBIERNO DEL HOMBRE INTERIOR - APP.JS INTEGRAL
     Compatible con:
     /CONSTRUCTOR-DIGITAL/gobierno-hombre-interior/
     ========================================================= */

  const APP_STORAGE_KEY = "gobierno_hombre_interior_estado";
  const APP_HISTORY_KEY = "gobierno_hombre_interior_historial";
  const APP_BOOK_REQUESTS_KEY = "gobierno_hombre_interior_solicitudes_libro";

  const state = {
    preguntas: [],
    resultados: {},
    capitulos: [],
    devocionales: {},
    respuestas: {},
    ultimoResultado: null,
    devocionalesAbiertos: false
  };

  const FALLBACK_PREGUNTAS = [
    { id: "a1", eje: "A", titulo: "Carga del pasado", texto: "Pienso con frecuencia en situaciones del pasado que todavía me pesan." },
    { id: "a2", eje: "A", titulo: "Carga del pasado", texto: "Siento que hay recuerdos que todavía gobiernan cómo me siento hoy." },
    { id: "a3", eje: "A", titulo: "Carga del pasado", texto: "Me cuesta soltar experiencias antiguas aunque hayan pasado años." },
    { id: "a4", eje: "A", titulo: "Carga del pasado", texto: "Hay heridas del pasado que siguen afectando mis decisiones presentes." },
    { id: "a5", eje: "A", titulo: "Carga del pasado", texto: "Vuelvo mentalmente a conversaciones, errores o pérdidas que ya ocurrieron." },
    { id: "a6", eje: "A", titulo: "Carga del pasado", texto: "Siento que una parte de mi alma sigue detenida en algo que ya pasó." },

    { id: "b1", eje: "B", titulo: "Carga del presente", texto: "Puedo entregar a Dios lo que siento sin quedarme cargándolo." },
    { id: "b2", eje: "B", titulo: "Carga del presente", texto: "Normalmente vivo un día a la vez, sin quedarme atrapado entre pasado y futuro." },
    { id: "b3", eje: "B", titulo: "Carga del presente", texto: "Percibo paz interior aun en medio de situaciones difíciles." },
    { id: "b4", eje: "B", titulo: "Carga del presente", texto: "Antes de reaccionar, busco dirección espiritual para entender lo que estoy viviendo." },
    { id: "b5", eje: "B", titulo: "Carga del presente", texto: "Siento que mi espíritu gobierna mejor mis decisiones que mis emociones." },
    { id: "b6", eje: "B", titulo: "Carga del presente", texto: "Puedo descansar aunque no tenga todas las respuestas resueltas." },

    { id: "c1", eje: "C", titulo: "Carga del futuro", texto: "Con frecuencia me preocupo por cosas que todavía no han ocurrido." },
    { id: "c2", eje: "C", titulo: "Carga del futuro", texto: "Mi mente suele adelantarse a escenarios negativos del mañana." },
    { id: "c3", eje: "C", titulo: "Carga del futuro", texto: "Me cuesta descansar porque siento que debo controlar lo que viene." },
    { id: "c4", eje: "C", titulo: "Carga del futuro", texto: "Siento presión interna por resolver desde hoy problemas que todavía no existen." },
    { id: "c5", eje: "C", titulo: "Carga del futuro", texto: "La incertidumbre me produce angustia y necesidad de tener todo bajo control." },
    { id: "c6", eje: "C", titulo: "Carga del futuro", texto: "Mi alma se tensa pensando en lo que podría salir mal más adelante." }
  ];

  const EXTRA_PREGUNTAS = [
    { id: "a7", eje: "A", titulo: "Carga del pasado", texto: "Me cuesta cerrar procesos internos relacionados con decisiones que tomé en el pasado." },
    { id: "a8", eje: "A", titulo: "Carga del pasado", texto: "Siento culpa o pesar por eventos que ya no puedo cambiar." },
    { id: "a9", eje: "A", titulo: "Carga del pasado", texto: "Hay conversaciones o episodios antiguos que siguen regresando a mi mente." },
    { id: "a10", eje: "A", titulo: "Carga del pasado", texto: "Me comparo con lo que fui, con lo que perdí o con lo que debió haber ocurrido." },

    { id: "b7", eje: "B", titulo: "Carga del presente", texto: "Puedo mantenerme centrado espiritualmente aun cuando enfrento presión externa." },
    { id: "b8", eje: "B", titulo: "Carga del presente", texto: "Siento que tengo capacidad real de procesar lo que vivo sin colapsar internamente." },
    { id: "b9", eje: "B", titulo: "Carga del presente", texto: "Tengo momentos de quietud interior donde percibo dirección y reposo." },
    { id: "b10", eje: "B", titulo: "Carga del presente", texto: "Siento que puedo confiar en Dios incluso cuando no controlo los resultados." },

    { id: "c7", eje: "C", titulo: "Carga del futuro", texto: "Pienso repetidamente en escenarios futuros que podrían salir mal." },
    { id: "c8", eje: "C", titulo: "Carga del futuro", texto: "Me cuesta disfrutar el presente porque mi mente está adelantada a lo que viene." },
    { id: "c9", eje: "C", titulo: "Carga del futuro", texto: "Siento que debo prevenirlo todo para poder estar en paz." },
    { id: "c10", eje: "C", titulo: "Carga del futuro", texto: "La incertidumbre del mañana me genera tensión interna frecuente." }
  ];

  const FALLBACK_RESULTADOS = {
    A: {
      codigo: "A",
      nombre: "Carga del pasado",
      subtipo: "Memoria retenida / peso emocional",
      frase: "El pasado pesa cuando el alma decide sostener lo que debía entregar.",
      versiculo: "Isaías 43:18 — “No os acordéis de las cosas pasadas…”",
      descripcion: "Esta carga indica peso retenido en la memoria emocional. El sistema interior sigue recibiendo influencia de hechos que ya pasaron, pero que no fueron descargados completamente.",
      principio: "Lo que no se entrega, permanece activo en el alma."
    },
    B: {
      codigo: "B",
      nombre: "Carga del presente",
      subtipo: "Capacidad de reposo / transferencia actual",
      frase: "El presente es el único lugar donde el alma deja de cargar y el espíritu comienza a gobernar.",
      versiculo: "Hebreos 3:15 — “Si oyereis hoy su voz…”",
      descripcion: "Esta carga indica la capacidad real del sistema para permanecer en el presente, discernir lo que vive y transferir correctamente hacia Cristo.",
      principio: "La paz es resultado de una transferencia correcta."
    },
    C: {
      codigo: "C",
      nombre: "Carga del futuro",
      subtipo: "Anticipación / control / ansiedad",
      frase: "El futuro pesa cuando el alma intenta controlar lo que aún no ha llegado.",
      versiculo: "Mateo 6:34 — “No os afanéis por el día de mañana…”",
      descripcion: "Esta carga indica tendencia a adelantarse al mañana, vivir anticipando escenarios y sostener internamente lo que todavía no ha ocurrido.",
      principio: "El futuro no se controla; se entrega."
    }
  };

  const FALLBACK_DEVOCIONALES = {
    A: {
      enfoque: "Sanar memoria, cerrar procesos y soltar el peso del ayer.",
      accion: "Haz una lista de eventos, decisiones o pérdidas del pasado que todavía tienen peso en ti. Preséntalos a Dios uno por uno y declara que ya no gobernarán tu presente.",
      oracion: "Señor, hoy renuncio a seguir viviendo atado a lo que ya pasó. Entrego mis recuerdos, mis heridas, mis culpas y mis procesos no cerrados. Sana mi memoria y restablece el flujo correcto en mí. En el nombre de Jesús, Amén."
    },
    B: {
      enfoque: "Fortalecer el gobierno del espíritu y permanecer en el presente.",
      accion: "Identifica qué estás cargando hoy. No lo niegues ni lo retengas: preséntalo en oración y declara que Cristo es tu fundamento.",
      oracion: "Señor, gracias porque me llamas a vivir hoy, en Tu voz y en Tu gobierno. Enséñame a permanecer, discernir y transferir correctamente. Que mi alma descanse y que mi espíritu gobierne. En el nombre de Jesús, Amén."
    },
    C: {
      enfoque: "Rendir el control, soltar la anticipación y regresar al presente.",
      accion: "Escribe las tres preocupaciones futuras que más te inquietan. Luego conviértelas en tres oraciones de entrega y repite: “Esto está en Tus manos, Señor”.",
      oracion: "Señor, hoy renuncio a controlar lo que todavía no ha llegado. Entrego mis planes, temores y escenarios futuros. Devuélveme al presente y enséñame a descansar en Tu dirección. En el nombre de Jesús, Amén."
    }
  };

  const FALLBACK_CAPITULOS = [
    {
      id: "prologo",
      titulo: "Prólogo — Síntesis",
      contenido: "<div class='badge'>Resumen</div><h3>Quién gobierna tu interior</h3><p>El hombre no colapsa por lo que vive, sino por dónde lo sostiene.</p>"
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

  function toTitleCase(text) {
    return String(text || "")
      .toLowerCase()
      .replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function escapeHtml(str) {
    return String(str || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function saveState() {
    try {
      const payload = {
        respuestas: state.respuestas,
        ultimoResultado: state.ultimoResultado,
        nombreUsuario: $("nombreUsuario") ? $("nombreUsuario").value.trim() : "",
        mentorUsuario: $("mentorUsuario") ? $("mentorUsuario").value.trim() : "",
        fechaEvaluacion: $("fechaEvaluacion") ? $("fechaEvaluacion").value : "",
        emailLibro: $("emailLibro") ? $("emailLibro").value.trim() : ""
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
      const inputEmail = $("emailLibro");

      if (inputNombre && saved.nombreUsuario) inputNombre.value = saved.nombreUsuario;
      if (inputMentor && saved.mentorUsuario) inputMentor.value = saved.mentorUsuario;
      if (inputFecha && saved.fechaEvaluacion) inputFecha.value = saved.fechaEvaluacion;
      if (inputEmail && saved.emailLibro) inputEmail.value = saved.emailLibro;
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

  function saveBookRequest(entry) {
    try {
      const raw = localStorage.getItem(APP_BOOK_REQUESTS_KEY);
      const arr = safeParse(raw, []);
      arr.unshift(entry);
      localStorage.setItem(APP_BOOK_REQUESTS_KEY, JSON.stringify(arr.slice(0, 300)));
    } catch (error) {
      warn("No se pudo guardar solicitud de libro:", error);
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

  function normalizarPreguntas(preguntas) {
    const base = Array.isArray(preguntas) ? preguntas.slice() : [];
    const ids = new Set(base.map((p) => p.id));

    EXTRA_PREGUNTAS.forEach((p) => {
      if (!ids.has(p.id)) {
        base.push(p);
        ids.add(p.id);
      }
    });

    return base.map((p) => ({
      ...p,
      titulo: p.eje === "A" ? "Carga del pasado" : p.eje === "B" ? "Carga del presente" : "Carga del futuro"
    }));
  }

  async function loadData() {
    state.preguntas = normalizarPreguntas(await fetchJson("data/preguntas.json", FALLBACK_PREGUNTAS));
    state.resultados = await fetchJson("data/resultados.json", FALLBACK_RESULTADOS);
    state.capitulos = await fetchJson("data/capitulos.json", FALLBACK_CAPITULOS);
    state.devocionales = await fetchJson("data/devocionales.json", FALLBACK_DEVOCIONALES);

    if (!Array.isArray(state.preguntas) || !state.preguntas.length) {
      state.preguntas = normalizarPreguntas(FALLBACK_PREGUNTAS);
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
    ensureResultControls();

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
      <div class="badge">Resumen editorial</div>
      <h3>Resumen del contenido</h3>
      <p>Esta sección presenta una síntesis del prólogo y de cada capítulo del libro. No corresponde al libro completo, sino a un resumen guiado de sus fundamentos.</p>
    `;

    state.capitulos.forEach((capitulo) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "capitulo-btn";
      btn.textContent = capitulo.titulo.startsWith("Resumen") || capitulo.titulo.includes("Síntesis")
        ? capitulo.titulo
        : `Resumen — ${capitulo.titulo}`;

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

  function getNivelCarga(porcentaje, eje) {
    if (eje === "B") {
      if (porcentaje >= 70) return "fortaleza alta";
      if (porcentaje >= 50) return "fortaleza media";
      if (porcentaje >= 35) return "fortaleza básica";
      return "fortaleza baja";
    }

    if (porcentaje >= 60) return "alta";
    if (porcentaje >= 40) return "media";
    if (porcentaje >= 20) return "moderada";
    return "baja";
  }

  function construirAnalisisPorCarga(result) {
    const { A, B, C } = result.porcentajes;

    const analisisA = {
      codigo: "A",
      titulo: "Carga del pasado",
      porcentaje: A,
      nivel: getNivelCarga(A, "A"),
      dictamen:
        A >= 60 ? "Existe una carga alta del pasado. El alma sigue sosteniendo memoria emocional no descargada." :
        A >= 40 ? "Existe una carga media del pasado. Aún hay episodios o procesos del ayer que siguen ejerciendo peso." :
        A >= 20 ? "Existe una carga moderada del pasado. Aunque no domina el sistema, todavía influye en la estabilidad interior." :
        "La carga del pasado es baja. No se observa predominio fuerte de memoria retenida en este momento.",
      recomendacion:
        A >= 40 ? "Trabajar sanidad de memoria, cierre de procesos, perdón y entrega específica de episodios no resueltos." :
        "Mantener vigilancia sobre recuerdos reactivos y continuar fortaleciendo la transferencia correcta."
    };

    const analisisB = {
      codigo: "B",
      titulo: "Carga del presente",
      porcentaje: B,
      nivel: getNivelCarga(B, "B"),
      dictamen:
        B >= 70 ? "La capacidad de permanecer en el presente es alta. Hay buen potencial de reposo, discernimiento y transferencia actual." :
        B >= 50 ? "La capacidad de permanecer en el presente es media. Existe base funcional, aunque aún compite con influencias del pasado o del futuro." :
        B >= 35 ? "La capacidad de permanecer en el presente es básica. El sistema necesita fortalecer su permanencia y su gobierno espiritual." :
        "La capacidad de permanecer en el presente es baja. El sistema se encuentra más desplazado hacia cargas del pasado o del futuro.",
      recomendacion:
        B >= 50 ? "Consolidar hábitos de quietud, oración, discernimiento y entrega diaria de la carga actual." :
        "Fortalecer la permanencia en el presente mediante ejercicios de descanso, oración guiada y enfoque en la voz de Dios para hoy."
    };

    const analisisC = {
      codigo: "C",
      titulo: "Carga del futuro",
      porcentaje: C,
      nivel: getNivelCarga(C, "C"),
      dictamen:
        C >= 60 ? "Existe una carga alta del futuro. La mente se está adelantando al mañana y sosteniendo internamente escenarios no ocurridos." :
        C >= 40 ? "Existe una carga media del futuro. Hay tendencia importante a la anticipación, el control y la inquietud." :
        C >= 20 ? "Existe una carga moderada del futuro. Aunque no domina el sistema, sí aparece como foco de tensión interna." :
        "La carga del futuro es baja. No se observa predominio fuerte de anticipación o control en este momento.",
      recomendacion:
        C >= 40 ? "Trabajar entrega del control, reducción de anticipación mental y retorno consciente al presente." :
        "Mantener hábitos de reposo y vigilancia sobre pensamientos anticipatorios."
    };

    return [analisisA, analisisB, analisisC];
  }

  function construirDictamenGlobal(result, analisis) {
    const A = analisis[0];
    const B = analisis[1];
    const C = analisis[2];

    let conclusion = "";

    if (B.porcentaje >= 60 && A.porcentaje < 35 && C.porcentaje < 35) {
      conclusion = "El sistema interior presenta una base estable en el presente. Existe mejor capacidad de reposo, discernimiento y transferencia, aunque sigue siendo necesario vigilar las influencias secundarias del pasado y del futuro.";
    } else if (A.porcentaje >= 40 && C.porcentaje >= 40) {
      conclusion = "El sistema interior muestra tensión simultánea entre pasado y futuro. La permanencia en el presente se encuentra reducida, y se observa riesgo de desgaste por memoria retenida y anticipación acumulada al mismo tiempo.";
    } else if (A.porcentaje >= 40 && B.porcentaje >= 40) {
      conclusion = "El sistema interior conserva base funcional en el presente, pero arrastra carga significativa del pasado. La estabilidad existe, aunque se ve afectada por procesos no cerrados o memorias con peso activo.";
    } else if (C.porcentaje >= 40 && B.porcentaje >= 40) {
      conclusion = "El sistema interior conserva base funcional en el presente, pero presenta influencia importante del futuro. La estabilidad es parcial y se ve afectada por tendencia al control y a la anticipación.";
    } else if (A.porcentaje >= 50) {
      conclusion = "El sistema interior se encuentra mayormente influido por la carga del pasado. La memoria emocional está ocupando más espacio del deseable y requiere intervención específica.";
    } else if (C.porcentaje >= 50) {
      conclusion = "El sistema interior se encuentra mayormente influido por la carga del futuro. La mente se adelanta al mañana y necesita recuperar reposo y dirección presente.";
    } else {
      conclusion = "El sistema interior presenta un estado mixto. No hay colapso absoluto en una sola carga, pero sí áreas que requieren fortalecimiento del presente, transferencia y alineación interior.";
    }

    return conclusion;
  }

  function construirRecomendacionGlobal(analisis) {
    const aAlta = analisis[0].porcentaje >= 40;
    const bBaja = analisis[1].porcentaje < 45;
    const cAlta = analisis[2].porcentaje >= 40;

    if (aAlta && cAlta) {
      return "Se recomienda trabajar simultáneamente sanidad de memoria y rendición del control futuro, priorizando ejercicios que devuelvan a la persona al presente y fortalezcan el gobierno del espíritu.";
    }

    if (aAlta) {
      return "Se recomienda priorizar procesos de sanidad interior, cierre de ciclos, perdón y entrega específica de memorias retenidas.";
    }

    if (cAlta) {
      return "Se recomienda priorizar ejercicios de reposo, desaceleración mental, oración de entrega y enfoque en la provisión diaria de Dios.";
    }

    if (bBaja) {
      return "Se recomienda fortalecer hábitos de permanencia en el presente: oración guiada, respiración consciente, escritura devocional y revisión diaria de cargas actuales.";
    }

    return "Se recomienda conservar los hábitos que sostienen el presente, profundizar el discernimiento espiritual y mantener transferencia constante hacia Cristo.";
  }

  function construirDevocionalesIntegrales(result) {
    const analisis = construirAnalisisPorCarga(result);

    const devA = {
      titulo: "Devocional — Carga del pasado",
      lectura: "Resumen temático: el peso del ayer no domina por lo que ocurrió, sino por lo que todavía no fue entregado. La memoria retenida ocupa espacio en el alma cuando el flujo se interrumpe.",
      enfoque: analisis[0].recomendacion,
      practica: "Ora nombrando con claridad aquello que aún recuerdas con peso. No solo lo menciones: entrégalo deliberadamente.",
      oracion: "Señor, hoy renuncio a vivir gobernado por lo que ya pasó. Te entrego recuerdos, heridas y procesos inconclusos. Sana mi memoria y restablece el flujo correcto en mí. Amén."
    };

    const devB = {
      titulo: "Devocional — Carga del presente",
      lectura: "Resumen temático: el presente es el punto donde el espíritu puede gobernar y el alma puede dejar de cargar. Permanecer aquí no es pasividad: es diseño correcto.",
      enfoque: analisis[1].recomendacion,
      practica: "Detén el ritmo del día por unos minutos. Identifica qué estás cargando hoy y exprésalo en una oración breve y concreta.",
      oracion: "Señor, enséñame a vivir hoy, bajo Tu voz y bajo Tu gobierno. Fortalece mi espíritu y permite que mi alma encuentre reposo. Amén."
    };

    const devC = {
      titulo: "Devocional — Carga del futuro",
      lectura: "Resumen temático: el mañana pesa cuando el alma quiere controlarlo antes de tiempo. La ansiedad se reduce cuando el futuro vuelve a las manos de Dios.",
      enfoque: analisis[2].recomendacion,
      practica: "Escribe tus temores del mañana y conviértelos en declaraciones de entrega. Devuelve el futuro al lugar correcto.",
      oracion: "Señor, hoy suelto el control de lo que aún no ha llegado. Te entrego mi futuro, mis planes y mis escenarios imaginados. Devuélveme al presente. Amén."
    };

    return [devA, devB, devC];
  }

  function ensureSvgMarkers() {
    const svg = $("porticoSvg");
    if (!svg) return;

    const ns = "http://www.w3.org/2000/svg";

    let defs = svg.querySelector("defs");
    if (!defs) {
      defs = document.createElementNS(ns, "defs");
      svg.insertBefore(defs, svg.firstChild);
    }

    const markers = [
      { id: "markerPast", color: "#3b82f6" },
      { id: "markerPresent", color: "#22c55e" },
      { id: "markerFuture", color: "#ef4444" }
    ];

    markers.forEach((m) => {
      if (!svg.querySelector(`#${m.id}`)) {
        const marker = document.createElementNS(ns, "marker");
        marker.setAttribute("id", m.id);
        marker.setAttribute("markerWidth", "8");
        marker.setAttribute("markerHeight", "8");
        marker.setAttribute("refX", "4");
        marker.setAttribute("refY", "4");
        marker.setAttribute("orient", "auto");
        marker.setAttribute("markerUnits", "strokeWidth");

        const path = document.createElementNS(ns, "path");
        path.setAttribute("d", "M0,0 L8,4 L0,8 z");
        path.setAttribute("fill", m.color);

        marker.appendChild(path);
        defs.appendChild(marker);
      }
    });
  }

  function ensureSvgTexts() {
    const svg = $("porticoSvg");
    if (!svg) return;

    const ns = "http://www.w3.org/2000/svg";

    function ensureText(id, x, y, txt, color, size, weight) {
      let el = svg.querySelector(`#${id}`);
      if (!el) {
        el = document.createElementNS(ns, "text");
        el.setAttribute("id", id);
        svg.appendChild(el);
      }
      el.setAttribute("x", String(x));
      el.setAttribute("y", String(y));
      el.setAttribute("text-anchor", "middle");
      el.setAttribute("font-size", String(size));
      el.setAttribute("fill", color);
      el.setAttribute("font-weight", weight || "700");
      el.textContent = txt;
    }

    ensureText("labelAlma", 160, 66, "ALMA", "#f8fafc", 11, "700");
    ensureText("labelEspiritu", 160, 130, "ESPÍRITU", "#f8fafc", 11, "700");
    ensureText("labelCristo", 160, 198, "CRISTO", "#f4d77a", 12, "700");
  }

  function ocultarElementosNoDeseados() {
    const carga = $("carga");
    const flechaActual = $("flechaActual");

    if (carga) {
      carga.setAttribute("r", "0");
      carga.style.display = "none";
    }

    if (flechaActual) {
      flechaActual.setAttribute("stroke-width", "0");
      flechaActual.style.display = "none";
    }
  }

  function pintarPortico(result) {
    const { A, B, C } = result.porcentajes;

    const viga = $("viga");
    const columna = $("columna");

    const flechaPasado = $("flechaPasado");
    const flechaPresente = $("flechaPresente");
    const flechaFuturo = $("flechaFuturo");

    const labelPasado = $("labelPasado");
    const labelPresente = $("labelPresente");
    const labelFuturo = $("labelFuturo");

    ensureSvgMarkers();
    ensureSvgTexts();
    ocultarElementosNoDeseados();

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

    if (flechaPasado) {
      flechaPasado.setAttribute("stroke-width", String(Math.max(2, A / 10)));
      flechaPasado.setAttribute("marker-end", "url(#markerPast)");
      flechaPasado.style.opacity = String(Math.max(0.35, A / 100));
    }

    if (flechaPresente) {
      flechaPresente.setAttribute("stroke-width", String(Math.max(2, B / 10)));
      flechaPresente.setAttribute("marker-end", "url(#markerPresent)");
      flechaPresente.style.opacity = String(Math.max(0.35, B / 100));
    }

    if (flechaFuturo) {
      flechaFuturo.setAttribute("stroke-width", String(Math.max(2, C / 10)));
      flechaFuturo.setAttribute("marker-end", "url(#markerFuture)");
      flechaFuturo.style.opacity = String(Math.max(0.35, C / 100));
    }

    if (labelPasado) labelPasado.textContent = `${A}%`;
    if (labelPresente) labelPresente.textContent = `${B}%`;
    if (labelFuturo) labelFuturo.textContent = `${C}%`;

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
            <span>Carga del pasado</span>
            <span>${result.porcentajes.A}%</span>
          </div>
          <div class="metrica-barra"><span style="width:${result.porcentajes.A}%"></span></div>
        </div>

        <div class="metrica metrica-present">
          <div class="metrica-header">
            <span>Carga del presente</span>
            <span>${result.porcentajes.B}%</span>
          </div>
          <div class="metrica-barra"><span style="width:${result.porcentajes.B}%"></span></div>
        </div>

        <div class="metrica metrica-future">
          <div class="metrica-header">
            <span>Carga del futuro</span>
            <span>${result.porcentajes.C}%</span>
          </div>
          <div class="metrica-barra"><span style="width:${result.porcentajes.C}%"></span></div>
        </div>
      </div>
    `;
  }

  function ensureResultControls() {
    const section = $("resultado");
    if (!section) return;

    if (!$("btnDevocionales")) {
      const btn = document.createElement("button");
      btn.id = "btnDevocionales";
      btn.type = "button";
      btn.className = "secondary";
      btn.textContent = "📖 Devocionales";
      btn.addEventListener("click", toggleDevocionales);
      section.querySelector(".container")?.appendChild(btn);
    }

    if (!$("panelDevocionales")) {
      const panel = document.createElement("div");
      panel.id = "panelDevocionales";
      panel.className = "hidden";
      panel.style.marginTop = "18px";
      section.querySelector(".container")?.appendChild(panel);
    }
  }

  function renderDevocionales(result) {
    const panel = $("panelDevocionales");
    if (!panel) return;

    const devocionales = construirDevocionalesIntegrales(result);

    panel.innerHTML = `
      <div class="bloque-info">
        <strong>Devocionales guiados</strong>
        <p>Estos devocionales se construyen a partir de los fundamentos resumidos del libro y se enfocan en cada carga detectada en tu evaluación.</p>
      </div>

      ${devocionales.map((d) => `
        <div id="contenidoCapitulo" style="margin-top:18px;">
          <div class="badge">Devocional</div>
          <h3>${escapeHtml(d.titulo)}</h3>
          <p><strong>Lectura base:</strong> ${escapeHtml(d.lectura)}</p>
          <p><strong>Enfoque:</strong> ${escapeHtml(d.enfoque)}</p>
          <p><strong>Práctica:</strong> ${escapeHtml(d.practica)}</p>
          <div class="bloque-info">
            <strong>Oración</strong>
            <p>${escapeHtml(d.oracion)}</p>
          </div>
        </div>
      `).join("")}
    `;

    if (state.devocionalesAbiertos) {
      panel.classList.remove("hidden");
    } else {
      panel.classList.add("hidden");
    }
  }

  function toggleDevocionales() {
    const panel = $("panelDevocionales");
    if (!panel || !state.ultimoResultado) {
      alert("Primero debes calcular un resultado.");
      return;
    }

    state.devocionalesAbiertos = !state.devocionalesAbiertos;
    renderDevocionales(state.ultimoResultado);
  }

  function renderResultado(result) {
    const resultadoTexto = $("resultadoTexto");
    const detalleResultado = $("detalleResultado");

    if (!resultadoTexto || !detalleResultado) return;

    const analisis = construirAnalisisPorCarga(result);
    const dictamenGlobal = construirDictamenGlobal(result, analisis);
    const recomendacionGlobal = construirRecomendacionGlobal(analisis);

    resultadoTexto.innerHTML = `
      <div class="resultado-titulo">Evaluación integral de cargas</div>
      <p><strong>Resumen del sistema:</strong> esta lectura no se basa solo en la carga más alta, sino en la interacción entre pasado, presente y futuro.</p>

      <div class="bloque-info">
        <strong>Dictamen general:</strong>
        <p>${dictamenGlobal}</p>
      </div>

      <div class="bloque-info">
        <strong>Recomendación general:</strong>
        <p>${recomendacionGlobal}</p>
      </div>
    `;

    detalleResultado.innerHTML = `
      <div class="badge">Diagnóstico integral</div>

      <p><strong>Nombre:</strong> ${escapeHtml(result.nombre)}</p>
      <p><strong>Mentor:</strong> ${escapeHtml(result.mentor || "No registrado")}</p>
      <p><strong>Fecha:</strong> ${formatearFechaVisible(result.fecha)}</p>

      <hr>

      ${analisis.map((item) => `
        <h3>${item.titulo} — ${item.porcentaje}%</h3>
        <p><strong>Nivel:</strong> ${toTitleCase(item.nivel)}</p>
        <p><strong>Dictamen:</strong> ${item.dictamen}</p>
        <div class="bloque-info">
          <strong>Recomendación:</strong>
          <p>${item.recomendacion}</p>
        </div>
      `).join("")}
    `;

    pintarPortico(result);
    renderDevocionales(result);
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

  function obtenerPortadaLibroSrc() {
    const img = $("portadaLibro");
    if (img && img.getAttribute("src")) {
      return img.getAttribute("src");
    }
    return "assets/portada-libro.png";
  }

  function svgToDataUri() {
    const svg = $("porticoSvg");
    if (!svg) return "";

    const clone = svg.cloneNode(true);

    // Asegurar textos y ocultar elementos no deseados en la copia
    const carga = clone.querySelector("#carga");
    if (carga) carga.remove();

    const flechaActual = clone.querySelector("#flechaActual");
    if (flechaActual) flechaActual.remove();

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(clone);
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svgString);
  }

  function generarHtmlPDF(result) {
    const analisis = construirAnalisisPorCarga(result);
    const dictamenGlobal = construirDictamenGlobal(result, analisis);
    const recomendacionGlobal = construirRecomendacionGlobal(analisis);
    const devocionales = construirDevocionalesIntegrales(result);
    const portadaSrc = obtenerPortadaLibroSrc();
    const svgData = svgToDataUri();

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
    margin:36px;
    line-height:1.55;
  }
  h1,h2,h3{
    margin:0 0 10px;
  }
  h1{
    font-size:24px;
    text-transform:uppercase;
    letter-spacing:.04em;
  }
  h2{
    font-size:18px;
    margin-top:28px;
    color:#92400e;
  }
  h3{
    font-size:15px;
    margin-top:20px;
  }
  .sub{
    font-style:italic;
    margin-bottom:18px;
    color:#374151;
  }
  .box{
    border:1px solid #d1d5db;
    border-left:5px solid #d4af37;
    padding:14px 16px;
    margin:14px 0;
    background:#f9fafb;
  }
  .meta p{
    margin:4px 0;
  }
  ul{
    margin:8px 0 14px 20px;
  }
  li{
    margin:4px 0;
  }
  .past{ color:#2563eb; font-weight:bold; }
  .present{ color:#16a34a; font-weight:bold; }
  .future{ color:#dc2626; font-weight:bold; }
  .small{
    color:#4b5563;
    font-size:12px;
  }
  .cover{
    text-align:center;
    margin-bottom:20px;
  }
  .cover img{
    max-width:240px;
    width:100%;
    border-radius:12px;
    box-shadow:0 12px 28px rgba(0,0,0,.18);
  }
  .schema{
    text-align:center;
    margin:18px 0;
  }
  .schema img{
    max-width:420px;
    width:100%;
  }
  hr{
    border:none;
    border-top:1px solid #d1d5db;
    margin:18px 0;
  }
</style>
</head>
<body>
  <div class="cover">
    <img src="${portadaSrc}" alt="Portada del libro">
  </div>

  <h1>Gobierno del Hombre Interior</h1>
  <p class="sub">Informe de evaluación integral del paciente</p>

  <div class="meta">
    <p><strong>Paciente:</strong> ${escapeHtml(result.nombre)}</p>
    <p><strong>Mentor:</strong> ${escapeHtml(result.mentor || "No registrado")}</p>
    <p><strong>Fecha:</strong> ${formatearFechaVisible(result.fecha)}</p>
  </div>

  <h2>Esquema visual</h2>
  <div class="schema">
    ${svgData ? `<img src="${svgData}" alt="Esquema de cargas">` : ""}
  </div>

  <h2>Dictamen general</h2>
  <div class="box">
    <p>${escapeHtml(dictamenGlobal)}</p>
  </div>

  <h2>Recomendación general</h2>
  <div class="box">
    <p>${escapeHtml(recomendacionGlobal)}</p>
  </div>

  <h2>Distribución de cargas</h2>
  <ul>
    <li class="past">Carga del pasado: ${result.porcentajes.A}%</li>
    <li class="present">Carga del presente: ${result.porcentajes.B}%</li>
    <li class="future">Carga del futuro: ${result.porcentajes.C}%</li>
  </ul>
  <p class="small">Puntajes base: A=${result.puntajes.A}, B=${result.puntajes.B}, C=${result.puntajes.C}</p>

  <h2>Análisis por carga</h2>
  ${analisis.map((item) => `
    <div class="box">
      <h3>${escapeHtml(item.titulo)} — ${item.porcentaje}%</h3>
      <p><strong>Nivel:</strong> ${escapeHtml(toTitleCase(item.nivel))}</p>
      <p><strong>Dictamen:</strong> ${escapeHtml(item.dictamen)}</p>
      <p><strong>Recomendación:</strong> ${escapeHtml(item.recomendacion)}</p>
    </div>
  `).join("")}

  <h2>Devocionales sugeridos</h2>
  ${devocionales.map((d) => `
    <div class="box">
      <h3>${escapeHtml(d.titulo)}</h3>
      <p><strong>Lectura base:</strong> ${escapeHtml(d.lectura)}</p>
      <p><strong>Práctica:</strong> ${escapeHtml(d.practica)}</p>
      <p><strong>Oración:</strong> ${escapeHtml(d.oracion)}</p>
    </div>
  `).join("")}

  <h2>Observación final</h2>
  <div class="box">
    <p>Este informe presenta una lectura espiritual y estructural del estado del hombre interior con base en las cargas del pasado, del presente y del futuro, orientando al paciente hacia reposo, transferencia y gobierno interior correcto.</p>
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
    const win = window.open("", "_blank", "width=1000,height=1100");

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
      }, 400);
    };
  }

  function solicitarLibro() {
    const input = $("emailLibro");
    const email = input ? input.value.trim() : "";

    if (!email) {
      alert("Por favor escribe tu correo electrónico.");
      return;
    }

    const emailValido = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    if (!emailValido) {
      alert("Por favor escribe un correo electrónico válido.");
      return;
    }

    const solicitud = {
      email,
      fecha: new Date().toLocaleString("es-CO"),
      nombre: $("nombreUsuario") ? $("nombreUsuario").value.trim() : "",
      mentor: $("mentorUsuario") ? $("mentorUsuario").value.trim() : ""
    };

    saveBookRequest(solicitud);
    saveState();

    alert("Tu solicitud del libro completo ha sido registrada. Luego podrás compartirlo directamente.");
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
      state.devocionalesAbiertos = false;

      const nombre = $("nombreUsuario");
      const mentor = $("mentorUsuario");
      const fecha = $("fechaEvaluacion");
      const email = $("emailLibro");

      if (nombre) nombre.value = "";
      if (mentor) mentor.value = "";
      if (fecha) fecha.value = getTodayISO();
      if (email) email.value = "";

      document.querySelectorAll("input[type='radio']").forEach((radio) => {
        radio.checked = false;
      });

      const resultadoTexto = $("resultadoTexto");
      const detalleResultado = $("detalleResultado");
      const metricas = $("metricasResultado");
      const panelDevocionales = $("panelDevocionales");

      if (resultadoTexto) resultadoTexto.innerHTML = "";
      if (detalleResultado) detalleResultado.innerHTML = "";
      if (metricas) {
        metricas.innerHTML = "";
        metricas.classList.add("hidden");
      }
      if (panelDevocionales) {
        panelDevocionales.innerHTML = "";
        panelDevocionales.classList.add("hidden");
      }

      ["flechaPasado", "flechaPresente", "flechaFuturo"].forEach((id) => {
        const el = $(id);
        if (el) {
          el.setAttribute("stroke-width", "0");
          el.style.opacity = "1";
        }
      });

      ["labelPasado", "labelPresente", "labelFuturo"].forEach((id) => {
        const el = $(id);
        if (el) el.textContent = "";
      });

      const carga = $("carga");
      if (carga) {
        carga.setAttribute("r", "0");
        carga.style.display = "none";
      }

      const flechaActual = $("flechaActual");
      if (flechaActual) {
        flechaActual.setAttribute("stroke-width", "0");
        flechaActual.style.display = "none";
      }

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
    window.toggleDevocionales = toggleDevocionales;
    window.solicitarLibro = solicitarLibro;
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