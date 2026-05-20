// ===============================
// STORAGE - GUARDAR Y RECUPERAR DATOS
// ===============================

import {
  DB,
  PROYECTOS,
  importarDB,
  exportarDB
} from './db.js';

const STORAGE_KEY = "evaluacion_ofertas_db";
const STORAGE_PROYECTOS_KEY = "evaluacion_ofertas_proyectos";

// ===============================
// GUARDAR EN LOCALSTORAGE
// ===============================
export function guardarDB() {
  try {
    const data = JSON.stringify(DB);
    localStorage.setItem(STORAGE_KEY, data);

    const proyectosData = JSON.stringify({
      lista: PROYECTOS.lista,
      activoId: PROYECTOS.activoId
    });
    localStorage.setItem(STORAGE_PROYECTOS_KEY, proyectosData);

    console.log("✔ Datos guardados correctamente");
  } catch (error) {
    console.error("❌ Error al guardar:", error);
  }
}

// ===============================
// CARGAR DESDE LOCALSTORAGE
// ===============================
export function cargarDB() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);

    if (data) {
      const parsed = JSON.parse(data);
      importarDB(parsed);
    } else {
      console.warn("⚠ No hay datos principales guardados");
    }

    const proyectosData = localStorage.getItem(STORAGE_PROYECTOS_KEY);

    if (proyectosData) {
      const parsedProyectos = JSON.parse(proyectosData);

      PROYECTOS.lista = Array.isArray(parsedProyectos.lista)
        ? parsedProyectos.lista
        : [];

      PROYECTOS.activoId = parsedProyectos.activoId ?? null;
    } else {
      console.warn("⚠ No hay proyectos guardados");
    }

    console.log("✔ Datos cargados correctamente");
  } catch (error) {
    console.error("❌ Error al cargar:", error);
  }
}

// ===============================
// ELIMINAR DATOS
// ===============================
export function limpiarStorage() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(STORAGE_PROYECTOS_KEY);
  console.log("🗑 Datos eliminados");
}

// ===============================
// AUTO-GUARDADO (CADA CAMBIO)
// ===============================
export function activarAutoGuardado(intervalo = 2000) {
  setInterval(() => {
    guardarDB();
  }, intervalo);
}

// ===============================
// GUARDADO MANUAL
// ===============================
export function guardarManual() {
  guardarDB();
  alert("Datos guardados correctamente");
}

// ===============================
// EXPORTAR BACKUP
// ===============================
export function exportarBackup() {
  const backup = {
    db: exportarDB(),
    proyectos: {
      lista: PROYECTOS.lista,
      activoId: PROYECTOS.activoId
    }
  };

  const dataStr = JSON.stringify(backup, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });

  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");

  a.href = url;
  a.download = "backup_evaluacion_ofertas.json";
  a.click();

  URL.revokeObjectURL(url);
}

// ===============================
// IMPORTAR BACKUP
// ===============================
export function importarBackup(file) {
  const reader = new FileReader();

  reader.onload = function (e) {
    try {
      const data = JSON.parse(e.target.result);

      if (data.db) {
        importarDB(data.db);
      } else {
        importarDB(data);
      }

      if (data.proyectos) {
        PROYECTOS.lista = Array.isArray(data.proyectos.lista)
          ? data.proyectos.lista
          : [];

        PROYECTOS.activoId = data.proyectos.activoId ?? null;
      }

      guardarDB();
      alert("Backup cargado correctamente");
    } catch (error) {
      alert("Error al cargar el archivo");
    }
  };

  reader.readAsText(file);
}