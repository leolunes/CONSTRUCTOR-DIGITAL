(function () {

  const TABLES = {
    contratos: "contratos",
    facturas: "facturas",
    alertas: "alertas",
    analisis: "analisis",
    configuracion: "configuracion"
  };

  function getAll(table) {
    return window.AFOStorage.get(table, []);
  }

  function saveAll(table, data) {
    window.AFOStorage.set(table, data);
    return data;
  }

  function insert(table, record) {
    const list = getAll(table);

    const newRecord = {
      id: record.id || window.AFOStorage.generateId(table),
      fechaRegistro: record.fechaRegistro || new Date().toISOString(),
      ...record
    };

    list.push(newRecord);
    saveAll(table, list);

    return newRecord;
  }

  function update(table, id, newData) {
    const list = getAll(table);

    const updated = list.map(item => {
      if (item.id === id) {
        return {
          ...item,
          ...newData,
          fechaActualizacion: new Date().toISOString()
        };
      }
      return item;
    });

    saveAll(table, updated);
    return updated.find(item => item.id === id) || null;
  }

  function remove(table, id) {
    const list = getAll(table);
    const filtered = list.filter(item => item.id !== id);
    saveAll(table, filtered);
    return true;
  }

  function findById(table, id) {
    const list = getAll(table);
    return list.find(item => item.id === id) || null;
  }

  function filter(table, predicate) {
    const list = getAll(table);
    return list.filter(predicate);
  }

  function clearTable(table) {
    saveAll(table, []);
    return true;
  }

  function getContracts() {
    return getAll(TABLES.contratos);
  }

  function saveContract(data) {
    return insert(TABLES.contratos, data);
  }

  function updateContract(id, data) {
    return update(TABLES.contratos, id, data);
  }

  function deleteContract(id) {
    return remove(TABLES.contratos, id);
  }

  function getFacturas() {
    return getAll(TABLES.facturas);
  }

  function saveFactura(data) {
    return insert(TABLES.facturas, data);
  }

  function updateFactura(id, data) {
    return update(TABLES.facturas, id, data);
  }

  function deleteFactura(id) {
    return remove(TABLES.facturas, id);
  }

  function getFacturasByContrato(contratoId) {
    return filter(TABLES.facturas, item => item.contratoId === contratoId);
  }

  function getAlertas() {
    return getAll(TABLES.alertas);
  }

  function saveAlerta(data) {
    return insert(TABLES.alertas, data);
  }

  function updateAlerta(id, data) {
    return update(TABLES.alertas, id, data);
  }

  function deleteAlerta(id) {
    return remove(TABLES.alertas, id);
  }

  function getAlertasByContrato(contratoId) {
    return filter(TABLES.alertas, item => item.contratoId === contratoId);
  }

  function getAnalisis() {
    return getAll(TABLES.analisis);
  }

  function saveAnalisis(data) {
    return insert(TABLES.analisis, data);
  }

  function getAnalisisByContrato(contratoId) {
    return filter(TABLES.analisis, item => item.contratoId === contratoId);
  }

  function getConfig() {
    return window.AFOStorage.get(TABLES.configuracion, {});
  }

  function saveConfig(data) {
    const current = getConfig();
    const merged = { ...current, ...data };
    window.AFOStorage.set(TABLES.configuracion, merged);
    return merged;
  }

  window.AFODB = {
    TABLES,
    getAll,
    saveAll,
    insert,
    update,
    remove,
    findById,
    filter,
    clearTable,

    getContracts,
    saveContract,
    updateContract,
    deleteContract,

    getFacturas,
    saveFactura,
    updateFactura,
    deleteFactura,
    getFacturasByContrato,

    getAlertas,
    saveAlerta,
    updateAlerta,
    deleteAlerta,
    getAlertasByContrato,

    getAnalisis,
    saveAnalisis,
    getAnalisisByContrato,

    getConfig,
    saveConfig
  };

})();