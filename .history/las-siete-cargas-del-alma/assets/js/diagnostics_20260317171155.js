function getSectionMeta(sectionId) {
  const sections = getState().data?.sections || [];
  return sections.find(section => section.id === sectionId) || null;
}

function getVerseDisplay(sectionId) {
  const meta = getSectionMeta(sectionId);
  if (!meta) return "";
  if (meta.verse && meta.verseText) return `${meta.verse} — “${meta.verseText}”`;
  return meta.verse || "";
}

function getGlobalDiagnosticText(result) {
  if (!result) {
    return "Completa la evaluación para obtener un diagnóstico pastoral estructural.";
  }

  const band = result.globalBand;
  const dominant = result.dominant?.title || "ninguna carga dominante";

  if (band === "Alineado") {
    return `La estructura general se encuentra en un estado alineado. El alma no muestra una sobrecarga severa, la columna espiritual está transmitiendo de forma saludable y el nivel de descanso en el Cimiento es estable. Aun así, conviene vigilar especialmente la carga de ${dominant.toLowerCase()}.`;
  }

  if (band === "Ajuste") {
    return `Se observa una necesidad de ajuste estructural. El alma está reteniendo peso en algunas áreas, especialmente en ${dominant.toLowerCase()}. La transferencia espiritual existe, pero no es constante. Conviene fortalecer oración, entrega consciente y hábitos de descanso en Cristo.`;
  }

  if (band === "Riesgo") {
    return `La estructura muestra señales de riesgo. El alma está reteniendo más peso del que fue diseñada para soportar, la columna espiritual no está transmitiendo con firmeza suficiente y el descanso en el Cimiento es irregular. La carga dominante es ${dominant.toLowerCase()}. Se recomienda intervención pastoral práctica y plan de transferencia inmediato.`;
  }

  return `La estructura se encuentra en estado crítico. El alma está severamente sobrecargada, la transferencia espiritual es débil y el nivel de descanso en el Cimiento es bajo. La carga dominante es ${dominant.toLowerCase()}. Este diagnóstico sugiere detener la acumulación, acompañamiento pastoral serio y una ruta urgente de descarga espiritual.`;
}

function getStructuralObservationText(result) {
  if (!result) {
    return "La lectura estructural se activará al completar la evaluación.";
  }

  const alma = result.axes?.alma || 0;
  const espiritu = result.axes?.espiritu || 0;
  const cimiento = result.axes?.cimiento || 0;

  let almaText = "";
  if (alma <= 25) almaText = "La viga del alma muestra una retención leve de carga.";
  else if (alma <= 50) almaText = "La viga del alma muestra una retención moderada de carga.";
  else if (alma <= 75) almaText = "La viga del alma está sobrecargada y requiere alivio.";
  else almaText = "La viga del alma está severamente sobrecargada.";

  let espirituText = "";
  if (espiritu >= 75) espirituText = "La columna espiritual está transmitiendo con solidez.";
  else if (espiritu >= 50) espirituText = "La columna espiritual transmite, pero con intermitencia.";
  else if (espiritu >= 25) espirituText = "La columna espiritual muestra debilidad de transmisión.";
  else espirituText = "La columna espiritual está muy debilitada para conducir el peso.";

  let cimientoText = "";
  if (cimiento >= 75) cimientoText = "El descanso en Cristo es alto.";
  else if (cimiento >= 50) cimientoText = "El descanso en Cristo es parcial.";
  else if (cimiento >= 25) cimientoText = "El descanso en Cristo es bajo.";
  else cimientoText = "El descanso en Cristo es críticamente bajo.";

  return `${almaText} ${espirituText} ${cimientoText}`;
}

function getSectionObservation(sectionScore) {
  const pct = sectionScore?.percent || 0;
  const title = sectionScore?.title || "Carga";

  if (pct <= 20) return `${title}: carga leve, con buena capacidad de manejo.`;
  if (pct <= 40) return `${title}: requiere ajuste y observación consciente.`;
  if (pct <= 70) return `${title}: está reteniendo peso estructuralmente relevante.`;
  return `${title}: carga severa; está afectando de manera directa el equilibrio interior.`;
}

function getRouteActions(result) {
  if (!result) return [];

  const actions = [];
  const dominant = result.dominant?.sectionId || "";
  const transfer = result.transferLevel;
  const cimiento = result.axes?.cimiento || 0;

  actions.push({
    title: "Acción principal",
    text: `Identifica diariamente cuándo el alma comienza a retener la carga dominante (${safeText(result.dominant?.title, "principal")}) y exprésala en oración concreta antes de que se acumule.`
  });

  actions.push({
    title: "Acción estructural",
    text: "No intentes resolver la carga solo con pensamiento emocional. Nombra la carga, reconócela, llévala al espíritu por medio de oración y entrégala conscientemente a Cristo."
  });

  if (transfer === "Muy baja" || transfer === "Baja") {
    actions.push({
      title: "Fortalecimiento de columna espiritual",
      text: "Necesitas reforzar la vida de oración, quietud y comunión. La columna espiritual está mostrando debilidad para transmitir el peso."
    });
  }

  if (cimiento < 50) {
    actions.push({
      title: "Descanso en el Cimiento",
      text: "Tu nivel de descanso en Cristo es bajo. Debes practicar entrega diaria, confesión pastoral y recordatorios explícitos de dependencia del Cimiento."
    });
  }

  if (dominant === "culpa") {
    actions.push({
      title: "Intervención específica",
      text: "No sigas intentando pagar el pasado con esfuerzo. La culpa debe llevarse al perdón y al Cimiento."
    });
  }

  if (dominant === "miedo") {
    actions.push({
      title: "Intervención específica",
      text: "No sostengas hoy el peso de un mañana que aún no ha llegado. Tu práctica central debe ser confianza y entrega del futuro."
    });
  }

  if (dominant === "ansiedad") {
    actions.push({
      title: "Intervención específica",
      text: "La ansiedad muestra un intento de control. Trabaja en nombrar lo que no puedes gobernar y colócalo verbalmente en manos de Dios."
    });
  }

  if (dominant === "responsabilidad") {
    actions.push({
      title: "Intervención específica",
      text: "Estás sosteniendo más de lo que te corresponde. Revisa límites, delegación y falsa sensación de ser el soporte de todos."
    });
  }

  if (dominant === "rechazo") {
    actions.push({
      title: "Intervención específica",
      text: "Tu identidad no debe descansar en la aprobación humana. Repite verdades de adopción y aceptación en Dios."
    });
  }

  if (dominant === "escasez") {
    actions.push({
      title: "Intervención específica",
      text: "La provisión no puede ser una carga permanente del alma. Une administración responsable con confianza real en la fuente."
    });
  }

  if (dominant === "soledad") {
    actions.push({
      title: "Intervención específica",
      text: "No respondas a la soledad aislándote más. Debes restaurar comunión con Dios y conexión relacional saludable."
    });
  }

  return actions;
}

function getContextualTeaching(id) {
  const teachings = {
    miedo: {
      title: "Miedo",
      verse: "Mateo 6:34",
      verseText: "Así que, no os afanéis por el día de mañana, porque el día de mañana traerá su afán. Basta a cada día su propio mal.",
      teaching: "El miedo es la carga del futuro sobre el alma de hoy. No debe quedarse en la viga; debe ser transmitido al Cimiento.",
      actions: [
        "Nombra hoy tres temores concretos.",
        "Entrégalos verbalmente en oración.",
        "Repite: Dios gobierna el mañana."
      ]
    },
    culpa: {
      title: "Culpa",
      verse: "Romanos 8:1",
      verseText: "Ahora, pues, ninguna condenación hay para los que están en Cristo Jesús, los que no andan conforme a la carne, sino conforme al Espíritu.",
      teaching: "La culpa es el pasado retenido en el presente. Cristo puede sostener lo que el alma ya no debe seguir cargando.",
      actions: [
        "Confiesa lo retenido.",
        "Renuncia a seguir pagando con esfuerzo lo que debe descansar en el perdón."
      ]
    },
    ansiedad: {
      title: "Ansiedad",
      verse: "Filipenses 4:6",
      verseText: "Por nada estéis afanosos, sino sean conocidas vuestras peticiones delante de Dios en toda oración y ruego, con acción de gracias.",
      teaching: "La ansiedad aparece cuando el alma intenta gobernar lo que no puede controlar.",
      actions: [
        "Escribe lo que intentas controlar.",
        "Separa lo que sí te corresponde de lo que no."
      ]
    },
    responsabilidad: {
      title: "Responsabilidad excesiva",
      verse: "Mateo 11:28",
      verseText: "Venid a mí todos los que estáis trabajados y cargados, y yo os haré descansar.",
      teaching: "La responsabilidad sana madura; la excesiva aplasta. No fuiste llamado a sostener toda la estructura.",
      actions: [
        "Identifica una carga ajena que estás sosteniendo.",
        "Define un límite sano hoy."
      ]
    },
    rechazo: {
      title: "Rechazo",
      verse: "Efesios 1:6",
      verseText: "Para alabanza de la gloria de su gracia, con la cual nos hizo aceptos en el Amado.",
      teaching: "El rechazo hiere la identidad cuando el alma busca valor fuera del Cimiento.",
      actions: [
        "Repite una verdad de identidad en Dios.",
        "Renuncia a medir tu valor por aprobación humana."
      ]
    },
    escasez: {
      title: "Temor a la escasez",
      verse: "Filipenses 4:19",
      verseText: "Mi Dios, pues, suplirá todo lo que os falta conforme a sus riquezas en gloria en Cristo Jesús.",
      teaching: "La provisión no debe convertirse en una carga permanente del alma. Dios sigue siendo fuente.",
      actions: [
        "Haz una lista de provisiones ya recibidas.",
        "Ora desde gratitud, no solo desde temor."
      ]
    },
    soledad: {
      title: "Soledad",
      verse: "Salmo 68:6",
      verseText: "Dios hace habitar en familia a los desamparados; saca a los cautivos a prosperidad; mas los rebeldes habitan en tierra seca.",
      teaching: "La soledad se vuelve carga cuando el alma pierde conexión con comunión y presencia.",
      actions: [
        "Busca un momento real de comunión con Dios hoy.",
        "No te aísles más; activa una conexión segura."
      ]
    },
    alma: {
      title: "Viga / Alma",
      verse: "Salmo 42:5",
      verseText: "¿Por qué te abates, oh alma mía, y te turbas dentro de mí? Espera en Dios; porque aún he de alabarle, salvación mía y Dios mío.",
      teaching: "La viga del alma percibe el peso de la vida. Su función es recibir y transmitir, no retener.",
      actions: [
        "Reconoce qué carga está quedándose en el alma.",
        "No confundas sensibilidad con obligación de sostener."
      ]
    },
    espiritu: {
      title: "Columna / Espíritu",
      verse: "Proverbios 20:27",
      verseText: "Lámpara de Jehová es el espíritu del hombre, la cual escudriña lo más profundo del corazón.",
      teaching: "La columna espiritual recibe del alma y dirige al Cimiento. Cuando se debilita, el peso se queda atrapado arriba.",
      actions: [
        "Fortalece oración y quietud.",
        "Lleva conscientemente el peso hacia Dios."
      ]
    },
    cimiento: {
      title: "Cimiento / Cristo",
      verse: "1 Corintios 3:11",
      verseText: "Porque nadie puede poner otro fundamento que el que está puesto, el cual es Jesucristo.",
      teaching: "Cristo es el fundamento que sostiene lo que el alma no puede cargar. El descanso real no está en controlar, sino en fundamentarse.",
      actions: [
        "Entrega explícitamente la carga a Cristo.",
        "Reposa en el fundamento antes de intentar resolver."
      ]
    }
  };

  return teachings[id] || {
    title: "Panel contextual",
    verse: "",
    verseText: "",
    teaching: "Sin contenido contextual disponible.",
    actions: []
  };
}

function getFullVerseDisplayById(id) {
  const info = getContextualTeaching(id);
  if (info.verse && info.verseText) return `${info.verse} — “${info.verseText}”`;
  return info.verse || "";
}