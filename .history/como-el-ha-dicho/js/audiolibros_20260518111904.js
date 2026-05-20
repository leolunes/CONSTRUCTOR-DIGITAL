const listaAudiolibros = document.getElementById("listaAudiolibros");
const detalleAudiolibro = document.getElementById("detalleAudiolibro");
const tituloLibro = document.getElementById("tituloLibro");
const descripcionLibro = document.getElementById("descripcionLibro");
const capitulosLibro = document.getElementById("capitulosLibro");

let audiolibros = [];

document.addEventListener("DOMContentLoaded", cargarAudiolibros);

async function cargarAudiolibros() {
  try {
    const respuesta = await fetch("data/audiolibros.json");
    audiolibros = await respuesta.json();
    renderizarAudiolibros();
  } catch (error) {
    console.error("Error cargando audiolibros:", error);
    listaAudiolibros.innerHTML = `
      <div class="empty-card">
        <h3>No se pudieron cargar los audiolibros</h3>
        <p>Verifica el archivo data/audiolibros.json.</p>
      </div>
    `;
  }
}

function renderizarAudiolibros() {
  listaAudiolibros.innerHTML = "";

  audiolibros.forEach((libro) => {
    const card = document.createElement("article");
    card.className = "category-card";

    card.innerHTML = `
      <div class="card-icon">
        <i class="fas fa-book-open"></i>
      </div>

      <h3>${libro.titulo}</h3>
      <p>${libro.descripcion}</p>

      <button class="btn-primary" onclick="abrirAudiolibro('${libro.id}')">
        Ver capítulos
      </button>
    `;

    listaAudiolibros.appendChild(card);
  });
}

function abrirAudiolibro(idLibro) {
  const libro = audiolibros.find((item) => item.id === idLibro);

  if (!libro) return;

  listaAudiolibros.classList.add("hidden");
  detalleAudiolibro.classList.remove("hidden");

  tituloLibro.textContent = libro.titulo;
  descripcionLibro.textContent = libro.descripcion;

  capitulosLibro.innerHTML = "";

  libro.capitulos.forEach((capitulo) => {
    const item = document.createElement("div");
    item.className = "chapter-card";

    item.innerHTML = `
      <div>
        <span class="badge">${capitulo.tipo}</span>
        <h3>${capitulo.titulo}</h3>
      </div>

      <div class="chapter-actions">
        <a href="${capitulo.pdf}" target="_blank" class="btn-secondary">
          <i class="fas fa-file-pdf"></i> Leer PDF
        </a>

        ${
          capitulo.audio
            ? `
              <audio controls preload="none">
                <source src="${capitulo.audio}" type="audio/mpeg">
                Tu navegador no soporta audio.
              </audio>
            `
            : ""
        }
      </div>
    `;

    capitulosLibro.appendChild(item);
  });
}

function cerrarDetalleAudiolibro() {
  detalleAudiolibro.classList.add("hidden");
  listaAudiolibros.classList.remove("hidden");
}