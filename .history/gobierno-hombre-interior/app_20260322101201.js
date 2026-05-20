(function () {
  "use strict";

  /* =========================================================
     GOBIERNO DEL HOMBRE INTERIOR - APP.JS
     Base funcional completa
     Compatible con:
     /CONSTRUCTOR-DIGITAL/gobierno-hombre-interior/
     ========================================================= */

  const APP_STORAGE_KEY = "gobierno_hombre_interior_estado";
  const APP_HISTORY_KEY = "gobierno_hombre_interior_historial";

  const state = {
    preguntas: [],
    resultados: null,
    capitulos: [],
    devocionales: null,
    respuestas: {},
    ultimoResultado: null
  };

  const FALLBACK_PREGUNTAS = [
    {
      id: "a1",
      eje: "A",
      titulo: "Pórtico del pasado",
      texto: "Pienso con frecuencia en situaciones del pasado que todavía me pesan."
    },
    {
      id: "a2",
      eje: "A",
      titulo: "Pórtico del pasado",
      texto: "Siento que hay recuerdos que todavía gobiernan cómo me siento hoy."
    },
    {
      id: "a3",
      eje: "A",
      titulo: "Pórtico del pasado",
      texto: "Me cuesta soltar experiencias antiguas aunque hayan pasado años."
    },
    {
      id: "b1",
      eje: "B",
      titulo: "Pórtico del presente",
      texto: "Puedo entregar a Dios lo que siento sin quedarme cargándolo."
    },
    {
      id: "b2",
      eje: "B",
      titulo: "Pórtico del presente",
      texto: "Normalmente vivo un día a la vez, sin quedarme atrapado entre pasado y futuro."
    },
    {
      id: "b3",
      eje: "B",
      titulo: "Pórtico del presente",
      texto: "Percibo paz interior aun en medio de situaciones difíciles."
    },
    {
      id: "c1",
      eje: "C",
      titulo: "Pórtico del futuro",
      texto: "Con frecuencia me preocupo por cosas que todavía no han ocurrido."
    },
    {
      id: "c2",
      eje: "C",
      titulo: "Pórtico del futuro",
      texto: "Mi mente suele adelantarse a escenarios negativos del mañana."
    },
    {
      id: "c3",
      eje: "C",
      titulo: "Pórtico del futuro",
      texto: "Me cuesta descansar porque siento que debo controlar lo que viene."
    }
  ];

  const FALLBACK_RESULTADOS = {
    A: {
      codigo: "A",
      nombre: "Pórtico del pasado",
      subtipo: "Depresión / carga retenida",
      frase: "El pasado pesa cuando el alma decide sostener lo que debía entregar.",
      versiculo: "Isaías 43:18 — “No os acordéis de las cosas pasadas…”",
      descripcion:
        "Tu resultado indica que el alma está reteniendo cargas asociadas al pasado. El flujo hacia el espíritu y hacia Cristo se encuentra interrumpido por recuerdos, peso emocional o procesos que no han sido completamente entregados.",
      principio:
        "La depresión no es solo tristeza: es una estructura donde la carga nunca descendió."
    },
    B: {
      codigo: "B",
      nombre: "Pórtico del presente",
      subtipo: "Gobierno correcto / paz",
      frase: "El presente es el único lugar donde el alma deja de cargar y el espíritu comienza a gobernar.",
      versiculo: "Hebreos 3:15 — “Si oyereis hoy su voz…”",
      descripcion:
        "Tu resultado indica un mejor equilibrio interior. El alma percibe, el espíritu gobierna y la carga encuentra mejor transferencia hacia Cristo. Este es el modelo más estable del diseño interior.",
      principio:
        "La paz no es ausencia de carga: es evidencia de un sistema correctamente gobernado."
    },
    C: {
      codigo: "C",
      nombre: "Pórtico del futuro",
      subtipo: "Ansiedad / carga anticipada",
      frase: "El futuro pesa cuando el alma intenta controlar lo que aún no ha llegado.",
      versiculo: "Mateo 6:34 — “No os afanéis por el día de mañana…”",
      descripcion:
        "Tu resultado indica que el alma está anticipando escenarios futuros y cargando antes de tiempo lo que todavía no existe. El flujo está interrumpido por el intento de control.",
      principio:
        "La ansiedad no nace del futuro: nace del intento del alma por controlarlo."
    }
  };

  const FALLBACK_CAPITULOS = [
    {
      id: "prologo",
      titulo: "Prólogo",
      contenido: `
        <div class="badge">Inicio</div>
        <h3>Quién gobierna tu interior</h3>
        <p>Este libro enseña que el problema del hombre no es la carga, sino quién la sostiene. El alma no fue diseñada para gobernar, sino para percibir; el espíritu fue dado para discernir y transferir; y Cristo es el fundamento que sostiene completamente.</p>
      `
    },
    {
      id: "cap1",
      titulo: "Capítulo 1 — El diseño original del hombre",
      contenido: `
        <div class="badge">Capítulo 1</div>
        <h3>El sistema que Dios estableció</h3>
        <p>El hombre fue creado como un sistema: espíritu, alma y cuerpo. Cuando ese orden se respeta, hay estabilidad. Cuando se altera, aparece desgaste.</p>
        <div class="bloque-info">El alma recibe, el espíritu gobierna y Cristo sostiene.</div>
      `
    },
    {
      id: "cap8",
      titulo: "Capítulo 8 — El pórtico del pasado",
      contenido: `
        <div class="badge">Capítulo 8</div>
        <h3>Depresión como carga retenida</h3>
        <p>El pórtico A representa el alma reteniendo el peso del pasado. La carga llega, pero no desciende al espíritu ni alcanza el fundamento.</p>
      `
    },
    {
      id: "cap10",
      titulo: "Capítulo 10 — El pórtico del futuro",
      contenido: `
        <div class="badge">Capítulo 10</div>
        <h3>Ansiedad como carga anticipada</h3>
        <p>El pórtico C representa el alma intentando cargar el futuro antes de tiempo. La mente anticipa, el alma se tensa y el flujo se interrumpe.</p>
      `
    },
    {
      id: "cap12",
      titulo: "Capítulo 12 — El pórtico del presente",
      contenido: `
        <div class="badge">Capítulo 12</div>
        <h3>Gobierno correcto</h3>
        <p>El pórtico B representa el diseño funcionando correctamente: el alma percibe, el espíritu discierne y Cristo sostiene. Aquí aparece la paz.</p>
      `
    },
    {
      id: "conclusion",
      titulo: "Conclusión profética",
      contenido: `
        <div class="badge">Cierre</div>
        <h3>El hombre restaurado</h3>
        <p>El hombre restaurado no vive sin problemas, pero ya no vive cargándolos. Ha vuelto al diseño: el espíritu gobierna, el alma descansa y Cristo sostiene.</p>
      `
    }
  ];

  const FALLBACK_DEVOCIONALES = {
    A: {
      oracion:
        "Señor, hoy traigo delante de Ti todo lo que he cargado del pasado. Lo que me dolió, lo que no entendí y lo que no pude cambiar. Hoy decido soltarlo. Recibe todo lo que mi alma ha sostenido por tanto tiempo.",
      accion:
        "Haz una lista de recuerdos o cargas del pasado que siguen teniendo peso en ti. Ora por cada una y declara: ‘Esto ya no gobernará mi presente’.",
      enfoque: "Sanar memoria, cerrar procesos, restaurar flujo."
    },
    B: {
      oracion:
        "Señor, enséñame a permanecer en el presente, donde Tú hablas, donde Tú guías y donde Tú sostienes. Que mi espíritu gobierne y que mi alma encuentre descanso en Ti.",
      accion:
        "Dedica unos minutos a revisar qué estás cargando hoy. Entrégalo conscientemente en oración antes de dormir.",
      enfoque: "Permanecer, discernir, transferir continuamente."
    },
    C: {
      oracion:
        "Señor, hoy renuncio a querer controlar lo que no me corresponde. Entrego a Ti mi futuro, mis planes y mis temores. Enséñame a vivir en el presente y a descansar en Tu dirección.",
      accion:
        "Escribe tres cosas que estás intentando controlar. Luego convierte cada una en una oración de entrega.",
      enfoque: "Rendir control, volver al presente, descansar en Cristo."
    }
  };

  const OPCIONES = [
    { valor: 0, texto: "Nunca" },
    { valor: 1, texto: "A veces" },
    { valor: 2, texto: "Frecuentemente" },
    { valor: 3, texto: "Casi siempre" }
  ];

  function $(id) {
    return document.getElementById(id);
  }

  function getScreens() {
    return Array.from(document.querySelectorAll(".screen"));
  }

  function showScreen(screenId) {
    getScreens().forEach((section) => {
      section.classList.remove("active");
    });

    const target = $(screenId);
    if (target) {
      target.classList.add("active");
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }

  function safeParse(json, fallback) {
    try {
      return JSON.parse(json);
    } catch (_) {
      return fallback;
    }
  }

  function saveState() {
    const payload = {
      respuestas: state.respuestas,
      ultimoResultado: state.ultimoResultado,
      nombreUsuario: $("nombreUsuario") ? $("nombreUsuario").value.trim() : ""
    };
    localStorage.setItem(APP_STORAGE_KEY, JSON.stringify(payload));
  }

  function restoreState() {
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
  }

  function saveHistory(entry) {
    const raw = localStorage.getItem(APP_HISTORY_KEY);
    const arr = safeParse(raw, []);
    arr.unshift(entry);
    localStorage.setItem(APP_HISTORY_KEY, JSON.stringify(arr.slice(0, 50)));
  }

  async function fetchJson(path, fallback) {
    try {
      const res = await fetch(path, { cache: "no-store" });
      if (!res.ok) throw new Error(`No se pudo cargar ${path}`);
      return await res.json();
    } catch (_) {
      return fallback;
    }
  }

  async function loadData() {
    state.preguntas = await fetchJson("data/preguntas.json", FALLBACK_PREGUNTAS);
    state.resultados = await fetchJson("data/resultados.json", FALLBACK_RESULTADOS);
    state.capitulos = await fetchJson("data/capitulos.json", FALLBACK_CAPITULOS);
    state.devocionales = await fetchJson("data/devocionales.json", FALLBACK_DEVOCIONALES);

    renderPreguntas();
    renderCapitulos();
    restoreState();
    restoreSelectedAnswers();
  }

  function renderPreguntas() {
    const container = $("preguntasContainer");
    if (!container) return;

    container.innerHTML = "";

    state.preguntas.forEach((pregunta, index) => {
      const card = document.createElement("div");
      card.className = "pregunta-card";

      const titulo = document.createElement("h3");
      titulo.textContent = `${index + 1}. ${pregunta.titulo}`;

      const texto = document.createElement("p");
      texto.className = "pregunta-texto";
      texto.textContent = pregunta.texto;

      const opciones = document.createElement("div");
      opciones.className = "opciones";

      OPCIONES.forEach((op) => {
        const row = document.createElement("div");
        row.className = "opcion";

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

        row.appendChild(input);
        row.appendChild(label);
        opciones.appendChild(row);
      });

      card.appendChild(titulo);
      card.appendChild(texto);
      card.appendChild(opciones);

      container.appendChild(card);
    });
  }

  function restoreSelectedAnswers() {
    Object.keys(state.respuestas).forEach((preguntaId) => {
      const value = state.respuestas[preguntaId];
      const input = document.getElementById(`${preguntaId}_${value}`);
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
      <p>Selecciona un capítulo para leerlo aquí. Más adelante podrás cargar el contenido completo desde <strong>data/capitulos.json</strong>.</p>
    `;

    state.capitulos.forEach((cap) => {
      const btn = document.createElement("button");
      btn.className = "capitulo-btn";
      btn.type = "button";
      btn.textContent = cap.titulo;
      btn.addEventListener("click", () => {
        contenido.innerHTML = cap.contenido || `<p>${cap.titulo}</p>`;
        window.scrollTo({ top: lista.offsetTop, behavior: "smooth" });
      });
      lista.appendChild(btn);
    });
  }

  function getPreguntaById(id) {
    return state.preguntas.find((p) => p.id === id);
  }

  function validarRespuestasCompletas() {
    return state.preguntas.every((p) => typeof state.respuestas[p.id] === "number");
  }

  function sumarPorEjes() {
    const sum = { A: 0, B: 0, C: 0 };

    state.preguntas.forEach((pregunta) => {
      const val = Number(state.respuestas[pregunta.id] || 0);

      if (pregunta.eje === "A") sum.A += val;
      if (pregunta.eje === "B") sum.B += val;
      if (pregunta.eje === "C") sum.C += val;
    });

    return sum;
  }

  function calcularPorcentajes(sum) {
    const total = sum.A + sum.B + sum.C;
    if (total <= 0) {
      return { A: 0, B: 0, C: 0 };
    }

    return {
      A: Math.round((sum.A / total) * 100),
      B: Math.round((sum.B / total) * 100),
      C: Math.round((sum.C / total) * 100)
    };
  }

  function determinarDominante(sum) {
    const entries = [
      { eje: "A", valor: sum.A },
      { eje: "B", valor: sum.B },
      { eje: "C", valor: sum.C }
    ].sort((a, b) => b.valor - a.valor);

    const primero = entries[0];
    const segundo = entries[1];

    const empate = primero.valor === segundo.valor;

    return {
      dominante: primero.eje,
      empate,
      mezcla: empate ? `${primero.eje}/${segundo.eje}` : primero.eje,
      orden: entries
    };
  }

  function getDevocional(eje) {
    return (state.devocionales && state.devocionales[eje]) || FALLBACK_DEVOCIONALES[eje];
  }

  function getResultado(eje) {
    return (state.resultados && state.resultados[eje]) || FALLBACK_RESULTADOS[eje];
  }

  function pintarPortico(eje) {
    const carga = $("carga");
    const viga = $("viga");
    const columna = $("columna");

    if (!carga || !viga || !columna) return;

    viga.setAttribute("y", "70");
    viga.setAttribute("height", "12");
    columna.setAttribute("x", "150");
    columna.setAttribute("y", "82");
    columna.setAttribute("height", "90");

    if (eje === "A") {
      carga.setAttribute("cx", "70");
      carga.setAttribute("cy", "50");
      viga.setAttribute("y", "76");
    } else if (eje === "B") {
      carga.setAttribute("cx", "160");
      carga.setAttribute("cy", "50");
    } else if (eje === "C") {
      carga.setAttribute("cx", "250");
      carga.setAttribute("cy", "50");
      viga.setAttribute("y", "76");
    }
  }

  function renderResultado(finalResult) {
    const box = $("resultadoTexto");
    const detail = $("detalleResultado");

    if (!box || !detail) return;

    const resultado = getResultado(finalResult.dominante);
    const devocional = getDevocional(finalResult.dominante);

    const mezclaHtml = finalResult.empate
      ? `<p class="small-note"><strong>Lectura mixta:</strong> tu evaluación presenta una mezcla entre <strong>${finalResult.mezcla}</strong>. Se muestra el eje dominante principal para orientar tu proceso.</p>`
      : "";

    box.innerHTML = `
      <div class="resultado-titulo">${resultado.nombre}</div>
      <p><strong>Lectura:</strong> ${resultado.subtipo}</p>
      <p class="resultado-frase">“${resultado.frase.replace(/^“|”$/g, "")}”</p>
      <p>${resultado.descripcion}</p>
      <p class="resultado-versiculo">${resultado.versiculo}</p>
      <p class="resultado-principio"><strong>Principio:</strong> ${resultado.principio}</p>
      ${mezclaHtml}
    `;

    detail.innerHTML = `
      <div class="badge">Ruta sugerida</div>
      <p><strong>Enfoque:</strong> ${devocional.enfoque}</p>
      <p><strong>Acción práctica:</strong> ${devocional.accion}</p>
      <div class="bloque-info">
        <strong>Oración recomendada:</strong>
        <p>${devocional.oracion}</p>
      </div>
      <hr>
      <p><strong>Distribución general:</strong></p>
      <ul>
        <li>Pasado / Pórtico A: ${finalResult.porcentajes.A}%</li>
        <li>Presente / Pórtico B: ${finalResult.porcentajes.B}%</li>
        <li>Futuro / Pórtico C: ${finalResult.porcentajes.C}%</li>
      </ul>
    `;

    pintarPortico(finalResult.dominante);
  }

  function formatearFecha() {
    const now = new Date();
    return now.toLocaleString("es-CO", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit"
    });
  }

  function calcularResultadoInterno() {
    const nombre = $("nombreUsuario") ? $("nombreUsuario").value.trim() : "";

    if (!nombre) {
      alert("Por favor escribe tu nombre antes de continuar.");
      return null;
    }

    if (!validarRespuestasCompletas()) {
      alert("Debes responder todas las preguntas antes de calcular el resultado.");
      return null;
    }

    const sum = sumarPorEjes();
    const porcentajes = calcularPorcentajes(sum);
    const dominanteInfo = determinarDominante(sum);

    const finalResult = {
      nombre,
      fecha: formatearFecha(),
      puntajes: sum,
      porcentajes,
      dominante: dominanteInfo.dominante,
      empate: dominanteInfo.empate,
      mezcla: dominanteInfo.mezcla
    };

    state.ultimoResultado = finalResult;
    saveState();
    saveHistory(finalResult);

    return finalResult;
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
    const finalResult = calcularResultadoInterno();
    if (!finalResult) return;

    renderResultado(finalResult);
    showScreen("resultado");
  }

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("sw.js").catch(() => {
        /* silencioso por ahora */
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
    exposeGlobals();
    await loadData();
    registerSW();

    if (state.ultimoResultado) {
      renderResultado(state.ultimoResultado);
    }
  });
})();