"use strict";

document.addEventListener("DOMContentLoaded", iniciarFichaEquipo);

const CLAVE_EQUIPO_ACTUAL = "costos_alquiler_equipo_actual";
const CLAVE_RESULTADOS_CALCULO = "costos_alquiler_resultados_calculo";

async function iniciarFichaEquipo() {
  try {
    const parametros = new URLSearchParams(window.location.search);

    const idEquipo =
      parametros.get("id") ||
      parametros.get("equipo") ||
      leerEquipoGuardado()?.id;

    if (!idEquipo) {
      throw new Error("No se indicó el equipo que se desea consultar.");
    }

    const indice = await cargarIndiceEquipos();

    const registro = indice.find(
      (equipo) => String(equipo.id) === String(idEquipo)
    );

    if (!registro) {
      throw new Error(`No se encontró el equipo "${idEquipo}" en el catálogo.`);
    }

    limpiarVariablesGlobalesEquipo();

    const rutaDatos =
      registro.rutaDatos ||
      registro.ruta ||
      `data/equipos/${registro.id}/datos.js`;

    await cargarScriptEquipo(rutaDatos);

    const datos =
      window.DATOS_EQUIPO ||
      window.EQUIPO_DATOS ||
      window.EQUIPO ||
      window.equipo ||
      window.datosEquipo ||
      window.equipoActual;

    if (!datos || typeof datos !== "object") {
      throw new Error(
        "El archivo datos.js del equipo no contiene información válida."
      );
    }

    guardarEquipoActual(datos, registro, rutaDatos);
    renderizarFichaEquipo(datos, registro);
    configurarSeleccionEquipo(datos, registro, rutaDatos);
  } catch (error) {
    console.error(error);
    mostrarErrorEquipo(error.message);
  }
}

async function cargarIndiceEquipos() {
  const respuesta = await fetch(
    `data/equipos-index.json?v=${Date.now()}`,
    {
      cache: "no-store"
    }
  );

  if (!respuesta.ok) {
    throw new Error("No fue posible cargar data/equipos-index.json.");
  }

  const contenido = await respuesta.json();

  const lista = Array.isArray(contenido)
    ? contenido
    : Array.isArray(contenido?.equipos)
      ? contenido.equipos
      : [];

  if (!lista.length) {
    throw new Error("El catálogo de equipos está vacío.");
  }

  return lista;
}

function limpiarVariablesGlobalesEquipo() {
  [
    "DATOS_EQUIPO",
    "EQUIPO_DATOS",
    "EQUIPO",
    "equipo",
    "datosEquipo",
    "equipoActual"
  ].forEach((nombre) => {
    try {
      delete window[nombre];
    } catch (error) {
      window[nombre] = undefined;
    }
  });
}

function cargarScriptEquipo(ruta) {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");

    const separador = ruta.includes("?")
      ? "&"
      : "?";

    script.src = `${ruta}${separador}v=${Date.now()}`;
    script.async = true;

    script.onload = () => {
      script.remove();
      resolve();
    };

    script.onerror = () => {
      script.remove();

      reject(
        new Error(
          `No fue posible cargar el archivo de datos: ${ruta}`
        )
      );
    };

    document.head.appendChild(script);
  });
}

function renderizarFichaEquipo(datos, registro) {
  const entradas = datos.entradas || {};
  const calculados = datos.calculados || {};

  const nombre =
    datos.nombre ||
    registro.nombreEquipo ||
    "Equipo";

  const codigo =
    datos.codigo ||
    registro.codigoModelo ||
    "—";

  const familia =
    datos.familia ||
    registro.familia ||
    "—";

  const marca =
    datos.marca ||
    "—";

  const modelo =
    datos.modelo ||
    "—";

  const rodaje =
    datos.rodaje ||
    "—";

  const combustible =
    datos.combustible ||
    "—";

  const unidadAlquiler =
    datos.unidadAlquiler ||
    entradas.unidadAlquiler ||
    registro.unidadAlquiler ||
    "—";

  const referencia =
    datos.referencia ||
    registro.equipoReferencia ||
    "—";

  const tarifaComercial =
    primerNumeroValido(
      calculados.tarifaComercial,
      entradas.tarifaComercialObjetivo,
      registro.tarifaComercial
    );

  const costoDirecto =
    primerNumeroValido(
      calculados.costoDirectoHorario
    );

  const rendimiento =
    primerNumeroValido(
      entradas.rendimiento
    );

  const unidadRendimiento =
    entradas.unidadRendimiento ||
    "unidad/h";

  const costoPorUnidad =
    primerNumeroValido(
      calculados.costoPorUnidad,
      calculados.alquilerPorUnidad
    );

  asignarTexto("topbarEquipoNombre", nombre);
  asignarTexto("equipoFamilia", familia);
  asignarTexto("equipoNombre", nombre);
  asignarTexto("equipoReferencia", referencia);
  asignarTexto("equipoCodigo", codigo);

  asignarTexto("equipoMarca", `Marca: ${marca}`);
  asignarTexto("equipoModelo", `Modelo: ${modelo}`);
  asignarTexto("equipoRodaje", `Rodaje: ${rodaje}`);
  asignarTexto("equipoCombustible", `Combustible: ${combustible}`);

  asignarTexto(
    "equipoTarifaComercial",
    formatearMoneda(tarifaComercial)
  );

  asignarTexto(
    "equipoUnidadAlquiler",
    `Por ${unidadAlquiler}`
  );

  asignarTexto(
    "equipoCostoDirecto",
    formatearMoneda(costoDirecto)
  );

  asignarTexto(
    "equipoRendimiento",
    formatearNumero(rendimiento, 2)
  );

  asignarTexto(
    "equipoUnidadRendimiento",
    unidadRendimiento
  );

  asignarTexto(
    "equipoCostoUnidad",
    formatearMoneda(costoPorUnidad)
  );

  asignarTexto(
    "equipoCostoUnidadTexto",
    entradas.unidadCostoProduccion ||
    "Por unidad producida"
  );

  asignarTexto("detalleEquipoId", datos.id || registro.id);
  asignarTexto("detalleEquipoCodigo", codigo);
  asignarTexto("detalleEquipoFamilia", familia);
  asignarTexto("detalleEquipoMarca", marca);
  asignarTexto("detalleEquipoModelo", modelo);
  asignarTexto("detalleEquipoRodaje", rodaje);
  asignarTexto("detalleEquipoCombustible", combustible);
  asignarTexto("detalleEquipoUnidadAlquiler", unidadAlquiler);

  asignarTexto(
    "fichaPrecioAdquisicion",
    formatearMoneda(entradas.precioAdquisicion)
  );

  asignarTexto(
    "fichaValorRescate",
    formatearPorcentaje(entradas.valorRescate)
  );

  asignarTexto(
    "fichaVidaUtil",
    `${formatearNumero(entradas.vidaUtilHoras, 2)} h`
  );

  asignarTexto(
    "fichaHorasAnio",
    `${formatearNumero(entradas.horasAnio, 0)} h`
  );

  asignarTexto(
    "fichaTasaInteres",
    formatearPorcentaje(entradas.tasaInteres)
  );

  asignarTexto(
    "fichaSeguroAnual",
    formatearPorcentaje(entradas.seguroAnual)
  );

  asignarTexto(
    "fichaMantenimientoFijo",
    formatearMoneda(entradas.mantenimientoFijoAnual)
  );

  asignarTexto(
    "fichaConsumoCombustible",
    `${formatearNumero(entradas.consumoCombustible, 3)} L/h`
  );

  asignarTexto(
    "fichaPrecioCombustible",
    formatearMoneda(entradas.precioCombustible)
  );

  asignarTexto(
    "fichaFactorLubricantes",
    formatearPorcentaje(entradas.factorLubricantes)
  );

  asignarTexto(
    "fichaCostoRodaje",
    formatearMoneda(entradas.costoRodaje)
  );

  asignarTexto(
    "fichaVidaRodaje",
    `${formatearNumero(entradas.vidaRodajeHoras, 0)} h`
  );

  asignarTexto(
    "fichaOperadorMes",
    formatearMoneda(entradas.operadorMes)
  );

  asignarTexto(
    "fichaHorasOperador",
    `${formatearNumero(entradas.horasOperadorMes, 0)} h`
  );

  asignarTexto(
    "fichaMargenAlquiler",
    formatearPorcentaje(entradas.margenAlquiler)
  );

  asignarTexto(
    "fichaMovilizacion",
    formatearMoneda(entradas.movilizacion)
  );

  asignarTexto(
    "fichaDesmovilizacion",
    formatearMoneda(entradas.desmovilizacion)
  );

  asignarTexto(
    "fichaHorasAmortizacion",
    `${formatearNumero(entradas.horasAmortizacion, 0)} h`
  );

  asignarTexto(
    "fichaCostoDirecto",
    formatearMoneda(calculados.costoDirectoHorario)
  );

  asignarTexto(
    "fichaAlquilerEquivalente",
    formatearMoneda(calculados.alquilerEquivalente)
  );

  asignarTexto(
    "fichaCostoPorUnidad",
    formatearMoneda(costoPorUnidad)
  );

  asignarTexto(
    "fichaTransporteEquivalente",
    formatearMoneda(calculados.costoTransporteEquivalente)
  );

  asignarTexto(
    "fichaCostoComercialFinal",
    formatearMoneda(calculados.costoComercialFinal)
  );

  configurarImagenEquipo(datos, registro, nombre);

  const enlaceEntradas =
    document.getElementById("btnEditarEntradas");

  if (enlaceEntradas) {
    enlaceEntradas.href =
      `entradas.html?id=${encodeURIComponent(datos.id || registro.id)}`;
  }

  document.title =
    `${nombre} | Costos de Alquiler`;

  ocultarErrorEquipo();
}

function configurarImagenEquipo(datos, registro, nombre) {
  const imagen =
    document.getElementById("equipoImagen");

  const fallback =
    document.getElementById("equipoImagenFallback");

  if (!imagen) {
    return;
  }

  const rutaImagen =
    registro.imagen ||
    (
      datos.imagen &&
      datos.imagen.includes("/")
        ? datos.imagen
        : `data/equipos/${datos.id}/${datos.imagen || "imagen.jpg"}`
    );

  imagen.alt = `Imagen de ${nombre}`;

  imagen.onload = () => {
    imagen.hidden = false;
    fallback?.setAttribute("hidden", "");
  };

  imagen.onerror = () => {
    imagen.hidden = true;
    fallback?.removeAttribute("hidden");
  };

  imagen.src =
    `${rutaImagen}?v=${Date.now()}`;
}

function configurarSeleccionEquipo(
  datos,
  registro,
  rutaDatos
) {
  const boton =
    document.getElementById("btnSeleccionarEquipo");

  if (!boton) {
    return;
  }

  boton.addEventListener("click", () => {
    guardarEquipoActual(
      datos,
      registro,
      rutaDatos
    );

    boton.textContent =
      "Equipo seleccionado";

    boton.disabled = true;

    window.AppCostosEquipos?.mostrarToast?.(
      `${datos.nombre || registro.nombreEquipo} seleccionado correctamente.`,
      "success"
    );
  });
}

function guardarEquipoActual(
  datos,
  registro,
  rutaDatos
) {
  const seleccion = {
    id:
      datos.id ||
      registro.id,
    nombreEquipo:
      datos.nombre ||
      registro.nombreEquipo,
    codigoModelo:
      datos.codigo ||
      registro.codigoModelo,
    rutaDatos,
    imagen:
      registro.imagen ||
      `data/equipos/${datos.id}/imagen.jpg`,
    unidadAlquiler:
      datos.unidadAlquiler ||
      registro.unidadAlquiler,
    tarifaComercial:
      primerNumeroValido(
        datos.calculados?.tarifaComercial,
        datos.entradas?.tarifaComercialObjetivo,
        registro.tarifaComercial
      ),
    datos,
    seleccionadoEn:
      new Date().toISOString()
  };

  try {
    localStorage.setItem(
      CLAVE_EQUIPO_ACTUAL,
      JSON.stringify(seleccion)
    );

    localStorage.removeItem(
      CLAVE_RESULTADOS_CALCULO
    );
  } catch (error) {
    console.warn(
      "No fue posible guardar el equipo seleccionado:",
      error
    );
  }
}

function leerEquipoGuardado() {
  try {
    const contenido =
      localStorage.getItem(
        CLAVE_EQUIPO_ACTUAL
      );

    return contenido
      ? JSON.parse(contenido)
      : null;
  } catch (error) {
    return null;
  }
}

function asignarTexto(id, valor) {
  const elemento =
    document.getElementById(id);

  if (elemento) {
    elemento.textContent =
      valor ?? "—";
  }
}

function primerNumeroValido(...valores) {
  for (const valor of valores) {
    const numero = Number(valor);

    if (Number.isFinite(numero)) {
      return numero;
    }
  }

  return 0;
}

function formatearNumero(valor, decimales = 0) {
  const numero = Number(valor);

  return new Intl.NumberFormat(
    "es-CO",
    {
      minimumFractionDigits: decimales,
      maximumFractionDigits: decimales
    }
  ).format(
    Number.isFinite(numero)
      ? numero
      : 0
  );
}

function formatearMoneda(valor) {
  const numero = Number(valor);

  return new Intl.NumberFormat(
    "es-CO",
    {
      style: "currency",
      currency: "COP",
      maximumFractionDigits: 0
    }
  ).format(
    Number.isFinite(numero)
      ? numero
      : 0
  );
}

function formatearPorcentaje(valor) {
  const numero = Number(valor);

  if (!Number.isFinite(numero)) {
    return "0 %";
  }

  const porcentaje =
    Math.abs(numero) <= 1
      ? numero * 100
      : numero;

  return `${formatearNumero(porcentaje, 2)} %`;
}

function mostrarErrorEquipo(mensaje) {
  const panel =
    document.getElementById("panelEquipoError");

  const texto =
    document.getElementById("mensajeEquipoError");

  if (texto) {
    texto.textContent = mensaje;
  }

  panel?.removeAttribute("hidden");
}

function ocultarErrorEquipo() {
  document
    .getElementById("panelEquipoError")
    ?.setAttribute("hidden", "");
}