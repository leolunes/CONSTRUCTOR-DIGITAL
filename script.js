// script.js

// Espera a que el DOM esté completamente cargado
document.addEventListener("DOMContentLoaded", function () {
  // Función para descargar el contenido en PDF
  document.getElementById("descargar-pdf")?.addEventListener("click", () => {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Capturar el contenido de la enseñanza
    const contenido = document.getElementById("contenido");
    if (!contenido) {
      alert("No se encontró el contenido para exportar.");
      return;
    }

    // Convertir el contenido en texto plano (simplificado)
    const texto = contenido.innerText || contenido.textContent;

    // Agregar contenido al PDF (ajustado a varias páginas si es largo)
    const lineas = doc.splitTextToSize(texto, 180);
    doc.text(lineas, 15, 20);

    // Guardar el archivo PDF
    doc.save("ensenanza.pdf");
  });
});

