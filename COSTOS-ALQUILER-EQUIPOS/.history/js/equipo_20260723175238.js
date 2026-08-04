"use strict";

/* ============================================================
   FICHA INDIVIDUAL DEL EQUIPO
   Archivo: js/equipo.js
   ============================================================ */

const EquipoApp = (() => {

  const ESTADO = {
    indice: [],
    registroIndice: null,
    datos: null,
    idSolicitado: "",
    rutaDatos: "",
    rutaImagen: ""
  };

  const SELECTORES = {
    estadoCarga: "estadoCarga",
    estadoError: "estadoError",
    fichaEquipo: "fichaEquipo",
    tituloError: "tituloError",
    descripcionError: "descripcionError",
    statusDot: "statusDot",
    statusTitle: "statusTitle",
    statusDescription: "statusDescription"
  };

  document.addEventListener("DOMContentLoaded", iniciar);

  async function iniciar() {
    configurarInterfaz();
    actualizarAnio();

    try {
      ESTADO.idSolicitado = obtenerIdEquipo();

      if (!ESTADO.idSolicitado) {
        throw new Error(
          "No se recibió el identificador del equipo en la dirección. " +
          "Abra la ficha desde el catálogo de equipos."
        );
      }

      actualizarEstado("Cargando", "Consultando el catálogo de equipos");

      ESTADO.indice = await cargarIndice();
      ESTADO.registroIndice = buscarEquipoEnIndice(
        ESTADO.indice,
        ESTADO.idSolicitado
      );

      if (!ESTADO.registroIndice) {
        throw new Error(
          `No se encontró el equipo "${ESTADO.idSolicitado}" en equipos-index.json.`
        );
      }

      ESTADO.rutaDatos = obtenerRutaDatos(ESTADO.registroIndice);
      ESTADO.rutaImagen = obtenerRutaImagen(ESTADO.registroIndice);

      actualizarEstado("Cargando", "Leyendo la ficha técnica del equipo");

      ESTADO.datos = await cargarArchivoDatos(ESTADO.rutaDatos);

      if (!ESTADO.datos || typeof ESTADO.datos !== "object") {
        throw new Error(
          "El archivo datos.js no contiene un objeto EQUIPO_DATOS válido."
        );
      }

      renderizarFicha(ESTADO.datos, ESTADO.registroIndice);
      mostrarFicha();
      actualizarEstado("Disponible", "Ficha cargada correctamente", true);

    } catch (error) {
      console.error(error);
      mostrarError(error);
      actualizarEstado("Error", "No fue posible cargar la ficha", false);
    }
  }

  /* ============================================================
     CARGA DE DATOS
     ============================================================ */

  function obtenerIdEquipo() {
    const parametros = new URLSearchParams(window.location.search);

    return (
      parametros.get("id") ||
      parametros.get("equipo") ||
      parametros.get("modelo") ||
      ""
    ).trim();
  }

  async function cargarIndice() {
    const respuesta = await fetch("data/equipos-index.json", {
      cache: "no-store"
    });

    if (!respuesta.ok) {
      throw new Error(
        `No fue posible abrir data/equipos-index.json. Código ${respuesta.status}.`
      );
    }

    const contenido = await respuesta.json();

    if (Array.isArray(contenido)) {
      return contenido;
    }

    if (Array.isArray(contenido.equipos)) {
      return contenido.equipos;
    }

    if (Array.isArray(contenido.items)) {
      return contenido.items;
    }

    throw new Error(
      "equipos-index.json debe contener un arreglo o una propiedad equipos."
    );
  }

  function buscarEquipoEnIndice(indice, id) {
    const objetivo = normalizarTexto(id);

    return indice.find((item) => {
      const candidatos = [
        item.id,
        item.slug,
        item.codigo,
        item.modelo,
        item.carpeta,
        item.identificador
      ];

      return candidatos.some(
        (valor) => normalizarTexto(valor) === objetivo
      );
    }) || null;
  }

  function obtenerRutaDatos(registro) {
    if (registro.archivoDatos) {
      return registro.archivoDatos;
    }

    if (registro.rutaDatos) {
      return registro.rutaDatos;
    }

    if (registro.datos) {
      return registro.datos;
    }

    const carpeta =
      registro.carpeta ||
      registro.slug ||
      registro.id ||
      ESTADO.idSolicitado;

    return `data/equipos/${carpeta}/datos.js`;
  }

  function obtenerRutaImagen(registro) {
    if (registro.imagen) {
      return registro.imagen;
    }

    if (registro.rutaImagen) {
      return registro.rutaImagen;
    }

    const carpeta =
      registro.carpeta ||
      registro.slug ||
      registro.id ||
      ESTADO.idSolicitado;

    return `data/equipos/${carpeta}/imagen.jpg`;
  }

  function cargarArchivoDatos(ruta) {
    return new Promise((resolve, reject) => {
      try {
        delete window.EQUIPO_DATOS;
      } catch (_) {
        window.EQUIPO_DATOS = undefined;
      }

      const script = document.createElement("script");
      script.src = agregarMarcaTiempo(ruta);
      script.async = true;

      script.onload = () => {
        script.remove();

        if (!window.EQUIPO_DATOS) {
          reject(
            new Error(
              `El archivo ${ruta} cargó, pero no asignó window.EQUIPO_DATOS.`
            )
          );
          return;
        }

        resolve(window.EQUIPO_DATOS);
      };

      script.onerror = () => {
        script.remove();

        reject(
          new Error(
            `No fue posible cargar ${ruta}. Verifique que el archivo exista y que Live Server esté activo.`
          )
        );
      };

      document.head.appendChild(script);
    });
  }

  function agregarMarcaTiempo(ruta) {
    const separador = ruta.includes("?") ? "&" : "?";
    return `${ruta}${separador}v=${Date.now()}`;
  }

  /* ============================================================
     RENDERIZADO GENERAL
     ============================================================ */

  function renderizarFicha(datos, indice) {
    const identificacion = objeto(datos.identificacion);
    const presentacion = objeto(datos.presentacion);
    const configuracion = objeto(datos.configuracion);
    const propiedad = objeto(datos.propiedad);
    const costosFijos = objeto(datos.costosFijosHora);
    const combustible = objeto(datos.combustible);
    const lubricantes = objeto(datos.lubricantes);
    const rodajeDesgaste = objeto(datos.rodajeDesgaste);
    const mantenimiento = objeto(datos.mantenimientoVariable);
    const operador = objeto(datos.operador);
    const ayudante = objeto(datos.ayudante);
    const energia = objeto(datos.energia);
    const otros = objeto(datos.otrosCostosOperacion);
    const costoDirecto = objeto(datos.costoDirecto);
    const alquiler = objeto(datos.alquiler);
    const transporte = objeto(datos.transporte);
    const costoComercial = objeto(datos.costoComercial);
    const rendimiento = objeto(datos.rendimiento);
    const produccion = objeto(datos.produccion);
    const mercado = objeto(datos.mercado);
    const control = objeto(datos.control);
    const observaciones = objeto(datos.observaciones);
    const seguridad = objeto(datos.seguridad);
    const factores = objeto(datos.factoresAjuste);

    const nombre =
      primerValor(
        identificacion.nombre,
        identificacion.equipo,
        presentacion.titulo,
        indice.nombre,
        indice.modelo,
        ESTADO.idSolicitado
      );

    const codigo =
      primerValor(
        identificacion.codigo,
        identificacion.modelo,
        indice.codigo,
        indice.modelo,
        ESTADO.idSolicitado
      );

    const familia =
      primerValor(
        identificacion.familia,
        indice.familia,
        "Sin clasificar"
      );

    const referencia =
      primerValor(
        identificacion.equipoReferencia,
        identificacion.equipoDeReferencia,
        presentacion.subtitulo,
        presentacion.referencia,
        indice.descripcion,
        ""
      );

    const descripcion =
      primerValor(
        presentacion.descripcion,
        identificacion.descripcion,
        datos.descripcion,
        referencia,
        "Sin descripción disponible."
      );

    const rodaje =
      primerValor(
        configuracion.rodaje,
        identificacion.rodaje,
        "-"
      );

    const tipoCombustible =
      primerValor(
        combustible.tipo,
        combustible.combustible,
        combustible.nombre,
        "-"
      );

    const unidadAlquiler =
      primerValor(
        alquiler.unidad,
        alquiler.unidadAlquiler,
        "h"
      );

    const tarifaComercial =
      numero(
        primerValor(
          alquiler.tarifaComercial,
          alquiler.tarifa,
          costoComercial.tarifaComercial,
          costoComercial.costoFinal,
          0
        )
      );

    const costoDirectoHora =
      numero(
        primerValor(
          costoDirecto.totalHora,
          costoDirecto.costoHora,
          costoDirecto.total,
          alquiler.costoDirecto,
          0
        )
      );

    const transporteHora =
      numero(
        primerValor(
          transporte.equivalenteHora,
          transporte.costoEquivalenteHora,
          transporte.transporteEquivalente,
          0
        )
      );

    const costoFinal =
      numero(
        primerValor(
          costoComercial.costoFinal,
          costoComercial.totalHora,
          costoComercial.total,
          tarifaComercial + transporteHora
        )
      );

    const precioAdquisicion =
      numero(
        primerValor(
          propiedad.precioAdquisicion,
          propiedad.valorAdquisicion,
          propiedad.precio,
          0
        )
      );

    const consumo =
      numero(
        primerValor(
          combustible.consumoHora,
          combustible.consumo,
          combustible.litrosHora,
          0
        )
      );

    const rendimientoValor =
      numero(
        primerValor(
          rendimiento.valor,
          rendimiento.rendimiento,
          rendimiento.valorReferencial,
          0
        )
      );

    const unidadRendimiento =
      primerValor(
        rendimiento.unidad,
        rendimiento.unidadRendimiento,
        produccion.unidad,
        ""
      );

    const margen =
      normalizarPorcentaje(
        primerValor(
          alquiler.margen,
          alquiler.margenAlquiler,
          costoComercial.margen,
          0
        )
      );

    establecerTexto("tituloPagina", nombre);
    establecerTexto("nombreEquipo", nombre);
    establecerTexto("codigoModelo", codigo);
    establecerTexto(
      "estadoEquipo",
      primerValor(control.estado, indice.estado, "ACTIVO")
    );
    establecerTexto("equipoReferencia", referencia || familia);
    establecerTexto("descripcionGeneral", descripcion);
    establecerTexto("familiaEquipo", familia);
    establecerTexto("rodajeEquipo", rodaje);
    establecerTexto("tipoCombustible", tipoCombustible);
    establecerTexto("unidadAlquiler", unidadAlquiler);

    establecerTexto("tarifaComercial", moneda(tarifaComercial));
    establecerTexto("tarifaUnidad", `por ${unidadAlquiler}`);
    establecerTexto("costoDirectoHora", moneda(costoDirectoHora));
    establecerTexto("transporteHora", moneda(transporteHora));
    establecerTexto("costoComercialFinal", moneda(costoFinal));

    establecerTexto("precioAdquisicion", moneda(precioAdquisicion));
    establecerTexto(
      "consumoCombustible",
      `${decimal(consumo, 3)} ${primerValor(combustible.unidad, "L/h")}`
    );
    establecerTexto(
      "rendimientoReferencial",
      decimal(rendimientoValor, 2)
    );
    establecerTexto(
      "unidadRendimiento",
      unidadRendimiento || "Sin unidad"
    );
    establecerTexto(
      "margenAlquiler",
      `${decimal(margen, 2)} %`
    );

    configurarImagen(datos, indice, nombre);
    renderizarSecciones(datos);
    document.title = `${nombre} | Costos de Alquiler`;
  }

  function renderizarSecciones(datos) {
    renderizarListaObjeto(
      "listaIdentificacion",
      objeto(datos.identificacion),
      etiquetasIdentificacion()
    );

    renderizarListaObjeto(
      "listaConfiguracion",
      objeto(datos.configuracion),
      etiquetasConfiguracion()
    );

    renderizarTablaFlexible(
      "tablaEspecificaciones",
      arreglo(datos.especificacionesTecnicas),
      ["Parámetro", "Valor", "Unidad"]
    );

    establecerTexto(
      "usoRecomendado",
      primerValor(
        datos.identificacion?.usoRecomendado,
        datos.presentacion?.usoRecomendado,
        datos.rendimiento?.usoRecomendado,
        datos.usoRecomendado,
        "Sin información disponible."
      )
    );

    renderizarListaObjeto(
      "listaPropiedad",
      objeto(datos.propiedad),
      etiquetasPropiedad(),
      true
    );

    renderizarListaObjeto(
      "listaCostosFijos",
      objeto(datos.costosFijosHora),
      etiquetasCostos(),
      true
    );

    renderizarListaCombinada(
      "listaCombustible",
      [
        { titulo: "Combustible", datos: objeto(datos.combustible) },
        { titulo: "Lubricantes", datos: objeto(datos.lubricantes) },
        { titulo: "Energía", datos: objeto(datos.energia) }
      ],
      true
    );

    renderizarListaCombinada(
      "listaOperador",
      [
        { titulo: "Operador", datos: objeto(datos.operador) },
        { titulo: "Ayudante", datos: objeto(datos.ayudante) }
      ],
      true
    );

    renderizarListaCombinada(
      "listaRodajeDesgaste",
      [
        { titulo: "Rodaje y desgaste", datos: objeto(datos.rodajeDesgaste) },
        { titulo: "Mantenimiento variable", datos: objeto(datos.mantenimientoVariable) },
        { titulo: "Otros costos", datos: objeto(datos.otrosCostosOperacion) }
      ],
      true
    );

    renderizarListaObjeto(
      "listaTransporte",
      objeto(datos.transporte),
      etiquetasTransporte(),
      true
    );

    renderizarTablaResumenCostos(datos);

    establecerTexto(
      "condicionesComerciales",
      primerValor(
        datos.alquiler?.condiciones,
        datos.costoComercial?.condiciones,
        datos.mercado?.condicionesComerciales,
        "Tarifa referencial sujeta a condiciones de operación, disponibilidad, ubicación y duración del alquiler."
      )
    );

    renderizarListaObjeto(
      "listaRendimiento",
      objeto(datos.rendimiento),
      etiquetasRendimiento(),
      true
    );

    renderizarListaObjeto(
      "listaProduccion",
      objeto(datos.produccion),
      etiquetasProduccion(),
      true
    );

    establecerTexto(
      "condicionesRendimiento",
      primerValor(
        datos.rendimiento?.condiciones,
        datos.produccion?.condiciones,
        "El rendimiento puede variar según el operador, el estado del terreno, la logística, el clima y las condiciones de trabajo."
      )
    );

    renderizarAplicaciones(arreglo(datos.aplicaciones));

    renderizarTablaFlexible(
      "tablaAccesorios",
      arreglo(datos.accesorios),
      ["Accesorio", "Descripción", "Compatibilidad"]
    );

    renderizarListaObjeto(
      "listaSeguridad",
      objeto(datos.seguridad),
      {},
      false
    );

    renderizarObservaciones(objeto(datos.observaciones));

    renderizarListaObjeto(
      "listaControl",
      objeto(datos.control),
      etiquetasControl(),
      false
    );

    renderizarListaObjeto(
      "listaMercado",
      objeto(datos.mercado),
      etiquetasMercado(),
      true
    );

    renderizarListaObjeto(
      "listaFactores",
      objeto(datos.factoresAjuste),
      etiquetasFactores(),
      true
    );
  }

  /* ============================================================
     COMPONENTES DE PRESENTACIÓN
     ============================================================ */

  function configurarImagen(datos, indice, nombre) {
    const imagen = document.getElementById("imagenEquipo");
    const fallback = document.getElementById("imagenFallback");

    if (!imagen || !fallback) {
      return;
    }

    const ruta = primerValor(
      datos.presentacion?.imagen,
      datos.identificacion?.imagen,
      indice.imagen,
      ESTADO.rutaImagen
    );

    imagen.alt = `Imagen de ${nombre}`;

    imagen.onload = () => {
      imagen.hidden = false;
      fallback.hidden = true;
    };

    imagen.onerror = () => {
      imagen.hidden = true;
      fallback.hidden = false;
    };

    imagen.src = agregarMarcaTiempo(ruta);
  }

  function renderizarListaObjeto(
    idContenedor,
    datos,
    etiquetas = {},
    formatearNumeros = false
  ) {
    const contenedor = document.getElementById(idContenedor);

    if (!contenedor) {
      return;
    }

    const entradas = Object.entries(datos).filter(
      ([, valor]) => esValorVisible(valor)
    );

    if (!entradas.length) {
      contenedor.innerHTML = mensajeSinDatos();
      return;
    }

    contenedor.innerHTML = entradas.map(([clave, valor]) => {
      const etiqueta = etiquetas[clave] || humanizarClave(clave);
      const contenido = formatearValor(clave, valor, formatearNumeros);

      return `
        <div class="equipment-data-row">
          <span>${escaparHtml(etiqueta)}</span>
          <strong>${contenido}</strong>
        </div>
      `;
    }).join("");
  }

  function renderizarListaCombinada(
    idContenedor,
    bloques,
    formatearNumeros = false
  ) {
    const contenedor = document.getElementById(idContenedor);

    if (!contenedor) {
      return;
    }

    const html = [];

    bloques.forEach((bloque) => {
      const entradas = Object.entries(bloque.datos).filter(
        ([, valor]) => esValorVisible(valor)
      );

      if (!entradas.length) {
        return;
      }

      html.push(`
        <div class="equipment-data-subtitle">
          ${escaparHtml(bloque.titulo)}
        </div>
      `);

      entradas.forEach(([clave, valor]) => {
        html.push(`
          <div class="equipment-data-row">
            <span>${escaparHtml(humanizarClave(clave))}</span>
            <strong>${formatearValor(clave, valor, formatearNumeros)}</strong>
          </div>
        `);
      });
    });

    contenedor.innerHTML = html.length
      ? html.join("")
      : mensajeSinDatos();
  }

  function renderizarTablaFlexible(
    idContenedor,
    filas,
    encabezadosPreferidos = []
  ) {
    const contenedor = document.getElementById(idContenedor);

    if (!contenedor) {
      return;
    }

    if (!filas.length) {
      contenedor.innerHTML = mensajeSinDatos();
      return;
    }

    if (filas.every((fila) => typeof fila !== "object")) {
      contenedor.innerHTML = `
        <ul class="equipment-simple-list">
          ${filas.map(
            (fila) => `<li>${escaparHtml(String(fila))}</li>`
          ).join("")}
        </ul>
      `;
      return;
    }

    const columnas = obtenerColumnas(filas);

    const encabezados = columnas.map((columna, indice) => (
      encabezadosPreferidos[indice] ||
      humanizarClave(columna)
    ));

    contenedor.innerHTML = `
      <table class="equipment-table">
        <thead>
          <tr>
            ${encabezados.map(
              (encabezado) => `<th>${escaparHtml(encabezado)}</th>`
            ).join("")}
          </tr>
        </thead>
        <tbody>
          ${filas.map((fila) => `
            <tr>
              ${columnas.map((columna) => `
                <td>${formatearValor(columna, fila[columna], true)}</td>
              `).join("")}
            </tr>
          `).join("")}
        </tbody>
      </table>
    `;
  }

  function renderizarTablaResumenCostos(datos) {
    const contenedor = document.getElementById("tablaCostoDirecto");

    if (!contenedor) {
      return;
    }

    const conceptos = [
      ["Costos fijos", sumarValores(datos.costosFijosHora)],
      ["Combustible", obtenerCosto(datos.combustible)],
      ["Lubricantes", obtenerCosto(datos.lubricantes)],
      ["Rodaje y desgaste", obtenerCosto(datos.rodajeDesgaste)],
      ["Mantenimiento variable", obtenerCosto(datos.mantenimientoVariable)],
      ["Operador", obtenerCosto(datos.operador)],
      ["Ayudante", obtenerCosto(datos.ayudante)],
      ["Energía", obtenerCosto(datos.energia)],
      ["Otros costos", obtenerCosto(datos.otrosCostosOperacion)]
    ].filter(([, valor]) => valor !== 0);

    const totalDeclarado = numero(
      primerValor(
        datos.costoDirecto?.totalHora,
        datos.costoDirecto?.costoHora,
        datos.costoDirecto?.total,
        0
      )
    );

    const totalCalculado = conceptos.reduce(
      (acumulado, [, valor]) => acumulado + valor,
      0
    );

    const total = totalDeclarado || totalCalculado;

    if (!conceptos.length && !total) {
      contenedor.innerHTML = mensajeSinDatos();
      return;
    }

    contenedor.innerHTML = `
      <table class="equipment-table">
        <thead>
          <tr>
            <th>Concepto</th>
            <th>Costo por hora</th>
          </tr>
        </thead>
        <tbody>
          ${conceptos.map(([concepto, valor]) => `
            <tr>
              <td>${escaparHtml(concepto)}</td>
              <td>${moneda(valor)}</td>
            </tr>
          `).join("")}
          <tr class="equipment-table-total">
            <td><strong>Costo directo total</strong></td>
            <td><strong>${moneda(total)}</strong></td>
          </tr>
        </tbody>
      </table>
    `;
  }

  function renderizarAplicaciones(aplicaciones) {
    const contenedor = document.getElementById("listaAplicaciones");

    if (!contenedor) {
      return;
    }

    if (!aplicaciones.length) {
      contenedor.innerHTML = mensajeSinDatos();
      return;
    }

    contenedor.innerHTML = aplicaciones.map((aplicacion, indice) => {
      if (typeof aplicacion === "string") {
        return `
          <article class="equipment-mini-card">
            <span class="equipment-mini-number">${indice + 1}</span>
            <h3>${escaparHtml(aplicacion)}</h3>
          </article>
        `;
      }

      const titulo = primerValor(
        aplicacion.titulo,
        aplicacion.nombre,
        aplicacion.aplicacion,
        `Aplicación ${indice + 1}`
      );

      const descripcion = primerValor(
        aplicacion.descripcion,
        aplicacion.detalle,
        ""
      );

      return `
        <article class="equipment-mini-card">
          <span class="equipment-mini-number">${indice + 1}</span>
          <h3>${escaparHtml(titulo)}</h3>
          ${descripcion
            ? `<p>${escaparHtml(descripcion)}</p>`
            : ""
          }
        </article>
      `;
    }).join("");
  }

  function renderizarObservaciones(datos) {
    const contenedor = document.getElementById("listaObservaciones");

    if (!contenedor) {
      return;
    }

    const entradas = Object.entries(datos).filter(
      ([, valor]) => esValorVisible(valor)
    );

    if (!entradas.length) {
      contenedor.innerHTML = mensajeSinDatos();
      return;
    }

    contenedor.innerHTML = entradas.map(([clave, valor]) => `
      <div class="equipment-observation-item">
        <strong>${escaparHtml(humanizarClave(clave))}</strong>
        <p>${formatearValor(clave, valor, false)}</p>
      </div>
    `).join("");
  }

  /* ============================================================
     INTERFAZ Y EVENTOS
     ============================================================ */

  function configurarInterfaz() {
    const botonMenu = document.getElementById("btnMenu");
    const sidebar = document.getElementById("sidebar");
    const botonImprimir = document.getElementById("btnImprimirFicha");

    if (botonMenu && sidebar) {
      botonMenu.addEventListener("click", () => {
        const abierto = sidebar.classList.toggle("open");
        botonMenu.setAttribute("aria-expanded", String(abierto));
      });
    }

    if (botonImprimir) {
      botonImprimir.addEventListener("click", () => {
        window.print();
      });
    }

    document.querySelectorAll(".equipment-tab").forEach((boton) => {
      boton.addEventListener("click", () => {
        const objetivo = boton.dataset.target;
        const seccion = document.getElementById(objetivo);

        document.querySelectorAll(".equipment-tab").forEach(
          (item) => item.classList.remove("active")
        );

        boton.classList.add("active");

        if (seccion) {
          seccion.scrollIntoView({
            behavior: "smooth",
            block: "start"
          });
        }
      });
    });
  }

  function mostrarFicha() {
    ocultar(SELECTORES.estadoCarga);
    ocultar(SELECTORES.estadoError);
    mostrar(SELECTORES.fichaEquipo);
  }

  function mostrarError(error) {
    ocultar(SELECTORES.estadoCarga);
    ocultar(SELECTORES.fichaEquipo);
    mostrar(SELECTORES.estadoError);

    establecerTexto(
      SELECTORES.tituloError,
      "No fue posible cargar el equipo"
    );

    establecerTexto(
      SELECTORES.descripcionError,
      error?.message || "Se presentó un error inesperado."
    );
  }

  function actualizarEstado(titulo, descripcion, correcto = null) {
    establecerTexto(SELECTORES.statusTitle, titulo);
    establecerTexto(SELECTORES.statusDescription, descripcion);

    const punto = document.getElementById(SELECTORES.statusDot);

    if (!punto) {
      return;
    }

    punto.classList.remove("success", "error");

    if (correcto === true) {
      punto.classList.add("success");
    }

    if (correcto === false) {
      punto.classList.add("error");
    }
  }

  function mostrar(id) {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.hidden = false;
    }
  }

  function ocultar(id) {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.hidden = true;
    }
  }

  function actualizarAnio() {
    establecerTexto(
      "footerYear",
      `© ${new Date().getFullYear()}`
    );
  }

  /* ============================================================
     FORMATO Y UTILIDADES
     ============================================================ */

  function establecerTexto(id, valor) {
    const elemento = document.getElementById(id);

    if (elemento) {
      elemento.textContent = valor ?? "";
    }
  }

  function primerValor(...valores) {
    return valores.find(
      (valor) =>
        valor !== undefined &&
        valor !== null &&
        valor !== ""
    );
  }

  function objeto(valor) {
    return valor && typeof valor === "object" && !Array.isArray(valor)
      ? valor
      : {};
  }

  function arreglo(valor) {
    if (Array.isArray(valor)) {
      return valor;
    }

    if (valor === undefined || valor === null || valor === "") {
      return [];
    }

    return [valor];
  }

  function numero(valor) {
    if (typeof valor === "number" && Number.isFinite(valor)) {
      return valor;
    }

    if (typeof valor !== "string") {
      return 0;
    }

    let limpio = valor
      .replace(/\s/g, "")
      .replace(/[^\d,.-]/g, "");

    if (limpio.includes(",") && limpio.includes(".")) {
      limpio = limpio.lastIndexOf(",") > limpio.lastIndexOf(".")
        ? limpio.replace(/\./g, "").replace(",", ".")
        : limpio.replace(/,/g, "");
    } else if (limpio.includes(",")) {
      const partes = limpio.split(",");
      limpio = partes.at(-1).length <= 3
        ? limpio.replace(",", ".")
        : limpio.replace(/,/g, "");
    }

    const resultado = Number(limpio);

    return Number.isFinite(resultado) ? resultado : 0;
  }

  function normalizarPorcentaje(valor) {
    const resultado = numero(valor);

    if (Math.abs(resultado) <= 1) {
      return resultado * 100;
    }

    return resultado;
  }

  function moneda(valor) {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }).format(numero(valor));
  }

  function decimal(valor, decimales = 2) {
    return new Intl.NumberFormat("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimales
    }).format(numero(valor));
  }

  function normalizarTexto(valor) {
    return String(valor ?? "")
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  function humanizarClave(clave) {
    return String(clave)
      .replace(/([a-záéíóúñ])([A-ZÁÉÍÓÚÑ])/g, "$1 $2")
      .replace(/[_-]+/g, " ")
      .replace(/\b\w/g, (letra) => letra.toUpperCase());
  }

  function escaparHtml(valor) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatearValor(clave, valor, formatearNumeros = false) {
    if (valor === undefined || valor === null || valor === "") {
      return "-";
    }

    if (Array.isArray(valor)) {
      return valor
        .map((item) => escaparHtml(String(item)))
        .join("<br>");
    }

    if (typeof valor === "object") {
      return escaparHtml(JSON.stringify(valor));
    }

    if (typeof valor === "boolean") {
      return valor ? "Sí" : "No";
    }

    const claveNormalizada = normalizarTexto(clave);
    const valorNumero = numero(valor);

    if (
      claveNormalizada.includes("porcentaje") ||
      claveNormalizada.includes("margen") ||
      claveNormalizada.includes("interes") ||
      claveNormalizada.includes("seguro") ||
      claveNormalizada.includes("rescate")
    ) {
      return `${decimal(normalizarPorcentaje(valor), 2)} %`;
    }

    if (
      formatearNumeros &&
      (
        claveNormalizada.includes("costo") ||
        claveNormalizada.includes("precio") ||
        claveNormalizada.includes("valor") ||
        claveNormalizada.includes("tarifa") ||
        claveNormalizada.includes("salario") ||
        claveNormalizada.includes("movilizacion") ||
        claveNormalizada.includes("desmovilizacion")
      ) &&
      valorNumero !== 0
    ) {
      return moneda(valorNumero);
    }

    if (typeof valor === "number") {
      return decimal(valor, 3);
    }

    return escaparHtml(String(valor));
  }

  function esValorVisible(valor) {
    return !(
      valor === undefined ||
      valor === null ||
      valor === "" ||
      (Array.isArray(valor) && valor.length === 0) ||
      (
        typeof valor === "object" &&
        !Array.isArray(valor) &&
        Object.keys(valor).length === 0
      )
    );
  }

  function obtenerColumnas(filas) {
    const columnas = [];

    filas.forEach((fila) => {
      if (!fila || typeof fila !== "object") {
        return;
      }

      Object.keys(fila).forEach((clave) => {
        if (!columnas.includes(clave)) {
          columnas.push(clave);
        }
      });
    });

    return columnas;
  }

  function sumarValores(datos) {
    return Object.entries(objeto(datos)).reduce(
      (total, [clave, valor]) => {
        const normalizada = normalizarTexto(clave);

        if (
          normalizada.includes("total") &&
          numero(valor) !== 0
        ) {
          return total;
        }

        return total + (
          typeof valor === "number" ||
          typeof valor === "string"
            ? numero(valor)
            : 0
        );
      },
      0
    );
  }

  function obtenerCosto(datos) {
    const bloque = objeto(datos);

    return numero(
      primerValor(
        bloque.costoHora,
        bloque.costoPorHora,
        bloque.totalHora,
        bloque.total,
        bloque.valorHora,
        0
      )
    );
  }

  function mensajeSinDatos() {
    return `
      <div class="equipment-no-data">
        Sin información disponible.
      </div>
    `;
  }

  /* ============================================================
     ETIQUETAS AMIGABLES
     ============================================================ */

  function etiquetasIdentificacion() {
    return {
      codigo: "Código",
      modelo: "Modelo",
      nombre: "Nombre",
      familia: "Familia",
      marca: "Marca",
      equipoReferencia: "Equipo de referencia",
      equipoDeReferencia: "Equipo de referencia",
      rodaje: "Rodaje",
      usoRecomendado: "Uso recomendado"
    };
  }

  function etiquetasConfiguracion() {
    return {
      rodaje: "Rodaje",
      combustible: "Combustible",
      capacidad: "Capacidad",
      potencia: "Potencia",
      pesoOperacion: "Peso de operación",
      operadorRequerido: "Operador requerido",
      ayudanteRequerido: "Ayudante requerido"
    };
  }

  function etiquetasPropiedad() {
    return {
      precioAdquisicion: "Precio de adquisición",
      valorAdquisicion: "Valor de adquisición",
      valorRescate: "Valor de rescate",
      vidaUtilHoras: "Vida útil",
      horasAnio: "Horas de trabajo por año",
      tasaInteres: "Tasa de interés",
      seguroAnual: "Seguro anual",
      mantenimientoFijoAnual: "Mantenimiento fijo anual"
    };
  }

  function etiquetasCostos() {
    return {
      depreciacionHora: "Depreciación por hora",
      inversionHora: "Costo de inversión por hora",
      seguroHora: "Seguro por hora",
      mantenimientoFijoHora: "Mantenimiento fijo por hora",
      totalHora: "Total de costos fijos por hora"
    };
  }

  function etiquetasTransporte() {
    return {
      movilizacion: "Movilización",
      desmovilizacion: "Desmovilización",
      horasAmortizacion: "Horas de amortización",
      equivalenteHora: "Transporte equivalente por hora",
      transporteEquivalente: "Transporte equivalente por hora"
    };
  }

  function etiquetasRendimiento() {
    return {
      valor: "Rendimiento",
      rendimiento: "Rendimiento",
      unidad: "Unidad",
      usoRecomendado: "Uso recomendado",
      condiciones: "Condiciones"
    };
  }

  function etiquetasProduccion() {
    return {
      costoPorUnidad: "Costo por unidad",
      costoAlquilerUnidad: "Costo de alquiler por unidad",
      unidad: "Unidad de producción",
      unidadCosto: "Unidad del costo"
    };
  }

  function etiquetasControl() {
    return {
      estado: "Estado",
      fechaCreacion: "Fecha de creación",
      fechaActualizacion: "Fecha de actualización",
      version: "Versión",
      fuente: "Fuente",
      responsable: "Responsable"
    };
  }

  function etiquetasMercado() {
    return {
      tarifaMinima: "Tarifa mínima",
      tarifaPromedio: "Tarifa promedio",
      tarifaMaxima: "Tarifa máxima",
      ciudadReferencia: "Ciudad de referencia",
      region: "Región",
      condicionesComerciales: "Condiciones comerciales"
    };
  }

  function etiquetasFactores() {
    return {
      region: "Factor regional",
      altura: "Factor por altura",
      clima: "Factor climático",
      disponibilidad: "Factor de disponibilidad",
      dificultad: "Factor de dificultad",
      jornada: "Factor de jornada"
    };
  }

  return {
    iniciar
  };

})();