(function () {

  const PREFIX = "afo_";

  function buildKey(key) {
    return PREFIX + key;
  }

  function get(key, defaultValue = null) {

    try {
      const raw = localStorage.getItem(buildKey(key));

      if (!raw) return defaultValue;

      return JSON.parse(raw);

    } catch (e) {
      console.error("Error leyendo storage", e);
      return defaultValue;
    }

  }

  function set(key, value) {

    try {
      localStorage.setItem(
        buildKey(key),
        JSON.stringify(value)
      );
    } catch (e) {
      console.error("Error guardando storage", e);
    }

  }

  function remove(key) {
    localStorage.removeItem(buildKey(key));
  }

  function clearAll() {

    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(PREFIX)) {
        localStorage.removeItem(key);
      }
    });

  }

  function push(key, item) {

    const list = get(key, []);

    list.push(item);

    set(key, list);

  }

  function update(key, id, newData) {

    const list = get(key, []);

    const updated = list.map(item => {

      if (item.id === id) {
        return {
          ...item,
          ...newData
        };
      }

      return item;

    });

    set(key, updated);

  }

  function removeById(key, id) {

    const list = get(key, []);

    const filtered = list.filter(item => item.id !== id);

    set(key, filtered);

  }

  function generateId(prefix = "id") {

    return prefix + "_" + Date.now() + "_" + Math.floor(Math.random() * 1000);

  }

  window.AFOStorage = {
    get,
    set,
    remove,
    clearAll,
    push,
    update,
    removeById,
    generateId
  };

})();