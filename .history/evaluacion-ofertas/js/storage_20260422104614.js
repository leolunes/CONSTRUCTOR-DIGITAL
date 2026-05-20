// ===============================
// STORAGE - GUARDAR Y RECUPERAR DATOS
// ===============================

import { DB, importarDB } from './db.js';

const STORAGE_KEY = "evaluacion_ofertas_db";

// ===============================
// GUARDAR EN LOCALSTORAGE
// ===============================
export function guardarDB() {
  try {
    const data = JSON.stringify(DB);
    localStorage.setItem(STORAGE_KEY, data);
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

    if (!data) {
      console.warn("⚠ No hay datos guardados");
      return;
    }

    const parsed = JSON.parse(data);
    importarDB(parsed);

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
  const dataStr = JSON.stringify(DB, null, 2);
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
      importarDB(data);
      guardarDB();
      alert("Backup cargado correctamente");
    } catch (error) {
      alert("Error al cargar el archivo");
    }
  };

  reader.readAsText(file);
}