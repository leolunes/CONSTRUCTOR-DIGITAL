/* ==========================================================
   APP PLAN GIRÓN 2024 - 2027
   Motor de Inteligencia Municipal
   ========================================================== */

const IA_GIRON = {

    nombre: "Asistente Inteligente del Plan de Desarrollo de Girón",

    version: "1.0",

    obtenerBase() {
        return window.BASE_CONOCIMIENTO || {};
    },

    normalizar(texto) {
        return texto
            .toString()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    },

    limpiarRespuesta(texto) {
        return texto
            .replace(/\n{3,}/g, "\n\n")
            .trim();
    },

    obtenerSectores() {
        const base = this.obtenerBase();

        if (base.sectores && base.sectores.sectores) {
            return base.sectores.sectores;
        }

        return [];
    },

    obtenerPresupuesto() {
        const base = this.obtenerBase();
        return base.presupuesto || {};
    },

    obtenerProblematicas() {
        const base = this.obtenerBase();
        return base.problematicas || {};
    },

    obtenerFortalezas() {
        const base = this.obtenerBase();
        return base.fortalezas || {};
    },

    obtenerDebilidades() {
        const base = this.obtenerBase();
        return base.debilidades || {};
    },

    obtenerOportunidades() {
        const base = this.obtenerBase();
        return base.oportunidades || {};
    },

    obtenerRiesgos() {
        const base = this.obtenerBase();
        return base.riesgos || {};
    },

    obtenerPropuestas() {
        const base = this.obtenerBase();
        return base.propuestas || {};
    },

    obtenerPreguntasControl() {
        const base = this.obtenerBase();
        return base.preguntasControl || {};
    },

    obtenerControlPolitico() {
        const base = this.obtenerBase();
        return base.controlPolitico || {};
    },

    obtenerMetas() {
        const base = this.obtenerBase();
        return base.metas || {};
    },

    obtenerProgramas() {
        const base = this.obtenerBase();
        return base.programas || {};
    },

    obtenerProyectos() {
        const base = this.obtenerBase();
        return base.proyectos || {};
    },

    obtenerIndicadores() {
        const base = this.obtenerBase();
        return base.indicadores || {};
    },

    obtenerODS() {
        const base = this.obtenerBase();
        return base.ods || {};
    },

    obtenerGlosario() {
        const base = this.obtenerBase();
        return base.glosario || {};
    },

    detectarSector(pregunta) {
        const texto = this.normalizar(pregunta);
        const sectores = this.obtenerSectores();

        for (const sector of sectores) {
            const nombre = this.normalizar(sector.nombre);
            const id = this.normalizar(sector.id || "");

            if (texto.includes(nombre) || texto.includes(id)) {
                return sector;
            }
        }

        const alias = [
            { palabras: ["salud", "hospital", "vacunacion", "medico", "eps"], id: "salud-proteccion-social" },
            { palabras: ["educacion", "colegio", "escuela", "estudiante", "pae"], id: "educacion" },
            { palabras: ["movilidad", "transporte", "vias", "trafico", "accidentalidad"], id: "transporte" },
            { palabras: ["ambiente", "ambiental", "riesgo", "clima", "agua", "ecosistema"], id: "ambiente-desarrollo-sostenible" },
            { palabras: ["vivienda", "acueducto", "alcantarillado", "servicios publicos", "espacio publico"], id: "vivienda-ciudad-territorio" },
            { palabras: ["adulto mayor", "mujer", "juventud", "jovenes", "victimas", "discapacidad", "migrantes"], id: "inclusion-social-reconciliacion" },
            { palabras: ["turismo", "comercio", "industria", "empresas"], id: "comercio-industria-turismo" },
            { palabras: ["empleo", "trabajo", "emprendimiento", "formalizacion"], id: "trabajo" },
            { palabras: ["deporte", "recreacion", "cancha", "escenario deportivo"], id: "deporte-recreacion" },
            { palabras: ["gobierno", "alcaldia", "concejo", "transparencia", "participacion"], id: "gobierno-territorial" },
            { palabras: ["rural", "campo", "agricultura", "campesino", "vereda"], id: "agricultura-desarrollo-rural" }
        ];

        for (const grupo of alias) {
            if (grupo.palabras.some(palabra => texto.includes(this.normalizar(palabra)))) {
                return sectores.find(s => s.id === grupo.id) || null;
            }
        }

        return null;
    },

    detectarIntencion(pregunta) {
        const texto = this.normalizar(pregunta);

        if (texto.includes("presupuesto") || texto.includes("inversion") || texto.includes("plata") || texto.includes("recursos")) {
            return "presupuesto";
        }

        if (texto.includes("problema") || texto.includes("problematica") || texto.includes("necesidad")) {
            return "problematicas";
        }

        if (texto.includes("fortaleza") || texto.includes("ventaja")) {
            return "fortalezas";
        }

        if (texto.includes("debilidad") || texto.includes("debilidades")) {
            return "debilidades";
        }

        if (texto.includes("oportunidad") || texto.includes("potencial")) {
            return "oportunidades";
        }

        if (texto.includes("riesgo") || texto.includes("amenaza")) {
            return "riesgos";
        }

        if (texto.includes("propuesta") || texto.includes("campaña") || texto.includes("candidato")) {
            return "propuestas";
        }

        if (texto.includes("control politico") || texto.includes("concejal") || texto.includes("pregunta")) {
            return "control";
        }

        if (texto.includes("meta") || texto.includes("metas")) {
            return "metas";
        }

        if (texto.includes("programa") || texto.includes("programas")) {
            return "programas";
        }

        if (texto.includes("proyecto") || texto.includes("proyectos")) {
            return "proyectos";
        }

        if (texto.includes("indicador") || texto.includes("indicadores")) {
            return "indicadores";
        }

        if (texto.includes("ods") || texto.includes("desarrollo sostenible")) {
            return "ods";
        }

        if (texto.includes("dofa") || texto.includes("diagnostico estrategico")) {
            return "dofa";
        }

        if (texto.includes("glosario") || texto.includes("significa") || texto.includes("que es")) {
            return "glosario";
        }

        if (texto.includes("sector") || texto.includes("sectores")) {
            return "sectores";
        }

        return "general";
    },

    buscarPorSectorEnArchivo(archivo, sector) {
        if (!archivo || !sector) return null;

        const nombreSector = this.normalizar(sector.nombre);
        const idSector = this.normalizar(sector.id || "");

        if (archivo.sectores && Array.isArray(archivo.sectores)) {
            return archivo.sectores.find(item => {
                const texto = this.normalizar(JSON.stringify(item));
                return texto.includes(nombreSector) || texto.includes(idSector);
            });
        }

        if (archivo.propuestas && Array.isArray(archivo.propuestas)) {
            return archivo.propuestas.find(item => {
                const texto = this.normalizar(JSON.stringify(item));
                return texto.includes(nombreSector) || texto.includes(idSector);
            });
        }

        if (archivo.preguntas && Array.isArray(archivo.preguntas)) {
            return archivo.preguntas.find(item => {
                const texto = this.normalizar(JSON.stringify(item));
                return texto.includes(nombreSector) || texto.includes(idSector);
            });
        }

        return null;
    },

    responder(pregunta) {
        if (!pregunta || pregunta.trim() === "") {
            return "Escriba una pregunta sobre el Plan de Desarrollo de Girón.";
        }

        const sector = this.detectarSector(pregunta);
        const intencion = this.detectarIntencion(pregunta);

        if (intencion === "presupuesto") {
            return this.responderPresupuesto(sector);
        }

        if (intencion === "problematicas") {
            return this.responderProblematicas(sector);
        }

        if (intencion === "fortalezas") {
            return this.responderFortalezas(sector);
        }

        if (intencion === "debilidades") {
            return this.responderDebilidades(sector);
        }

        if (intencion === "oportunidades") {
            return this.responderOportunidades(sector);
        }

        if (intencion === "riesgos") {
            return this.responderRiesgos(sector);
        }

        if (intencion === "propuestas") {
            return this.responderPropuestas(sector);
        }

        if (intencion === "control") {
            return this.responderControlPolitico(sector);
        }

        if (intencion === "metas") {
            return this.responderMetas(sector);
        }

        if (intencion === "programas") {
            return this.responderProgramas(sector);
        }

        if (intencion === "proyectos") {
            return this.responderProyectos(sector);
        }

        if (intencion === "indicadores") {
            return this.responderIndicadores(sector);
        }

        if (intencion === "ods") {
            return this.responderODS(sector);
        }

        if (intencion === "dofa") {
            return this.responderDOFA();
        }

        if (intencion === "glosario") {
            return this.responderGlosario(pregunta);
        }

        if (intencion === "sectores") {
            return this.responderSectores();
        }

        return this.responderGeneral(pregunta, sector);
    },

    responderPresupuesto(sector) {
        const presupuesto = this.obtenerPresupuesto();

        if (!presupuesto || !presupuesto.sectores) {
            return "No encontré información presupuestal cargada en la Base de Conocimiento.";
        }

        if (sector) {
            const item = presupuesto.sectores.find(p => p.sectorId === sector.id);

            if (!item) {
                return `No encontré presupuesto específico para el sector ${sector.nombre}.`;
            }

            return this.limpiarRespuesta(`
El sector **${item.sector}** tiene una inversión total de **$ ${item.totalCuatrienio} millones** para el periodo 2024-2027.

Participación dentro del Plan: **${item.participacionPorcentual}**.

Distribución por vigencia:

2024: $ ${item.valores["2024"]} millones
2025: $ ${item.valores["2025"]} millones
2026: $ ${item.valores["2026"]} millones
2027: $ ${item.valores["2027"]} millones

Este dato es útil para evaluar la prioridad financiera del sector y preparar propuestas o preguntas de control político.
            `);
        }

        const total = presupuesto.totalesPorVigencia
            ? presupuesto.totalesPorVigencia.totalCuatrienio
            : "sin dato";

        const ranking = presupuesto.sectores.slice(0, 5).map(item => {
            return `${item.ranking}. ${item.sector}: $ ${item.totalCuatrienio} millones (${item.participacionPorcentual})`;
        }).join("\n");

        return this.limpiarRespuesta(`
El Plan de Desarrollo de Girón contempla un presupuesto total de **$ ${total} millones** para el periodo 2024-2027.

Los sectores con mayor inversión son:

${ranking}

Esto muestra que la mayor concentración de recursos está en Educación y Salud.
        `);
    },

    responderProblematicas(sector) {
        const archivo = this.obtenerProblematicas();

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.problematicas) {
                return `No encontré problemáticas específicas para el sector ${sector.nombre}.`;
            }

            return `
Principales problemáticas del sector **${sector.nombre}**:

${data.problematicas.map(p => "- " + p).join("\n")}
            `;
        }

        if (!archivo.sectores) {
            return "No encontré el archivo de problemáticas cargado.";
        }

        return `
Principales problemáticas identificadas por sectores:

${archivo.sectores.map(s => `**${s.sector}**\n${s.problematicas.slice(0, 3).map(p => "- " + p).join("\n")}`).join("\n\n")}
        `;
    },

    responderFortalezas(sector) {
        const archivo = this.obtenerFortalezas();

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.fortalezas) {
                return `No encontré fortalezas específicas para el sector ${sector.nombre}.`;
            }

            return `
Fortalezas del sector **${sector.nombre}**:

${data.fortalezas.map(p => "- " + p).join("\n")}
            `;
        }

        return `
Fortalezas municipales destacadas:

${(archivo.fortalezasMunicipales || []).map(p => "- " + p).join("\n")}
        `;
    },

    responderDebilidades(sector) {
        const archivo = this.obtenerDebilidades();

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.debilidades) {
                return `No encontré debilidades específicas para el sector ${sector.nombre}.`;
            }

            return `
Debilidades del sector **${sector.nombre}**:

${data.debilidades.map(p => "- " + p).join("\n")}
            `;
        }

        return `
Debilidades transversales del municipio:

${(archivo.debilidadesTransversales || []).map(p => "- " + p).join("\n")}
        `;
    },

    responderOportunidades(sector) {
        const archivo = this.obtenerOportunidades();

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.oportunidades) {
                return `No encontré oportunidades específicas para el sector ${sector.nombre}.`;
            }

            return `
Oportunidades del sector **${sector.nombre}**:

${data.oportunidades.map(p => "- " + p).join("\n")}
            `;
        }

        return `
Oportunidades municipales destacadas:

${(archivo.oportunidadesMunicipales || []).map(p => "- " + p).join("\n")}
        `;
    },

    responderRiesgos(sector) {
        const archivo = this.obtenerRiesgos();

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.riesgos) {
                return `No encontré riesgos específicos para el sector ${sector.nombre}.`;
            }

            return `
Riesgos del sector **${sector.nombre}**:

${data.riesgos.map(p => "- " + p).join("\n")}
            `;
        }

        return `
Riesgos transversales del municipio:

${(archivo.riesgosTransversales || []).map(p => "- " + p).join("\n")}
        `;
    },

    responderPropuestas(sector) {
        const archivo = this.obtenerPropuestas();

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.ideas) {
                return `No encontré propuestas específicas para el sector ${sector.nombre}.`;
            }

            return `
Propuestas sugeridas para **${sector.nombre}**:

${data.ideas.map(p => "- " + p).join("\n")}
            `;
        }

        return `
Puedo generar propuestas por sector. Por ejemplo, pregunte:

- ¿Qué propuestas hay para salud?
- ¿Qué puede proponer un candidato sobre educación?
- ¿Qué propuesta puedo hacer para movilidad?
        `;
    },

    responderControlPolitico(sector) {
        const preguntas = this.obtenerPreguntasControl();
        const control = this.obtenerControlPolitico();

        if (sector) {
            const dataPreguntas = this.buscarPorSectorEnArchivo(preguntas, sector);
            const dataControl = this.buscarPorSectorEnArchivo(control, sector);

            const lista1 = dataPreguntas && dataPreguntas.preguntas ? dataPreguntas.preguntas : [];
            const lista2 = dataControl && dataControl.preguntas ? dataControl.preguntas : [];

            const todas = [...lista1, ...lista2];

            if (todas.length === 0) {
                return `No encontré preguntas de control político para el sector ${sector.nombre}.`;
            }

            return `
Preguntas de control político para **${sector.nombre}**:

${todas.map(p => "- " + p).join("\n")}
            `;
        }

        return `
Puedo ayudarle a preparar preguntas de control político por sector.

Ejemplos:

- Preguntas de control político sobre salud.
- Preguntas para educación.
- Preguntas para movilidad.
- Preguntas para presupuesto.
        `;
    },

    responderMetas(sector) {
        const archivo = this.obtenerMetas();

        if (!archivo.sectores) {
            return "No encontré metas cargadas en la Base de Conocimiento.";
        }

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.metas) {
                return `No encontré metas para el sector ${sector.nombre}.`;
            }

            return `
Metas registradas para **${sector.nombre}**:

${data.metas.map(m => `- ${m.nombre}: ${m.descripcion}`).join("\n")}
            `;
        }

        return `
El archivo de metas está organizado por sectores. Puede preguntar, por ejemplo:

- ¿Qué metas tiene salud?
- ¿Qué metas tiene educación?
- ¿Qué metas tiene movilidad?
        `;
    },

    responderProgramas(sector) {
        const archivo = this.obtenerProgramas();

        if (!archivo.programas) {
            return "No encontré programas cargados en la Base de Conocimiento.";
        }

        let programas = archivo.programas;

        if (sector) {
            programas = programas.filter(p => p.sectorId === sector.id);
        }

        if (programas.length === 0) {
            return sector
                ? `No encontré programas específicos para ${sector.nombre}.`
                : "No encontré programas disponibles.";
        }

        return `
Programas ${sector ? "del sector **" + sector.nombre + "**" : "registrados"}:

${programas.map(p => `- **${p.nombre}**: ${p.descripcion}`).join("\n")}
        `;
    },

    responderProyectos(sector) {
        const archivo = this.obtenerProyectos();

        if (!archivo.sectores) {
            return "No encontré proyectos cargados en la Base de Conocimiento.";
        }

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.proyectos) {
                return `No encontré proyectos para el sector ${sector.nombre}.`;
            }

            return `
Proyectos registrados para **${sector.nombre}**:

${data.proyectos.map(p => `- **${p.nombre}**: ${p.descripcion}`).join("\n")}
            `;
        }

        return `
Los proyectos están organizados por sectores. Puede preguntar:

- ¿Qué proyectos tiene educación?
- ¿Qué proyectos tiene salud?
- ¿Qué proyectos tiene transporte?
        `;
    },

    responderIndicadores(sector) {
        const archivo = this.obtenerIndicadores();

        if (!archivo.sectores) {
            return "No encontré indicadores cargados en la Base de Conocimiento.";
        }

        if (sector) {
            const data = this.buscarPorSectorEnArchivo(archivo, sector);

            if (!data || !data.indicadores) {
                return `No encontré indicadores para el sector ${sector.nombre}.`;
            }

            return `
Indicadores del sector **${sector.nombre}**:

${data.indicadores.map(i => `- ${i.nombre} (${i.unidad || "sin unidad"})`).join("\n")}
            `;
        }

        return `
Los indicadores están organizados por sectores. Puede preguntar:

- Indicadores de salud.
- Indicadores de educación.
- Indicadores de transporte.
        `;
    },

    responderODS(sector) {
        const archivo = this.obtenerODS();

        if (!archivo.odsRelacionados) {
            return "No encontré información de ODS cargada.";
        }

        if (sector && archivo.relacionPorSector) {
            const relacion = archivo.relacionPorSector.find(r => r.sectorId === sector.id);

            if (!relacion) {
                return `No encontré ODS relacionados con ${sector.nombre}.`;
            }

            return `
El sector **${sector.nombre}** se relaciona con los siguientes ODS:

${relacion.ods.map(o => "- " + o).join("\n")}
            `;
        }

        return `
ODS relacionados con el Plan de Desarrollo:

${archivo.odsRelacionados.map(o => `- ${o.id}: ${o.nombre}`).join("\n")}
        `;
    },

    responderDOFA() {
        const base = this.obtenerBase();
        const dofa = base.diagnosticoDofa;

        if (!dofa) {
            return "No encontré el diagnóstico DOFA cargado.";
        }

        return `
Diagnóstico estratégico DOFA de Girón:

**Fortalezas**
${dofa.fortalezas.map(p => "- " + p).join("\n")}

**Debilidades**
${dofa.debilidades.map(p => "- " + p).join("\n")}

**Oportunidades**
${dofa.oportunidades.map(p => "- " + p).join("\n")}

**Riesgos**
${dofa.riesgos.map(p => "- " + p).join("\n")}

Prioridades estratégicas:
${dofa.prioridadesEstrategicas.map(p => `- ${p.tema}: ${p.justificacion}`).join("\n")}
        `;
    },

    responderGlosario(pregunta) {
        const archivo = this.obtenerGlosario();

        if (!archivo.terminos) {
            return "No encontré el glosario cargado.";
        }

        const texto = this.normalizar(pregunta);

        const encontrado = archivo.terminos.find(t => {
            return texto.includes(this.normalizar(t.termino)) ||
                   (t.sigla && texto.includes(this.normalizar(t.sigla)));
        });

        if (!encontrado) {
            return `
No encontré ese término exacto en el glosario. Algunos términos disponibles son:

${archivo.terminos.slice(0, 10).map(t => "- " + t.termino + (t.sigla ? " (" + t.sigla + ")" : "")).join("\n")}
            `;
        }

        return `
**${encontrado.termino}** ${encontrado.sigla ? "(" + encontrado.sigla + ")" : ""}

${encontrado.definicion}

Uso dentro de la app: ${encontrado.usoEnLaApp}
        `;
    },

    responderSectores() {
        const sectores = this.obtenerSectores();

        if (sectores.length === 0) {
            return "No encontré sectores cargados.";
        }

        return `
Sectores identificados en el Plan de Desarrollo:

${sectores.map(s => `- ${s.icono || ""} **${s.nombre}**: ${s.descripcion}`).join("\n")}
        `;
    },

    responderGeneral(pregunta, sector) {
        if (sector) {
            return `
Información general del sector **${sector.nombre}**:

${sector.descripcion}

Eje principal: ${sector.ejePrincipal || "No especificado"}

Uso dentro de la app: ${sector.usoApp || "Consulta sectorial, propuestas y control político."}

Puede preguntar también:

- Presupuesto de ${sector.nombre}
- Problemáticas de ${sector.nombre}
- Propuestas para ${sector.nombre}
- Preguntas de control político sobre ${sector.nombre}
            `;
        }

        return `
Soy el Asistente Inteligente del Plan de Desarrollo de Girón 2024-2027.

Puedo ayudarle con:

- Presupuesto por sector.
- Problemáticas del municipio.
- Fortalezas, debilidades, oportunidades y riesgos.
- Propuestas de campaña.
- Preguntas de control político.
- Metas, programas, proyectos e indicadores.
- ODS relacionados.
- Glosario de términos.
- Diagnóstico DOFA.

Ejemplo: escriba "presupuesto de educación" o "propuestas para salud".
        `;
    },

    generarRespuestaHTML(pregunta) {
        const respuesta = this.responder(pregunta);

        return respuesta
            .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
            .replace(/\n/g, "<br>");
    },

    consultarDesdePantalla(inputId, respuestaId) {
        const input = document.getElementById(inputId);
        const respuesta = document.getElementById(respuestaId);

        if (!input || !respuesta) return;

        const pregunta = input.value.trim();

        if (pregunta === "") {
            alert("Escriba una pregunta para consultar.");
            return;
        }

        respuesta.innerHTML = `
            <div class="respuesta-ia">
                ${this.generarRespuestaHTML(pregunta)}
            </div>
        `;
    }
};

function consultarIA(inputId, respuestaId) {
    IA_GIRON.consultarDesdePantalla(inputId, respuestaId);
}

console.log("Motor IA Girón cargado correctamente.");