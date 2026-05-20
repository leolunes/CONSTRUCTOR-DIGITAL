(function () {

  function safeNumber(v) {
    const n = Number(v);
    return isNaN(n) ? 0 : n;
  }

  function percent(part, total) {
    const p = safeNumber(part);
    const t = safeNumber(total);

    if (t === 0) return 0;

    return (p / t) * 100;
  }

  function money(n) {
    const value = safeNumber(n);

    return value.toLocaleString("es-CO", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  }

  function sum(list, field) {

    let total = 0;

    list.forEach(item => {
      total += safeNumber(item[field]);
    });

    return total;

  }

  function groupBy(list, field) {

    const map = {};

    list.forEach(item => {

      const key = item[field] || "otros";

      if (!map[key]) {
        map[key] = [];
      }

      map[key].push(item);

    });

    return map;

  }

  function calculateCostDistribution(items) {

    const result = {
      materiales: 0,
      manoObra: 0,
      equipos: 0,
      transportes: 0,
      otros: 0,
      total: 0
    };

    items.forEach(item => {

      const valor = safeNumber(item.valor);

      result.total += valor;

      switch (item.tipo) {

        case "material":
          result.materiales += valor;
          break;

        case "mano_obra":
          result.manoObra += valor;
          break;

        case "equipo":
          result.equipos += valor;
          break;

        case "transporte":
          result.transportes += valor;
          break;

        default:
          result.otros += valor;

      }

    });

    return result;

  }

  function calculateDeviation(expected, actual) {

    const e = safeNumber(expected);
    const a = safeNumber(actual);

    const diff = a - e;

    return {
      diferencia: diff,
      porcentaje: percent(diff, e)
    };

  }

  function riskLevel(percentValue) {

    const p = Math.abs(percentValue);

    if (p < 10) return "bajo";

    if (p < 25) return "medio";

    if (p < 50) return "alto";

    return "critico";

  }

  function analyzeDeviation(expected, actual) {

    const dev = calculateDeviation(expected, actual);

    return {
      esperado: expected,
      real: actual,
      diferencia: dev.diferencia,
      porcentaje: dev.porcentaje,
      riesgo: riskLevel(dev.porcentaje)
    };

  }

  window.AFOCalc = {
    safeNumber,
    percent,
    money,
    sum,
    groupBy,
    calculateCostDistribution,
    calculateDeviation,
    analyzeDeviation,
    riskLevel
  };

})();